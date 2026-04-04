import { createDatabase, type Database } from '../../src/db.js';

export function createSeededDatabase(dbPath: string): Database {
  const db = createDatabase(dbPath);

  // Species
  db.run(
    `INSERT INTO species (id, name, common_breeds) VALUES (?, ?, ?)`,
    ['sheep', 'Ovins', JSON.stringify(['Lacaune', 'Ile-de-France', 'Texel'])]
  );
  db.run(
    `INSERT INTO species (id, name, common_breeds) VALUES (?, ?, ?)`,
    ['cattle', 'Bovins', JSON.stringify(['Charolaise', 'Limousine', 'Blonde d\'Aquitaine'])]
  );
  db.run(
    `INSERT INTO species (id, name, common_breeds) VALUES (?, ?, ?)`,
    ['pigs', 'Porcins', JSON.stringify(['Large White', 'Landrace Francais', 'Pietrain'])]
  );

  // Welfare standards -- sheep
  db.run(
    `INSERT INTO welfare_standards (species_id, production_system, category, standard, legal_minimum, best_practice, regulation_ref, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['sheep', 'outdoor', 'abri', 'Fourniture d\'un abri contre les intemperies',
     'Abri disponible en cas de conditions meteorologiques extremes', 'Abri permanent disponible toute l\'annee',
     'Code Rural art. R214-17 ; Directive 98/58/CE', 'DGAL / IDELE', 'FR']
  );
  db.run(
    `INSERT INTO welfare_standards (species_id, production_system, category, standard, legal_minimum, best_practice, regulation_ref, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['sheep', 'all', 'inspection', 'Inspection reguliere du troupeau',
     'Inspection a intervalles suffisants pour eviter toute souffrance', 'Inspection quotidienne de tous les animaux',
     'Code Rural art. R214-17 ; Directive 98/58/CE', 'DGAL / IDELE', 'FR']
  );

  // Welfare standards -- cattle
  db.run(
    `INSERT INTO welfare_standards (species_id, production_system, category, standard, legal_minimum, best_practice, regulation_ref, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['cattle', 'indoor', 'hebergement', 'Surface de couchage et ventilation adequates',
     'Surface suffisante pour se coucher et se lever sans difficulte', 'Logettes adaptees a la taille de la vache avec litiere profonde',
     'Arrete du 25 octobre 1982 ; Code Rural art. R214-17', 'DGAL / IDELE', 'FR']
  );
  db.run(
    `INSERT INTO welfare_standards (species_id, production_system, category, standard, legal_minimum, best_practice, regulation_ref, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['cattle', 'all', 'eau', 'Acces a l\'eau potable',
     'Eau potable en quantite suffisante chaque jour', 'Acces permanent a l\'eau propre avec plusieurs points d\'abreuvement',
     'Arrete du 25 octobre 1982 art. 5 ; Code Rural art. R214-17', 'DGAL / IDELE', 'FR']
  );

  // Welfare standards -- pigs
  db.run(
    `INSERT INTO welfare_standards (species_id, production_system, category, standard, legal_minimum, best_practice, regulation_ref, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['pigs', 'indoor', 'enrichissement', 'Materiel d\'enrichissement obligatoire',
     'Acces permanent a des materiaux manipulables', 'Plusieurs types de materiaux renouveles regulierement dont paille et substrat fouissable',
     'Arrete du 16 janvier 2003 art. 15 ; Directive 2008/120/CE', 'DGAL / IFIP', 'FR']
  );
  db.run(
    `INSERT INTO welfare_standards (species_id, production_system, category, standard, legal_minimum, best_practice, regulation_ref, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['pigs', 'all', 'caudectomie', 'Restrictions sur la coupe de la queue',
     'Non routine -- seulement si preuves de morsures malgre mesures environnementales', 'Pas de caudectomie -- resoudre les problemes d\'elevage sous-jacents',
     'Arrete du 16 janvier 2003 art. 17 ; Directive 2008/120/CE', 'DGAL / IFIP', 'FR']
  );

  // Movement rules
  db.run(
    `INSERT INTO movement_rules (species_id, rule_type, rule, standstill_days, exceptions, authority, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['sheep', 'notification', 'Notification de tout mouvement d\'ovins a la BDNI sous 7 jours. Document de circulation obligatoire.',
     7, 'Transhumance : declaration prealable a la DDPP',
     'EDE / BDNI', 'Code Rural art. D212-29 ; Arrete du 19 decembre 2005', 'FR']
  );
  db.run(
    `INSERT INTO movement_rules (species_id, rule_type, rule, standstill_days, exceptions, authority, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['cattle', 'notification', 'Toute naissance, mort, entree ou sortie d\'un bovin doit etre notifiee a la BDNI dans les 7 jours. Passeport bovin obligatoire.',
     7, 'Deplacements entre sites d\'une meme exploitation',
     'EDE / BDNI', 'Code Rural art. D212-19 ; Arrete du 10 juin 2020', 'FR']
  );
  db.run(
    `INSERT INTO movement_rules (species_id, rule_type, rule, standstill_days, exceptions, authority, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['pigs', 'notification', 'Tout mouvement de porcins doit etre notifie a la BDPORC dans les 7 jours. ICA obligatoire pour l\'abattoir.',
     7, 'Pas d\'exception',
     'BDPORC / DDPP', 'Arrete du 24 novembre 2005 ; Reglement (CE) 853/2004', 'FR']
  );

  // Stocking densities
  db.run(
    `INSERT INTO stocking_densities (species_id, age_class, housing_type, density_value, density_unit, legal_minimum, recommended, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['sheep', 'brebis', 'bergerie', 1.5, 'm2_par_tete', 1.0, 1.5, 'IDELE / Directive 98/58/CE', 'FR']
  );
  db.run(
    `INSERT INTO stocking_densities (species_id, age_class, housing_type, density_value, density_unit, legal_minimum, recommended, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['cattle', 'adulte', 'logette', 6.0, 'm2_par_tete', 6.0, 8.0, 'IDELE / Arrete 25 oct. 1982', 'FR']
  );
  db.run(
    `INSERT INTO stocking_densities (species_id, age_class, housing_type, density_value, density_unit, legal_minimum, recommended, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['pigs', 'porcs charcutiers', 'interieur', 0.65, 'm2_par_tete', 0.65, 0.80, 'Arrete 16 jan. 2003', 'FR']
  );

  // Feed requirements
  db.run(
    `INSERT INTO feed_requirements (species_id, age_class, production_stage, energy_mj_per_day, protein_g_per_day, dry_matter_kg, minerals, example_ration, notes, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['sheep', 'brebis', 'entretien', 8.5, 80, 1.2, JSON.stringify({ calcium_g: 3, phosphore_g: 2 }),
     'Herbe ou foin a volonte + pierre a lecher minerale', 'Brebis de 70 kg', 'FR']
  );
  db.run(
    `INSERT INTO feed_requirements (species_id, age_class, production_stage, energy_mj_per_day, protein_g_per_day, dry_matter_kg, minerals, example_ration, notes, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['cattle', 'adulte', 'entretien', 55.0, 450, 9.0, JSON.stringify({ calcium_g: 25, phosphore_g: 18 }),
     'Ensilage d\'herbe a volonte', 'Vache allaitante de 600 kg', 'FR']
  );
  db.run(
    `INSERT INTO feed_requirements (species_id, age_class, production_stage, energy_mj_per_day, protein_g_per_day, dry_matter_kg, minerals, example_ration, notes, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['pigs', 'porcs charcutiers', 'engraissement', 26.0, 340, 2.5, JSON.stringify({ calcium_g: 12, phosphore_g: 8, lysine_g: 15 }),
     'Aliment complet (2,5 kg/jour)', 'Porc charcutier 60-110 kg', 'FR']
  );

  // Housing requirements
  db.run(
    `INSERT INTO housing_requirements (species_id, age_class, system, space_per_head_m2, ventilation, flooring, temperature_range, lighting, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['sheep', 'brebis', 'bergerie', 1.5, 'Ventilation naturelle avec faitage ouvert',
     'Paille sur sol dur', '5-20 C', 'Lumiere naturelle minimum',
     'IDELE / Directive 98/58/CE', 'FR']
  );
  db.run(
    `INSERT INTO housing_requirements (species_id, age_class, system, space_per_head_m2, ventilation, flooring, temperature_range, lighting, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['cattle', 'adulte', 'logette', 6.0, 'Ventilation naturelle avec 0,04 m2 de sortie par vache',
     'Logettes avec matelas ou litiere profonde', '5-25 C', 'Lumiere naturelle minimum 8 heures',
     'IDELE / Arrete du 25 octobre 1982', 'FR']
  );
  db.run(
    `INSERT INTO housing_requirements (species_id, age_class, system, space_per_head_m2, ventilation, flooring, temperature_range, lighting, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['pigs', 'porcs charcutiers', 'interieur', 0.65, 'Ventilation mecanique, max 0,2 m/s au niveau des animaux',
     'Caillebotis partiel avec zone de couchage pleine', '18-22 C', 'Minimum 40 lux pendant 8 heures',
     'Arrete du 16 janvier 2003 / IFIP', 'FR']
  );

  // Breeding guidance
  db.run(
    `INSERT INTO breeding_guidance (species_id, topic, guidance, calendar, gestation_days, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['sheep', 'agnelage', 'Gestation moyenne 147 jours. Echographie a 45-60 jours. Augmenter l\'alimentation les 6 dernieres semaines de gestation.',
     JSON.stringify({ lutte: 'Oct-Nov', echographie: 'Jan', agnelage: 'Mar-Avr', sevrage: 'Jul-Aout' }),
     147, 'IDELE / INRAE', 'FR']
  );
  db.run(
    `INSERT INTO breeding_guidance (species_id, topic, guidance, calendar, gestation_days, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['cattle', 'velage', 'Gestation d\'environ 283 jours. NEC cible 3,0 au tarissement. Ration de transition 3 semaines avant velage.',
     JSON.stringify({ mise_a_la_reproduction: 'Avr-Juin', diagnostic_gestation: 'Sep-Nov', tarissement: 'Mar-Avr', velage: 'Fev-Avr' }),
     283, 'IDELE / INRAE', 'FR']
  );
  db.run(
    `INSERT INTO breeding_guidance (species_id, topic, guidance, calendar, gestation_days, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['pigs', 'mise_bas', 'Gestation de la truie environ 114 jours (3 mois, 3 semaines, 3 jours). Transfert en maternite 5-7 jours avant. Objectif 2,3-2,5 portees par truie et par an.',
     JSON.stringify({ saillie: 'continu', diagnostic_gestation: '28 jours apres saillie', mise_bas: '114 jours apres saillie', sevrage: '21-28 jours apres mise bas' }),
     114, 'IFIP / INRAE', 'FR']
  );

  // Animal health conditions
  db.run(
    `INSERT INTO animal_health (id, species_id, condition, symptoms, causes, treatment, prevention, notifiable, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['fievre-aphteuse', 'cattle', 'Fievre aphteuse',
     'Fievre, aphtes sur la bouche et les pieds, salivation, boiterie, refus de manger',
     'Virus aphteux (Aphthovirus)',
     'Pas de traitement -- declaration obligatoire a la DDPP. Abattage du troupeau.',
     'Biosecurite stricte, controles aux importations, plans de contingence',
     1, 'DGAL / Code Rural art. L223-1', 'FR']
  );
  db.run(
    `INSERT INTO animal_health (id, species_id, condition, symptoms, causes, treatment, prevention, notifiable, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['pietin-ovins', 'sheep', 'Pietin (dermatite interdigitee)',
     'Boiterie, odeur fetide des pieds, decollement de la corne, gonflement interdigite',
     'Dichelobacter nodosus, conditions humides et chaudes',
     'Parage, pediluve (sulfate de zinc), antibiotiques dans les cas graves. Isoler les animaux atteints.',
     'Inspection reguliere des pieds, pediluves, reforme des boiteux chroniques, sols drainants',
     0, 'IDELE / GDS France', 'FR']
  );

  // FTS5 search index entries
  db.run(
    `INSERT INTO search_index (title, body, species, category, jurisdiction) VALUES (?, ?, ?, ?, ?)`,
    ['Normes bien-etre ovins', 'Normes de bien-etre pour les ovins incluant abri, inspection, alimentation et manipulation selon le Code Rural.', 'sheep', 'welfare', 'FR']
  );
  db.run(
    `INSERT INTO search_index (title, body, species, category, jurisdiction) VALUES (?, ?, ?, ?, ?)`,
    ['Mouvement bovins BDNI', 'Tout mouvement de bovins doit etre notifie a la BDNI dans les 7 jours. Passeport bovin obligatoire.', 'cattle', 'movement', 'FR']
  );
  db.run(
    `INSERT INTO search_index (title, body, species, category, jurisdiction) VALUES (?, ?, ?, ?, ?)`,
    ['Hebergement porcins', 'L\'hebergement des porcins necessite des surfaces minimales, du materiel d\'enrichissement et un controle de la temperature. Porcs charcutiers : 0,65 m2 minimum legal.', 'pigs', 'housing', 'FR']
  );
  db.run(
    `INSERT INTO search_index (title, body, species, category, jurisdiction) VALUES (?, ?, ?, ?, ?)`,
    ['Reproduction ovine', 'La saison de lutte des ovins se deroule d\'octobre a novembre avec agnelage en mars-avril. Gestation de 147 jours.', 'sheep', 'breeding', 'FR']
  );
  db.run(
    `INSERT INTO search_index (title, body, species, category, jurisdiction) VALUES (?, ?, ?, ?, ?)`,
    ['Fievre aphteuse', 'La fievre aphteuse est une maladie reglementee causant des aphtes sur la bouche et les pieds. Declaration obligatoire a la DDPP.', 'cattle', 'health', 'FR']
  );

  return db;
}
