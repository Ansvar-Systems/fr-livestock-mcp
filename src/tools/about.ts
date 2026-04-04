import { buildMeta } from '../metadata.js';
import { SUPPORTED_JURISDICTIONS } from '../jurisdiction.js';

export function handleAbout() {
  return {
    name: 'France Livestock MCP',
    description:
      'Normes francaises d\'elevage : bien-etre animal, alimentation, sante animale, hebergement, densites, ' +
      'mouvements et reproduction. Couvre bovins laitiers et allaitants, porcins, volailles, ovins, caprins et equins ' +
      'avec donnees DGAL, Code Rural, GDS France et IDELE.',
    version: '0.1.0',
    jurisdiction: [...SUPPORTED_JURISDICTIONS],
    data_sources: [
      'DGAL (Direction Generale de l\'Alimentation)',
      'Code Rural et de la Peche Maritime',
      'GDS France (Groupements de Defense Sanitaire)',
      'IDELE (Institut de l\'Elevage)',
    ],
    tools_count: 11,
    links: {
      homepage: 'https://ansvar.eu/open-agriculture',
      repository: 'https://github.com/ansvar-systems/fr-livestock-mcp',
      mcp_network: 'https://ansvar.ai/mcp',
    },
    _meta: buildMeta(),
  };
}
