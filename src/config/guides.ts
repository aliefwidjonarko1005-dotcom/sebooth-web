import type { GuideStep } from '@/components/guide/Guide'

/**
 * Per-page guide steps. Targets are DOM ids; a step whose target is not on screen
 * (hidden for this user, not loaded yet) is skipped automatically.
 * Bump the storage key version when the steps change so returning visitors see them once.
 */

export const GUIDE_KEYS = {
  access: 'guide_seen_access_v2',
  profile: 'guide_seen_profile_v4',
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

// Learn by doing: each gesture step waits for the visitor to really do it on their own photos
export const PROFILE_GUIDE: GuideStep[] = [
  {
    target: 'tour-profile-session-card',
    title: 'Ketuk untuk ganti pose',
    body: 'Satu sesi berisi photostrip, foto pose, live video, dan GIF. Coba ketuk fotonya sekali.',
    gesture: 'tap',
    advanceOn: 'action',
    action: 'profile-tap'
  },
  {
    target: 'tour-profile-session-card',
    title: 'Geser untuk pindah sesi',
    body: 'Sekarang geser foto ke kiri atau kanan untuk membuka sesi lain. Di laptop, tarik pakai mouse.',
    gesture: 'swipe-x',
    advanceOn: 'action',
    action: 'profile-swipe'
  },
  {
    target: 'tour-profile-session-card',
    title: 'Tahan untuk buka menu',
    body: 'Tekan dan tahan foto sampai kartunya membesar, lalu lepas. Menu unduh dan bagikan akan terbuka.',
    gesture: 'hold',
    advanceOn: 'action',
    action: 'profile-hold'
  },
  {
    target: 'tour-profile-options-close',
    title: 'Ini menu fotomu',
    body: 'Dari sini kamu bisa unduh foto HD atau bagikan sesi. Untuk sekarang, tutup dulu menunya.',
    gesture: 'tap',
    advanceOn: 'click'
  },
  {
    target: 'bottom-nav-bookshelf-btn',
    title: 'Buka Gallery View',
    body: 'Semua sesimu tersusun di satu rak. Ketuk tombol ini untuk melihatnya.',
    gesture: 'tap',
    advanceOn: 'click'
  },
  {
    target: 'tour-profile-bookshelf-grid',
    title: 'Pilih satu sesi',
    body: 'Ketuk salah satu photostrip untuk membukanya dalam tampilan besar.',
    gesture: 'tap',
    advanceOn: 'click'
  },
  {
    target: 'tour-profile-bundle-btn',
    title: 'Simpan semua file sesi ini',
    body: 'Tombol ini mengunduh photostrip, live video, GIF, dan foto asli dalam kualitas penuh. Pakai kapan saja kamu siap.'
  },
  {
    target: 'bottom-nav-guide-btn',
    title: 'Kamu sudah siap',
    body: 'Panduan ini bisa dibuka lagi kapan saja dari tombol Guide.'
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
