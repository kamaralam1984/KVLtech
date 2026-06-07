"use client"
import { useEffect, useRef, useState, useCallback } from "react"

type WSMessage = { type: string; [key: string]: unknown }
type MessageHandler = (msg: WSMessage) => void

interface UseWebSocketOptions {
  userId?: string
  role?: "admin" | "client"
  channels?: string[]
  onMessage?: MessageHandler
  onConnect?: () => void
  onDisconnect?: () => void
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<NodeJS.Timeout | undefined>(undefined)
  const messageHandlers = useRef<Set<MessageHandler>>(new Set())
  // Stable ref for options to avoid stale closures without causing re-connects
  const optionsRef = useRef(options)
  optionsRef.current = options

  const channelsKey = JSON.stringify(options.channels)

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    try {
      const proto = window.location.protocol === "https:" ? "wss:" : "ws:"
      const url = `${proto}//${window.location.host}/ws`
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
        optionsRef.current.onConnect?.()

        // Authenticate
        if (optionsRef.current.userId) {
          ws.send(JSON.stringify({
            type: "auth",
            userId: optionsRef.current.userId,
            role: optionsRef.current.role,
          }))
        }

        // Subscribe to channels
        if (optionsRef.current.channels?.length) {
          ws.send(JSON.stringify({ type: "subscribe", channels: optionsRef.current.channels }))
        }
      }

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as WSMessage
          setLastMessage(msg)
          messageHandlers.current.forEach(h => h(msg))
          optionsRef.current.onMessage?.(msg)
        } catch {}
      }

      ws.onclose = () => {
        setIsConnected(false)
        optionsRef.current.onDisconnect?.()
        // Reconnect after 3s
        reconnectTimer.current = setTimeout(connect, 3000)
      }

      ws.onerror = () => ws.close()

    } catch {
      console.warn("[WS] Connection failed, retrying...")
      reconnectTimer.current = setTimeout(connect, 5000)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.userId, options.role, channelsKey])

  useEffect(() => {
    connect()
    return () => {
      clearTimeout(reconnectTimer.current)
      wsRef.current?.close()
    }
  }, [connect])

  const send = useCallback((msg: WSMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg))
    }
  }, [])

  const addHandler = useCallback((handler: MessageHandler) => {
    messageHandlers.current.add(handler)
    return () => messageHandlers.current.delete(handler)
  }, [])

  return { isConnected, lastMessage, send, addHandler }
}

// Specialized hooks
export function useAdminWebSocket(userId: string) {
  return useWebSocket({
    userId,
    role: "admin",
    channels: ["dashboard", "crm", `user:${userId}`],
  })
}

export function useClientWebSocket(userId: string, orderId?: string) {
  return useWebSocket({
    userId,
    role: "client",
    channels: orderId ? [`user:${userId}`, `chat:${orderId}`] : [`user:${userId}`],
  })
}
