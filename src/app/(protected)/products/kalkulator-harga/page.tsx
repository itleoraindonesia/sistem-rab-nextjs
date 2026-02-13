"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutGrid, 
  Boxes, 
  Hammer, 
  Sofa, 
  Grid3X3, 
  Building2,
  ChevronRight,
  ArrowRight
} from "lucide-react";

interface Calculator {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  status: "active" | "coming_soon";
  badge?: string;
}

const calculators: Calculator[] = [
  {
    id: "panel",
    name: "Panel Lantai & Dinding",
    description: "Hitung kebutuhan panel lantai dan dinding dengan akurat",
    href: "/products/kalkulator-harga/panel",
    icon: <Boxes className="w-8 h-8" />,
    status: "active",
    badge: "Active"
  },
  {
    id: "konstruksi",
    name: "Konstruksi",
    description: "Perhitungan volume beton, besi, dan bekisting",
    href: "/products/kalkulator-harga/konstruksi",
    icon: <Hammer className="w-8 h-8" />,
    status: "coming_soon",
    badge: "Coming Soon"
  },
  {
    id: "jasa-tukang",
    name: "Jasa Tukang",
    description: "Estimasi biaya jasa tukang harian dan borongan",
    href: "/products/kalkulator-harga/jasa-tukang",
    icon: <Hammer className="w-8 h-8" />,
    status: "coming_soon",
    badge: "Coming Soon"
  },
  {
    id: "interior",
    name: "Interior",
    description: "Perhitungan furniture, plafon, dan finishing",
    href: "/products/kalkulator-harga/interior",
    icon: <Sofa className="w-8 h-8" />,
    status: "coming_soon",
    badge: "Coming Soon"
  },
  {
    id: "keramik",
    name: "Keramik",
    description: "Hitung kebutuhan keramik lantai dan dinding",
    href: "/products/kalkulator-harga/keramik",
    icon: <Grid3X3 className="w-8 h-8" />,
    status: "coming_soon",
    badge: "Coming Soon"
  },
  {
    id: "dinding",
    name: "Dinding",
    description: "Perhitungan bata, batako, dan bata ringan",
    href: "/products/kalkulator-harga/dinding",
    icon: <Building2 className="w-8 h-8" />,
    status: "coming_soon",
    badge: "Coming Soon"
  },
];

export default function KalkulatorHargaPage() {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-brand-primary rounded-xl flex items-center justify-center">
              <LayoutGrid className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary">Kalkulator Sistem</h1>
              <p className="text-muted">Pilih kalkulator untuk menghitung biaya proyek Anda</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-surface rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Boxes className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted">Active Calculator</p>
                <p className="text-2xl font-bold text-primary">1</p>
              </div>
            </div>
          </div>
          <div className="bg-surface rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Hammer className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted">Coming Soon</p>
                <p className="text-2xl font-bold text-primary">5</p>
              </div>
            </div>
          </div>
          <div className="bg-surface rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <LayoutGrid className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted">Total Kalkulator</p>
                <p className="text-2xl font-bold text-primary">6</p>
              </div>
            </div>
          </div>
        </div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {calculators.map((calc) => {
            const isActive = calc.status === "active";
            const isCurrentPage = pathname === calc.href;

            return (
              <Link
                key={calc.id}
                href={calc.href}
                className={`
                  group relative bg-surface rounded-2xl p-6 shadow-sm border-2 transition-all duration-300
                  ${isActive 
                    ? "border-green-200 hover:border-green-400 hover:shadow-lg hover:-translate-y-1" 
                    : "border-gray-100 hover:border-gray-200 cursor-not-allowed opacity-75"
                  }
                  ${isCurrentPage ? "border-brand-primary ring-2 ring-brand-primary/20" : ""}
                `}
              >
                {/* Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`
                    px-3 py-1 rounded-full text-xs font-medium
                    ${isActive 
                      ? "bg-green-100 text-green-700" 
                      : "bg-yellow-100 text-yellow-700"
                    }
                  `}>
                    {calc.badge}
                  </span>
                </div>

                {/* Icon */}
                <div className={`
                  w-16 h-16 rounded-2xl flex items-center justify-center mb-4
                  ${isActive 
                    ? "bg-green-50 text-green-600" 
                    : "bg-gray-100 text-gray-400"
                  }
                `}>
                  {calc.icon}
                </div>

                {/* Content */}
                <h3 className={`text-xl font-semibold mb-2 ${isActive ? "text-primary" : "text-gray-500"}`}>
                  {calc.name}
                </h3>
                <p className={`text-sm mb-4 ${isActive ? "text-muted" : "text-gray-400"}`}>
                  {calc.description}
                </p>

                {/* Action */}
                <div className={`
                  flex items-center gap-2 text-sm font-medium
                  ${isActive ? "text-brand-primary group-hover:gap-3 transition-all" : "text-gray-400"}
                `}>
                  {isActive ? (
                    <>
                      <span>Buka Kalkulator</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <span>Segera Hadir</span>
                  )}
                </div>

                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-brand-primary rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
              <LayoutGrid className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Tentang Kalkulator Sistem</h3>
              <p className="text-sm text-blue-700">
                Kalkulator sistem membantu Anda menghitung estimasi biaya proyek secara akurat. 
                Saat ini tersedia kalkulator Panel Lantai & Dinding yang dapat digunakan langsung. 
                Kalkulator lainnya akan segera hadir. Gunakan kalkulator ini untuk perencanaan 
                budget dan pembuatan RAB (Rencana Anggaran Biaya).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
