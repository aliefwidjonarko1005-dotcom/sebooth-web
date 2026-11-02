'use client'

import { useState, type ReactNode } from 'react'
import Image from 'next/image'
import { Eye, EyeOff } from 'lucide-react'
import { FlowHero } from '@/components/ui/FlowHero'

export const FIELD_LABEL = 'block text-[15px] leading-snug font-semibold text-blue-dark'
// 17px so iOS does not zoom in on focus. Real form fields keep their border: it is how you see them.
export const FIELD_INPUT =
  'mt-1.5 block min-h-14 w-full rounded-lg border border-slate-500 bg-white px-4 text-[17px] font-normal text-blue-dark placeholder:text-slate-500 focus:border-primary focus:outline-2 focus:-outline-offset-1 focus:outline-primary'
export const FIELD_HINT = 'mt-1.5 text-[15px] leading-snug text-slate-600'
export const AUTH_LINK =
  'inline-flex min-h-11 items-center font-bold text-primary underline underline-offset-4 hover:text-navy-raised focus-visible:outline-2 focus-visible:outline-primary'

const AUTH_ERRORS: Record<string, string> = {
  invalid_credentials: 'Email atau password salah. Cek lagi ejaannya, lalu coba lagi.',
  email_not_confirmed: 'Email ini belum dikonfirmasi. Cek kotak masuk emailmu dulu.',
  user_already_exists: 'Email ini sudah terdaftar. Masuk saja lewat tautan di bawah.',
  email_exists: 'Email ini sudah terdaftar. Masuk saja lewat tautan di bawah.',
  weak_password: 'Password terlalu pendek. Pakai minimal 6 karakter.',
  email_address_invalid: 'Format email belum benar. Cek lagi penulisannya.',
  over_request_rate_limit: 'Terlalu banyak percobaan. Tunggu sebentar, lalu coba lagi.',
  over_email_send_rate_limit: 'Terlalu banyak percobaan. Tunggu sebentar, lalu coba lagi.',
}

/** Supabase answers in English. Say what went wrong and how to fix it, in the site's language. */
export function authErrorMessage(err: unknown, fallback: string): string {
  const code = (err as { code?: string } | null)?.code
  return (code && AUTH_ERRORS[code]) || fallback
}

/** Keeps where the person was heading when they switch between login and register. */
export function authSwitchHref(path: string, claimId: string | null, redirectTo: string | null): string {
  const query = new URLSearchParams()
  if (claimId) query.set('claim', claimId)
  if (redirectTo) query.set('redirect', redirectTo)
  return query.size ? `${path}?${query}` : path
}

/** Navy top with a real Sebooth print on larger screens, and the form under or beside it. */
export function AuthShell({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <div className="min-h-svh bg-cream-soft md:grid md:grid-cols-2">
      <FlowHero title={title}>
        <p className="mt-3 text-xl leading-snug">{intro}</p>
        <Image
          src="/images/gallery/hd/strip_004a6bbb.webp"
          alt="Contoh hasil cetak photobooth Sebooth"
          width={1200}
          height={1800}
          sizes="288px"
          className="mt-10 hidden h-auto w-72 rounded-lg md:block"
        />
      </FlowHero>
      {/* Same structure as the hero's inner column, so both sides keep equal outer margins */}
      <main className="px-5 py-8 text-[17px] leading-relaxed text-blue-dark md:self-center md:py-16">
        <div className="mx-auto max-w-xl">{children}</div>
      </main>
    </div>
  )
}

interface PasswordFieldProps {
  id: string
  autoComplete: 'current-password' | 'new-password'
  value: string
  onChange: (value: string) => void
  minLength?: number
  hint?: string
}

export function PasswordField({ id, autoComplete, value, onChange, minLength, hint }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)
  const hintId = `${id}-hint`

  return (
    <div>
      <label htmlFor={id} className={FIELD_LABEL}>Password</label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          required
          minLength={minLength}
          autoComplete={autoComplete}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-describedby={hint ? hintId : undefined}
          className={`${FIELD_INPUT} pr-14`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Sembunyikan password' : 'Tampilkan password'}
          className="absolute right-0 bottom-0 flex h-14 w-14 cursor-pointer items-center justify-center text-slate-600 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
        >
          {visible ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>
      {hint && <p id={hintId} className={FIELD_HINT}>{hint}</p>}
    </div>
  )
}

export function AuthError({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-lg bg-red-50 p-4 font-medium leading-snug text-red-700">
      {children}
    </p>
  )
}
