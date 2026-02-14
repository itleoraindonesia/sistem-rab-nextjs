"use client";

import { useRouter } from "next/navigation";
import { useMasterData } from "@/context/MasterDataContext";
import { panelConfig } from "@/lib/calculators";
import { CalculatorForm } from "@/components/calculators/CalculatorForm";
import { CalculatorResults } from "@/components/calculators/CalculatorResults";
import { useState, useEffect } from "react";
import { CalculationResult } from "@/lib/calculators";
import LoadingState from "@/components/form/LoadingState";

export default function PanelCalculatorPage() {
  const router = useRouter();
  const { panels, ongkir, loading: masterLoading } = useMasterData();
  const [result, setResult] = useState<CalculationResult | null>(null);

  // Handle back navigation
  const handleBack = () => {
    router.push("/products/kalkulator-harga");
  };

  if (masterLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-brand-primary">
            Kalkulator Panel Lantai & Dinding
          </h1>
          <p className="text-muted">
            Hitung kebutuhan panel lantai dan dinding dengan akurat
          </p>
        </div>

        {/* Calculator Form */}
        <CalculatorForm
          config={panelConfig}
          masterData={{
            panels,
            ongkir,
            parameters: {
              wasteFactor: 1.1,
              upahPasang: 200000,
              hargaJoint: 2300,
            },
          }}
          onCalculate={setResult}
          onBack={handleBack}
        />

        {/* Results - show in a separate section for better UX */}
        {result && (
          <div className="mt-6">
            <CalculatorResults 
              result={result} 
              title="Rincian Lengkap"
            />
          </div>
        )}
      </div>
    </div>
  );
}
