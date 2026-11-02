'use client'

import React from 'react'
import { LayoutGrid, Download, LogOut, HelpCircle, Image as ImageIcon } from 'lucide-react'
import { Dock } from '@/components/ui/Dock'
import { SeboothLoader } from '@/components/ui/SeboothLoader'

interface ProfileDockProps {
  isLoggingOut: boolean
  isBundling: boolean
  isOverviewMode: boolean
  guideOpen: boolean
  bundleProgress: { current: number; total: number }
  triggerHaptic: (type?: 'tick' | 'pop') => void
  handleOpenBookshelf: () => void
  handleCloseBookshelf: () => void
  handleDownloadBundle: (e?: React.MouseEvent | React.TouchEvent) => void
  handleOpenHelp: () => void
  handleLogout: () => void
}

/** Floating bottom dock: Gallery View, Photos View, Download, Guide, Log Out. */
export function ProfileDock({
  isLoggingOut,
  isBundling,
  isOverviewMode,
  guideOpen,
  bundleProgress,
  triggerHaptic,
  handleOpenBookshelf,
  handleCloseBookshelf,
  handleDownloadBundle,
  handleOpenHelp,
  handleLogout
}: ProfileDockProps) {
  return (
    <div
      className="fixed bottom-4 sm:bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4"
      style={{ bottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}
    >
      <Dock
        ariaLabel="Navigasi Galeri"
        onHaptic={(type) => triggerHaptic(type || 'tick')}
        activeId={
          isLoggingOut
            ? 'logout'
            : isBundling
              ? 'download'
              : isOverviewMode
                ? 'gallery'
                : guideOpen
                  ? 'guide'
                  : 'photos'
        }
        items={[
          {
            id: 'gallery',
            domId: 'bottom-nav-bookshelf-btn',
            label: 'Gallery View',
            icon: <LayoutGrid className="w-5 h-5" />,
            onSelect: (e) => {
              e.stopPropagation()
              if (!isOverviewMode) handleOpenBookshelf()
            },
          },
          {
            id: 'photos',
            domId: 'bottom-nav-photos-btn',
            label: 'Photos View',
            icon: <ImageIcon className="w-5 h-5" />,
            onSelect: (e) => {
              e.stopPropagation()
              if (isOverviewMode) handleCloseBookshelf()
            },
          },
          {
            id: 'download',
            domId: 'tour-profile-bundle-btn',
            label: 'Download',
            title: isBundling
              ? `Menyimpan (${bundleProgress.current}/${bundleProgress.total})...`
              : 'Download',
            disabled: isBundling,
            icon: isBundling ? (
              <SeboothLoader variant="mini" label="Menyiapkan unduhan" className="w-5 h-5" />
            ) : (
              <Download className="w-5 h-5" />
            ),
            onSelect: (e) => {
              e.stopPropagation()
              handleDownloadBundle(e)
            },
          },
          {
            id: 'guide',
            domId: 'bottom-nav-guide-btn',
            label: 'Guide',
            icon: <HelpCircle className="w-5 h-5" />,
            onSelect: (e) => {
              e.stopPropagation()
              handleOpenHelp()
            },
          },
          {
            id: 'logout',
            domId: 'bottom-nav-logout-btn',
            label: 'Log Out',
            title: 'Keluar / Log Out',
            tone: 'danger',
            disabled: isLoggingOut,
            icon: isLoggingOut ? (
              <SeboothLoader variant="mini" className="w-5 h-5" />
            ) : (
              <LogOut className="w-5 h-5" />
            ),
            onSelect: (e) => {
              e.stopPropagation()
              handleLogout()
            },
          },
        ]}
      />
    </div>
  )
}
