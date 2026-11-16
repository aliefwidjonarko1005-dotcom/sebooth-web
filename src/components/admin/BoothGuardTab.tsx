'use client'

import { useCallback, useEffect, useState } from 'react'
import { startAuthentication, startRegistration } from '@simplewebauthn/browser'
import { Bell, Download, KeyRound, Lock, Power, RefreshCw, ShieldCheck, Trash2, Unlock, Wrench } from 'lucide-react'
import { canonicalJSON, COMMAND_TTL_MS, type BoothAction, type BoothCommand } from '@/lib/boothGuardShared'
import { subscribeToPush } from '@/lib/queue/pushSubscription'

interface Device {
  id: string
  hostname: string | null
  label: string | null
  app_version: string | null
  status: 'pending' | 'approved' | 'locked' | 'revoked'
  lock_reason: string | null
  last_seen: string | null
  last_ip: string | null
  last_status: Record<string, unknown> | null
  created_at: string
}

interface BoothData {
  rpId: string
  devices: Device[]
  ownerKeys: { credential_id: string; label: string | null }[]
  pendingCommands: { device_id: string; command: BoothCommand }[]
}

const STATUS_STYLE: Record<Device['status'], string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  locked: 'bg-red-100 text-red-800',
  revoked: 'bg-[#1A1A1A]/10 text-[#1A1A1A]/60',
}
const STATUS_LABEL: Record<Device['status'], string> = {
  pending: 'Menunggu approval',
  approved: 'Aktif',
  locked: 'Terkunci',
  revoked: 'Dicabut',
}
const ACTION_LABEL: Record<BoothAction, string> = {
  approve: 'Approve', lock: 'Kunci', unlock: 'Buka kunci', revoke: 'Cabut',
  set_config: 'Ubah config', restart: 'Restart', update: 'Update',
}

function newCommand(deviceId: string, action: BoothAction, params: Record<string, unknown>): BoothCommand {
  const now = Date.now()
  return { v: 1, id: crypto.randomUUID(), deviceId, action, params, issuedAt: now, expiresAt: now + COMMAND_TTL_MS }
}

async function challengeFor(cmd: BoothCommand): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalJSON(cmd)))
  let s = ''
  for (const b of new Uint8Array(hash)) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** PBKDF2-SHA256 hash the kiosk verifies (src/main/lib/adminPin.ts); the PIN itself never leaves this browser. */
async function hashAdminPin(pin: string): Promise<string> {
  const iterations = 210_000
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256)
  const b64 = (b: Uint8Array) => btoa(String.fromCharCode(...b))
  return `pbkdf2$${iterations}$${b64(salt)}$${b64(new Uint8Array(bits))}`
}

function ago(iso: string | null): string {
  if (!iso) return 'belum pernah'
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return `${s} dtk lalu`
  if (s < 3600) return `${Math.round(s / 60)} mnt lalu`
  if (s < 86400) return `${Math.round(s / 3600)} jam lalu`
  return `${Math.round(s / 86400)} hari lalu`
}

