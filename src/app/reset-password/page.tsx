'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { SeboothLoader } from '@/components/ui/SeboothLoader'
import { FLOW_BUTTON_ORANGE } from '@/components/ui/FlowHero'
import { AUTH_LINK, AuthError, AuthShell, PasswordField, authErrorMessage } from '@/components/auth/AuthForm'

export default function ResetPasswordPage() {
  const [supabase] = useState(createClient)
  const [linkState, setLinkState] = useState<'checking' | 'ok' | 'invalid'>('checking')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // The client swaps the email link's ?code= for a session on start; getSession waits for that.
    // It only works in the browser that asked for the link, because PKCE keeps its verifier there.
    supabase.auth.getSession().then(({ data }) => setLinkState(data.session ? 'ok' : 'invalid'))
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.updateUser({ password })
    if (authError) {
      setError(authErrorMessage(authError, 'Gagal menyimpan password. Periksa koneksi internetmu, lalu coba lagi.'))
      setLoading(false)
      return
    }
    // Stays in the loading state until the next page opens
    window.location.href = '/profile'
  }

  return (
    <AuthShell title="Buat Password Baru" intro="Setelah disimpan, kamu langsung masuk ke akunmu.">
      {linkState === 'checking' && <SeboothLoader variant="mini" label="Memeriksa tautan" className="h-8 w-8" />}

      {linkState === 'invalid' && (
        <div className="space-y-4">
          <AuthError>
            Tautan ini sudah kedaluwarsa, sudah dipakai, atau dibuka di browser lain. Minta tautan baru, lalu buka di
            HP atau browser yang sama.
          </AuthError>
          <Link href="/forgot-password" className={AUTH_LINK}>Minta tautan baru</Link>
        </div>
      )}

      {linkState === 'ok' && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <PasswordField
            id="reset-password"
            autoComplete="new-password"
            minLength={6}
            value={password}
            onChange={setPassword}
            hint="Minimal 6 karakter."
          />

          {error && <AuthError>{error}</AuthError>}

          <button type="submit" disabled={loading} className={`${FLOW_BUTTON_ORANGE} cursor-pointer`}>
            {loading ? <SeboothLoader variant="mini" label="Sedang menyimpan" className="h-6 w-6" /> : 'Simpan Password'}
          </button>
        </form>
      )}
    </AuthShell>
  )
}
