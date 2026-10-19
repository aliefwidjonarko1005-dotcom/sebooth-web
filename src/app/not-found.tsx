import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Halaman tidak ditemukan | Sebooth",
  robots: { index: false, follow: true },
};

const WA_HELP_URL =
  "https://wa.me/6285713899441?text=Halo%20Sebooth,%20saya%20tidak%20bisa%20membuka%20link%20foto%20saya.";

// A photostrip with three blank exposures and the last one showing the error code
export default function NotFound() {
  return (
    <div className="min-h-[100svh] bg-primary text-white flex items-center justify-center px-4 pt-20 pb-16">
      <div className="w-full max-w-4xl grid gap-12 md:grid-cols-[auto_1fr] items-center">
        <div
          aria-hidden="true"
          className="mx-auto w-28 sm:w-48 bg-white p-3 pb-10 rotate-[-4deg] hard-shadow-orange"
        >
          <div className="grid gap-2">
            <div className="aspect-[4/3] bg-slate-200" />
            <div className="aspect-[4/3] bg-slate-300" />
            <div className="aspect-[4/3] bg-slate-900 flex items-center justify-center">
              <span className="font-bayon text-4xl sm:text-5xl text-secondary leading-none">404</span>
            </div>
          </div>
          <p className="mt-3 text-center font-bayon text-lg text-primary leading-none">SEBOOTH</p>
        </div>

        <div className="text-center md:text-left">
          <h1 className="font-bayon text-5xl sm:text-7xl leading-[0.95]">
            Fotonya nggak ketemu di sini
          </h1>
          <p className="mt-5 max-w-xl text-base sm:text-lg text-white/80 leading-relaxed mx-auto md:mx-0">
            Link yang kamu buka sudah tidak aktif atau salah ketik. Kalau kamu datang dari scan QR
            photobooth, coba scan ulang QR di cetakan foto kamu. Masih gagal? Kirim pesan ke tim kami,
            sertakan foto struk atau cetakannya.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center md:justify-start">
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3.5 rounded-xl bg-secondary text-white font-bold border-2 border-black hard-shadow-black active:translate-y-0.5"
            >
              Kembali ke beranda
            </Link>
            <a
              href={WA_HELP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3.5 rounded-xl bg-white text-primary font-bold border-2 border-black hard-shadow-black active:translate-y-0.5"
            >
              Chat tim Sebooth
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
