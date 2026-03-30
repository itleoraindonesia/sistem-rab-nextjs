"use client";

import Link from "next/link";
import { useEffect, useState } from 'react';
import { GitCommit, RefreshCw, Calendar, ArrowRight } from 'lucide-react';

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
  const lastDate = sortedDates[0];

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

  return (
    <div className="bg-gray-100 rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-gray-400" />
          <h3 className="font-semibold text-gray-700 text-sm">Pembaruan Sistem</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={fetchCommits}
            disabled={loading}
            className="p-1.5 hover:bg-gray-200 rounded-md transition-all text-gray-400 hover:text-gray-600"
            title="Segarkan Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/setting/updates"
            className="p-1.5 hover:bg-gray-200 rounded-md transition-all text-gray-400 hover:text-gray-600"
            title="Lihat Semua"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="p-4">
        {loading && sortedDates.length === 0 ? (
          <div className="py-4 flex items-center justify-center text-gray-400">
            <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin mr-2"></div>
            <p className="text-xs">Memuat data...</p>
          </div>
        ) : error ? (
          <div className="py-4 text-center">
            <p className="text-xs text-red-500 mb-2">{error}</p>
            <button
              onClick={fetchCommits}
              className="text-xs font-medium text-gray-600 hover:text-gray-800 hover:underline"
            >
              Coba lagi
            </button>
          </div>
        ) : sortedDates.length === 0 ? (
          <div className="py-4 text-center text-gray-400">
            <p className="text-xs">Belum ada riwayat.</p>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Tanggal terakhir pembaruan</p>
              <p className="text-sm font-medium text-gray-800">{formatDate(lastDate)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function CommitRecapFull() {
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

  const cleanMessage = (msg: string) => {
    return msg.replace(/^(feat|fix|docs|style|refactor|test|chore|perf)(\(.*\))?:/, '').trim();
  };

  const getCommitBadge = (msg: string) => {
    const lowerMsg = msg.toLowerCase();
    if (lowerMsg.startsWith('feat')) return { label: 'Fitur', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    if (lowerMsg.startsWith('fix')) return { label: 'Perbaikan', color: 'bg-rose-100 text-rose-700 border-rose-200' };
    if (lowerMsg.startsWith('docs')) return { label: 'Docs', color: 'bg-amber-100 text-amber-700 border-amber-200' };
    if (lowerMsg.startsWith('perf')) return { label: 'Performa', color: 'bg-violet-100 text-violet-700 border-violet-200' };
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-brand-primary" />
          <h3 className="font-bold text-gray-900 text-sm">Pembaruan Sistem</h3>
        </div>
        <button
          onClick={fetchCommits}
          disabled={loading}
          className="p-1.5 hover:bg-gray-100 rounded-md transition-all text-gray-500 hover:text-brand-primary"
          title="Segarkan Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="p-0">
        {loading && sortedDates.length === 0 ? (
          <div className="py-12 flex flex-col items-center text-center text-gray-400">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-brand-primary rounded-full animate-spin mb-2"></div>
            <p className="text-sm">Memuat data...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center px-4">
            <p className="text-sm text-red-500 mb-2">{error}</p>
            <button
              onClick={fetchCommits}
              className="text-sm font-medium text-brand-primary hover:underline"
            >
              Coba lagi
            </button>
          </div>
        ) : sortedDates.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <p className="text-sm">Belum ada riwayat.</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-4 bottom-4 w-px bg-gray-200"></div>

            <div className="py-6 px-4 space-y-6">
              {sortedDates.map((dateKey) => {
                const dateCommits = commits[dateKey];
                const isToday = new Date(dateKey).toDateString() === new Date().toDateString();

                return (
                  <div key={dateKey} className="relative z-10 pl-8">
                    <div className="absolute left-0 top-1 flex items-center justify-center w-8 h-8">
                      <div className={`w-3 h-3 rounded-full border-2 ${isToday ? 'bg-brand-primary border-brand-primary' : 'bg-white border-gray-300'}`}></div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <span className={`text-sm font-semibold ${isToday ? 'text-brand-primary' : 'text-gray-700'}`}>
                        {formatDate(dateKey)}
                      </span>
                      {isToday && (
                        <span className="text-[10px] font-bold text-white bg-brand-primary px-2 py-0.5 rounded">
                          Hari Ini
                        </span>
                      )}
                    </div>

                    <div className="space-y-3">
                      {dateCommits.map((commit) => {
                        const badge = getCommitBadge(commit.message);
                        const cleanMsg = cleanMessage(commit.message);
                        
                        return (
                          <div 
                            key={commit.sha} 
                            className="group bg-gray-50 hover:bg-gray-100 rounded-lg p-3 transition-colors"
                          >
                            <div className="flex items-start gap-2.5">
                              {badge && (
                                <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${badge.color}`}>
                                  {badge.label}
                                </span>
                              )}
                              <p className={`text-sm text-gray-700 font-medium leading-relaxed group-hover:text-gray-900 ${badge ? 'pt-0.5' : ''}`}>
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