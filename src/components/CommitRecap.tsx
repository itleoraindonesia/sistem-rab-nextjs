"use client";

import { useEffect, useState } from 'react';
import { GitCommit, RefreshCw, Calendar } from 'lucide-react';

interface Commit {
  sha: string;
  message: string;
  date: string;
  author: string;
  url: string;
}

interface CommitsResponse {
  commits: Record<string, Commit[]>;
  lastUpdated: string;
  error?: string;
}

export default function CommitRecap() {
  const [commits, setCommits] = useState<Record<string, Commit[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommits = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/commits');
      const data: CommitsResponse = await response.json();
      
      if (response.ok) {
        setCommits(data.commits);
      } else {
        setError(data.error || 'Gagal mengambil data commit');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengambil data');
      console.error('Error fetching commits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommits();
  }, []);

  const sortedDates = Object.keys(commits).sort().reverse();

  // Helper untuk format tanggal Indonesia
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('id-ID', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  // Helper untuk membersihkan pesan commit
  const cleanMessage = (msg: string) => {
    return msg.replace(/^(feat|fix|docs|style|refactor|test|chore|perf)(\(.*\))?:/, '').trim();
  };

  // Helper untuk mendapatkan tipe commit (badge)
  const getCommitBadge = (msg: string) => {
    const lowerMsg = msg.toLowerCase();
    // Colors optimized for dark green background
    if (lowerMsg.startsWith('feat')) return { label: 'Fitur', color: 'bg-emerald-400/20 text-emerald-100 border-emerald-400/30' };
    if (lowerMsg.startsWith('fix')) return { label: 'Perbaikan', color: 'bg-rose-400/20 text-rose-100 border-rose-400/30' };
    if (lowerMsg.startsWith('docs')) return { label: 'Docs', color: 'bg-amber-400/20 text-amber-100 border-amber-400/30' };
    if (lowerMsg.startsWith('perf')) return { label: 'Performa', color: 'bg-violet-400/20 text-violet-100 border-violet-400/30' };
    return null;
  };

  return (
    <div className="bg-brand-primary rounded-xl shadow-lg border border-brand-primary overflow-hidden text-white">
      {/* Header Section Compact */}
      <div className="px-4 py-3 border-b border-white/10 bg-black/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-brand-accent" />
          <h3 className="font-bold text-white text-sm">Pembaruan Sistem</h3>
        </div>
        <button
          onClick={fetchCommits}
          disabled={loading}
          className="p-1.5 hover:bg-white/10 rounded-md transition-all text-white/70 hover:text-brand-accent"
          title="Segarkan Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="p-0">
        {loading && sortedDates.length === 0 ? (
          <div className="py-8 flex flex-col items-center text-center text-white/50">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mb-2"></div>
            <p className="text-xs">Memuat data...</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center px-4">
            <p className="text-xs text-red-200 mb-2">{error}</p>
            <button
              onClick={fetchCommits}
              className="text-xs font-medium text-brand-accent hover:underline"
            >
              Coba lagi
            </button>
          </div>
        ) : sortedDates.length === 0 ? (
          <div className="py-8 text-center text-white/50">
            <p className="text-xs">Belum ada riwayat.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-3.5 top-4 bottom-4 w-px bg-white/20"></div>

            <div className="py-4 px-3 space-y-6">
              {sortedDates.map((dateKey) => {
                const dateCommits = commits[dateKey];
                const isToday = new Date(dateKey).toDateString() === new Date().toDateString();

                return (
                  <div key={dateKey} className="relative z-10 pl-8">
                    {/* Date Marker */}
                    <div className="absolute left-0 top-0.5 flex items-center justify-center w-7 h-7">
                      <div className={`w-2.5 h-2.5 rounded-full border-2 border-brand-primary ring-2 ring-white/20 ${isToday ? 'bg-brand-accent' : 'bg-white'}`}></div>
                    </div>

                    {/* Date Header */}
                    <div className="flex items-center gap-2 mb-3">
                       <span className={`text-xs font-semibold ${isToday ? 'text-brand-accent' : 'text-white/90'}`}>
                          {formatDate(dateKey)}
                        </span>
                        {isToday && (
                          <span className="text-[10px] font-bold text-brand-primary bg-brand-accent px-1.5 rounded">
                            Hari Ini
                          </span>
                        )}
                    </div>

                    {/* Commits List */}
                    <div className="space-y-3">
                      {dateCommits.map((commit) => {
                        const badge = getCommitBadge(commit.message);
                        const cleanMsg = cleanMessage(commit.message);
                        
                        return (
                          <div 
                            key={commit.sha} 
                            className="group"
                          >
                            <div className="flex items-start gap-2.5">
                              {badge && (
                                <span className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${badge.color}`}>
                                  {badge.label}
                                </span>
                              )}
                              <p className={`text-xs text-white/80 font-medium leading-relaxed group-hover:text-white transition-colors ${badge ? 'pt-0.5' : ''}`}>
                                {cleanMsg}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}