import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navbar, NavbarSpacer } from '@/components/layout/Navbar'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { QueryProvider } from '@/providers/QueryProvider'
import { ToastProvider } from '@/providers/ToastProvider'
import { TooltipProvider } from '@/providers/TooltipProvider'
import Home from '@/pages/Home'
import About from '@/pages/About'
import History from '@/pages/History'

export default function App() {
  return (
    <ThemeProvider>
    <QueryProvider>
      <TooltipProvider>
        <ToastProvider>
          <BrowserRouter>
            <div className="relative min-h-screen bg-background text-on-surface">
              <Navbar />
              <NavbarSpacer />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/history" element={<History />} />
              </Routes>
            </div>
          </BrowserRouter>
        </ToastProvider>
      </TooltipProvider>
    </QueryProvider>
    </ThemeProvider>
  )
}
