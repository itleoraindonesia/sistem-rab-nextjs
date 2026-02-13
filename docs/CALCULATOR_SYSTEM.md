# Sistem Kalkulator Modular - Dokumentasi Arsitektur

## 📋 Overview

Sistem kalkulator terintegrasi untuk Leora ERP yang mendukung multiple calculator types, reusable components, dan embeddable widgets untuk WordPress/Elementor.

## 🎯 Tujuan Sistem

1. **Modular**: Setiap kalkulator independen tapi share core logic
2. **Reusable**: Components dapat digunakan di ERP, website, dan embed
3. **Extensible**: Mudah menambah kalkulator baru
4. **Multi-Platform**: ERP internal, website publik, WordPress embed

## 🏗️ Arsitektur

```
┌─────────────────────────────────────────────────────────────┐
│                    CALCULATOR SYSTEM                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   Panel     │  │ Konstruksi  │  │ Jasa Tukang │       │
│  │  Calculator │  │ Calculator  │  │ Calculator  │       │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘       │
│         │                │                │                │
│         └────────────────┼────────────────┘                │
│                          ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              CORE CALCULATION ENGINE                 │   │
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

### Kalkulator Routes
```
src/app/(protected)/products/
└── kalkulator-harga/
    ├── page.tsx              # Menu utama 6 kalkulator
    ├── layout.tsx            # Layout dengan navigation
    ├── panel/
    │   ├── page.tsx          # Redirect ke /panel-lantai-dinding
    │   └── embed/
    │       └── page.tsx      # Versi embed
    ├── konstruksi/
    │   ├── page.tsx         # Skeleton
    │   └── embed/
    │       └── page.tsx
    ├── jasa-tukang/
    ├── interior/
    ├── keramik/
    └── dinding/
```

### Shared Components
```
src/components/calculators/
├── layout/
│   ├── CalculatorMenu.tsx
│   └── CalculatorCard.tsx
├── base/
│   ├── CalculatorForm.tsx
│   └── CalculatorResults.tsx
└── hooks/
    └── useEmbedResize.ts
```

### Core Library
```
src/lib/calculators/
├── types.ts              # Shared types
├── utils.ts              # Math utilities
└── constants.ts          # Waste factor, etc
```

## 🧮 List Kalkulator

| Kalkulator | Lokasi | Status |
|------------|--------|--------|
| Panel Lantai & Dinding | `/products/panel-lantai-dinding` | ✅ Active |
| Konstruksi | `/products/kalkulator-harga/konstruksi` | 🚧 Coming Soon |
| Jasa Tukang | `/products/kalkulator-harga/jasa-tukang` | 🚧 Coming Soon |
| Interior | `/products/kalkulator-harga/interior` | 🚧 Coming Soon |
| Keramik | `/products/kalkulator-harga/keramik` | 🚧 Coming Soon |
| Dinding | `/products/kalkulator-harga/dinding` | 🚧 Coming Soon |

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

---

**Last Updated**: 2026-02-13
**Status**: 🚧 In Development
