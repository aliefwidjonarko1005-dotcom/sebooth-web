import type { GuideStep } from '@/components/guide/Guide'

/**
 * Per-page guide steps. Targets are DOM ids; a step whose target is not on screen
 * (hidden for this user, not loaded yet) is skipped automatically.
 * Bump the storage key version when the steps change so returning visitors see them once.
 */

export const GUIDE_KEYS = {
  access: 'guide_seen_access_v2',
  profile: 'guide_seen_profile_v2',
  queueJoin: 'guide_seen_queue_join_v2',
  queueTicket: 'guide_seen_queue_ticket_v2',
  frames: 'guide_seen_frames_v2',
  homeSwipe: 'guide_seen_home_swipe_v2'
} as const

export const ACCESS_GUIDE: GuideStep[] = [
  {
    target: 'tour-claim-urgent-banner',
    title: 'Status penyimpanan sesi',
    body: 'Titik di kiri menunjukkan berapa lama file disimpan. Ketuk "Simpan permanen" agar sesi masuk ke akunmu.'
  },
  {
    target: 'tour-claim-first-media',
    title: 'Lihat foto ukuran penuh',
    body: 'Semua hasil sesi ada di sini: photostrip, foto pose, dan live video.',
    gesture: 'tap',
    advanceOn: 'click'
  },
  {
    target: 'tour-lightbox-media',
    title: 'Geser untuk media berikutnya',
    body: 'Di layar penuh, geser ke kiri atau kanan untuk berpindah. Tahan foto untuk menyimpannya langsung di HP.',
    gesture: 'swipe-x'
  },
  {
    target: 'tour-lightbox-close',
    title: 'Kembali ke galeri',
    body: 'Tutup tampilan penuh untuk melanjutkan.',
    gesture: 'tap',
    advanceOn: 'click'
  },
  {
    target: 'tour-claim-bundle-btn',
    title: 'Unduh semua sekaligus',
    body: 'Satu ketukan menyimpan seluruh file ke perangkat, tanpa ZIP. Setelah selesai, ada dua langkah singkat: rating dan follow Instagram.',
    gesture: 'tap'
  },
  {
    target: 'tour-claim-share-btn',
    title: 'Bagikan ke teman satu sesi',
    body: 'Kirim tautan ini supaya teman yang ikut berfoto bisa mengunduh sendiri.',
    gesture: 'tap'
  }
]

export const PROFILE_GUIDE: GuideStep[] = [
  {
    target: 'tour-profile-session-card',
    title: 'Tumpukan foto sesi',
    body: 'Ketuk foto untuk ganti pose. Geser ke samping atau tekan panah kiri dan kanan untuk pindah sesi.',
    gesture: 'swipe-x'
  },
  {
    target: 'tour-profile-mode-switcher',
    title: 'Lihat semua sesi sekaligus',
    body: 'Tombol ini membuka rak album berisi seluruh sesimu.',
    gesture: 'tap'
  },
  {
    target: 'tour-profile-bundle-btn',
    title: 'Simpan semua file sesi ini',
    body: 'Photostrip, live video, GIF, dan foto asli diunduh berurutan dalam kualitas penuh.',
    gesture: 'tap'
  },
  {
    target: 'tour-profile-help-btn',
    title: 'Butuh bantuan lagi?',
    body: 'Buka panduan ini kapan saja dari tombol tanda tanya.',
    gesture: 'tap'
  }
]

export const QUEUE_JOIN_GUIDE: GuideStep[] = [
  {
    target: 'guide-join-account',
    title: 'Data dari akunmu',
    body: 'Nama dan nomor ini dipakai operator untuk memanggilmu. Tidak perlu isi formulir lagi.'
  },
  {
    target: 'guide-join-submit',
    title: 'Ambil nomor antrean',
    body: 'Setelah dapat nomor, kamu bebas jalan-jalan. Halaman tiket memberi tahu kapan harus kembali ke booth.',
    gesture: 'tap'
  }
]

export const QUEUE_TICKET_GUIDE: GuideStep[] = [
  {
    target: 'guide-ticket-number',
    title: 'Ini nomor antreanmu',
    body: 'Warna layar berubah saat giliranmu mendekat: kuning artinya bersiap, oranye artinya menuju booth, merah artinya giliranmu.'
  },
  {
    target: 'guide-ticket-timer',
    title: 'Perkiraan waktu tunggu',
    body: 'Dihitung dari durasi rata-rata sesi di booth ini dan diperbarui otomatis.'
  },
  {
    target: 'guide-ticket-push',
    title: 'Nyalakan notifikasi',
    body: 'Kami kirim pemberitahuan ke HP saat giliranmu dekat, jadi kamu tidak perlu terus membuka halaman ini.',
    gesture: 'tap'
  },
  {
    target: 'guide-ticket-checkin',
    title: 'Check-in saat dipanggil',
    body: 'Tombol check-in muncul saat kamu tinggal dua antrean lagi. Kalau tidak check-in saat dipanggil, nomormu bisa dilewati.',
    gesture: 'tap'
  }
]

export const FRAMES_GUIDE: GuideStep[] = [
  {
    target: 'guide-frames-categories',
    title: 'Pilih tema acara',
    body: 'Ketuk atau geser deretan kategori untuk menyaring frame sesuai tema acaramu.',
    gesture: 'swipe-x'
  },
  {
    target: 'guide-frames-search',
    title: 'Atau cari langsung',
    body: 'Ketik nama atau gaya frame yang kamu cari.'
  },
  {
    target: 'guide-frames-first',
    title: 'Lihat detail frame',
    body: 'Ketuk frame untuk melihatnya lebih besar, lalu pesan lewat WhatsApp kalau cocok.',
    gesture: 'tap',
    advanceOn: 'click'
  },
  {
    target: 'guide-frames-order',
    title: 'Pesan frame ini',
    body: 'Tombol ini membuka WhatsApp dengan nama frame sudah terisi.'
  }
]
