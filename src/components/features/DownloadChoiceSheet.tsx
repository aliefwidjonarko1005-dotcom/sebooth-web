'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Check, Download, FileArchive, Files, Loader2, X } from 'lucide-react'

export interface DownloadFile {
  name: string
  /** Same-origin /api/download link that answers with Content-Disposition: attachment */
  href: string
  label: string
}

export type DownloadMode = 'zip' | 'separate'

interface DownloadChoiceSheetProps {
  open: boolean
  files: DownloadFile[]
  zipName: string
  onClose: () => void
  /** Called once the visitor is finished, with how many files they now have */
  onDone: (count: number, mode: DownloadMode) => void
}

type View = 'choose' | 'zipping' | 'zipReady' | 'separate'

function clickDownload(href: string, name: string) {
  const link = document.createElement('a')
  link.href = href
  link.download = name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Asks how to save every file: one ZIP (works in every browser, since it is a single download)
 * or separate files (lands straight in the gallery, but some browsers only allow the first of
 * several downloads, so the separate view keeps a tap-to-save button per file).
 */
export default function DownloadChoiceSheet({ open, files, zipName, onClose, onDone }: DownloadChoiceSheetProps) {
  const reduceMotion = useReducedMotion()
  const [view, setView] = useState<View>('choose')
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [zipUrl, setZipUrl] = useState<string | null>(null)
  const [zipCount, setZipCount] = useState(0)
  const [failed, setFailed] = useState<string[]>([])
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Fresh state each time the sheet opens; drop the ZIP blob when it closes
  useEffect(() => {
    if (open) {
      setView('choose')
      setProgress({ done: 0, total: files.length })
      setFailed([])
      setSaved(new Set())
      setError(null)
      return
    }
    abortRef.current?.abort()
    setZipUrl((url) => {
      if (url) URL.revokeObjectURL(url)
      return null
    })
  }, [open, files.length])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const buildZip = async () => {
    setView('zipping')
    setError(null)
    setProgress({ done: 0, total: files.length })
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const { default: JSZip } = await import('jszip')
      const zip = new JSZip()
      const blobs: (Blob | null)[] = new Array(files.length).fill(null)
      let done = 0
      let cursor = 0

      // Three at a time: quick on wifi without starving a phone on mobile data
      const worker = async () => {
        while (cursor < files.length) {
          const index = cursor++
          try {
            const res = await fetch(files[index].href, { signal: controller.signal })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            blobs[index] = await res.blob()
          } catch (err) {
            if (controller.signal.aborted) throw err
          }
          done += 1
          setProgress({ done, total: files.length })
        }
      }
      await Promise.all(Array.from({ length: Math.min(3, files.length) }, worker))

      // Added in gallery order, whatever order the downloads finished in
      const missing: string[] = []
      files.forEach((file, index) => {
        const blob = blobs[index]
        if (blob) zip.file(file.name, blob, { binary: true })
        else missing.push(file.label)
      })
      const packed = files.length - missing.length
      if (packed === 0) {
        setError('File belum bisa diambil. Periksa koneksi lalu coba lagi, atau pilih file terpisah.')
        setView('choose')
        return
      }

      // Photos and videos are already compressed; STORE keeps packing instant on phones
      const blob = await zip.generateAsync({ type: 'blob', compression: 'STORE' })
      const url = URL.createObjectURL(blob)
      setZipUrl(url)
      setZipCount(packed)
      setFailed(missing)
      setView('zipReady')
      clickDownload(url, zipName)
    } catch {
      if (controller.signal.aborted) return
      setError('ZIP gagal dibuat. Coba lagi, atau pilih file terpisah.')
      setView('choose')
    }
  }

  const downloadSeparately = () => {
    // All clicks inside this tap: browsers only allow scripted downloads during a user gesture
    files.forEach((file) => clickDownload(file.href, file.name))
    setSaved(new Set(files.map((f) => f.name)))
    setView('separate')
  }

  const saveOne = (file: DownloadFile) => {
    clickDownload(file.href, file.name)
    setSaved((prev) => new Set(prev).add(file.name))
  }

  const finish = (count: number, mode: DownloadMode) => {
    onDone(count, mode)
  }

  const zipping = view === 'zipping'
  const percent = progress.total ? Math.round((progress.done / progress.total) * 100) : 0

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
          <motion.div
            className="absolute inset-0 bg-slate-950/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={zipping ? undefined : onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="download-choice-title"
            className="relative w-full sm:max-w-[440px] max-h-[94svh] overflow-y-auto overscroll-contain bg-white rounded-t-[28px] sm:rounded-[28px] px-5 pt-5 pb-[max(20px,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_rgba(15,23,42,0.18)]"
            initial={reduceMotion ? { opacity: 0 } : { y: '100%' }}
            animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { y: '100%', transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="download-choice-title" className="text-[17px] font-bold text-slate-900">
                  {view === 'zipReady' ? 'ZIP sudah siap' : view === 'separate' ? 'File sedang diunduh' : `Unduh ${files.length} file`}
                </h2>
                <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
                  {view === 'choose' && 'Pilih cara menyimpan foto dan video sesi ini.'}
                  {view === 'zipping' && 'Mengemas semua file jadi satu. Jangan tutup halaman ini.'}
                  {view === 'zipReady' && `${zipCount} file dikemas dalam ${zipName}.`}
                  {view === 'separate' && 'Kalau browser hanya menyimpan sebagian, ketuk file yang belum masuk.'}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup"
                className="w-10 h-10 -mr-2 -mt-1 shrink-0 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <p role="alert" className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-[13px] text-rose-700">
                {error}
              </p>
            )}

            {view === 'choose' && (
              <div className="mt-5 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={buildZip}
                  className="group flex items-start gap-3 rounded-2xl border-2 border-[#002366] bg-[#002366]/[0.04] p-4 text-left transition-colors hover:bg-[#002366]/[0.08] cursor-pointer"
                >
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#002366] text-white">
                    <FileArchive className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2 text-[15px] font-bold text-slate-900">
                      Satu file ZIP
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[13px] font-bold text-white">Disarankan</span>
                    </span>
                    <span className="mt-1 block text-[13px] leading-relaxed text-slate-500">
                      Sekali unduh, semua file lengkap. Aman di semua browser, termasuk yang memblokir unduhan beruntun.
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={downloadSeparately}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4 text-left transition-colors hover:bg-slate-50 cursor-pointer"
                >
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <Files className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-bold text-slate-900">File terpisah</span>
                    <span className="mt-1 block text-[13px] leading-relaxed text-slate-500">
                      Tiap foto dan video tersimpan sendiri-sendiri, tanpa perlu ekstrak. Browser mungkin minta izin unduh beberapa file.
                    </span>
                  </span>
                </button>
              </div>
            )}

            {view === 'zipping' && (
              <div className="mt-6" aria-live="polite">
                <div className="flex items-center justify-between text-[13px] font-semibold text-slate-700">
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-[#002366]" />
                    {progress.done < progress.total ? `Mengambil file ${progress.done + 1} dari ${progress.total}` : 'Mengemas ZIP'}
                  </span>
                  <span className="tabular-nums text-slate-500">{percent}%</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-[#002366] transition-[width] duration-300" style={{ width: `${percent}%` }} />
                </div>
              </div>
            )}

            {view === 'zipReady' && zipUrl && (
              <div className="mt-5 flex flex-col gap-3">
                {failed.length > 0 && (
                  <p className="rounded-2xl bg-amber-50 px-4 py-3 text-[13px] leading-relaxed text-amber-800">
                    {failed.length} file tidak ikut masuk ZIP ({failed.join(', ')}). Unduh lewat tombol di masing-masing foto.
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => finish(zipCount, 'zip')}
                  className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#002366] text-[15px] font-bold text-white transition-colors hover:bg-blue-dark cursor-pointer"
                >
                  <Check className="h-5 w-5" />
                  Selesai
                </button>
                <button
                  type="button"
                  onClick={() => clickDownload(zipUrl, zipName)}
                  className="flex h-11 items-center justify-center gap-2 rounded-full text-[14px] font-semibold text-slate-600 transition-colors hover:bg-slate-100 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  Belum terunduh? Simpan ZIP lagi
                </button>
              </div>
            )}

            {view === 'separate' && (
              <div className="mt-4">
                <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200">
                  {files.map((file) => (
                    <li key={file.name} className="flex items-center justify-between gap-3 px-4 py-2.5">
                      <span className="min-w-0 truncate text-[14px] font-medium text-slate-800">{file.label}</span>
                      <button
                        type="button"
                        onClick={() => saveOne(file)}
                        aria-label={`Unduh ulang ${file.label}`}
                        className="flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-slate-100 px-3 text-[13px] font-semibold text-slate-700 transition-colors hover:bg-slate-200 cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5" />
                        {saved.has(file.name) ? 'Ulangi' : 'Unduh'}
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => finish(files.length, 'separate')}
                  className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#002366] text-[15px] font-bold text-white transition-colors hover:bg-blue-dark cursor-pointer"
                >
                  <Check className="h-5 w-5" />
                  Selesai
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
