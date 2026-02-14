/**
 * Shared Types for Calculator System
 * Config-driven architecture - 1 file per calculator
 */

// Field Types
export type FieldType = 'number' | 'select' | 'checkbox' | 'text' | 'date' | 'fieldarray';

export interface CalculatorField {
  name: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  options?: { value: string; label: string }[]; // For select
  visibleWhen?: {
    field: string;
    value: any;
  };
  validation?: {
    required?: boolean | string;
    min?: number;
    max?: number;
  };
}

export interface FieldArrayField {
  name: string;
  type: 'number';
  label: string;
}

// Master Data Types (from BE/Supabase)
export interface Panel {
  id: number;
  name: string;
  harga: number;
  luas_per_lembar: number;
  jumlah_per_truck: number;
  type: string;
}

export interface Ongkir {
  provinsi: string;
  kabupaten?: string;
  biaya: number;
}

export interface CalculatorMasterData {
  panels: Panel[];
  ongkir: Ongkir[];
  parameters?: {
    wasteFactor: number;
    upahPasang: number;
    hargaJoint: number;
  };
}

// Calculation Result
export interface CalculationItem {
  desc: string;
  qty: number;
  unit?: string;
  unit_price: number;
  amount: number;
}

export interface CalculationResult {
  // Dimensions
  luasDinding?: number;
  luasLantai?: number;
  
  // Quantities
  lembarDinding?: number;
  lembarLantai?: number;
  titikJointDinding?: number;
  titikJointLantai?: number;
  
  // Costs
  subtotalDinding?: number;
  subtotalLantai?: number;
  biayaOngkir?: number;
  grandTotal: number;
  
  // Items breakdown
  items: CalculationItem[];
}

// Calculator Config
export interface CalculatorConfig {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'coming_soon';
  icon?: string;
  
  // Fields configuration
  fields: CalculatorField[];
  
  // Field array sub-fields (for dynamic fields like bidang[])
  fieldArrayFields?: Record<string, FieldArrayField[]>;
  
  // Default parameters
  defaultParameters?: {
    wasteFactor: number;
    upahPasang: number;
    hargaJoint: number;
  };
  
  // Master data sources
  masterDataSources?: {
    panels?: {
      table: string;
      filter?: string; // e.g., 'type=lantai'
    };
    ongkir?: {
      table: string;
    };
  };
}

// Form values type (generics)
export interface CalculatorValues {
  [key: string]: any;
}

// Calculator instance
export interface Calculator extends CalculatorConfig {
  calculate: (values: CalculatorValues, masterData: CalculatorMasterData) => CalculationResult;
}
