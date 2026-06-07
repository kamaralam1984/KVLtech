"use client"
import dynamic from "next/dynamic"

// Client-only dynamic imports — ssr: false is only valid inside 'use client' components
const ChatWidget = dynamic(
  () => import("@/components/ui/ChatWidget").then((m) => ({ default: m.ChatWidget })),
  { ssr: false, loading: () => null }
)

export function LazyClientWidgets() {
  return <ChatWidget />
}
