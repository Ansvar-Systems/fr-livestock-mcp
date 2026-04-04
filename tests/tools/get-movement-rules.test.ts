import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { handleGetMovementRules } from '../../src/tools/get-movement-rules.js';
import { createSeededDatabase } from '../helpers/seed-db.js';
import type { Database } from '../../src/db.js';
import { existsSync, unlinkSync } from 'fs';

const TEST_DB = 'tests/test-movement-rules.db';

describe('get_movement_rules tool', () => {
  let db: Database;

  beforeAll(() => {
    db = createSeededDatabase(TEST_DB);
  });

  afterAll(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  test('sheep notification is 7 days', () => {
    const result = handleGetMovementRules(db, { species: 'sheep' });
    expect(result).toHaveProperty('rules');
    const rules = (result as { rules: { standstill_days: number; rule_type: string }[] }).rules;
    const notification = rules.find(r => r.rule_type === 'notification');
    expect(notification).toBeDefined();
    expect(notification!.standstill_days).toBe(7);
  });

  test('cattle notification is 7 days', () => {
    const result = handleGetMovementRules(db, { species: 'cattle' });
    expect(result).toHaveProperty('rules');
    const rules = (result as { rules: { standstill_days: number; rule_type: string }[] }).rules;
    const notification = rules.find(r => r.rule_type === 'notification');
    expect(notification).toBeDefined();
    expect(notification!.standstill_days).toBe(7);
  });

  test('pig notification is 7 days', () => {
    const result = handleGetMovementRules(db, { species: 'pigs' });
    expect(result).toHaveProperty('rules');
    const rules = (result as { rules: { standstill_days: number; rule_type: string }[] }).rules;
    const notification = rules.find(r => r.rule_type === 'notification');
    expect(notification).toBeDefined();
    expect(notification!.standstill_days).toBe(7);
  });

  test('filters by species', () => {
    const result = handleGetMovementRules(db, { species: 'sheep' });
    expect(result).toHaveProperty('species', 'Ovins');
  });

  test('includes authority and regulation_ref', () => {
    const result = handleGetMovementRules(db, { species: 'sheep' });
    const rules = (result as { rules: { authority: string; regulation_ref: string }[] }).rules;
    expect(rules[0].authority).toContain('BDNI');
    expect(rules[0].regulation_ref).toContain('Code Rural');
  });

  test('includes exceptions', () => {
    const result = handleGetMovementRules(db, { species: 'sheep' });
    const rules = (result as { rules: { exceptions: string }[] }).rules;
    expect(rules[0].exceptions).toContain('Transhumance');
  });

  test('rejects unsupported jurisdiction', () => {
    const result = handleGetMovementRules(db, { species: 'sheep', jurisdiction: 'GB' });
    expect(result).toHaveProperty('error', 'jurisdiction_not_supported');
  });

  test('returns not_found for unknown species', () => {
    const result = handleGetMovementRules(db, { species: 'alpaca' });
    expect(result).toHaveProperty('error', 'not_found');
  });

  test('looks up by species name case-insensitively', () => {
    const result = handleGetMovementRules(db, { species: 'Ovins' });
    expect(result).toHaveProperty('rules');
  });
});
