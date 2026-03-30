"use client";

import { useEffect, useState } from 'react';
import { RefreshCw, ExternalLink } from 'lucide-react';

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

const getCommitBadge = (msg: string) => {
  const lowerMsg = msg.toLowerCase();
  if (lowerMsg.startsWith('feat')) return { label: 'Fitur', color: 'bg-emerald-100 text-emerald-700' };
  if (lowerMsg.startsWith('fix')) return { label: 'Fix', color: 'bg-rose-100 text-rose-700' };
  if (lowerMsg.startsWith('docs')) return { label: 'Docs', color: 'bg-amber-100 text-amber-700' };
  if (lowerMsg.startsWith('perf')) return { label: 'Perf', color: 'bg-violet-100 text-violet-700' };
  if (lowerMsg.startsWith('refactor')) return { label: 'Refactor', color: 'bg-blue-100 text-blue-700' };
  return null;
};

const cleanMessage = (msg: string) => {
  return msg.replace(/^(feat|fix|docs|style|refactor|test|chore|perf)(\(.*\))?:/, '').trim();
};

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  } catch {
    return dateString;
  }
};

const formatRelativeDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hari ini';
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari lalu`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
    return null;
  } catch {
    return null;
  }
};

export default function UpdatesPage() {
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

  return (
    <div className="py-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-primary">Pembaruan Sistem</h1>
            <p className="text-sm text-gray-500 mt-0.5">Riwayat pembaruan dan fitur baru</p>
          </div>
          <button
            onClick={fetchCommits}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Segarkan</span>
          </button>
        </div>

        {sortedDates[0] && (
          <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-lg px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
              <span className="text-sm text-gray-600">Terakhir diperbarui:</span>
              <span className="text-sm font-semibold text-brand-primary">{formatDate(sortedDates[0])}</span>
            </div>
            <span className="text-xs text-gray-500">{commits[sortedDates[0]]?.length || 0} update</span>
          </div>
        )}

        {loading && sortedDates.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-brand-primary rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-400">Memuat data...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-sm text-red-500 mb-2">{error}</p>
            <button onClick={fetchCommits} className="text-sm font-medium text-brand-primary hover:underline">Coba lagi</button>
          </div>
        ) : sortedDates.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-400">Belum ada riwayat.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedDates.map((dateKey) => {
              const dateCommits = commits[dateKey];
              const isToday = new Date(dateKey).toDateString() === new Date().toDateString();
              const relativeDate = formatRelativeDate(dateKey);
              const formattedDate = formatDate(dateKey);

              return (
                <div key={dateKey} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className={`px-4 py-2.5 flex items-center justify-between border-b ${isToday ? 'bg-brand-primary/5 border-brand-primary/20' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isToday ? 'bg-brand-primary' : 'bg-gray-300'}`} />
                      <span className={`text-sm font-medium ${isToday ? 'text-brand-primary' : 'text-gray-700'}`}>
                        {relativeDate ? `${formattedDate} (${relativeDate})` : formattedDate}
                      </span>
                      {isToday && <span className="text-[10px] font-bold text-white bg-brand-primary px-1.5 py-0.5 rounded">BARU</span>}
                    </div>
                    <span className="text-xs text-gray-500">{dateCommits.length} commit</span>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {dateCommits.map((commit) => {
                      const badge = getCommitBadge(commit.message);
                      const message = cleanMessage(commit.message);

                      return (
                        <div key={commit.sha} className="px-4 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors group">
                          {badge ? (
                            <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium ${badge.color}`}>{badge.label}</span>
                          ) : (
                            <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">Other</span>
                          )}
                          <p className="flex-1 text-sm text-gray-800 truncate">{message}</p>
                          <span className="text-[11px] text-gray-400 shrink-0">{commit.author}</span>
                          {commit.url && (
                            <a href={commit.url} target="_blank" rel="noopener noreferrer" className="shrink-0 p-1 hover:text-brand-primary text-gray-300 transition-colors" title="GitHub">
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}