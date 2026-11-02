'use client'

import Image from 'next/image'
import Link from 'next/link'
import { X, QrCode, LogOut } from 'lucide-react'
import { SeboothLoader } from '@/components/ui/SeboothLoader'

interface ProfileEmptyStateProps {
  handleLogout: () => void
  isLoggingOut: boolean
  setIsClaimModalOpen: (open: boolean) => void
}

/** Header and empty message shown to a logged-in user with no sessions yet. */
export function ProfileEmptyState({ handleLogout, isLoggingOut, setIsClaimModalOpen }: ProfileEmptyStateProps) {
  return (
    <div className="mx-auto flex h-full w-full max-w-xl flex-col px-5 pt-3 pb-6">
      <header className="flex shrink-0 items-center justify-between">
        <Link
          href="/"
          aria-label="Kembali ke Beranda"
          title="Kembali ke Beranda"
          className="-ml-2.5 flex h-11 w-11 items-center justify-center text-blue-dark transition-transform active:scale-90 focus-visible:outline-2 focus-visible:outline-primary"
        >
          <X className="h-6 w-6" />
        </Link>

        <h1 className="font-bayon text-[1.75rem] leading-none text-primary uppercase">My Photos</h1>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          aria-label="Keluar"
          title="Keluar / Log Out"
          className="-mr-2.5 flex h-11 w-11 cursor-pointer items-center justify-center text-blue-dark transition-transform active:scale-90 focus-visible:outline-2 focus-visible:outline-primary"
        >
          {isLoggingOut ? <SeboothLoader variant="mini" className="h-5 w-5" /> : <LogOut className="h-5 w-5" />}
        </button>
      </header>

      <main className="flex min-h-0 flex-1 flex-col justify-center">
        <Image
          src="/images/gallery/hd/strip_004a6bbb.webp"
          alt="Contoh hasil cetak photobooth Sebooth"
          width={1200}
          height={1800}
          sizes="200px"
          priority
          // Gives way first on short phones, so the text and buttons always fit one screen
          className="h-[min(30svh,calc(100svh-28rem))] w-auto self-start rounded-lg"
        />

        <h2 className="mt-6 font-bayon text-[2.5rem] leading-none text-primary uppercase">Belum Ada Sesi Foto</h2>
        <p className="mt-3 text-[17px] leading-relaxed text-blue-dark">
          Foto dan video dari photobooth Sebooth yang sudah kamu klaim otomatis tersimpan di sini.
        </p>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => setIsClaimModalOpen(true)}
            className="flex min-h-14 w-full cursor-pointer items-center justify-center gap-2.5 rounded-full bg-secondary px-6 text-[17px] font-bold text-blue-dark transition-colors hover:bg-orange-press focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98]"
          >
            <QrCode className="h-5 w-5" aria-hidden="true" />
            Klaim Foto Sekarang
          </button>
          <Link
            href="/"
            className="flex min-h-14 w-full items-center justify-center rounded-full bg-primary px-6 text-[17px] font-bold text-white transition-colors hover:bg-navy-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98]"
          >
            Ke Beranda
          </Link>
        </div>
      </main>
    </div>
  )
}
