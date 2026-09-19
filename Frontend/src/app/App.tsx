import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navbar, NavbarSpacer } from '@/components/layout/Navbar'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { QueryProvider } from '@/providers/QueryProvider'
import { ToastProvider } from '@/providers/ToastProvider'
import { TooltipProvider } from '@/providers/TooltipProvider'
import { AuthProvider } from '@/context/AuthContext'
import { GuestRoute } from '@/components/auth/ProtectedRoute'
import Home from '@/pages/Home'
import About from '@/pages/About'
import History from '@/pages/History'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'

export default function App() {
  return (
    <ThemeProvider>
    <QueryProvider>
      <TooltipProvider>
        <ToastProvider>
          <AuthProvider>
          <BrowserRouter>
            <div className="relative min-h-screen bg-background text-on-surface">
              <Navbar />
              <NavbarSpacer />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/history" element={<History />} />
                <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
                <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
              </Routes>
            </div>
          </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </TooltipProvider>
    </QueryProvider>
    </ThemeProvider>
  )
}
