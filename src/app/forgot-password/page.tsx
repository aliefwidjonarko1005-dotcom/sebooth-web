'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { whatsappUrl } from '@/config/social'
import { SeboothLoader } from '@/components/ui/SeboothLoader'
import { FLOW_BUTTON_ORANGE } from '@/components/ui/FlowHero'
import { AUTH_LINK, AuthError, AuthShell, FIELD_INPUT, FIELD_LABEL, authErrorMessage } from '@/components/auth/AuthForm'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: authError } = await createClient().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setLoading(false)
    if (authError) {
      setError(authErrorMessage(authError, 'Gagal mengirim email. Periksa koneksi internetmu, lalu coba lagi.'))
      return
    }
    setSent(true)
  }

  return (
    <AuthShell title="Lupa Password" intro="Kami kirim tautan ke emailmu untuk membuat password baru.">
      {sent ? (
        // Same message whether or not the email has an account, so nobody can probe who is registered
        <div role="status" className="space-y-4">
          <p>
            Kalau <strong>{email.trim()}</strong> terdaftar di Sebooth, tautan untuk membuat password baru sudah kami
            kirim. Buka tautan itu di HP atau browser ini juga.
          </p>
          <p>Belum masuk dalam beberapa menit? Cek folder spam atau promosi.</p>
          <button type="button" onClick={() => setSent(false)} className={`${AUTH_LINK} cursor-pointer`}>
            Kirim ulang atau ganti email
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className={FIELD_LABEL}>
            Email akunmu
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

          {error && <AuthError>{error}</AuthError>}

          <button type="submit" disabled={loading} className={`${FLOW_BUTTON_ORANGE} cursor-pointer`}>
            {loading ? <SeboothLoader variant="mini" label="Sedang mengirim" className="h-6 w-6" /> : 'Kirim Tautan'}
          </button>
        </form>
      )}

      <div className="mt-6">
        <p>
          Sudah ingat?{' '}
          <Link href="/login" className={AUTH_LINK}>Masuk</Link>
        </p>
        <p>
          Lupa email yang dipakai?{' '}
          <a
            href={whatsappUrl('Halo Sebooth, saya lupa email akun Sebooth saya.')}
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
