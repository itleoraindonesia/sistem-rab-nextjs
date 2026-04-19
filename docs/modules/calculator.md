# Calculator Module

## Overview
Sistem kalkulator terintegrasi untuk menghitung RAB (Rencana Anggaran Biaya) berbagai jenis konstruksi. Mendukung multiple calculator types dengan embeddable widgets untuk website eksternal.

## Architecture

### Modular Design
```
Calculator System
├── Core Engine (Frontend)
│   ├── Instant calculations (luas, qty, subtotal)
│   ├── Config-driven field rendering
│   └── Real-time result updates
├── Calculator Types
│   ├── Panel (Lantai & Dinding) ✅
│   ├── Konstruksi 🚧
│   ├── Jasa Tukang 🚧
│   ├── Interior 🚧
│   └── Keramik 🚧
└── Deployment Targets
    ├── ERP Internal ✅
    ├── Website Embed ✅
    └── WordPress Plugin 🚧
```

### 1 File per Calculator
Setiap kalkulator adalah file konfigurasi independen:
```typescript
// src/lib/calculators/panel.ts
export const panelConfig: CalculatorConfig = {
  id: 'panel',
  name: 'Panel Lantai & Dinding',
  fields: [...field definitions...],
  calculations: [...calculation logic...]
};

export function panelCalculate(values, masterData) {
  // Calculation implementation
  return results;
}
```

## Calculator Types

### ✅ Panel Calculator (Active)
**Purpose**: Calculate panel flooring and wall costs

**Input Fields**:
- Customer info (name, phone, email)
- Location info (province, city)
- Panel specifications (type, thickness, brand)
- Area calculations (length × width)
- Quantity calculations
- Ongkir (shipping) calculations

**Output**:
- Material costs breakdown
- Labor costs
- Shipping costs
- Grand total with margins

**Integration**:
- Master panel data from Supabase
- Ongkir rates by province/city
- Real-time price updates

### 🚧 Future Calculators (Planned)
- **Konstruksi**: General construction costs
- **Jasa Tukang**: Labor-only calculations
- **Interior**: Interior finishing costs
- **Keramik**: Tile installation costs

## Technical Implementation

### Configuration-Driven
```typescript
interface CalculatorConfig {
  id: string;
  name: string;
  description?: string;
  fields: CalculatorField[];
  sections: CalculatorSection[];
  calculations: CalculationRule[];
}

interface CalculatorField {
  id: string;
  type: 'text' | 'number' | 'select' | 'radio' | 'checkbox';
  label: string;
  required?: boolean;
  validation?: ZodSchema;
  dependencies?: string[]; // Show/hide based on other fields
  options?: SelectOption[]; // For select/radio
}
```

### Calculation Engine
```typescript
interface CalculationResult {
  subtotal: number;
  discount?: number;
  tax?: number;
  shipping?: number;
  total: number;
  breakdown: {
    materials: number;
    labor: number;
    overhead: number;
  };
  metadata: {
    lastUpdated: Date;
    version: string;
    assumptions: string[];
  };
}
```

### Real-time Calculations
- **Instant Updates**: Calculate on every field change
- **Debounced**: 300ms debounce for performance
- **Validation**: Real-time field validation
- **Error Handling**: Graceful error states

## Embed System

### WordPress Integration
```html
<iframe 
  src="https://your-domain.com/products/kalkulator-harga/panel/embed"
  width="100%" 
  height="800px"
  frameborder="0"
  id="panel-calculator">
</iframe>

<script>
window.addEventListener('message', (e) => {
  if (e.data.type === 'resize') {
    document.getElementById('panel-calculator').style.height = 
      e.data.height + 'px';
  }
});
</script>
```

### PostMessage API
```typescript
// Send height updates to parent
window.parent.postMessage({
  type: 'resize',
  height: document.body.scrollHeight
}, '*');
```

### Security Configuration
```typescript
// Environment variables
NEXT_PUBLIC_EMBED_ALLOWED_ORIGINS=*
# Production: https://yourdomain.com,https://www.yourdomain.com

// Next.js headers
headers: [
  {
    source: "/products/kalkulator-harga/:path*/embed",
    headers: [
      { key: "X-Frame-Options", value: "ALLOWALL" },
      { key: "Content-Security-Policy", value: "frame-ancestors *" },
    ],
  },
]
```

### Middleware Bypass
```typescript
// src/middleware.ts
if (request.nextUrl.pathname.includes("/embed/")) {
  return await updateSession(request); // No auth enforcement
}
```

## UI Components

### CalculatorForm
- **Generic Form Builder**: Render fields from config
- **Section Navigation**: Multi-step form with progress
- **Validation Display**: Real-time error indicators
- **Responsive Design**: Mobile-optimized layout

### CalculatorResults
- **Dynamic Results**: Update based on input changes
- **Breakdown Display**: Detailed cost breakdown
- **Export Options**: PDF/Excel export
- **Save Quote**: Save to CRM integration

### Embed Layout
- **Minimal Layout**: No sidebar/header
- **Auto-resize**: Dynamic height adjustment
- **Error Boundaries**: Graceful error handling
- **Loading States**: Skeleton loaders

