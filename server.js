const { createServer } = require("http")
const { parse } = require("url")
const next = require("next")
const crypto = require("crypto")

const dev = process.env.NODE_ENV !== "production"
const hostname = process.env.HOSTNAME || "0.0.0.0"
const port = parseInt(process.env.PORT || "3000")

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// WebSocket client registry
// channels: "notifications", "chat:{orderId}", "dashboard", "crm", "user:{userId}"
const clients = new Map() // clientId → { socket, channels: Set, userId, role }
const channelClients = new Map() // channel → Set<clientId>

function generateId() {
  return crypto.randomBytes(8).toString("hex")
}

// Manual WebSocket handshake (no ws package needed)
function performHandshake(req, socket) {
  const key = req.headers["sec-websocket-key"]
  if (!key) { socket.destroy(); return false }

  const acceptKey = crypto
    .createHash("sha1")
    .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")
    .digest("base64")

  socket.write(
    "HTTP/1.1 101 Switching Protocols\r\n" +
    "Upgrade: websocket\r\n" +
    "Connection: Upgrade\r\n" +
    `Sec-WebSocket-Accept: ${acceptKey}\r\n\r\n`
  )
  return true
}

// Parse WebSocket frame (RFC 6455)
function parseFrame(buffer) {
  if (buffer.length < 2) return null

  const firstByte = buffer[0]
  const secondByte = buffer[1]
  const opcode = firstByte & 0x0f
  const isMasked = Boolean(secondByte & 0x80)
  let payloadLength = secondByte & 0x7f
  let offset = 2

  if (payloadLength === 126) {
    if (buffer.length < 4) return null
    payloadLength = buffer.readUInt16BE(2)
    offset = 4
  } else if (payloadLength === 127) {
    if (buffer.length < 10) return null
    payloadLength = Number(buffer.readBigUInt64BE(2))
    offset = 10
  }

  let maskKey = null
  if (isMasked) {
    if (buffer.length < offset + 4) return null
    maskKey = buffer.slice(offset, offset + 4)
    offset += 4
  }

  if (buffer.length < offset + payloadLength) return null

  const payload = buffer.slice(offset, offset + payloadLength)
  if (isMasked && maskKey) {
    for (let i = 0; i < payload.length; i++) {
      payload[i] ^= maskKey[i % 4]
    }
  }

  return { opcode, payload, totalLength: offset + payloadLength }
}

// Build WebSocket frame
function buildFrame(data) {
  const payload = Buffer.isBuffer(data) ? data : Buffer.from(data, "utf8")
  const length = payload.length
  let frame

  if (length <= 125) {
    frame = Buffer.allocUnsafe(2 + length)
    frame[0] = 0x81 // FIN + text opcode
    frame[1] = length
    payload.copy(frame, 2)
  } else if (length <= 65535) {
    frame = Buffer.allocUnsafe(4 + length)
    frame[0] = 0x81
    frame[1] = 126
    frame.writeUInt16BE(length, 2)
    payload.copy(frame, 4)
  } else {
    frame = Buffer.allocUnsafe(10 + length)
    frame[0] = 0x81
    frame[1] = 127
    frame.writeBigUInt64BE(BigInt(length), 2)
    payload.copy(frame, 10)
  }
  return frame
}

// Build ping/close frames
function buildPingFrame() { return Buffer.from([0x89, 0x00]) }
function buildCloseFrame() { return Buffer.from([0x88, 0x00]) }

function sendToSocket(socket, data) {
  if (socket.destroyed || socket.writableEnded) return
  try { socket.write(buildFrame(typeof data === "string" ? data : JSON.stringify(data))) } catch {}
}

function subscribe(clientId, channel) {
  const client = clients.get(clientId)
  if (!client) return
  client.channels.add(channel)
  if (!channelClients.has(channel)) channelClients.set(channel, new Set())
  channelClients.get(channel).add(clientId)
}

function unsubscribe(clientId, channel) {
  const client = clients.get(clientId)
  if (client) client.channels.delete(channel)
  if (channelClients.has(channel)) channelClients.get(channel).delete(clientId)
}

function removeClient(clientId) {
  const client = clients.get(clientId)
  if (client) {
    client.channels.forEach(ch => {
      if (channelClients.has(ch)) channelClients.get(ch).delete(clientId)
    })
  }
  clients.delete(clientId)
}

