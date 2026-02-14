# Sistem Kalkulator Modular - Dokumentasi Arsitektur

## 📋 Overview

Sistem kalkulator terintegrasi untuk Leora ERP yang mendukung multiple calculator types, reusable components, dan embeddable widgets untuk WordPress/Elementor.

## 🎯 Tujuan Sistem

1. **Modular**: Setiap kalkulator independen tapi share core logic
2. **Reusable**: Components dapat digunakan di ERP, website, dan embed
3. **Extensible**: Mudah menambah kalkulator baru
4. **Multi-Platform**: ERP internal, website publik, WordPress embed
5. **Config-Driven**: 1 file = 1 kalkulator (fields + calculation)

## 🏗️ Arsitektur

```
┌─────────────────────────────────────────────────────────────┐
│                    CALCULATOR SYSTEM                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   Panel     │  │ Konstruksi  │  │ Jasa Tukang │       │
│  │ Calculator  │  │ Calculator  │  │ Calculator  │       │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘       │
│         │                │                │                │
│         └────────────────┼────────────────┘                │
│                          ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              CALCULATION ENGINE (FE)                  │   │
│  │  - Instant calculations (luas, qty, subtotal)        │   │
│  │  - Config-driven field rendering                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                 │
│         ┌────────────────┼────────────────┐                │
│         ▼                ▼                ▼                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   ERP App   │  │   Website   │  │   Embed     │       │
│  │  (Internal) │  │   (Public)  │  │ (WordPress) │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Struktur Folder

### Calculator Library (Core)
```
src/lib/calculators/
├── types.ts              # Shared types (CalculatorConfig, CalculationResult, etc.)
├── panel.ts              # ✅ Panel calculator config + calculation (1 file)
├── index.ts              # Calculator registry + exports
└── [kalkulator].ts       # Tambahkan kalkulator baru di sini
```

### Calculator Components
```
src/components/calculators/
├── CalculatorForm.tsx     # Generic form builder (render from config)
└── CalculatorResults.tsx  # Generic results display
```

### Kalkulator Routes
```
src/app/(protected)/products/
└── kalkulator-harga/
    ├── page.tsx              # Menu utama 6 kalkulator
    ├── layout.tsx            # Layout dengan navigation
    ├── panel/
    │   ├── page.tsx          # ✅ Kalkulator Panel (modular)
    │   └── embed/
    │       └── page.tsx     # Versi embed
    ├── konstruksi/
    ├── jasa-tukang/
    ├── interior/
    ├── keramik/
    └── dinding/
```

## 🔧 Technical Implementation

### Calculation Logic
- **Frontend (FE)**: Instant calculations (luas, qty, subtotal, grand total)
- **Backend (BE/Supabase)**: Price lookups (harga panel, ongkir rates)

### Calculator Registry
```typescript
// src/lib/calculators/index.ts
import { panelConfig, panelCalculate } from './panel';
// import { konstruksiConfig, konstruksiCalculate } from './konstruksi';

export const calculators = {
  panel: panelConfig,
  // konstruksi: konstruksiConfig,  // Coming soon
};

export const calculateFunctions = {
  panel: panelCalculate,
};

// Helper function
export function calculate(calculatorId, values, masterData) {
  return calculateFunctions[calculatorId](values, masterData);
}
```

### 1 File per Kalkulator
Setiap kalkulator adalah 1 file yang berisi:
```typescript
// src/lib/calculators/panel.ts
export const panelConfig: CalculatorConfig = {
  id: 'panel',
  name: 'Panel Lantai & Dinding',
  fields: [
    // Field definitions
  ],
  // Config lainnya
};

export function panelCalculate(values, masterData) {
  // Calculation logic
  return result;
}
```

## 🧮 List Kalkulator

| Kalkulator | File | Status |
|------------|------|--------|
| Panel Lantai & Dinding | `panel.ts` | ✅ Active |
| Konstruksi | `konstruksi.ts` | 🚧 Coming Soon |
| Jasa Tukang | `jasa-tukang.ts` | 🚧 Coming Soon |
| Interior | `interior.ts` | 🚧 Coming Soon |
| Keramik | `keramik.ts` | 🚧 Coming Soon |
| Dinding | `dinding.ts` | 🚧 Coming Soon |

## 🔌 Embed System

### URL Pattern
```
/products/kalkulator-harga/[type]/embed?theme=light&compact=true
```

### Query Parameters
- `theme`: `light` | `dark`
- `compact`: `true` | `false`
- `callback`: URL untuk redirect setelah submit

### PostMessage API
```javascript
// Resize event
window.parent.postMessage({ type: 'resize', height: 850 }, '*');

// Submit event
window.parent.postMessage({ type: 'submit', data: {...} }, '*');
```

## ➕ Menambah Kalkulator Baru

1. **Buat file** `src/lib/calculators/[nama].ts`
2. **Define config** dengan fields + calculation
3. **Register** di `index.ts`
4. **Buat route** `/products/kalkulator-harga/[nama]/page.tsx`

Contoh:
```typescript
// src/lib/calculators/konstruksi.ts
export const konstruksiConfig: CalculatorConfig = {
  id: 'konstruksi',
  name: 'Konstruksi',
  fields: [...],
};

export function konstruksiCalculate(values, masterData) {
  // logic
}
```

---

**Last Updated**: 2026-02-14
**Status**: ✅ Panel Calculator Active - Modular System Ready
