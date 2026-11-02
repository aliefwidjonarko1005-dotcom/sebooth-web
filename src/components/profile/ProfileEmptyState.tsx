'use client'

import Link from 'next/link'
import { X, QrCode, Camera, LogOut } from 'lucide-react'
import { SeboothLoader } from '@/components/ui/SeboothLoader'

interface ProfileEmptyStateProps {
  handleLogout: () => void
  isLoggingOut: boolean
  setIsClaimModalOpen: (open: boolean) => void
}

/** Header, empty message and footer shown to a logged-in user with no sessions yet. */
export function ProfileEmptyState({ handleLogout, isLoggingOut, setIsClaimModalOpen }: ProfileEmptyStateProps) {
  return (
    <div className="w-full max-w-6xl mx-auto h-full flex flex-col justify-between px-4 sm:px-6 md:px-8 pt-3 pb-4">
      {/* Header */}
      <header className="w-full max-w-4xl mx-auto pt-1 pb-2 flex items-center justify-between shrink-0 z-20">
        <Link
          href="/"
          className="w-10 h-10 flex items-center justify-start text-slate-800 hover:text-black transition-opacity active:scale-95 cursor-pointer"
          title="Kembali ke Beranda"
        >
          <X className="w-6 h-6 stroke-[2.2]" />
        </Link>

        <div className="flex flex-col items-center">
          <h1 className="text-[18px] sm:text-[20px] font-extrabold text-slate-900 tracking-tight font-sans">
            My Photos
          </h1>
          <span className="text-[11px] font-medium text-slate-400 -mt-0.5">
            0 Sesi Tersimpan
          </span>
        </div>

        {/* Log Out */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-9 h-9 flex items-center justify-center text-slate-700 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-90 cursor-pointer rounded-xl"
          title="Keluar / Log Out"
        >
          {isLoggingOut ? (
            <SeboothLoader variant="mini" className="w-5 h-5 text-rose-500" />
          ) : (
            <LogOut className="w-[20px] h-[20px] stroke-[2.2]" />
          )}
        </button>
      </header>

      {/* Centerpiece: Empty State */}
      <div className="relative w-full flex-1 min-h-0 flex flex-col items-center justify-center my-auto py-6 text-center max-w-md mx-auto">
        <div className="w-20 h-20 rounded-3xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 mb-5 shadow-sm">
          <Camera className="w-10 h-10 stroke-[1.8]" />
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
          Belum Ada Sesi Foto
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6 px-4">
          Foto dan video dari photobooth Sebooth yang sudah kamu klaim akan otomatis muncul dan tersimpan di galeri ini.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
          <button
            onClick={() => setIsClaimModalOpen(true)}
            className="w-full py-3.5 px-6 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            <span>Klaim Foto Sekarang</span>
          </button>
          <Link
            href="/"
            className="w-full py-3.5 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center"
          >
            Ke Beranda
          </Link>
        </div>
      </div>

      <footer className="w-full max-w-4xl mx-auto py-2 text-center text-[11px] text-slate-400">
        Sebooth Photobooth &copy; {new Date().getFullYear()}
      </footer>
    </div>
  )
}
