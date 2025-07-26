import { WalletInfo } from '../wallet/WalletInfo'

export function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex justify-center">
                    <WalletInfo />
                </div>
            </div>
        </div>
    )
}