## Data Integration

### Master Data Dependencies
- **Panel Prices**: Real-time from master_panel table
- **Ongkir Rates**: Province/city-based shipping costs
- **Material Specs**: Thickness, quality, brand options
- **Labor Rates**: Regional labor cost variations

### CRM Integration
- **Lead Capture**: Calculator results feed to CRM
- **Quote Generation**: Automatic quote creation
- **Follow-up**: Email/WhatsApp integration

### Document Integration
- **Quote Documents**: Generate formal quotations
- **Contract Templates**: Pre-filled contract drafts
- **Invoice Generation**: Automatic invoice creation

## File Structure

```
src/
├── lib/calculators/
│   ├── index.ts              # Calculator registry
│   ├── types.ts              # Shared types
│   └── panel.ts              # Panel calculator ✅
├── components/calculators/
│   ├── CalculatorForm.tsx    # Generic form builder
│   ├── CalculatorResults.tsx # Results display
│   └── CalculatorEmbed.tsx   # Embed wrapper
├── app/(protected)/products/kalkulator-harga/
│   ├── page.tsx              # Calculator menu
│   ├── layout.tsx            # Navigation layout
│   ├── panel/
│   │   ├── page.tsx          # ERP version
│   │   └── embed/
│   │       └── page.tsx      # Embed version
│   └── [type]/
│       ├── page.tsx          # Dynamic calculator
│       └── embed/page.tsx    # Dynamic embed
└── hooks/
    └── useCalculator.ts      # Calculation hooks
```

## Adding New Calculators

### 1. Create Calculator File
```typescript
// src/lib/calculators/konstruksi.ts
export const konstruksiConfig: CalculatorConfig = {
  id: 'konstruksi',
  name: 'Kalkulator Konstruksi',
  fields: [
    // Define fields
  ],
  calculations: [
    // Define calculation rules
  ]
};

export function konstruksiCalculate(values, masterData) {
  // Implementation
}
```

### 2. Register Calculator
```typescript
// src/lib/calculators/index.ts
import { konstruksiConfig, konstruksiCalculate } from './konstruksi';

export const calculators = {
  panel: panelConfig,
  konstruksi: konstruksiConfig, // Add here
};

export const calculateFunctions = {
  panel: panelCalculate,
  konstruksi: konstruksiCalculate, // Add here
};
```

### 3. Create Route Files
```typescript
// src/app/(protected)/products/kalkulator-harga/konstruksi/page.tsx
export default function KonstruksiCalculator() {
  return <Calculator type="konstruksi" />;
}

// src/app/(protected)/products/kalkulator-harga/konstruksi/embed/page.tsx
export default function EmbeddedKonstruksiCalculator() {
  return <CalculatorEmbed type="konstruksi" />;
}
```

## Performance Optimization

### Calculation Optimization
- **Memoization**: React.useMemo for expensive calculations
- **Debouncing**: Input debouncing to prevent excessive recalculations
- **Web Workers**: Heavy calculations moved to background threads

### Loading Optimization
- **Code Splitting**: Dynamic imports for calculator components
- **Lazy Loading**: Calculator types loaded on demand
- **Skeleton UI**: Fast perceived performance

### Caching Strategy
- **Master Data**: Cached for 1 hour
- **Calculation Results**: Cached per session
- **User Preferences**: Local storage persistence

## Error Handling

### Validation Errors
- **Field Validation**: Real-time input validation
- **Business Rules**: Calculation-specific validations
- **API Errors**: Graceful fallback for data loading failures

### Calculation Errors
- **Division by Zero**: Safe mathematical operations
- **Missing Data**: Fallback values and error states
- **Invalid Inputs**: User-friendly error messages

## Security Considerations

### Embed Security
- **Origin Validation**: Configurable allowed origins
- **CORS Headers**: Proper iframe embedding headers
- **Input Sanitization**: All inputs validated and sanitized

### Data Protection
- **No Auth Bypass**: Embed still respects data access rules
- **Rate Limiting**: API rate limiting for embed usage
- **Audit Logging**: Calculator usage tracking

## Testing Strategy

### Unit Tests
- **Calculation Logic**: Mathematical accuracy
- **Field Validation**: Input validation rules
- **Configuration**: Config-driven behavior

### Integration Tests
- **Data Loading**: Master data integration
- **CRM Integration**: Lead creation flow
- **Embed Functionality**: iframe communication

### E2E Tests
- **Full Flow**: Complete calculation workflow
- **Mobile Testing**: Responsive design validation
- **Cross-browser**: Browser compatibility

## Future Enhancements

### Phase 2: Advanced Features
- **Comparison Mode**: Side-by-side calculator comparisons
- **Save/Load**: User-saved calculator states
- **Templates**: Pre-configured calculation templates
- **Bulk Calculations**: CSV input for bulk calculations

### Phase 3: Ecosystem Integration
- **API Access**: REST API for external integrations
- **Webhooks**: Real-time calculation result notifications
- **Analytics**: Usage analytics and conversion tracking
- **A/B Testing**: Calculator optimization testing

---

*Last Updated: 2026-04-04*
*Status: Production Ready (Panel Calculator)*