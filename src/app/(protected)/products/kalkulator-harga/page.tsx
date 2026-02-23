
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
    <div className="min-h-screen bg-white">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Kalkulator Sistem</h1>
        <p className="text-gray-600">Pilih kalkulator untuk menghitung biaya proyek Anda</p>
      </div>

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
                flex flex-col p-6 rounded-xl border transition-all duration-200
                ${isActive 
                  ? "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm" 
                  : "bg-gray-50 border-gray-100 cursor-not-allowed opacity-75"
                }
                ${isCurrentPage ? "ring-2 ring-blue-500/20 border-blue-400" : ""}
              `}
              onClick={(e) => !isActive && e.preventDefault()}
            >
              {/* Top part: Icon & Badge */}
              <div className="flex items-start justify-between mb-4">
                <div className={`
                  w-12 h-12 rounded-lg flex items-center justify-center
                  ${isActive 
                    ? "bg-blue-50 text-blue-600" 
                    : "bg-gray-200 text-gray-500"
                  }
                `}>
                  {calc.icon}
                </div>
                {calc.badge && (
                  <span className={`
                    px-2.5 py-1 rounded-full text-xs font-medium
                    ${isActive 
                      ? "bg-blue-50 text-blue-700" 
                      : "bg-gray-200 text-gray-600"
                    }
                  `}>
                    {calc.badge}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className={`text-lg font-semibold mb-1 ${isActive ? "text-gray-900" : "text-gray-700"}`}>
                  {calc.name}
                </h3>
                <p className={`text-sm ${isActive ? "text-gray-500" : "text-gray-400"}`}>
                  {calc.description}
                </p>
              </div>

              {/* Action */}
              <div className={`
                mt-4 flex items-center gap-2 text-sm font-medium
                ${isActive ? "text-blue-600" : "text-gray-400"}
              `}>
                {isActive ? (
                  <>
                    Buka Kalkulator
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <span>Segera Hadir</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
