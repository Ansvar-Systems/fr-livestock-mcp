import type { Database } from './db.js';

/**
 * Species alias resolution.
 *
 * LLMs frequently use generic names like "cattle" when the database
 * stores "dairy_cattle" / "beef_cattle".  This module maps common
 * aliases to the actual species_id values so tool calls don't return
 * not_found for valid queries.
 */

const ALIASES: Record<string, string[]> = {
  cattle: ['dairy_cattle', 'beef_cattle', 'veal_calves'],
  cow: ['dairy_cattle'],
  cows: ['dairy_cattle'],
  beef: ['beef_cattle'],
  dairy: ['dairy_cattle'],
  // French
  bovin: ['dairy_cattle', 'beef_cattle'],
  bovins: ['dairy_cattle', 'beef_cattle'],
  vache: ['dairy_cattle'],
  vaches: ['dairy_cattle'],
  laitier: ['dairy_cattle'],
  allaitant: ['beef_cattle'],
  porc: ['pigs'],
  porcin: ['pigs'],
  porcins: ['pigs'],
  cochon: ['pigs'],
  mouton: ['sheep'],
  ovin: ['sheep'],
  ovins: ['sheep'],
  brebis: ['sheep'],
  chevre: ['goats'],
  caprin: ['goats'],
  caprins: ['goats'],
  cheval: ['horses'],
  chevaux: ['horses'],
  equin: ['horses'],
  equins: ['horses'],
  horse: ['horses'],
  horses: ['horses'],
  poule: ['laying_hens'],
  pondeuse: ['laying_hens'],
  poulet: ['broilers'],
  volaille: ['laying_hens', 'broilers'],
  volailles: ['laying_hens', 'broilers'],
  canard: ['ducks'],
  dinde: ['turkeys'],
  pig: ['pigs'],
  hen: ['laying_hens'],
  hens: ['laying_hens'],
  chicken: ['laying_hens', 'broilers'],
  chickens: ['laying_hens', 'broilers'],
  poultry: ['laying_hens', 'broilers'],
  goat: ['goats'],
  rabbit: ['rabbits'],
  lapin: ['rabbits'],
  calf: ['veal_calves'],
  calves: ['veal_calves'],
  veau: ['veal_calves'],
  duck: ['ducks'],
  turkey: ['turkeys'],
};

/**
 * Resolve a species input to one or more species_id values.
 *
 * Resolution order:
 * 1. Exact match on species.id → return as-is
 * 2. Case-insensitive match on species.name → return the id
 * 3. Alias table → return mapped ids
 * 4. No match → return original value (let SQL handle it)
 */
export function resolveSpecies(db: Database, input: string): string[] {
  const lower = input.toLowerCase();

  // 1. Exact species_id match
  const exact = db.get<{ id: string }>(
    'SELECT id FROM species WHERE id = ?', [input],
  );
  if (exact) return [exact.id];

  // 2. Case-insensitive name match
  const byName = db.get<{ id: string }>(
    'SELECT id FROM species WHERE LOWER(name) = ?', [lower],
  );
  if (byName) return [byName.id];

  // 3. Alias table
  const aliased = ALIASES[lower];
  if (aliased) {
    // Filter to species that actually exist in this DB
    const existing = aliased.filter(id => {
      const row = db.get<{ id: string }>('SELECT id FROM species WHERE id = ?', [id]);
      return !!row;
    });
    if (existing.length > 0) return existing;
  }

  // 4. Fallback — return original, SQL will find nothing and the
  //    handler returns its normal not_found message.
  return [input];
}

/**
 * Build a SQL WHERE clause fragment for species matching.
 * Handles single and multi-species resolution.
 *
 * Returns { clause: string, params: unknown[] } where clause looks like:
 *   "(t.species_id IN (?, ?))"
 */
export function speciesWhereClause(
  db: Database,
  input: string,
  tableAlias: string,
): { clause: string; params: unknown[] } {
  const ids = resolveSpecies(db, input);
  const placeholders = ids.map(() => '?').join(', ');
  return {
    clause: `(${tableAlias}.species_id IN (${placeholders}))`,
    params: ids,
  };
}
