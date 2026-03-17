'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { LogIn, Mail, Lock, Loader2, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const claimId = searchParams.get('claim')
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
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      if (authData.user && claimId) {
        // Link session to user
        const { error: claimError } = await supabase
          .from('sessions')
          .update({ 
            user_id: authData.user.id,
            is_claimed: true 
          })
          .eq('id', claimId)

        if (claimError) {
          console.error('Claim error:', claimError)
        }
      }

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Gagal masuk. Periksa kembali email dan password Anda.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md overflow-hidden rounded-[2rem] bg-white p-8 shadow-2xl ring-1 ring-gray-900/5 md:p-12"
      >
        <div className="text-center">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <LogIn className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-black text-gray-900">
            {claimId ? 'Masuk untuk Klaim' : 'Masuk ke Sebooth'}
          </h1>
          <p className="mt-2 text-gray-600">
            {claimId 
              ? 'Satu langkah lagi untuk menyimpan sesi fotomu.' 
              : 'Akses semua galeri fotomu di sini.'}
          </p>
          {claimId && (
            <div className="mt-4 rounded-xl bg-blue-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-blue-600 ring-1 ring-blue-100">
              ⚡ Mode Klaim Aktif
            </div>
          )}
        </div>

        <form onSubmit={handleLogin} className="mt-10 space-y-6">
          <div>
            <label className="text-sm font-bold text-gray-700">Email</label>
            <div className="relative mt-2">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border-none bg-gray-100 py-4 pl-12 pr-4 font-medium transition-shadow focus:ring-2 focus:ring-blue-600"
                placeholder="nama@email.com"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700">Password</label>
            <div className="relative mt-2">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border-none bg-gray-100 py-4 pl-12 pr-4 font-medium transition-shadow focus:ring-2 focus:ring-blue-600"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 font-black text-white shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:bg-gray-400"
          >
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
              <>
                Masuk <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 flex items-center justify-between text-sm">
          <button className="text-gray-500 hover:text-blue-600">Lupa Password?</button>
          <button 
            onClick={() => router.push(`/register${claimId ? `?claim=${claimId}` : ''}`)}
            className="font-bold text-blue-600 hover:underline"
          >
            Daftar Akun Baru
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
