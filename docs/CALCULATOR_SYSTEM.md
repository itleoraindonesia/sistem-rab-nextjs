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

Embed system memungkinkan kalkulator di-embed ke website eksternal (WordPress/Elementor) via iframe.

### URL Pattern
```
/embed/kalkulator-harga/[type]
```

Contoh:
```
/embed/kalkulator-harga/panel
```

### Production Features

#### 1. Error Handling
- **ErrorState component**: Menampilkan UI error dengan tombol retry
- **EmptyState component**: Menampilkan UI saat data tidak tersedia
- **Retry mechanism**: Tombol "Coba Lagi" untuk refresh data

#### 2. Performance Optimization
- **Debounced resize**: PostMessage resize dengan debounce 100ms
- **Height threshold**: Hanya kirim update jika height berubah >10px
- **Last height tracking**: Mencegah redundant updates

#### 3. Security
- **Configurable origins**: Environment variable `NEXT_PUBLIC_EMBED_ALLOWED_ORIGINS`
- **Development**: `*` (allow all)
- **Production**: List specific domains
- **CORS headers**: `X-Frame-Options: ALLOWALL`, `CSP: frame-ancestors *`

#### 4. Environment Variables
```env
# Development
NEXT_PUBLIC_EMBED_ALLOWED_ORIGINS=*

# Production
NEXT_PUBLIC_EMBED_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Security Configuration

#### 1. Middleware (src/middleware.ts)
Route `**/embed/**` bypass auth check namun tetap memperbarui session cookies:
```typescript
if (request.nextUrl.pathname.includes("/embed/")) {
  return await updateSession(request); // No auth enforcement
}
```

#### 2. Next.js Headers (next.config.ts)
Headers untuk mengizinkan iframe embedding:
```typescript
headers: async () => [
  {
    source: "/products/kalkulator-harga/:path*/embed",
    headers: [
      { key: "X-Frame-Options", value: "ALLOWALL" },
      { key: "Content-Security-Policy", value: "frame-ancestors *" },
    ],
  },
],
```

### Layout Embed
Embed menggunakan layout terpisah tanpa sidebar/header ERP:
- **File**: `src/app/(protected)/products/kalkulator-harga/[type]/embed/layout.tsx`
- **Features**: Minimal layout, tetap menggunakan MasterDataContext
- **No Auth Required**: Data panel dan ongkir di-fetch secara publik dari Supabase

### PostMessage API
Calculator embed mengirim height updates ke parent window untuk auto-resize iframe:

```javascript
// Resize event (auto-send saat content berubah)
window.parent.postMessage({ 
  type: 'resize', 
  height: document.body.scrollHeight 
}, '*');
```

### Cara Embed di Elementor

```html
<iframe 
  src="https://your-domain.com/products/kalkulator-harga/panel/embed"
  width="100%" 
  frameborder="0"
  id="panel-calculator"
  style="min-height: 800px;"
></iframe>

<script>
window.addEventListener('message', (e) => {
  if (e.data.type === 'resize') {
    document.getElementById('panel-calculator').style.height = 
      e.data.height + 'px';
  }
});
</script>
```

### Perbedaan Embed vs ERP Version

| Feature | ERP Version | Embed Version |
|---------|-------------|---------------|
| URL | `/products/kalkulator-harga/panel` | `/products/kalkulator-harga/panel/embed` |
| Layout | Dengan sidebar & header | Minimal, tanpa navigation |
| Auth | Required | Bypassed |
| Mobile Header | Ada (back button) | Tidak ada |
| PostMessage | Tidak | Resize events |
| Query Params | Tidak digunakan | Tidak digunakan |

## ➕ Menambah Kalkulator Baru

1. **Buat file** `src/lib/calculators/[nama].ts`
2. **Define config** dengan fields + calculation
3. **Register** di `index.ts`
4. **Buat route** `/products/kalkulator-harga/[nama]/page.tsx`
5. **Buat embed route** `/products/kalkulator-harga/[nama]/embed/page.tsx`
6. **(Optional) Buat embed layout** `/products/kalkulator-harga/[nama]/embed/layout.tsx`

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

### Embed Route Template
```typescript
// src/app/(protected)/products/kalkulator-harga/[nama]/embed/page.tsx
"use client";

import { useEffect, useRef } from "react";
// ... import components

export default function EmbeddedCalculator() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // PostMessage resize observer
    const sendHeight = () => {
      window.parent.postMessage({
        type: "resize",
        height: document.body.scrollHeight,
      }, "*");
    };
    // ... resize observer setup
  }, []);

  return (
    <div ref={containerRef}>
      {/* Calculator UI */}
    </div>
  );
}
```

---

**Last Updated**: 2026-02-18
**Status**: ✅ Production Ready - Full Error Handling & Security
