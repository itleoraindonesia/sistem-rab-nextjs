/**
 * Calculator Registry
 * Central export for all calculators
 */

import { panelConfig, panelCalculate } from './panel';
import { CalculatorConfig, CalculatorValues, CalculationResult, CalculatorMasterData } from './types';

// Export individual calculators
export { panelConfig, panelCalculate } from './panel';

// Registry: map calculator ID to config
export const calculators = {
  panel: panelConfig,
  // konstruksi: konstruksiConfig,  // Coming soon
  // 'jasa-tukang': jasaTukangConfig,  // Coming soon
  // interior: interiorConfig,  // Coming soon
  // keramik: keramikConfig,  // Coming soon
  // dinding: dindingConfig,  // Coming soon
} as const satisfies Record<string, CalculatorConfig>;

// Calculate functions registry
export const calculateFunctions = {
  panel: panelCalculate,
} as const;

// Helper: Get calculator config by ID
export function getCalculator(id: string): CalculatorConfig | undefined {
  return calculators[id as keyof typeof calculators];
}

// Helper: Get calculate function by ID
export function getCalculateFunction(id: string) {
  return calculateFunctions[id as keyof typeof calculateFunctions];
}

// Helper: Get all calculator IDs
export function getAllCalculatorIds(): string[] {
  return Object.keys(calculators);
}

// Helper: Get calculator list for menu
export function getCalculatorList() {
  return Object.values(calculators).map((config) => ({
    id: config.id,
    name: config.name,
    description: config.description,
    status: config.status,
    icon: config.icon,
  }));
}

// Helper: Calculate result for a calculator
export function calculate(
  calculatorId: string,
  values: CalculatorValues,
  masterData: CalculatorMasterData
): CalculationResult | null {
  const calculateFn = getCalculateFunction(calculatorId);
  if (!calculateFn) {
    console.error(`Calculator ${calculatorId} not found`);
    return null;
  }
  return calculateFn(values, masterData);
}

// Export types
export * from './types';
