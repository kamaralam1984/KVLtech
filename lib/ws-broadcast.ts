// Server-side helper to broadcast via global WebSocket server

type BroadcastMessage = {
  type: string
  [key: string]: unknown
}

declare global {
  // eslint-disable-next-line no-var
  var wsBroadcast: ((channel: string, message: BroadcastMessage) => void) | undefined
  // eslint-disable-next-line no-var
  var wsSendToUser: ((userId: string, message: BroadcastMessage) => void) | undefined
  // eslint-disable-next-line no-var
  var wsGetStats: (() => { clients: number; channels: number }) | undefined
}

export function wsBroadcast(channel: string, message: BroadcastMessage) {
  if (typeof global.wsBroadcast === "function") {
    global.wsBroadcast(channel, message)
  }
}

export function wsSendToUser(userId: string, message: BroadcastMessage) {
  if (typeof global.wsSendToUser === "function") {
    global.wsSendToUser(userId, message)
  }
}

// Predefined broadcast helpers
export const wsEvents = {
  // Admin/Dashboard
  newOrder: (order: { id: string; orderNumber: string; amount: number; clientName: string }) =>
    wsBroadcast("dashboard", { type: "new_order", ...order, ts: Date.now() }),

  orderStatusChanged: (orderId: string, status: string, clientId: string) => {
    wsBroadcast("dashboard", { type: "order_updated", orderId, status, ts: Date.now() })
    wsSendToUser(clientId, { type: "order_updated", orderId, status, ts: Date.now() })
  },

  newLead: (lead: { id: string; name: string; service: string; score?: number }) =>
    wsBroadcast("crm", { type: "new_lead", ...lead, ts: Date.now() }),

  // Notifications
  notify: (userId: string, notification: { title: string; message: string; type?: string }) =>
    wsSendToUser(userId, { type: "notification", ...notification, ts: Date.now() }),

  // Chat
  chatMessage: (orderId: string, message: { content: string; sender: string; isAdmin: boolean }) =>
    wsBroadcast(`chat:${orderId}`, { type: "chat_message", orderId, ...message, ts: Date.now() }),

  // Tickets
  ticketUpdate: (ticketId: string, clientId: string, update: { status?: string; reply?: string }) => {
    wsBroadcast("dashboard", { type: "ticket_updated", ticketId, ...update, ts: Date.now() })
    wsSendToUser(clientId, { type: "ticket_updated", ticketId, ...update, ts: Date.now() })
  },

  // Team
  teamActivity: (activity: { userId: string; action: string; resource: string }) =>
    wsBroadcast("dashboard", { type: "team_activity", ...activity, ts: Date.now() }),
}
