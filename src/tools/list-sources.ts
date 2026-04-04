import { buildMeta } from '../metadata.js';
import type { Database } from '../db.js';

interface Source {
  name: string;
  authority: string;
  official_url: string;
  retrieval_method: string;
  update_frequency: string;
  license: string;
  coverage: string;
  last_retrieved?: string;
}

export function handleListSources(db: Database): { sources: Source[]; _meta: ReturnType<typeof buildMeta> } {
  const lastIngest = db.get<{ value: string }>('SELECT value FROM db_metadata WHERE key = ?', ['last_ingest']);

  const sources: Source[] = [
    {
      name: 'DGAL (Direction Generale de l\'Alimentation)',
      authority: 'Ministere de l\'Agriculture et de la Souverainete Alimentaire',
      official_url: 'https://agriculture.gouv.fr/protection-animale',
      retrieval_method: 'HTML_SCRAPE',
      update_frequency: 'as_amended',
      license: 'Licence Ouverte / Open Licence',
      coverage: 'Reglementation bien-etre animal, normes d\'hebergement, prophylaxie obligatoire',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'Code Rural et de la Peche Maritime',
      authority: 'Legifrance / Republique Francaise',
      official_url: 'https://www.legifrance.gouv.fr/codes/id/LEGITEXT000006071367/',
      retrieval_method: 'HTML_SCRAPE',
      update_frequency: 'as_amended',
      license: 'Licence Ouverte / Open Licence',
      coverage: 'Dispositions legislatives et reglementaires relatives aux animaux d\'elevage, identification, mouvements, sante animale',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'GDS France (Groupements de Defense Sanitaire)',
      authority: 'GDS France',
      official_url: 'https://www.gdsfrance.org/',
      retrieval_method: 'HTML_SCRAPE',
      update_frequency: 'annual',
      license: 'Usage professionnel',
      coverage: 'Prophylaxie collective obligatoire, campagnes de depistage, qualification sanitaire des cheptels',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'IDELE (Institut de l\'Elevage)',
      authority: 'IDELE',
      official_url: 'https://idele.fr/',
      retrieval_method: 'HTML_SCRAPE',
      update_frequency: 'quarterly',
      license: 'Usage professionnel',
      coverage: 'References techniques bovins, ovins, caprins : hebergement, alimentation, reproduction, bien-etre',
      last_retrieved: lastIngest?.value,
    },
  ];

  return {
    sources,
    _meta: buildMeta({ source_url: 'https://agriculture.gouv.fr/protection-animale' }),
  };
}
