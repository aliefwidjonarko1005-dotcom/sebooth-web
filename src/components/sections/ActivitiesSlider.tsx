'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Clock, ArrowUpRight,
  Instagram, MapPin, BookOpen, ChevronRight
} from 'lucide-react'
import { ARTICLES_DATA } from '@/data/articles'

export const ActivitiesSlider: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stories' | 'activities'>('stories')

  return (
    <section className="relative w-full h-full min-h-screen flex flex-col justify-between items-center px-4 sm:px-6 md:px-10 pt-20 sm:pt-24 pb-8 overflow-hidden select-none bg-[#FAF8F5]">
      {/* Background Soft Glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-orange-400/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

      {/* ── 1. Top Section Header ── */}
      <div className="max-w-3xl w-full text-center flex flex-col items-center shrink-0 z-10">
        <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black font-bayon uppercase tracking-wide text-slate-900 leading-tight">
          Cerita Sebooth
        </h2>

        <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-xl line-clamp-2">
          Keseruan photobooth Sebooth di kampus Tembalang, resepsi wedding, konser musik, dan festival di Kota Semarang.
        </p>

        {/* Tab Switcher */}
        <div className="mt-4 p-1 rounded-full bg-stone-200/80 border border-stone-300/80 flex items-center gap-1">
          <button
            onClick={() => setActiveTab('stories')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'stories'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Artikel
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'activities'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Instagram className="w-3.5 h-3.5" />
            <span>Recent Post</span>
          </button>
        </div>
      </div>

      {/* ── 2. Content Stage (Grid / Horizontal Scroll Cards) ── */}
      <div className="w-full max-w-5xl flex-1 flex items-center justify-center my-3 sm:my-4 z-10 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'stories' ? (
            <motion.div
              key="stories-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5"
            >
              {ARTICLES_DATA.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="group bg-white rounded-2xl sm:rounded-3xl border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Cover Thumbnail */}
                    <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden">
                      <Image
                        src={item.coverImage}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                      />
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[9px] font-black text-white uppercase tracking-wider">
                        {item.category}
                      </span>
                    </div>

                    {/* Card Content */}
                    <div className="p-3.5 sm:p-4">
                      <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500 mb-1.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {item.date}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.readTime}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#FF5500] transition-colors line-clamp-2 leading-snug">
                        {item.title}
                      </h3>

                      <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {item.excerpt}
                      </p>
                    </div>
                  </div>

                  {/* Read Article Action */}
                  <div className="p-3.5 sm:p-4 pt-0">
                    <Link
                      href={`/artikel/${item.slug}`}
                      className="w-full py-2 px-3 rounded-xl bg-stone-100 group-hover:bg-[#FF5500] group-hover:text-white text-slate-800 font-bold text-xs flex items-center justify-between transition-all"
                    >
                      <span>Baca Cerita Lengkap</span>
                      <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </Link>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="activities-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5"
            >
              {/* Instagram Activity Post 1 */}
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200 shadow-sm p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[1.5px]">
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-black text-[10px] text-slate-900">
                          SB
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">@sebooth.id</p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5 text-orange-500" />
                          Gedung Prof. Soedarto, UNDIP Tembalang
                        </p>
                      </div>
                    </div>
                    <Instagram className="w-4 h-4 text-pink-600" />
                  </div>

                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-stone-100 mb-3">
                    <Image
                      src="/images/products/mini_studio_booth.webp"
                      alt="Sebooth Event Wisuda UNDIP"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  <p className="text-xs text-slate-700 line-clamp-3 leading-relaxed">
                    ✨ Momen haru & bahagia wisudawan UNDIP bareng bestie & keluarga! Makasih udah percaya sama Sebooth buat cetak instan kenangan berharga kalian 🎓❤️
                  </p>
                </div>

                <a
                  href="https://instagram.com/sebooth.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-bold transition-all"
                >
                  <span>Buka di Instagram</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Instagram Activity Post 2 */}
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200 shadow-sm p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[1.5px]">
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-black text-[10px] text-slate-900">
                          SB
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">@sebooth.id</p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5 text-orange-500" />
                          Ballroom Hotel Semarang
                        </p>
                      </div>
                    </div>
                    <Instagram className="w-4 h-4 text-pink-600" />
                  </div>

                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-stone-100 mb-3">
                    <Image
                      src="/images/products/partner_sebooth.webp"
                      alt="Sebooth Wedding Semarang"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  <p className="text-xs text-slate-700 line-clamp-3 leading-relaxed">
                    💍 Happy wedding Kevin & Sarah! Tamu-tamu seru banget cobain frame aesthetic wedding Sebooth dengan lighting studio glowing alami. Unlimited print seharian!
                  </p>
                </div>

                <a
                  href="https://instagram.com/sebooth.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-bold transition-all"
                >
                  <span>Buka di Instagram</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Instagram Activity Post 3 */}
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200 shadow-sm p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[1.5px]">
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-black text-[10px] text-slate-900">
                          SB
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">@sebooth.id</p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5 text-orange-500" />
                          Kota Lama Semarang
                        </p>
                      </div>
                    </div>
                    <Instagram className="w-4 h-4 text-pink-600" />
                  </div>

                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-stone-100 mb-3">
                    <Image
                      src="/images/products/vending_machine_booth.webp"
                      alt="Sebooth Vending Machine Semarang"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  <p className="text-xs text-slate-700 line-clamp-3 leading-relaxed">
                    🚀 Vending Machine Photobooth Sebooth mendarat di cafe Kota Lama Semarang! Cuma tap layar, pose seru, langsung jadi dalam hitungan detik. Cobain yuk!
                  </p>
                </div>

                <a
                  href="https://instagram.com/sebooth.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-bold transition-all"
                >
                  <span>Buka di Instagram</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── 3. Bottom Hub Action Bar ── */}
      <div className="w-full max-w-3xl flex items-center justify-center z-10 shrink-0">
        <Link
          href="/artikel"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95"
        >
          <BookOpen className="w-4 h-4 text-orange-400" />
          <span>Lihat Semua Artikel & Dokumentasi Event (Hub)</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  )
}
