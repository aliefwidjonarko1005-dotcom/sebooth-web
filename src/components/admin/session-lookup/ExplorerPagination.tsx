'use client'

import React from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'

interface ExplorerPaginationProps {
  listLoading: boolean
  currentPage: number
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>
  pageSize: number
  setPageSize: React.Dispatch<React.SetStateAction<number>>
  totalCount: number
  totalPages: number
}

/** Page size, range and first/prev/next/last controls. */
export function ExplorerPagination({ listLoading, currentPage, setCurrentPage, pageSize, setPageSize, totalCount, totalPages }: ExplorerPaginationProps) {
  return (
    <div className="p-4 sm:p-6 border-t border-[#1A1A1A]/10 bg-[#F9F9F9]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3 text-xs text-[#1A1A1A]/60">
        <span>
          Menampilkan{' '}
          <strong className="text-[#1A1A1A]">
            {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}
          </strong>{' '}
          -{' '}
          <strong className="text-[#1A1A1A]">
            {Math.min(currentPage * pageSize, totalCount)}
          </strong>{' '}
          dari <strong className="text-[#1A1A1A]">{totalCount.toLocaleString('id-ID')}</strong> sesi
        </span>

        <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-[#1A1A1A]/15">
          <span>Per halaman:</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
            className="bg-white border border-[#1A1A1A]/15 rounded-lg px-2 py-1 text-xs font-semibold cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {/* First Page */}
        <button
          onClick={() => setCurrentPage(1)}
          disabled={currentPage <= 1 || listLoading}
          className="p-2 rounded-xl border border-[#1A1A1A]/10 bg-white text-[#1A1A1A] hover:bg-[#F9F9F9] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          title="Halaman Pertama"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>

        {/* Prev Page */}
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage <= 1 || listLoading}
          className="px-3 py-1.5 rounded-xl border border-[#1A1A1A]/10 bg-white text-[#1A1A1A] hover:bg-[#F9F9F9] text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </button>

        <span className="px-3 py-1.5 text-xs font-bold text-[#1A1A1A]">
          Hal {currentPage} / {totalPages || 1}
        </span>

        {/* Next Page */}
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage >= totalPages || listLoading}
          className="px-3 py-1.5 rounded-xl border border-[#1A1A1A]/10 bg-white text-[#1A1A1A] hover:bg-[#F9F9F9] text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
        >
          <span className="hidden sm:inline">Selanjutnya</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage >= totalPages || listLoading}
          className="p-2 rounded-xl border border-[#1A1A1A]/10 bg-white text-[#1A1A1A] hover:bg-[#F9F9F9] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          title="Halaman Terakhir"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
