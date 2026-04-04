import { describe, test, expect } from 'vitest';
import { handleAbout } from '../../src/tools/about.js';

describe('about tool', () => {
  test('returns server metadata', () => {
    const result = handleAbout();
    expect(result.name).toBe('France Livestock MCP');
    expect(result.description).toContain('bien-etre');
    expect(result.jurisdiction).toEqual(['FR']);
    expect(result.tools_count).toBe(11);
    expect(result.links).toHaveProperty('homepage');
    expect(result._meta).toHaveProperty('disclaimer');
  });

  test('includes all four data sources', () => {
    const result = handleAbout();
    expect(result.data_sources).toHaveLength(4);
    expect(result.data_sources).toContain('DGAL (Direction Generale de l\'Alimentation)');
    expect(result.data_sources).toContain('GDS France (Groupements de Defense Sanitaire)');
  });
});