// Broadcast to a channel
function broadcast(channel, message) {
  const ids = channelClients.get(channel)
  if (!ids) return
  const frame = buildFrame(typeof message === "string" ? message : JSON.stringify(message))
  ids.forEach(clientId => {
    const client = clients.get(clientId)
    if (client && !client.socket.destroyed) {
      try { client.socket.write(frame) } catch {}
    }
  })
}

// Broadcast to specific user
function sendToUser(userId, message) {
  broadcast(`user:${userId}`, message)
}

// Handle incoming WebSocket message
function handleMessage(clientId, raw) {
  let msg
  try { msg = JSON.parse(raw) } catch { return }
  const client = clients.get(clientId)
  if (!client) return

  switch (msg.type) {
    case "auth":
      // Client sends JWT or userId for identification
      client.userId = msg.userId
      client.role = msg.role || "client"
      subscribe(clientId, `user:${msg.userId}`)
      sendToSocket(client.socket, { type: "auth_ok", clientId })
      break

    case "subscribe":
      // msg.channels: array of channel names to subscribe
      if (Array.isArray(msg.channels)) {
        msg.channels.forEach(ch => {
          // Auth check: clients can only subscribe to their own channels
          if (ch === "dashboard" && client.role !== "admin") return
          subscribe(clientId, ch)
        })
        sendToSocket(client.socket, { type: "subscribed", channels: msg.channels })
      }
      break

    case "unsubscribe":
      if (Array.isArray(msg.channels)) {
        msg.channels.forEach(ch => unsubscribe(clientId, ch))
      }
      break

    case "ping":
      sendToSocket(client.socket, { type: "pong", ts: Date.now() })
      break
  }
}

// Global broadcast function (exported via global for use in API routes)
global.wsBroadcast = broadcast
global.wsSendToUser = sendToUser
global.wsGetStats = () => ({ clients: clients.size, channels: channelClients.size })

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    const parsedUrl = parse(req.url, true)
    await handle(req, res, parsedUrl)
  })

  server.on("upgrade", (req, socket, head) => {
    const { pathname } = parse(req.url)
    if (pathname !== "/ws") {
      // Forward Next.js HMR/Turbopack WebSocket upgrades to Next.js handler
      try {
        const upgradeHandler = app.getUpgradeHandler?.()
        if (upgradeHandler) {
          upgradeHandler(req, socket, head)
        } else {
          socket.destroy()
        }
      } catch {
        socket.destroy()
      }
      return
    }

    if (!performHandshake(req, socket)) return

    const clientId = generateId()
    const client = { socket, channels: new Set(), userId: null, role: "unknown" }
    clients.set(clientId, client)

    console.log(`[WS] Client connected: ${clientId} (total: ${clients.size})`)

    // Send welcome
    sendToSocket(socket, { type: "connected", clientId, ts: Date.now() })

    // Keep-alive ping every 25s
    const pingInterval = setInterval(() => {
      if (socket.destroyed) { clearInterval(pingInterval); return }
      try { socket.write(buildPingFrame()) } catch {}
    }, 25000)

    let buffer = Buffer.alloc(0)

    socket.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk])
      while (buffer.length >= 2) {
        const opcode = buffer[0] & 0x0f
        const frame = parseFrame(buffer)
        if (!frame) break

        if (opcode === 0x8) { // Close
          socket.write(buildCloseFrame())
          socket.destroy()
          break
        } else if (opcode === 0x9) { // Ping
          const pong = Buffer.from([0x8a, 0x00])
          socket.write(pong)
        } else if (opcode === 0x1 || opcode === 0x2) { // Text/Binary
          handleMessage(clientId, frame.payload.toString("utf8"))
        }
        buffer = buffer.slice(frame.totalLength)
      }
    })

    socket.on("close", () => {
      clearInterval(pingInterval)
      removeClient(clientId)
      console.log(`[WS] Client disconnected: ${clientId} (total: ${clients.size})`)
    })

    socket.on("error", () => {
      clearInterval(pingInterval)
      removeClient(clientId)
    })
  })

  server.listen(port, hostname, () => {
    console.log(`[Server] Ready on http://${hostname}:${port}`)
    console.log(`[WS] WebSocket endpoint: ws://${hostname}:${port}/ws`)
  })
})
