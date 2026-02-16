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
  ArrowRight,
  Calculator
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
    name: "Kalkulator Panel",
    description: "Hitung kebutuhan panel lantai & dinding secara cepat (alat kalkulasi)",
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
            <div className="w-12 h-12 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
              <LayoutGrid className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary">Kalkulator Sistem</h1>
              <p className="text-muted">Pilih kalkulator untuk menghitung biaya proyek Anda</p>
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
                href={isActive ? calc.href : "#"}
                aria-disabled={!isActive}
                className={`
                  group relative bg-white rounded-2xl p-8 shadow-sm border transition-all duration-300
                  ${isActive 
                    ? "border-gray-200 hover:border-brand-primary/30 hover:shadow-xl hover:-translate-y-1 hover:bg-gray-50/50" 
                    : "border-gray-100 bg-gray-50/50 cursor-not-allowed opacity-80 grayscale-[0.5]"
                  }
                  ${isCurrentPage ? "border-brand-primary ring-2 ring-brand-primary/20" : ""}
                `}
                onClick={(e) => !isActive && e.preventDefault()}
              >
                {/* Badge */}
                <div className="absolute top-6 right-6">
                  <span className={`
                    px-3 py-1 rounded-full text-xs font-bold tracking-wide
                    ${isActive 
                      ? "bg-brand-primary/10 text-brand-primary" 
                      : "bg-gray-200 text-gray-500"
                    }
                  `}>
                    {calc.badge}
                  </span>
                </div>

                {/* Icon */}
                <div className={`
                  w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors
                  ${isActive 
                    ? "bg-brand-primary/5 text-brand-primary group-hover:bg-brand-primary/10" 
                    : "bg-gray-100 text-gray-400"
                  }
                `}>
                  {calc.icon}
                </div>

                {/* Content */}
                <div className="space-y-2 mb-6">
                  <h3 className={`text-xl font-bold ${isActive ? "text-gray-900" : "text-gray-500"}`}>
                    {calc.name}
                  </h3>
                  <p className={`text-sm leading-relaxed ${isActive ? "text-gray-600" : "text-gray-400"}`}>
                    {calc.description}
                  </p>
                </div>

                {/* Action */}
                <div className={`
                  flex items-center gap-2 text-sm font-bold
                  ${isActive ? "text-brand-primary" : "text-gray-400"}
                `}>
                  {isActive ? (
                    <span className="flex items-center gap-2 group-hover:gap-3 transition-all">
                      Buka Kalkulator
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  ) : (
                    <span>Segera Hadir</span>
                  )}
                </div>

                {/* Active Hover Line */}
                {isActive && (
                  <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-brand-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
