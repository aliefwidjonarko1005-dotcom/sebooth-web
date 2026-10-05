/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SEBOOTH UNCLAIMED SESSION RETENTION & EXPIRY POLICY
 * ═══════════════════════════════════════════════════════════════════════════
 * Aturan Kebijakan Batas Waktu 3 Hari untuk Sesi yang Belum Diklaim:
 * 1. Berlaku untuk sesi-sesi SETELAH tanggal kebijakan dimulai (5 Oktober 2026).
 *    Sesi baru wajib diklaim dalam kurun waktu 3 hari (72 jam) sejak sesi dibuat.
 * 2. Untuk sesi-sesi SEBELUM tanggal kebijakan (sesi lama / legacy):
 *    TIDAK BERLAKU kebijakan 3 hari ini. Semua foto sesi lama tetap tersimpan
 *    permanen di server dan dapat diakses/diklaim kapan saja tanpa batas waktu.
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Tanggal awal berlakunya kebijakan 3 hari (5 Oktober 2026 00:00:00 UTC)
export const UNCLAIMED_EXPIRY_POLICY_START_DATE =
  process.env.NEXT_PUBLIC_UNCLAIMED_EXPIRY_POLICY_START_DATE || '2026-10-05T00:00:00.000Z';

// Durasi batas simpan sementara: 3 hari (72 jam)
export const UNCLAIMED_EXPIRY_DURATION_MS = 3 * 24 * 60 * 60 * 1000;

export interface SessionExpiryStatus {
  /** Apakah sesi ini tunduk pada kebijakan batas waktu 3 hari (dibuat >= tanggal kebijakan) */
  isSubjectToPolicy: boolean;
  /** Apakah sesi ini sudah kedaluwarsa (hanya berlaku jika isSubjectToPolicy && !isClaimed && diff <= 0) */
  isExpired: boolean;
  /** Sisa total jam sebelum kedaluwarsa */
  totalHours: number;
  /** Sisa hari */
  days: number;
  /** Sisa jam (modulo 24) */
  hours: number;
  /** Teks ramah pengguna untuk countdown / status */
  timeString: string;
  /** Timestamp waktu kedaluwarsa (null jika tidak tunduk pada kebijakan atau sudah diklaim) */
  expiryTimestamp: number | null;
  /** Tanggal awal kebijakan */
  policyStartDate: string;
}

/**
 * Menghitung status masa berlaku sesi foto berdasarkan tanggal pembuatan dan status klaim.
 */
export function checkSessionExpiry(
  createdAtStr?: string | null,
  isClaimed?: boolean
): SessionExpiryStatus {
  const policyStart = new Date(UNCLAIMED_EXPIRY_POLICY_START_DATE).getTime();

  // Jika sudah diklaim, foto tersimpan permanen di akun pengguna
  if (isClaimed) {
    return {
      isSubjectToPolicy: false,
      isExpired: false,
      totalHours: 0,
      days: 0,
      hours: 0,
      timeString: 'Tersimpan Permanen',
      expiryTimestamp: null,
      policyStartDate: UNCLAIMED_EXPIRY_POLICY_START_DATE,
    };
  }

  // Jika tanggal sesi tidak ada, anggap aman dari kedaluwarsa
  if (!createdAtStr) {
    return {
      isSubjectToPolicy: false,
      isExpired: false,
      totalHours: 0,
      days: 0,
      hours: 0,
      timeString: 'Bebas Batas Waktu',
      expiryTimestamp: null,
      policyStartDate: UNCLAIMED_EXPIRY_POLICY_START_DATE,
    };
  }

  const createdAt = new Date(createdAtStr).getTime();

  // SESI SEBELUM KEBIJAKAN: Kebijakan 3 hari TIDAK BERLAKU
  if (createdAt < policyStart) {
    return {
      isSubjectToPolicy: false,
      isExpired: false,
      totalHours: 0,
      days: 0,
      hours: 0,
      timeString: 'Bebas Batas Waktu (Sesi Sebelum Kebijakan)',
      expiryTimestamp: null,
      policyStartDate: UNCLAIMED_EXPIRY_POLICY_START_DATE,
    };
  }

  // SESI SETELAH KEBIJAKAN: Berlaku batas waktu 3 hari sejak sesi dibuat
  const expiryTimestamp = createdAt + UNCLAIMED_EXPIRY_DURATION_MS;
  const diff = expiryTimestamp - Date.now();
  const isExpired = diff <= 0;

  const totalHours = Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  let timeString = 'Kedaluwarsa';
  if (!isExpired) {
    timeString = days > 0 ? `${days} Hari ${hours} Jam` : `${hours} Jam`;
  }

  return {
    isSubjectToPolicy: true,
    isExpired,
    totalHours,
    days,
    hours,
    timeString,
    expiryTimestamp,
    policyStartDate: UNCLAIMED_EXPIRY_POLICY_START_DATE,
  };
}
