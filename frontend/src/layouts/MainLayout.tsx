import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import FloatingChat from '../components/FloatingChat'

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()

  return (
    <div className="flex min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col lg:pl-[268px]">
        <TopBar onMenu={() => setSidebarOpen(true)} />
        <main className="relative flex-1 px-4 py-6 lg:px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="mx-auto max-w-[1500px]"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        <footer className="border-t border-line px-6 py-4">
          <div className="flex flex-col items-start justify-between gap-2 text-xs text-faint sm:flex-row sm:items-center">
            <p>
              <span className="font-semibold text-muted">TuskerGuard</span> · AI &amp; IoT intelligent system for human–elephant conflict mitigation
            </p>
            <p>Smart India Hackathon · YOLOv8 + ESP8266 + FastAPI + React</p>
          </div>
        </footer>
      </div>
      <FloatingChat />
    </div>
  )
}