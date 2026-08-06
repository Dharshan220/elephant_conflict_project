import { useState } from 'react'
import ChatBot from '../components/ChatBot'
import ReportModal from '../components/ReportModal'
import { MessageSquare } from 'lucide-react'
import { useTuskerLang } from '../i18n/LanguageContext'

export default function AssistantPage() {
  const [reportOpen, setReportOpen] = useState(false)
  const { t } = useTuskerLang()
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-5 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-accentSoft text-accent">
          <MessageSquare size={20} />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-ink">{t('pgAssistantHeading')}</h2>
          <p className="text-sm text-muted">{t('pgAssistantSubtitle')}</p>
        </div>
      </div>
      <ChatBot onOpenReport={() => setReportOpen(true)} />
      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  )
}