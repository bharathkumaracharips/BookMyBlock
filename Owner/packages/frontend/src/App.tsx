import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AppProviders } from './providers/PrivyProvider'
import { ToastProvider } from './components/ui/Toast'
import { Navbar } from './components/layout/Navbar'
import { TheaterDashboard } from './components/pages/TheaterDashboard'
import { HomePage } from './components/pages/HomePage'
import { SeatLayoutManagement } from './components/pages/SeatLayoutManagement'
import { PrivyDebug } from './components/debug/PrivyDebug'

import './index.css'

function App() {
    return (
        <AppProviders>

            <ToastProvider>
                <Router>
                    <div className="min-h-screen bg-gray-50">
                        <PrivyDebug />
                        <Navbar />
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/dashboard" element={<TheaterDashboard />} />
                            <Route path="/seat-layout" element={<SeatLayoutManagement />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </div>
                </Router>
            </ToastProvider>

        </AppProviders>
    )
}

export default App