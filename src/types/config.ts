/**
 * Configuration placeholder pattern for Topaz-VBE simulation parameters.
 * When exact numerical values from Topaz Tables 1–23 are pending official verification,
 * parameters are explicitly tagged with status: 'PENDING_VERIFICATION' and documented source.
 */

export type ParamStatus = 'VERIFIED' | 'PENDING_VERIFICATION';

export interface ConfigParam<T> {
  value: T;
  source: string; // e.g. "Topaz Table 4", "Topaz Table 12"
  status: ParamStatus;
  description: string;
  unit?: string;
  notes?: string;
}

export function createConfigParam<T>(
  value: T,
  source: string,
  status: ParamStatus,
  description: string,
  unit?: string,
  notes?: string
): ConfigParam<T> {
  return { value, source, status, description, unit, notes };
}
