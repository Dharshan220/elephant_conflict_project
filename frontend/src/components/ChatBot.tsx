import ChatPanel from './chat/ChatPanel'

export default function ChatBot({ onOpenReport }: { onOpenReport?: () => void }) {
  return (
    <div style={{ height: 'min(640px, calc(100vh - 220px))' }}>
      <ChatPanel onOpenReport={onOpenReport} />
    </div>
  )
}