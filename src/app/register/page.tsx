'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { afterAuthPath, safeRedirectPath } from '@/lib/safeRedirect'
import { SeboothLoader } from "@/components/ui/SeboothLoader";
import { FLOW_BUTTON_ORANGE } from '@/components/ui/FlowHero'
import {
  AUTH_LINK,
  AuthError,
  AuthShell,
  FIELD_HINT,
  FIELD_INPUT,
  FIELD_LABEL,
  PasswordField,
  authErrorMessage,
  authSwitchHref,
} from '@/components/auth/AuthForm'

function RegisterContent() {
  const searchParams = useSearchParams()
  const claimId = searchParams.get('claim')
  const redirectTo = safeRedirectPath(searchParams.get('redirect'))
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [instagram, setInstagram] = useState('')
  const [referralSource, setReferralSource] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!fullName.trim()) {
      setError('Nama lengkap wajib diisi.')
      setLoading(false)
      return
    }

    if (!phoneNumber.trim()) {
      setError('Nomor WhatsApp wajib diisi.')
      setLoading(false)
      return
    }

    try {
      const cleanInstagram = instagram.trim().replace(/^@/, '')
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone_number: phoneNumber.trim(),
            instagram: cleanInstagram || null,
            referral_source: referralSource || null,
            heard_from: referralSource || null,
          },
        },
      })

      if (authError) throw authError

      // Stays in the loading state until the next page opens
      window.location.href = afterAuthPath(claimId, redirectTo)
    } catch (err: unknown) {
      setError(authErrorMessage(err, 'Gagal mendaftar. Periksa koneksi internetmu, lalu coba lagi.'))
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title={claimId ? 'Daftar & Klaim Foto' : 'Buat Akun Sebooth'}
      intro={
        claimId
          ? 'Daftar sekarang dan foto ini jadi milikmu selamanya.'
          : redirectTo?.startsWith('/queue')
          ? 'Daftar dulu untuk mengambil nomor antrean.'
          : 'Mulai simpan kenanganmu selamanya.'
      }
    >
      <form onSubmit={handleRegister} className="space-y-5">
        <label className={FIELD_LABEL}>
          Nama lengkap
          <input
            type="text"
            required
            maxLength={50}
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={FIELD_INPUT}
          />
        </label>

        <div>
          <label className={FIELD_LABEL}>
            Nomor WhatsApp
            <input
              type="tel"
              required
              maxLength={16}
              autoComplete="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              aria-describedby="register-phone-hint"
              className={FIELD_INPUT}
              placeholder="08xx xxxx xxxx"
            />
          </label>
          <p id="register-phone-hint" className={FIELD_HINT}>Dipakai operator untuk menghubungimu saat antre.</p>
        </div>

        <label className={FIELD_LABEL}>
          Email
          <input
            type="email"
            required
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={FIELD_INPUT}
            placeholder="nama@email.com"
          />
        </label>

        <PasswordField
          id="register-password"
          autoComplete="new-password"
          minLength={6}
          value={password}
          onChange={setPassword}
          hint="Minimal 6 karakter."
        />

        <label className={FIELD_LABEL}>
          Instagram (opsional)
          <input
            type="text"
            maxLength={35}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            className={FIELD_INPUT}
            placeholder="@username"
          />
        </label>

        <label className={FIELD_LABEL}>
          Tahu Sebooth dari mana? (opsional)
          <span className="relative block">
            <select
              value={referralSource}
              onChange={(e) => setReferralSource(e.target.value)}
              className={`${FIELD_INPUT} cursor-pointer appearance-none pr-12`}
            >
              <option value="">Pilih salah satu</option>
              <option value="Instagram">Instagram</option>
              <option value="TikTok">TikTok</option>
              <option value="Google">Google</option>
              <option value="Postingan Teman">Postingan Teman</option>
            </select>
            <span className="pointer-events-none absolute right-0 bottom-0 flex h-14 w-14 items-center justify-center text-slate-600">
              <ChevronDown className="h-5 w-5" aria-hidden="true" />
            </span>
          </span>
        </label>

        {error && <AuthError>{error}</AuthError>}

        <button type="submit" disabled={loading} className={`${FLOW_BUTTON_ORANGE} cursor-pointer`}>
          {loading ? (
            <SeboothLoader variant="mini" label="Sedang mendaftar" className="h-6 w-6" />
          ) : claimId ? (
            'Daftar & Klaim Foto'
          ) : (
            'Daftar Sekarang'
          )}
        </button>
      </form>

      <p className="mt-6">
        Sudah punya akun?{' '}
        <Link href={authSwitchHref('/login', claimId, redirectTo)} className={AUTH_LINK}>Masuk</Link>
      </p>
    </AuthShell>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<SeboothLoader theme="light" label="Memuat halaman daftar" />}>
      <RegisterContent />
    </Suspense>
  )
}