export default function BoothGuardTab({ isSuper, flash }: { isSuper: boolean; flash: (m: string) => void }) {
  const [data, setData] = useState<BoothData | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')
  const [configFor, setConfigFor] = useState<Device | null>(null)
  const [configText, setConfigText] = useState('{\n  \n}')
  const [pin, setPin] = useState('')
  const [recoveryText, setRecoveryText] = useState('')
  const [now, setNow] = useState(0)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/booths', { cache: 'no-store' })
    const json = await res.json().catch(() => null)
    if (!json?.success) setError(json?.error || 'Gagal memuat booth')
    else { setError(''); setData(json); setNow(Date.now()) }
  }, [])

  useEffect(() => {
    const first = setTimeout(load, 0)
    const t = setInterval(load, 15_000)
    return () => { clearTimeout(first); clearInterval(t) }
  }, [load])

  const post = async (url: string, body: unknown) => {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const json = await res.json().catch(() => ({ success: false, error: `HTTP ${res.status}` }))
    if (!json.success) throw new Error(json.error || 'Gagal')
    return json
  }

  const send = async (device: Device, action: BoothAction, params: Record<string, unknown> = {}) => {
    if (!data?.ownerKeys.length) { setError('Daftarkan passkey owner dulu.'); return }
    if ((action === 'revoke' || action === 'lock') && !confirm(`${ACTION_LABEL[action]} ${device.label || device.hostname || device.id}?`)) return
    setBusy(device.id + action)
    try {
      const command = newCommand(device.id, action, params)
      const res = await startAuthentication({
        optionsJSON: {
          challenge: await challengeFor(command),
          rpId: data.rpId,
          allowCredentials: data.ownerKeys.map(k => ({ id: k.credential_id, type: 'public-key' as const })),
          userVerification: 'required',
          timeout: 60_000,
        },
      })
      await post('/api/admin/booths/command', {
        command,
        assertion: {
          type: 'passkey',
          credentialId: res.id,
          authenticatorData: res.response.authenticatorData,
          clientDataJSON: res.response.clientDataJSON,
          signature: res.response.signature,
        },
      })
      flash(`${ACTION_LABEL[action]} terkirim. Booth menerapkannya di heartbeat berikutnya (≤30 dtk).`)
      await load()
    } catch (e) {
      setError(`${ACTION_LABEL[action]} gagal: ${(e as Error).message}`)
    } finally {
      setBusy('')
    }
  }

  const registerPasskey = async () => {
    setBusy('register')
    try {
      const { options, ticket } = await post('/api/admin/owner-keys', { step: 'options' })
      const response = await startRegistration({ optionsJSON: options })
      const label = prompt('Nama device ini (mis. "HP Alief")') || null
      const { pin } = await post('/api/admin/owner-keys', { step: 'verify', ticket, response, label })
      setPin(JSON.stringify(pin, null, 2))
      await load()
    } catch (e) {
      setError(`Registrasi passkey gagal: ${(e as Error).message}`)
    } finally {
      setBusy('')
    }
  }

  const sendRecovery = async () => {
    try {
      await post('/api/admin/booths/command', JSON.parse(recoveryText))
      setRecoveryText('')
      flash('Command recovery terkirim.')
      await load()
    } catch (e) {
      setError(`Command recovery ditolak: ${(e as Error).message}`)
    }
  }

  const btn = 'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40'

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-[#1A1A1A]/10 shadow-xs space-y-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-bold text-[#1A1A1A]">Booth Guard</h2>
            <p className="text-xs text-[#1A1A1A]/60 mt-0.5 max-w-xl">
              Instalasi baru terkunci sampai kamu approve. Approve, buka kunci, ubah config, restart dan cabut
              ditandatangani passkey device kamu. Booth hanya percaya passkey yang tertanam di build-nya.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={async () => { flash((await subscribeToPush()) ? 'Notifikasi aktif di device ini.' : 'Notifikasi tidak bisa diaktifkan.') }}
              className={`${btn} bg-[#1A1A1A]/5 text-[#1A1A1A] hover:bg-[#1A1A1A]/10`}>
              <Bell className="w-4 h-4" /> Aktifkan notifikasi
            </button>
            <button onClick={load} className={`${btn} bg-[#1A1A1A]/5 text-[#1A1A1A] hover:bg-[#1A1A1A]/10`}>
              <RefreshCw className="w-4 h-4" /> Muat ulang
            </button>
          </div>
        </div>
        {error && <p className="text-xs font-bold text-red-600">{error}</p>}
        <p className="text-xs text-[#1A1A1A]/60">
          Passkey owner terdaftar: {data?.ownerKeys.length ? data.ownerKeys.map(k => k.label || k.credential_id.slice(0, 8)).join(', ') : 'belum ada'}
        </p>
      </div>

      <div className="space-y-3">
        {data?.devices.length === 0 && <p className="text-sm text-[#1A1A1A]/50">Belum ada booth yang mendaftar.</p>}
        {data?.devices.map(d => {
          const online = !!d.last_seen && now - new Date(d.last_seen).getTime() < 90_000
          const st = d.last_status || {}
          const pending = data.pendingCommands.filter(c => c.device_id === d.id)
          const can = (a: BoothAction) =>
            a === 'approve' ? d.status === 'pending'
            : a === 'unlock' ? d.status === 'locked'
            : a === 'lock' ? d.status === 'approved' || d.status === 'pending'
            : a === 'revoke' ? d.status !== 'revoked'
            : d.status === 'approved'
          return (
            <div key={d.id} className="bg-white p-5 rounded-2xl border border-[#1A1A1A]/10 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${online ? 'bg-emerald-500' : 'bg-[#1A1A1A]/20'}`} />
                    <span className="font-extrabold text-[#1A1A1A]">{d.label || d.hostname || 'Tanpa nama'}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${STATUS_STYLE[d.status]}`}>
                      {STATUS_LABEL[d.status]}{d.lock_reason === 'clone' ? ' (identitas ganda)' : ''}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#1A1A1A]/50 mt-1 font-mono">
                    {d.id.slice(0, 8).toUpperCase()} · v{d.app_version || '?'} · {d.last_ip || '-'} · terakhir {ago(d.last_seen)}
                  </p>
                  {d.last_status && (
                    <p className="text-[11px] text-[#1A1A1A]/60 mt-1">
                      Kamera {st.cameraReady ? 'siap' : 'tidak siap'} · Printer {st.printerReady ? 'siap' : 'tidak siap'} ·
                      {' '}{String(st.sessionsToday ?? 0)} sesi hari ini · nyala {String(st.uptimeMin ?? 0)} mnt · layar {String(st.guardState ?? '?')}
                    </p>
                  )}
                  {(() => {
                    const u = st.update as { state?: string; version?: string; error?: string } | undefined
                    if (!u || !u.state || u.state === 'idle') return null
                    return (
                      <p className={`text-[11px] mt-1 ${u.state === 'failed' ? 'text-red-600' : 'text-[#1A1A1A]/60'}`}>
                        Update v{u.version}: {u.state}{u.error ? ` (${u.error})` : ''}
                      </p>
                    )
                  })()}
                  {pending.length > 0 && (
                    <p className="text-[11px] text-amber-700 mt-1">Menunggu diambil booth: {pending.map(p => ACTION_LABEL[p.command.action]).join(', ')}</p>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {can('approve') && <button disabled={!!busy} onClick={() => send(d, 'approve')} className={`${btn} bg-primary text-white`}><ShieldCheck className="w-4 h-4" />Approve</button>}
                  {can('unlock') && <button disabled={!!busy} onClick={() => send(d, 'unlock')} className={`${btn} bg-primary text-white`}><Unlock className="w-4 h-4" />Buka kunci</button>}
                  {can('lock') && <button disabled={!!busy} onClick={() => send(d, 'lock')} className={`${btn} bg-red-600 text-white`}><Lock className="w-4 h-4" />Kunci</button>}
                  {can('restart') && <button disabled={!!busy} onClick={() => send(d, 'restart')} className={`${btn} bg-[#1A1A1A]/5 text-[#1A1A1A]`}><Power className="w-4 h-4" />Restart</button>}
                  {can('update') && <button disabled={!!busy} className={`${btn} bg-[#1A1A1A]/5 text-[#1A1A1A]`} onClick={() => {
                    const version = prompt(`Update ke versi (sudah di-publish dengan scripts/publish-release.mjs). Sekarang v${d.app_version || '?'}`)
                    if (version === null) return
                    if (!/^\d+\.\d+\.\d+$/.test(version.trim())) { setError('Versi harus format x.y.z'); return }
                    send(d, 'update', { version: version.trim() })
                  }}><Download className="w-4 h-4" />Update</button>}
                  {can('set_config') && <button disabled={!!busy} onClick={() => { setConfigFor(d); setConfigText('{\n  \n}') }} className={`${btn} bg-[#1A1A1A]/5 text-[#1A1A1A]`}><Wrench className="w-4 h-4" />Ubah config</button>}
                  {can('set_config') && <button disabled={!!busy} className={`${btn} bg-[#1A1A1A]/5 text-[#1A1A1A]`} onClick={async () => {
                    const pin = prompt('PIN admin baru: 4-8 angka, hanya 1, 2 dan 3 (tombol fisik booth)')
                    if (pin === null) return
                    if (!/^[123]{4,8}$/.test(pin)) { setError('PIN harus 4-8 angka dari 1, 2, 3'); return }
                    send(d, 'set_config', { patch: { adminPinHash: await hashAdminPin(pin), adminPinLength: pin.length } })
                  }}><KeyRound className="w-4 h-4" />PIN admin</button>}
                  {can('revoke') && <button disabled={!!busy} onClick={() => send(d, 'revoke')} className={`${btn} bg-[#1A1A1A]/5 text-red-600`}><Trash2 className="w-4 h-4" />Cabut</button>}
                </div>
              </div>

              {configFor?.id === d.id && (
                <div className="bg-[#F9F9F9] rounded-xl p-4 space-y-2">
                  <p className="text-xs text-[#1A1A1A]/60">
                    Field config yang diganti, format JSON. Contoh: {'{ "paymentEnabled": true, "sessionPrice": 30000 }'}
                  </p>
                  <textarea value={configText} onChange={e => setConfigText(e.target.value)} rows={6}
                    className="w-full font-mono text-xs p-3 rounded-lg border border-[#1A1A1A]/10" />
                  <div className="flex gap-2">
                    <button disabled={!!busy} className={`${btn} bg-primary text-white`} onClick={() => {
                      let patch: unknown
                      try { patch = JSON.parse(configText) } catch { setError('JSON config tidak valid'); return }
                      if (!patch || typeof patch !== 'object' || Array.isArray(patch)) { setError('Config harus objek JSON'); return }
                      setConfigFor(null)
                      send(d, 'set_config', { patch: patch as Record<string, unknown> })
                    }}>Tanda tangani & kirim</button>
                    <button className={`${btn} bg-[#1A1A1A]/5 text-[#1A1A1A]`} onClick={() => setConfigFor(null)}>Batal</button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {isSuper && (
        <div className="bg-white p-6 rounded-2xl border border-[#1A1A1A]/10 shadow-xs space-y-3">
          <h3 className="font-bold text-[#1A1A1A] flex items-center gap-2"><KeyRound className="w-4 h-4" /> Passkey owner</h3>
          <p className="text-xs text-[#1A1A1A]/60">
            Daftarkan dari HP/laptop kamu sendiri. Snippet yang muncul harus ditanam di build aplikasi booth
            (<code>src/shared/guardPins.ts</code>) sebelum passkey ini bisa membuka kunci booth.
          </p>
          <button disabled={!!busy} onClick={registerPasskey} className={`${btn} bg-primary text-white`}>
            <KeyRound className="w-4 h-4" /> Daftarkan passkey device ini
          </button>
          {pin && <textarea readOnly value={pin} rows={10} className="w-full font-mono text-[11px] p-3 rounded-lg border border-[#1A1A1A]/10 bg-[#F9F9F9]" />}

          <details className="pt-2">
            <summary className="text-xs font-bold text-[#1A1A1A]/70 cursor-pointer">Kirim command dari recovery key (HP hilang)</summary>
            <p className="text-xs text-[#1A1A1A]/60 mt-2">
              Tempel hasil <code>node scripts/booth-guard-recovery-sign.mjs</code> (JSON berisi command dan assertion).
            </p>
            <textarea value={recoveryText} onChange={e => setRecoveryText(e.target.value)} rows={5}
              className="w-full font-mono text-[11px] p-3 rounded-lg border border-[#1A1A1A]/10 mt-2" />
            <button onClick={sendRecovery} disabled={!recoveryText.trim()} className={`${btn} bg-[#1A1A1A] text-white mt-2`}>Kirim</button>
          </details>
        </div>
      )}
    </div>
  )
}
