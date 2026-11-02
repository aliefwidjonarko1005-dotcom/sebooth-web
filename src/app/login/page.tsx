'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { afterAuthPath, safeRedirectPath } from '@/lib/safeRedirect'
import { whatsappUrl } from '@/config/social'
import { SeboothLoader } from "@/components/ui/SeboothLoader";
import { FLOW_BUTTON_ORANGE } from '@/components/ui/FlowHero'
import {
  AUTH_LINK,
  AuthError,
  AuthShell,
  FIELD_INPUT,
  FIELD_LABEL,
  PasswordField,
  authErrorMessage,
  authSwitchHref,
} from '@/components/auth/AuthForm'

function LoginContent() {
  const searchParams = useSearchParams()
  const claimId = searchParams.get('claim')
  const redirectTo = safeRedirectPath(searchParams.get('redirect'))
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      // Stays in the loading state until the next page opens
      window.location.href = afterAuthPath(claimId, redirectTo)
    } catch (err: unknown) {
      setError(authErrorMessage(err, 'Gagal masuk. Periksa koneksi internetmu, lalu coba lagi.'))
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title={claimId ? 'Masuk untuk Klaim Foto' : 'Masuk ke Sebooth'}
      intro={
        claimId
          ? 'Satu langkah lagi untuk menyimpan sesi fotomu.'
          : redirectTo?.startsWith('/queue')
          ? 'Masuk ke akunmu untuk mengambil nomor antrean.'
          : 'Akses semua galeri fotomu di sini.'
      }
    >
      <form onSubmit={handleLogin} className="space-y-5">
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

        <PasswordField id="login-password" autoComplete="current-password" value={password} onChange={setPassword} />

        {error && <AuthError>{error}</AuthError>}

        <button type="submit" disabled={loading} className={`${FLOW_BUTTON_ORANGE} cursor-pointer`}>
          {loading ? <SeboothLoader variant="mini" label="Sedang masuk" className="h-6 w-6" /> : 'Masuk'}
        </button>
      </form>

      <div className="mt-6">
        <p>
          Belum punya akun?{' '}
          <Link href={authSwitchHref('/register', claimId, redirectTo)} className={AUTH_LINK}>Daftar</Link>
        </p>
        <p>
          Lupa password?{' '}
          <a
            href={whatsappUrl('Halo Sebooth, saya lupa password akun Sebooth saya.')}
            target="_blank"
            rel="noopener noreferrer"
            className={AUTH_LINK}
          >
            Chat Sebooth
          </a>
        </p>
      </div>
    </AuthShell>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<SeboothLoader theme="light" label="Memuat halaman masuk" />}>
      <LoginContent />
    </Suspense>
  )
}
