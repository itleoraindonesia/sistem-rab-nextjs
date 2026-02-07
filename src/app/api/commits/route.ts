import { NextResponse } from 'next/server';

// GitHub API configuration
const GITHUB_REPO = 'itleoraindonesia/sistem-rab-nextjs';
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/commits`;

// Commit interface
interface ProcessedCommit {
  sha: string;
  message: string;
  date: string;
  dateKey: string;
  author: string;
  url: string;
}

// Commit type translation mapping
const commitTypeTranslations: Record<string, string> = {
  'feat:': '✨ Fitur Baru',
  'fix:': '🐛 Perbaikan Bug',
  'feat(crm):': '📈 Fitur CRM',
  'refactor:': '♻️ Refactoring',
  'docs:': '📝 Dokumentasi',
  'chore:': '🔧 Pemeliharaan',
  'update:': '⬆️ Pembaruan',
  'improve:': '🚀 Peningkatan',
  'add': '➕ Penambahan',
  'rebrand:': '🎨 Rebranding',
};

// Feature translation function
function translateCommitMessage(message: string): string {
  let translated = message;

  // Translate commit types
  for (const [type, translation] of Object.entries(commitTypeTranslations)) {
    if (translated.toLowerCase().startsWith(type)) {
      translated = translated.replace(type, translation);
      break;
    }
  }

  // Translation patterns - longer phrases first to avoid partial replacements
  const translations: Array<[RegExp, string]> = [
    [/password change/gi, 'ubah password'],
    [/forgot password/gi, 'lupa password'],
    [/reset password/gi, 'reset password'],
    [/logout timeout/gi, 'timeout logout'],
    [/data fetching/gi, 'pengambilan data'],
    [/display improvements/gi, 'peningkatan tampilan'],
    [/meeting list/gi, 'daftar meeting'],
    [/detail pages/gi, 'halaman detail'],
    [/automatic numbering/gi, 'penomoran otomatis'],
    [/auto-numbering/gi, 'penomoran otomatis'],
    [/client display/gi, 'tampilan klien'],
    [/bulk input/gi, 'input masal'],
    [/navigation performance/gi, 'performa navigasi'],
    [/auth-helpers/gi, 'helper autentikasi'],
    [/kabupaten filter/gi, 'filter kabupaten'],
    [/joint logic/gi, 'logika sambungan'],
    [/waste factor/gi, 'faktor limbah'],
    [/authentication middleware/gi, 'middleware autentikasi'],
    [/protect dashboard route/gi, 'proteksi rute dashboard'],
    [/cache issues/gi, 'masalah cache'],
    [/document management/gi, 'manajemen dokumen'],
    [/project documentation/gi, 'dokumentasi proyek'],
    [/rename from/gi, 'ubah nama dari'],
    [/rebrand:/gi, '🎨 Rebranding'],
    [/to /gi, 'ke '],
    [/ and /gi, ' dan '],
    [/ with /gi, ' dengan '],
    [/configuration/gi, 'konfigurasi'],
    [/optimizations/gi, 'optimasi'],
    [/optimize/gi, 'optimalkan'],
    [/caching/gi, 'penyimpanan cache'],
    [/routes/gi, 'rute'],
    [/pricing/gi, 'harga'],
    [/redirect/gi, 'pengalihan'],
    [/preview/gi, 'pratinjau'],
    [/add /gi, 'tambahkan '],
    [/remove /gi, 'hapus '],
    [/deprecated/gi, 'usang'],
    [/update:/gi, 'Update'],
    [/feat:/gi, 'Fitur'],
    [/fix:/gi, 'Perbaikan'],
    [/docs:/gi, 'Dokumentasi'],
    [/chore:/gi, 'Pemeliharaan'],
  ];

  // Apply translations
  for (const [pattern, indonesian] of translations) {
    translated = translated.replace(pattern, indonesian);
  }

  return translated;
}

export async function GET() {
  try {
    const response = await fetch(GITHUB_API_URL, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error('Failed to fetch commits from GitHub');
    }

    const commits = await response.json();

    // Process commits and group by date
    const processedCommits = commits.slice(0, 20).map((commit: any) => {
      const message = commit.commit.message.split('\n')[0]; // Get first line only
      const date = new Date(commit.commit.author.date);
      const formattedDate = date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format for grouping

      return {
        sha: commit.sha.substring(0, 7),
        message: translateCommitMessage(message),
        date: formattedDate,
        dateKey,
        author: commit.author?.login || commit.commit.author.name,
        url: commit.html_url,
      };
    });

    // Group commits by date
    const groupedCommits = processedCommits.reduce((acc: Record<string, ProcessedCommit[]>, commit: ProcessedCommit) => {
      if (!acc[commit.dateKey]) {
        acc[commit.dateKey] = [];
      }
      acc[commit.dateKey].push(commit);
      return acc;
    }, {});

    return NextResponse.json({
      commits: groupedCommits,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching commits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch commits', commits: [] },
      { status: 500 }
    );
  }
}