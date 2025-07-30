import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AppProviders } from './providers/PrivyProvider'
import { ToastProvider } from './components/ui/Toast'
import { Navigation } from './components/layout/Navigation'
import { TheaterDashboard } from './components/pages/TheaterDashboard'
import { HomePage } from './components/pages/HomePage'
import { PrivyDebug } from './components/debug/PrivyDebug'
import { AppLayout } from './components/layout/AppLayout'
import './index.css'

function App() {
    return (
        <AppProviders>
            <AppLayout>
                <ToastProvider>
                    <Router>
                        <div className="min-h-screen bg-gray-50">
                            <PrivyDebug />
                            <Navigation />
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/dashboard" element={<TheaterDashboard />} />
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </div>
                    </Router>
                </ToastProvider>
            </AppLayout>
        </AppProviders>
    )
}

export default App