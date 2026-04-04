/**
 * France Livestock MCP — Data Ingestion Script
 *
 * Sources:
 * - DGAL (Direction Generale de l'Alimentation)
 * - Code Rural et de la Peche Maritime
 * - Arrete du 25 octobre 1982 (bovins)
 * - Arrete du 16 janvier 2003 (porcins)
 * - Arrete du 1er fevrier 2002 (poules pondeuses)
 * - BDNI (Base de Donnees Nationale d'Identification)
 * - EDE (Etablissement Departemental d'Elevage)
 * - GDS France (Groupements de Defense Sanitaire)
 * - INRAE (Institut National de Recherche pour l'Agriculture)
 * - IDELE (Institut de l'Elevage)
 * - IFIP (Institut du Porc)
 * - ITAVI (Institut Technique de l'Aviculture)
 * - Reglement (CE) 1/2005 (transport)
 * - Reglement (CE) 1099/2009 (abattage)
 *
 * Usage: npm run ingest
 */

import { createDatabase } from '../src/db.js';
import { mkdirSync, writeFileSync } from 'fs';

mkdirSync('data', { recursive: true });
const db = createDatabase('data/database.db');

const now = new Date().toISOString().split('T')[0];

// ────────────────────────────────────────
// 1. Species
// ────────────────────────────────────────
const species = [
  { id: 'dairy_cattle', name: 'Bovins laitiers', breeds: ['Prim\'Holstein', 'Montbeliarde', 'Normande', 'Brune', 'Abondance', 'Tarentaise'] },
  { id: 'beef_cattle', name: 'Bovins allaitants', breeds: ['Charolaise', 'Limousine', 'Blonde d\'Aquitaine', 'Salers', 'Aubrac', 'Rouge des Pres', 'Parthenaise'] },
  { id: 'pigs', name: 'Porcins', breeds: ['Large White', 'Landrace Francais', 'Pietrain', 'Duroc', 'Porc Basque', 'Porc Gascon', 'Porc de Bayeux'] },
  { id: 'laying_hens', name: 'Volailles pondeuses', breeds: ['Isa Brown', 'Lohmann Brown', 'Lohmann LSL', 'Novogen Brown', 'Marans'] },
  { id: 'broilers', name: 'Volailles de chair', breeds: ['Ross 308', 'Cobb 500', 'JA757 (croissance lente)', 'Label Rouge (Cou Nu)', 'Poulet de Bresse'] },
  { id: 'sheep', name: 'Ovins', breeds: ['Lacaune', 'Ile-de-France', 'Suffolk', 'Berrichon du Cher', 'Texel', 'Merinos d\'Arles', 'Prealpes du Sud'] },
  { id: 'goats', name: 'Caprins', breeds: ['Alpine', 'Saanen', 'Poitevine', 'Pyrenees', 'Angora', 'Rove'] },
  { id: 'horses', name: 'Equins', breeds: ['Selle Francais', 'Trotteur Francais', 'Percheron', 'Breton', 'Comtois', 'Merens', 'Camargue'] },
];

for (const s of species) {
  db.run(
    `INSERT OR REPLACE INTO species (id, name, common_breeds) VALUES (?, ?, ?)`,
    [s.id, s.name, JSON.stringify(s.breeds)]
  );
}

console.log(`Inserted ${species.length} species.`);

// ────────────────────────────────────────
// 2. Welfare Standards
// ────────────────────────────────────────
const welfareStandards = [
  // --- Bovins laitiers ---
  {
    species_id: 'dairy_cattle', production_system: 'all', category: 'densite_elevage',
    standard: 'Surface minimale par vache laitiere en stabulation',
    legal_minimum: 'Surface suffisante pour que l\'animal puisse se coucher, se lever et se mouvoir normalement (Code Rural art. L214-1). En logette : 1 logette par vache minimum.',
    best_practice: 'Minimum 6,0 m2 par vache en logette, 8,0 m2 en aire paillee ; logettes profondes paillees ; couloir d\'alimentation 3,5 m de large',
    regulation_ref: 'Code Rural art. L214-1 a L214-3 ; Arrete du 25 octobre 1982',
    source: 'DGAL / IDELE',
  },
  {
    species_id: 'dairy_cattle', production_system: 'all', category: 'acces_exterieur',
    standard: 'Acces au paturage pour les bovins laitiers',
    legal_minimum: 'Pas d\'obligation legale de paturage. L\'eleveur doit assurer des conditions d\'hebergement compatibles avec les besoins biologiques de l\'animal.',
    best_practice: 'Paturage minimum 150 jours par an ; chargement inferieur a 1,4 UGB/ha ; parcelles tournantes pour limiter le parasitisme',
    regulation_ref: 'Code Rural art. L214-1 ; Cahier des charges Label Rouge / AB',
    source: 'IDELE / INRAE',
  },
  {
    species_id: 'dairy_cattle', production_system: 'all', category: 'eau',
    standard: 'Acces permanent a l\'eau potable',
    legal_minimum: 'Chaque animal doit disposer d\'eau potable en quantite suffisante et de qualite adequate (Code Rural art. R214-17)',
    best_practice: 'Minimum 2 points d\'abreuvement pour 20 vaches ; debit 20 l/min ; nettoyage regulier des abreuvoirs',
    regulation_ref: 'Code Rural art. R214-17 ; Arrete du 25 octobre 1982 art. 5',
    source: 'DGAL / IDELE',
  },
  {
    species_id: 'dairy_cattle', production_system: 'all', category: 'ecornage',
    standard: 'Ecornage des veaux — conditions et analgesie',
    legal_minimum: 'Ecornage autorise avant 4 semaines d\'age par cauterisation thermique sans obligation legale d\'analgesie (mais recommandee). Apres 4 semaines : acte veterinaire obligatoire avec anesthesie.',
    best_practice: 'Ecornage avant 3 semaines avec sedation + anesthesie locale + AINS ; selection genetique sur le gene sans cornes (polled)',
    regulation_ref: 'Code Rural art. R214-17 ; Arrete du 5 juin 2000',
    source: 'DGAL / SNGTV',
  },
  {
    species_id: 'dairy_cattle', production_system: 'all', category: 'eclairage',
    standard: 'Eclairage dans les batiments d\'elevage bovin',
    legal_minimum: 'Les animaux ne doivent pas etre maintenus en permanence dans l\'obscurite. Un eclairage adapte doit etre fourni.',
    best_practice: 'Minimum 150-200 lux pendant 16 heures pour optimiser la production laitiere ; eclairage naturel privilegie',
    regulation_ref: 'Arrete du 25 octobre 1982 art. 4 ; Directive 98/58/CE',
    source: 'DGAL / IDELE',
  },

  // --- Bovins allaitants ---
  {
    species_id: 'beef_cattle', production_system: 'all', category: 'densite_elevage',
    standard: 'Surface par bovin allaitant en batiment',
    legal_minimum: 'Surface suffisante pour le comportement normal (Code Rural art. L214-1). Pas de norme chiffree reglementaire pour les bovins adultes.',
    best_practice: 'Aire paillee : 5 a 7 m2 par vache allaitante ; 3,5 m2 par broutard (200-350 kg) ; 5,0 m2 par animal fini (>350 kg)',
    regulation_ref: 'Code Rural art. L214-1 ; Arrete du 25 octobre 1982',
    source: 'DGAL / IDELE',
  },
  {
    species_id: 'beef_cattle', production_system: 'all', category: 'acces_exterieur',
    standard: 'Acces a l\'exterieur pour les bovins allaitants',
    legal_minimum: 'Pas d\'obligation reglementaire de paturage. Le systeme d\'hebergement doit permettre des conditions de vie conformes aux besoins de l\'espece.',
    best_practice: 'Paturage extensif d\'avril a novembre ; chargement 1,0-1,4 UGB/ha ; abri naturel ou artificiel contre intemperies',
    regulation_ref: 'Code Rural art. L214-1',
    source: 'IDELE / Chambres d\'Agriculture',
  },

  // --- Porcins ---
  {
    species_id: 'pigs', production_system: 'indoor', category: 'surface_par_animal',
    standard: 'Surface minimale par porc charcutier — reglementation',
    legal_minimum: 'Porcelets sevres (<10 kg) : 0,15 m2 ; porcelets (10-20 kg) : 0,20 m2 ; porcs (20-30 kg) : 0,30 m2 ; porcs (30-50 kg) : 0,40 m2 ; porcs (50-85 kg) : 0,55 m2 ; porcs (85-110 kg) : 0,65 m2 ; porcs >110 kg : 1,0 m2. Truies en groupe : 2,25 m2/truie.',
    best_practice: 'Porcs charcutiers 0,80-1,0 m2 ; truies 2,50 m2 ; sol avec litiere paillee partielle',
    regulation_ref: 'Arrete du 16 janvier 2003 ; Directive 2008/120/CE',
    source: 'DGAL / IFIP',
  },
  {
    species_id: 'pigs', production_system: 'all', category: 'materiel_manipulable',
    standard: 'Materiel d\'enrichissement obligatoire pour tous les porcs',
    legal_minimum: 'Chaque porc doit avoir un acces permanent a des materiaux manipulables, mastiquables et deformables (paille, foin, bois, sciure, compost de champignons ou melange)',
    best_practice: 'Combinaison de paille au sol, objets suspendus et materiaux organiques renouvelee quotidiennement',
    regulation_ref: 'Arrete du 16 janvier 2003 art. 15 ; Directive 2008/120/CE annexe I',
    source: 'DGAL / Directive europeenne',
  },
  {
    species_id: 'pigs', production_system: 'all', category: 'caudectomie',
    standard: 'Coupe de la queue des porcelets — conditions strictes',
    legal_minimum: 'Caudectomie de routine interdite. Autorisee seulement si preuves de morsures de queue malgre mesures environnementales. Maximum la moitie de la queue ; avant 7 jours d\'age sans anesthesie, apres 7 jours par un veterinaire avec anesthesie.',
    best_practice: 'Conservation de la queue intacte ; gestion des facteurs de risque (enrichissement, ventilation, densite, competition alimentaire)',
    regulation_ref: 'Arrete du 16 janvier 2003 art. 17 ; Directive 2008/120/CE annexe I ch. I',
    source: 'DGAL / IFIP',
  },
  {
    species_id: 'pigs', production_system: 'all', category: 'castration',
    standard: 'Castration chirurgicale des porcelets',
    legal_minimum: 'Castration autorisee avant 7 jours sans anesthesie obligatoire (mais analgesie recommandee). Apres 7 jours : anesthesie et analgesie obligatoires, acte veterinaire.',
    best_practice: 'Immunocastration (Improvac) ou elevage de males entiers ; arret progressif de la castration chirurgicale (engagements filiere)',
    regulation_ref: 'Arrete du 16 janvier 2003 art. 17 ; Declaration europeenne de Bruxelles 2010',
    source: 'DGAL / IFIP / INAPORC',
  },

  // --- Volailles pondeuses ---
  {
    species_id: 'laying_hens', production_system: 'cage_amenagee', category: 'surface',
    standard: 'Surface minimale par poule pondeuse en cage amenagee',
    legal_minimum: 'Minimum 750 cm2 par poule en cage amenagee, dont 600 cm2 utilisables ; perchoir 15 cm par poule ; nid et litiere',
    best_practice: 'Abandon progressif des cages ; transition vers systemes alternatifs (au sol, plein air)',
    regulation_ref: 'Arrete du 1er fevrier 2002 ; Directive 1999/74/CE',
    source: 'DGAL / ITAVI',
  },
  {
    species_id: 'laying_hens', production_system: 'au_sol', category: 'surface',
    standard: 'Systeme au sol — maximum 9 poules par m2',
    legal_minimum: 'Maximum 9 poules par m2 de surface utilisable (1111 cm2/poule). Litiere sur au moins 1/3 de la surface au sol. Perchoirs 15 cm par poule. Nids 1 pour 7 poules.',
    best_practice: 'Maximum 7 poules par m2 ; jardin d\'hiver couvert ; materiel de picorage',
    regulation_ref: 'Arrete du 1er fevrier 2002 art. 8',
    source: 'DGAL / ITAVI',
  },
  {
    species_id: 'laying_hens', production_system: 'plein_air', category: 'parcours_exterieur',
    standard: 'Poules plein air — minimum 4 m2 par poule en exterieur',
    legal_minimum: 'Minimum 4 m2 de parcours exterieur par poule. Ouvertures suffisantes pour l\'acces exterieur.',
    best_practice: 'Parcours arbore avec abris ; 8+ m2 par poule ; rotation des parcours ; haies brise-vent',
    regulation_ref: 'Arrete du 1er fevrier 2002 ; Reglement (CE) 589/2008',
    source: 'DGAL / ITAVI',
  },
  {
    species_id: 'laying_hens', production_system: 'all', category: 'epointage',
    standard: 'Epointage du bec — conditions en France',
    legal_minimum: 'Epointage du bec autorise par traitement infrarouge en couvoir. Coupe du bec a la lame interdite. Uniquement pour prevenir le picage si les mesures environnementales sont insuffisantes.',
    best_practice: 'Eviter l\'epointage ; selectionner des souches calmes ; enrichissement environnemental ; gestion de la lumiere',
    regulation_ref: 'Arrete du 1er fevrier 2002 art. 17 ; Code Rural art. R214-17',
    source: 'DGAL / ITAVI',
  },

  // --- Volailles de chair ---
  {
    species_id: 'broilers', production_system: 'standard', category: 'densite',
    standard: 'Densite maximale poulets de chair standard',
    legal_minimum: 'Maximum 33 kg/m2 en standard. Possibilite d\'aller jusqu\'a 39 kg/m2 si criteres de bien-etre respectes (mortalite, dermatite plantaire) et jusqu\'a 42 kg/m2 avec derogation (parametres environnementaux documentes).',
    best_practice: 'Maximum 30 kg/m2 ; races a croissance lente pour Label Rouge (max 11 sujets/m2)',
    regulation_ref: 'Arrete du 28 juin 2010 ; Directive 2007/43/CE',
    source: 'DGAL / ITAVI',
  },
  {
    species_id: 'broilers', production_system: 'label_rouge', category: 'densite',
    standard: 'Poulet Label Rouge — densite et parcours',
    legal_minimum: 'Label Rouge : maximum 11 sujets/m2 en batiment ; acces au parcours exterieur obligatoire (2 m2/sujet minimum) ; race rustique a croissance lente (age d\'abattage minimum 81 jours) ; alimentation 75% cereales minimum.',
    best_practice: 'Parcours herbager arbore ; batiments de 400 m2 maximum ; duree d\'elevage 81-120 jours',
    regulation_ref: 'Cahier des charges Label Rouge volailles ; INAO',
    source: 'INAO / Synalaf',
  },
  {
    species_id: 'broilers', production_system: 'all', category: 'eclairage_litiere',
    standard: 'Eclairage et litiere pour poulets de chair',
    legal_minimum: 'Eclairage minimum 20 lux sur 80% de la surface pendant la periode lumineuse. Litiere seche sur toute la surface au sol. Periode d\'obscurite de 6 heures continues minimum.',
    best_practice: 'Lumiere naturelle par fenetres ; litiere de copeaux de bois ; mesure de l\'ammoniac < 20 ppm',
    regulation_ref: 'Arrete du 28 juin 2010 art. 5-7',
    source: 'DGAL / ITAVI',
  },

  // --- Ovins ---
  {
    species_id: 'sheep', production_system: 'all', category: 'hebergement',
    standard: 'Conditions d\'hebergement des ovins',
    legal_minimum: 'Les ovins doivent disposer d\'un abri contre les conditions meteorologiques extremes. Acces a l\'eau et a l\'alimentation en quantite suffisante.',
    best_practice: 'Bergerie : 1,5 m2 par brebis ; aire d\'agnelage 2,0 m2 par brebis + agneaux ; litiere paillee epaisse ; ventilation naturelle',
    regulation_ref: 'Code Rural art. R214-17 ; Directive 98/58/CE annexe',
    source: 'DGAL / IDELE',
  },
  {
    species_id: 'sheep', production_system: 'all', category: 'coupe_queue',
    standard: 'Coupe de la queue des agneaux',
    legal_minimum: 'Caudectomie autorisee par anneau elastique avant 7 jours ; ne pas couper au-dessous de la 3e vertebre caudale. Apres 7 jours : acte veterinaire avec anesthesie.',
    best_practice: 'Ne pas pratiquer la caudectomie sauf indication sanitaire ; hygiene des zones peri-anales',
    regulation_ref: 'Code Rural art. R214-17 ; Arrete du 5 juin 2000',
    source: 'DGAL / IDELE',
  },

  // --- Caprins ---
  {
    species_id: 'goats', production_system: 'all', category: 'hebergement',
    standard: 'Conditions d\'hebergement des caprins',
    legal_minimum: 'Surface suffisante par animal. Les chevres doivent pouvoir se deplacer librement. Ecornage sous anesthesie apres 4 semaines.',
    best_practice: 'Minimum 1,5 m2 par chevre laitiere ; couchettes surelevees ; aire de paillage ; acces a un parcours exterieur recommande',
    regulation_ref: 'Code Rural art. R214-17 ; Directive 98/58/CE',
    source: 'DGAL / IDELE',
  },

  // --- Equins ---
  {
    species_id: 'horses', production_system: 'all', category: 'hebergement',
    standard: 'Conditions d\'hebergement des equins',
    legal_minimum: 'Box individuel : minimum 9 m2 (cheval de selle). Stalle : minimum 5 m2. Acces quotidien a l\'exercice obligatoire si le cheval est detenu en box ou stalle.',
    best_practice: 'Box 12-16 m2 pour un cheval de selle ; paddock ou pre complementaire ; contact visuel et tactile avec des congeneres',
    regulation_ref: 'Code Rural art. R214-17 ; Arrete du 25 octobre 1982 ; Charte du Bien-Etre Equin (IFCE)',
    source: 'DGAL / IFCE',
  },

  // --- Transport (transversal) ---
  {
    species_id: 'dairy_cattle', production_system: 'all', category: 'transport',
    standard: 'Duree maximale de transport des bovins — reglement europeen',
    legal_minimum: 'Maximum 8 heures sans pause. Avec vehicule agree de type 2 : jusqu\'a 29 heures (repos 1 heure apres 14 heures). Veaux de moins de 14 jours : interdits de transport sauf < 100 km. Femelles en dernier dixieme de gestation : interdites.',
    best_practice: 'Transport le plus court possible ; maximum 4 heures pour les animaux destines a l\'abattage ; abreuvement avant depart',
    regulation_ref: 'Reglement (CE) 1/2005 art. 3 et annexe I ch. V ; Code Rural art. R214-49 a R214-62',
    source: 'DGAL / Reglement europeen',
  },
  {
    species_id: 'pigs', production_system: 'all', category: 'transport',
    standard: 'Transport des porcins — reglementation',
    legal_minimum: 'Maximum 8 heures sans pause (24 heures avec vehicule type 2 equipe). Porcelets < 10 kg : maximum 4 heures. Porcelets non sevres : interdits de transport.',
    best_practice: 'Transport maximum 4 heures ; systeme de brumisation par temps chaud (> 27 C) ; densite respectee',
    regulation_ref: 'Reglement (CE) 1/2005 annexe I ch. V ; Code Rural',
    source: 'DGAL / IFIP',
  },

  // --- Abattage ---
  {
    species_id: 'dairy_cattle', production_system: 'all', category: 'abattage',
    standard: 'Etourdissement avant abattage — bovins',
    legal_minimum: 'Etourdissement obligatoire avant la saignee. Bovins : pistolet a tige perforante ou etourdissement electrique. Controle de l\'inconscience avant saignee. Saignee dans les 60 secondes apres etourdissement.',
    best_practice: 'Pistolet a tige perforante de secours disponible ; entretien regulier du materiel ; formation du personnel ; cameras de surveillance',
    regulation_ref: 'Reglement (CE) 1099/2009 art. 4, annexe I ; Code Rural art. R214-63 a R214-81',
    source: 'DGAL / Reglement europeen',
  },

  // --- Agriculture biologique (transversal) ---
  {
    species_id: 'dairy_cattle', production_system: 'biologique', category: 'bio_cahier_charges',
    standard: 'Cahier des charges agriculture biologique — bovins laitiers',
    legal_minimum: 'Bio : minimum 6 m2 interieur + 4,5 m2 exterieur par vache. Paturage obligatoire (minimum 180 jours/an si conditions le permettent). 100% alimentation biologique. Pas d\'antibiotiques preventifs. Maximum 2 UGB/ha.',
    best_practice: 'Aire paillee profonde ; paturage > 200 jours/an ; prairies multi-especes',
    regulation_ref: 'Reglement (UE) 2018/848 annexe II partie II ; Cahier des charges AB France',
    source: 'INAO / AgenceBio',
  },
  {
    species_id: 'pigs', production_system: 'biologique', category: 'bio_cahier_charges',
    standard: 'Cahier des charges agriculture biologique — porcins',
    legal_minimum: 'Bio porcins : 2,3 m2 interieur + 1,9 m2 exterieur par porc charcutier. 100% alimentation biologique. Pas de castration chirurgicale sans anesthesie. Groupes sur litiere. Age d\'abattage minimum 6 mois.',
    best_practice: 'Parcours exterieur avec possibilite de fouissage ; races rustiques ; duree d\'engraissement > 7 mois',
    regulation_ref: 'Reglement (UE) 2018/848 annexe II partie II',
    source: 'INAO / AgenceBio',
  },
  {
    species_id: 'laying_hens', production_system: 'biologique', category: 'bio_cahier_charges',
    standard: 'Cahier des charges agriculture biologique — poules pondeuses',
    legal_minimum: 'Bio pondeuses : maximum 6 poules/m2 interieur ; minimum 4 m2 exterieur par poule ; 100% alimentation biologique ; maximum 3000 poules par batiment ; 8 heures d\'obscurite continue minimum.',
    best_practice: 'Maximum 4 poules/m2 ; parcours arbore avec rotation ; poules mobiles',
    regulation_ref: 'Reglement (UE) 2018/848 annexe II partie II',
    source: 'INAO / AgenceBio / ITAVI',
  },

  // --- Inspections et controles ---
  {
    species_id: 'dairy_cattle', production_system: 'all', category: 'controle_officiel',
    standard: 'Inspections officielles de bien-etre animal — DDPP',
    legal_minimum: 'Les Directions Departementales de la Protection des Populations (DDPP) realisent des inspections inopinees. Sanctions : mise en demeure, amende administrative (jusqu\'a 750 EUR par infraction), poursuites penales en cas de maltraitance (art. 521-1 Code Penal : 3 ans d\'emprisonnement et 45 000 EUR d\'amende).',
    best_practice: 'Adhesion a une demarche qualite (Charte des Bonnes Pratiques d\'Elevage, Label Rouge) ; audits internes reguliers ; plan de bien-etre avec veterinaire',
    regulation_ref: 'Code Rural art. L214-1 a L214-23 ; art. L215-11 (sanctions) ; Code Penal art. 521-1',
    source: 'DGAL / DDPP',
  },
];

for (const w of welfareStandards) {
  db.run(
    `INSERT INTO welfare_standards (species_id, production_system, category, standard, legal_minimum, best_practice, regulation_ref, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'FR')`,
    [w.species_id, w.production_system, w.category, w.standard, w.legal_minimum, w.best_practice, w.regulation_ref, w.source]
  );
}

console.log(`Inserted ${welfareStandards.length} welfare standards.`);

// ────────────────────────────────────────
// 3. Stocking Densities
// ────────────────────────────────────────
const stockingDensities = [
  // Bovins laitiers
  { species_id: 'dairy_cattle', age_class: 'adulte', housing_type: 'logette', density_value: 6.0, density_unit: 'm2_par_tete', legal_minimum: 6.0, recommended: 8.0, source: 'IDELE / Arrete 25 oct. 1982' },
  { species_id: 'dairy_cattle', age_class: 'adulte', housing_type: 'aire_paillee', density_value: 8.0, density_unit: 'm2_par_tete', legal_minimum: 8.0, recommended: 10.0, source: 'IDELE / Arrete 25 oct. 1982' },
  { species_id: 'dairy_cattle', age_class: 'genisse', housing_type: 'groupe', density_value: 3.0, density_unit: 'm2_par_tete', legal_minimum: 2.5, recommended: 3.5, source: 'IDELE' },
  { species_id: 'dairy_cattle', age_class: 'adulte', housing_type: 'biologique', density_value: 6.0, density_unit: 'm2_par_tete_interieur', legal_minimum: 6.0, recommended: 10.0, source: 'Reglement (UE) 2018/848' },
  // Bovins allaitants
  { species_id: 'beef_cattle', age_class: '200-350 kg', housing_type: 'aire_paillee', density_value: 3.5, density_unit: 'm2_par_tete', legal_minimum: 3.0, recommended: 4.0, source: 'IDELE' },
  { species_id: 'beef_cattle', age_class: '>350 kg', housing_type: 'aire_paillee', density_value: 5.0, density_unit: 'm2_par_tete', legal_minimum: 4.5, recommended: 6.0, source: 'IDELE' },
  { species_id: 'beef_cattle', age_class: 'vache allaitante', housing_type: 'aire_paillee', density_value: 7.0, density_unit: 'm2_par_tete', legal_minimum: 5.0, recommended: 7.0, source: 'IDELE / Chambres d\'Agriculture' },
  // Porcins
  { species_id: 'pigs', age_class: 'porcelets sevres (<20 kg)', housing_type: 'interieur', density_value: 0.20, density_unit: 'm2_par_tete', legal_minimum: 0.20, recommended: 0.30, source: 'Arrete 16 jan. 2003' },
  { species_id: 'pigs', age_class: 'porcs 30-50 kg', housing_type: 'interieur', density_value: 0.40, density_unit: 'm2_par_tete', legal_minimum: 0.40, recommended: 0.55, source: 'Arrete 16 jan. 2003' },
  { species_id: 'pigs', age_class: 'porcs 50-85 kg', housing_type: 'interieur', density_value: 0.55, density_unit: 'm2_par_tete', legal_minimum: 0.55, recommended: 0.70, source: 'Arrete 16 jan. 2003' },
  { species_id: 'pigs', age_class: 'porcs 85-110 kg', housing_type: 'interieur', density_value: 0.65, density_unit: 'm2_par_tete', legal_minimum: 0.65, recommended: 0.80, source: 'Arrete 16 jan. 2003' },
  { species_id: 'pigs', age_class: 'porcs >110 kg', housing_type: 'interieur', density_value: 1.0, density_unit: 'm2_par_tete', legal_minimum: 1.0, recommended: 1.2, source: 'Arrete 16 jan. 2003' },
  { species_id: 'pigs', age_class: 'truies', housing_type: 'groupe', density_value: 2.25, density_unit: 'm2_par_tete', legal_minimum: 2.25, recommended: 2.50, source: 'Arrete 16 jan. 2003' },
  { species_id: 'pigs', age_class: 'porcs charcutiers', housing_type: 'biologique', density_value: 2.3, density_unit: 'm2_par_tete_interieur', legal_minimum: 2.3, recommended: 2.5, source: 'Reglement (UE) 2018/848' },
  // Pondeuses
  { species_id: 'laying_hens', age_class: 'adulte', housing_type: 'au_sol', density_value: 1111, density_unit: 'cm2_par_tete', legal_minimum: 1111, recommended: 1429, source: 'Arrete 1er fev. 2002 / Directive 1999/74/CE' },
  { species_id: 'laying_hens', age_class: 'adulte', housing_type: 'cage_amenagee', density_value: 750, density_unit: 'cm2_par_tete', legal_minimum: 750, recommended: 0, source: 'Arrete 1er fev. 2002 / Directive 1999/74/CE' },
  { species_id: 'laying_hens', age_class: 'adulte', housing_type: 'plein_air', density_value: 4.0, density_unit: 'm2_exterieur_par_tete', legal_minimum: 4.0, recommended: 8.0, source: 'Arrete 1er fev. 2002 / Reglement (CE) 589/2008' },
  { species_id: 'laying_hens', age_class: 'adulte', housing_type: 'biologique', density_value: 1667, density_unit: 'cm2_par_tete', legal_minimum: 1667, recommended: 2500, source: 'Reglement (UE) 2018/848' },
  // Poulets de chair
  { species_id: 'broilers', age_class: 'standard', housing_type: 'interieur', density_value: 33, density_unit: 'kg_par_m2', legal_minimum: 33, recommended: 30, source: 'Arrete 28 juin 2010 / Directive 2007/43/CE' },
  { species_id: 'broilers', age_class: 'standard_derogatoire', housing_type: 'interieur', density_value: 42, density_unit: 'kg_par_m2', legal_minimum: 42, recommended: 33, source: 'Arrete 28 juin 2010 / Directive 2007/43/CE' },
  { species_id: 'broilers', age_class: 'label_rouge', housing_type: 'interieur', density_value: 25, density_unit: 'kg_par_m2', legal_minimum: 25, recommended: 20, source: 'Cahier des charges Label Rouge' },
  { species_id: 'broilers', age_class: 'biologique', housing_type: 'interieur', density_value: 21, density_unit: 'kg_par_m2', legal_minimum: 21, recommended: 16, source: 'Reglement (UE) 2018/848' },
  // Ovins
  { species_id: 'sheep', age_class: 'brebis', housing_type: 'bergerie', density_value: 1.5, density_unit: 'm2_par_tete', legal_minimum: 1.0, recommended: 1.5, source: 'IDELE / Directive 98/58/CE' },
  { species_id: 'sheep', age_class: 'agneaux', housing_type: 'bergerie', density_value: 0.5, density_unit: 'm2_par_tete', legal_minimum: 0.5, recommended: 0.7, source: 'IDELE' },
  // Caprins
  { species_id: 'goats', age_class: 'chevre laitiere', housing_type: 'interieur', density_value: 1.5, density_unit: 'm2_par_tete', legal_minimum: 1.0, recommended: 1.5, source: 'IDELE / Directive 98/58/CE' },
  // Equins
  { species_id: 'horses', age_class: 'adulte', housing_type: 'box', density_value: 9.0, density_unit: 'm2_par_tete', legal_minimum: 9.0, recommended: 12.0, source: 'Arrete 25 oct. 1982 / IFCE' },
  { species_id: 'horses', age_class: 'adulte', housing_type: 'stalle', density_value: 5.0, density_unit: 'm2_par_tete', legal_minimum: 5.0, recommended: 9.0, source: 'Arrete 25 oct. 1982 / IFCE' },
  // Transport
  { species_id: 'pigs', age_class: 'charcutier (100 kg)', housing_type: 'transport', density_value: 0.425, density_unit: 'm2_par_tete', legal_minimum: 0.425, recommended: 0.50, source: 'Reglement (CE) 1/2005 annexe I ch. VII' },
  { species_id: 'dairy_cattle', age_class: 'adulte (500 kg)', housing_type: 'transport', density_value: 1.3, density_unit: 'm2_par_tete', legal_minimum: 1.3, recommended: 1.6, source: 'Reglement (CE) 1/2005 annexe I ch. VII' },
  { species_id: 'sheep', age_class: 'adulte (75 kg)', housing_type: 'transport', density_value: 0.30, density_unit: 'm2_par_tete', legal_minimum: 0.20, recommended: 0.30, source: 'Reglement (CE) 1/2005 annexe I ch. VII' },
];

for (const sd of stockingDensities) {
  db.run(
    `INSERT INTO stocking_densities (species_id, age_class, housing_type, density_value, density_unit, legal_minimum, recommended, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'FR')`,
    [sd.species_id, sd.age_class, sd.housing_type, sd.density_value, sd.density_unit, sd.legal_minimum, sd.recommended, sd.source]
  );
}

console.log(`Inserted ${stockingDensities.length} stocking densities.`);

// ────────────────────────────────────────
// 4. Feed Requirements
// ────────────────────────────────────────
const feedRequirements = [
  {
    species_id: 'dairy_cattle', age_class: 'adulte', production_stage: 'lactation (30 kg lait/jour)',
    energy_mj_per_day: 115, protein_g_per_day: 1800, dry_matter_kg: 22.0,
    minerals: JSON.stringify({ calcium_g: 80, phosphore_g: 45, magnesium_g: 25, sodium_g: 15 }),
    example_ration: 'Ensilage d\'herbe (35 kg) + ensilage de mais (15 kg) + concentre (8 kg) — objectif 0,95 UFL/kg MS',
    notes: 'Systeme UFL (Unite Fourragere Lait) : 1 UFL = 7,12 MJ ENL. PDI (Proteines Digestibles dans l\'Intestin) : 100-110 g PDI/UFL en debut de lactation.'
  },
  {
    species_id: 'dairy_cattle', age_class: 'adulte', production_stage: 'tarissement',
    energy_mj_per_day: 55, protein_g_per_day: 700, dry_matter_kg: 11.0,
    minerals: JSON.stringify({ calcium_g: 25, phosphore_g: 20, magnesium_g: 20 }),
    example_ration: 'Foin a volonte + ensilage d\'herbe limite — prevenir l\'hypocalcemie par ration a BACA negatives',
    notes: 'Tarissement de 6-8 semaines. NEC (Note d\'Etat Corporel) cible 3,0-3,5 au velage.'
  },
  {
    species_id: 'beef_cattle', age_class: 'broutard', production_stage: 'engraissement',
    energy_mj_per_day: 75, protein_g_per_day: 1100, dry_matter_kg: 10.0,
    minerals: JSON.stringify({ calcium_g: 30, phosphore_g: 20 }),
    example_ration: 'Ensilage de mais (20 kg) + concentre (4 kg) + paille a volonte',
    notes: 'Objectif GMQ (Gain Moyen Quotidien) 1200-1400 g/jour. Taurillons Charolais : 95-100 UFV/jour en finition.'
  },
  {
    species_id: 'pigs', age_class: 'porcelets sevres', production_stage: 'post-sevrage',
    energy_mj_per_day: 14, protein_g_per_day: 200, dry_matter_kg: 1.0,
    minerals: JSON.stringify({ calcium_g: 8, phosphore_g: 5, lysine_g: 12 }),
    example_ration: 'Aliment 1er age (1,0-1,5 kg/jour) — EN 10,5 MJ/kg, lysine digestible 12 g/kg',
    notes: 'Systeme EN porc (Energie Nette). Transition progressive aliment 1er age vers 2e age entre 12 et 25 kg.'
  },
  {
    species_id: 'pigs', age_class: 'porcs charcutiers', production_stage: 'engraissement',
    energy_mj_per_day: 26, protein_g_per_day: 340, dry_matter_kg: 2.5,
    minerals: JSON.stringify({ calcium_g: 12, phosphore_g: 8, lysine_g: 15 }),
    example_ration: 'Aliment complet (2,5 kg/jour) — EN 9,7 MJ/kg, MAT 155 g/kg',
    notes: 'Abattage a 115-120 kg. Indice de consommation cible 2,6-2,8. TMP (Taux de Muscle des Pieces) cible > 60%.'
  },
  {
    species_id: 'pigs', age_class: 'truies', production_stage: 'lactation',
    energy_mj_per_day: 65, protein_g_per_day: 900, dry_matter_kg: 6.5,
    minerals: JSON.stringify({ calcium_g: 25, phosphore_g: 15, lysine_g: 45 }),
    example_ration: 'Aliment truies allaitantes a volonte (6-7 kg/jour) — EN 9,7 MJ/kg, lysine digestible 7,5 g/kg',
    notes: 'Objectif 2,3-2,5 portees par truie et par an. Eviter la perte d\'etat en lactation.'
  },
  {
    species_id: 'laying_hens', age_class: 'adulte', production_stage: 'ponte',
    energy_mj_per_day: 1.3, protein_g_per_day: 18, dry_matter_kg: 0.12,
    minerals: JSON.stringify({ calcium_g: 4.2, phosphore_g: 0.35 }),
    example_ration: 'Aliment pondeuses (110-120 g/jour) — MAT 160-170 g/kg, calcium 38-42 g/kg',
    notes: 'Grit coquillier distribue separement. Consommation d\'eau environ 250 ml/jour.'
  },
  {
    species_id: 'broilers', age_class: 'poussin', production_stage: 'croissance (J0-J42)',
    energy_mj_per_day: 1.0, protein_g_per_day: 23, dry_matter_kg: 0.10,
    minerals: JSON.stringify({ calcium_g: 1.0, phosphore_g: 0.45 }),
    example_ration: 'Demarrage (J0-J10), croissance (J10-J28), finition (J28-J42) — MAT de 230 a 190 g/kg',
    notes: 'Indice de consommation cible 1,6-1,7 (standard) ou 2,2-2,5 (Label Rouge, croissance lente).'
  },
  {
    species_id: 'sheep', age_class: 'brebis', production_stage: 'entretien',
    energy_mj_per_day: 8.5, protein_g_per_day: 80, dry_matter_kg: 1.2,
    minerals: JSON.stringify({ calcium_g: 3, phosphore_g: 2, magnesium_g: 1.5 }),
    example_ration: 'Herbe ou foin a volonte + pierre a lecher minerale',
    notes: 'Brebis de 70 kg. Augmenter l\'alimentation les 6 dernieres semaines de gestation (steaming up).'
  },
  {
    species_id: 'sheep', age_class: 'brebis', production_stage: 'lactation',
    energy_mj_per_day: 18, protein_g_per_day: 200, dry_matter_kg: 2.5,
    minerals: JSON.stringify({ calcium_g: 8, phosphore_g: 5 }),
    example_ration: 'Herbe a volonte + concentre 0,5-1,0 kg/jour (plus pour portees doubles)',
    notes: 'Pic d\'ingestion 4-6 semaines apres agnelage. Brebis Lacaune laitieres : ration specifique lait.'
  },
  {
    species_id: 'goats', age_class: 'adulte', production_stage: 'lactation',
    energy_mj_per_day: 18, protein_g_per_day: 250, dry_matter_kg: 3.0,
    minerals: JSON.stringify({ calcium_g: 10, phosphore_g: 6 }),
    example_ration: 'Foin de luzerne + concentre (1,0-1,5 kg/jour) — MAT 150-160 g/kg MS',
    notes: 'Chevres Alpine ou Saanen : 800-1000 litres/lactation. Foin de qualite obligatoire (chevres selectifs).'
  },
  {
    species_id: 'horses', age_class: 'adulte', production_stage: 'entretien',
    energy_mj_per_day: 35, protein_g_per_day: 300, dry_matter_kg: 8.0,
    minerals: JSON.stringify({ calcium_g: 20, phosphore_g: 14, sodium_g: 10 }),
    example_ration: 'Foin (8-10 kg/jour) ou paturage + complement mineral. Rapport fourrage/concentre : 70/30 minimum.',
    notes: 'Cheval de selle de 500 kg. 1 UFC (Unite Fourragere Cheval) = 9,42 MJ ED. Acces a une pierre a sel.'
  },
];

for (const fr of feedRequirements) {
  db.run(
    `INSERT INTO feed_requirements (species_id, age_class, production_stage, energy_mj_per_day, protein_g_per_day, dry_matter_kg, minerals, example_ration, notes, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'FR')`,
    [fr.species_id, fr.age_class, fr.production_stage, fr.energy_mj_per_day, fr.protein_g_per_day, fr.dry_matter_kg, fr.minerals, fr.example_ration, fr.notes]
  );
}

console.log(`Inserted ${feedRequirements.length} feed requirements.`);

// ────────────────────────────────────────
// 5. Movement Rules (BDNI — Base de Donnees Nationale d'Identification)
// ────────────────────────────────────────
const movementRules = [
  // Bovins
  {
    species_id: 'dairy_cattle', rule_type: 'identification',
    rule: 'Tout bovin doit etre identifie dans les 20 jours suivant la naissance par 2 boucles auriculaires agrees (dont une electronique). Le passeport bovin (document d\'accompagnement) est delivre par l\'EDE. Enregistrement obligatoire a la BDNI.',
    standstill_days: 0, exceptions: 'Pas d\'exception',
    authority: 'EDE / BDNI', regulation_ref: 'Code Rural art. D212-17 a D212-28 ; Reglement (CE) 1760/2000',
  },
  {
    species_id: 'dairy_cattle', rule_type: 'notification',
    rule: 'Toute naissance, mort, entree ou sortie d\'un bovin doit etre notifiee a la BDNI dans les 7 jours. Le passeport bovin accompagne l\'animal a chaque deplacement. Le registre d\'elevage doit etre tenu a jour sur l\'exploitation.',
    standstill_days: 0, exceptions: 'Deplacements entre sites d\'une meme exploitation',
    authority: 'EDE / BDNI', regulation_ref: 'Code Rural art. D212-19 ; Arrete du 10 juin 2020',
  },
  {
    species_id: 'dairy_cattle', rule_type: 'deplacement',
    rule: 'Tout deplacement de bovins doit etre accompagne du passeport et d\'un document de circulation (Laissez-passer sanitaire si necessaire). L\'exploitation de destination notifie l\'arrivee a la BDNI sous 7 jours.',
    standstill_days: 0, exceptions: 'Transport direct a l\'abattoir',
    authority: 'DDPP / EDE', regulation_ref: 'Code Rural art. D212-19 a D212-24',
  },
  {
    species_id: 'beef_cattle', rule_type: 'identification',
    rule: 'Identique aux bovins laitiers : 2 boucles auriculaires dans les 20 jours, passeport bovin, enregistrement BDNI.',
    standstill_days: 0, exceptions: 'Pas d\'exception',
    authority: 'EDE / BDNI', regulation_ref: 'Code Rural art. D212-17 ; Reglement (CE) 1760/2000',
  },
  // Porcins
  {
    species_id: 'pigs', rule_type: 'identification',
    rule: 'Les porcins sont identifies par une marque auriculaire ou un tatouage portant l\'indicatif de marquage du site d\'elevage. Les porcs destines a l\'abattage : tatouage a l\'abattoir. Enregistrement obligatoire a la BDNI.',
    standstill_days: 0, exceptions: 'Porcelets sur le site de naissance : identification a la sortie',
    authority: 'BDNI / DDPP', regulation_ref: 'Arrete du 24 novembre 2005 ; Code Rural art. D212-32 a D212-39',
  },
  {
    species_id: 'pigs', rule_type: 'notification',
    rule: 'Tout mouvement de porcins doit etre notifie a la BDPORC (Base de Donnees Porcine) dans les 7 jours. Document d\'accompagnement (ICA - Information sur la Chaine Alimentaire) obligatoire pour tout envoi a l\'abattoir.',
    standstill_days: 0, exceptions: 'Pas d\'exception',
    authority: 'BDPORC / DDPP', regulation_ref: 'Arrete du 24 novembre 2005 ; Reglement (CE) 853/2004',
  },
  {
    species_id: 'pigs', rule_type: 'zones_reglementees',
    rule: 'En cas de peste porcine africaine (PPA) ou classique : zone de protection (3 km) et zone de surveillance (10 km) avec interdiction de mouvement. La France dispose d\'un plan de contingence PPA avec zones tampons aux frontieres.',
    standstill_days: 0, exceptions: 'Derogation DDPP pour transport direct a l\'abattoir apres analyses',
    authority: 'DGAL / DDPP', regulation_ref: 'Code Rural art. L223-1 a L223-8 ; Plan national PPA',
  },
  // Ovins et caprins
  {
    species_id: 'sheep', rule_type: 'identification',
    rule: 'Ovins : 2 reperes auriculaires (dont un electronique) avant 6 mois ou avant toute sortie de l\'exploitation. Enregistrement a la BDNI. Registre d\'elevage obligatoire sur l\'exploitation.',
    standstill_days: 0, exceptions: 'Agneaux de boucherie < 12 mois destines directement a l\'abattoir : 1 repere suffit',
    authority: 'EDE / BDNI', regulation_ref: 'Code Rural art. D212-29 a D212-31 ; Reglement (CE) 21/2004',
  },
  {
    species_id: 'sheep', rule_type: 'notification',
    rule: 'Notification de tout mouvement d\'ovins a la BDNI sous 7 jours. Document de circulation obligatoire avec numero EDE d\'origine et de destination, nombre d\'animaux, numeros d\'identification.',
    standstill_days: 0, exceptions: 'Transhumance : declaration prealable a la DDPP',
    authority: 'EDE / BDNI', regulation_ref: 'Code Rural art. D212-29 ; Arrete du 19 decembre 2005',
  },
  {
    species_id: 'goats', rule_type: 'identification',
    rule: 'Caprins : 2 reperes auriculaires (dont un electronique) avant 6 mois. Enregistrement BDNI. Registre d\'elevage.',
    standstill_days: 0, exceptions: 'Chevreaux de boucherie < 12 mois : 1 repere',
    authority: 'EDE / BDNI', regulation_ref: 'Code Rural art. D212-29 ; Reglement (CE) 21/2004',
  },
  {
    species_id: 'goats', rule_type: 'notification',
    rule: 'Notification a la BDNI sous 7 jours de tout mouvement. Document de circulation obligatoire.',
    standstill_days: 0, exceptions: 'Pas d\'exception',
    authority: 'EDE / BDNI', regulation_ref: 'Code Rural art. D212-29',
  },
  // Volailles
  {
    species_id: 'laying_hens', rule_type: 'identification',
    rule: 'Pas d\'identification individuelle pour les volailles. Enregistrement du lot (nombre, race, age) aupres de la DDPP. Registre d\'elevage obligatoire.',
    standstill_days: 0, exceptions: 'Pas d\'exception',
    authority: 'DDPP', regulation_ref: 'Code Rural art. D214-17 ; Arrete du 5 juin 2000',
  },
  {
    species_id: 'laying_hens', rule_type: 'zones_influenza',
    rule: 'En cas d\'influenza aviaire hautement pathogene (IAHP) : mise a l\'abri obligatoire (claustration) dans les zones a risque ; zones de protection (3 km) et surveillance (10 km) avec interdiction de mouvement.',
    standstill_days: 21, exceptions: 'Derogation DDPP pour transport direct a l\'abattoir',
    authority: 'DGAL / DDPP', regulation_ref: 'Code Rural art. L223-1 ; Arrete du 16 mars 2016 (IAHP)',
  },
  {
    species_id: 'broilers', rule_type: 'identification',
    rule: 'Enregistrement du lot aupres de la DDPP. Document d\'accompagnement pour tout transport. ICA (Information sur la Chaine Alimentaire) obligatoire pour l\'abattoir.',
    standstill_days: 0, exceptions: 'Pas d\'exception',
    authority: 'DDPP', regulation_ref: 'Code Rural ; Reglement (CE) 853/2004',
  },
  // Equins
  {
    species_id: 'horses', rule_type: 'identification',
    rule: 'Tout equide doit etre identifie avant 12 mois ou avant toute cession. Identification par document d\'identification (livret), transpondeur electronique (puce) et enregistrement au SIRE (Systeme d\'Information Relatif aux Equides).',
    standstill_days: 0, exceptions: 'Pas d\'exception',
    authority: 'IFCE / SIRE', regulation_ref: 'Code Rural art. D212-50 a D212-62 ; Reglement (UE) 2015/262',
  },
  {
    species_id: 'horses', rule_type: 'notification',
    rule: 'Toute cession, deces ou changement de lieu de detention doit etre declare au SIRE sous 30 jours. Le document d\'identification accompagne l\'animal a chaque deplacement.',
    standstill_days: 0, exceptions: 'Pas d\'exception',
    authority: 'IFCE / SIRE', regulation_ref: 'Code Rural art. D212-56',
  },
  // Export
  {
    species_id: 'dairy_cattle', rule_type: 'exportation',
    rule: 'Exportation intra-UE : certificat TRACES obligatoire. Examen clinique par un veterinaire officiel dans les 24 heures avant le depart. Statut sanitaire du troupeau documente (IBR, BVD, tuberculose, brucellose).',
    standstill_days: 0, exceptions: 'Transport direct vers abattoir dans un autre Etat membre : procedure simplifiee',
    authority: 'DDPP / DGAL', regulation_ref: 'Reglement (UE) 2016/429 (Loi Sante Animale) ; Systeme TRACES',
  },
];

for (const mr of movementRules) {
  db.run(
    `INSERT INTO movement_rules (species_id, rule_type, rule, standstill_days, exceptions, authority, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'FR')`,
    [mr.species_id, mr.rule_type, mr.rule, mr.standstill_days, mr.exceptions, mr.authority, mr.regulation_ref]
  );
}

console.log(`Inserted ${movementRules.length} movement rules.`);

// ────────────────────────────────────────
// 6. Animal Health / Prophylaxie
// ────────────────────────────────────────
const animalHealth = [
  // Prophylaxie obligatoire bovins
  {
    id: 'brucellose-bovins', species_id: 'dairy_cattle', condition: 'Brucellose bovine (Brucella abortus)',
    symptoms: 'Avortement en fin de gestation, retention placentaire, infertilite. Chez le taureau : orchite. Zoonose : fievre ondulante chez l\'homme.',
    causes: 'Brucella abortus ; contamination par les avortons, les eaux foetales, le lait',
    treatment: 'Pas de traitement — abattage des animaux positifs. La France a le statut officiellement indemne de brucellose bovine.',
    prevention: 'Prophylaxie obligatoire annuelle : depistage serologique sur lait de melange (troupeaux laitiers) ou prise de sang (troupeaux allaitants). Surveillance a l\'abattoir. Controle a l\'introduction (ASDA).',
    notifiable: 1, source: 'DGAL / GDS France / Code Rural art. L223-1',
  },
  {
    id: 'tuberculose-bovins', species_id: 'dairy_cattle', condition: 'Tuberculose bovine (Mycobacterium bovis)',
    symptoms: 'Amaigrissement chronique, toux, ganglions lymphatiques hypertrophies. Souvent subclinique. Diagnostic par intradermotuberculination (IDC).',
    causes: 'Mycobacterium bovis ; contamination par voie respiratoire, lait contamine. Reservoir sauvage : blaireaux, cerfs.',
    treatment: 'Pas de traitement — abattage des animaux positifs. Surveillance renforcee dans les departements a risque (Cote-d\'Or, Dordogne, Landes, Pyrenees-Atlantiques).',
    prevention: 'Prophylaxie obligatoire : tuberculination periodique (annuelle dans les zones a risque, quinquennale ailleurs). Surveillance a l\'abattoir. Controle a l\'introduction.',
    notifiable: 1, source: 'DGAL / GDS France',
  },
  {
    id: 'leucose-bovins', species_id: 'dairy_cattle', condition: 'Leucose bovine enzootique (LBE)',
    symptoms: 'Hypertrophie des ganglions lymphatiques, tumeurs dans les organes internes. Souvent asymptomatique. La France a le statut officiellement indemne.',
    causes: 'Virus de la leucose bovine enzootique (deltaretrovirus) ; transmission par le sang (insectes piqueurs, materiel d\'injection)',
    treatment: 'Pas de traitement — abattage des animaux positifs.',
    prevention: 'Prophylaxie obligatoire : depistage serologique sur lait de melange ou prise de sang. Frequence definie par departement (generalement annuelle).',
    notifiable: 1, source: 'DGAL / GDS France',
  },
  {
    id: 'ibr-bovins', species_id: 'dairy_cattle', condition: 'IBR (Rhinotracheite Infectieuse Bovine)',
    symptoms: 'Ecoulement nasal, fievre, baisse de production laitiere, avortements. Portage latent apres infection.',
    causes: 'Herpesvirus bovin de type 1 (BoHV-1) ; transmission par contact direct, aerosol',
    treatment: 'Pas de traitement curatif. Vaccination avec vaccin deletes gE pour differencier vaccinaux/infectes.',
    prevention: 'Plan national d\'eradication de l\'IBR : depistage serologique obligatoire (gE-ELISA sur lait ou sang). Vaccination obligatoire des animaux positifs. Objectif eradication 2027.',
    notifiable: 0, source: 'GDS France / Arrete du 31 mai 2016',
  },
  {
    id: 'bvd-bovins', species_id: 'dairy_cattle', condition: 'BVD (Diarrhee Virale Bovine)',
    symptoms: 'Diarrhee, fievre, baisse de production, avortements, veaux IPI (Infectes Permanents Immunotolerants)',
    causes: 'Pestivirus (BVD) ; transmission par contact direct ou par les IPI',
    treatment: 'Pas de traitement. Les IPI doivent etre detectes et elimines.',
    prevention: 'Plan national BVD (arrete du 31 juillet 2019) : depistage de tous les veaux a la naissance par biopsie auriculaire (prelevement sur boucle). Elimination des IPI. Qualification des cheptels.',
    notifiable: 0, source: 'GDS France / DGAL / Arrete du 31 juillet 2019',
  },
  // Fievre aphteuse
  {
    id: 'fievre-aphteuse', species_id: 'dairy_cattle', condition: 'Fievre aphteuse',
    symptoms: 'Fievre, aphtes sur la bouche, les pieds et les mamelles, salivation excessive, boiterie, refus de manger',
    causes: 'Virus aphteux (Aphthovirus) ; tres contagieux par contact direct, air, fomites',
    treatment: 'Pas de traitement — declaration obligatoire a la DDPP. Abattage du troupeau et des contacts. La France est indemne.',
    prevention: 'Controles aux importations, biosecurite, plans de contingence. Vaccination interdite en temps normal (EU).',
    notifiable: 1, source: 'DGAL / Code Rural art. L223-1 ; OIE',
  },
  // Porcins
  {
    id: 'ppa-porcins', species_id: 'pigs', condition: 'Peste Porcine Africaine (PPA)',
    symptoms: 'Fievre elevee, hemorragies cutanees, cyanose des oreilles, mortalite brutale. Forme chronique : amaigrissement, diarrhee, avortements.',
    causes: 'Virus PPA (Asfivirus) ; transmission par contact direct, viande contaminee, tiques molles, fomites',
    treatment: 'Pas de traitement ni de vaccin — declaration obligatoire. Abattage et restriction de mouvements.',
    prevention: 'Biosecurite renforcee, clotures contre les sangliers, interdiction de nourrir les porcs avec des dechets alimentaires. Plan national de surveillance PPA.',
    notifiable: 1, source: 'DGAL / Plan national PPA / OIE',
  },
  {
    id: 'ppc-porcins', species_id: 'pigs', condition: 'Peste Porcine Classique (PPC)',
    symptoms: 'Fievre elevee (41-42 C), taches violacees sur la peau, demarche vacillante, diarrhee, vomissements. Mortalite elevee.',
    causes: 'Virus PPC (Pestivirus) ; transmission par contact direct, aliments contamines, semence, fomites',
    treatment: 'Pas de traitement — declaration obligatoire. Abattage et restriction de mouvements. La France est indemne depuis 2002.',
    prevention: 'Vaccination interdite en statut indemne. Biosecurite, controles aux importations, surveillance dans la faune sauvage (sangliers).',
    notifiable: 1, source: 'DGAL / Code Rural / OIE',
  },
  // Volailles
  {
    id: 'iahp-volailles', species_id: 'laying_hens', condition: 'Influenza Aviaire Hautement Pathogene (IAHP)',
    symptoms: 'Mortalite brutale et elevee, chute de ponte, oedeme de la tete, cyanose de la crete et des barbillons, signes nerveux',
    causes: 'Virus influenza aviaire (H5N1, H5N8, etc.) ; contamination par les oiseaux sauvages, contact direct, fomites',
    treatment: 'Pas de traitement — declaration obligatoire. Abattage, zones de protection et surveillance.',
    prevention: 'Vaccination preventive des palmipedes (canards) autorisee depuis 2023 en France (campagnes vaccinales annuelles). Mise a l\'abri obligatoire en periode de risque. Biosecurite renforcee.',
    notifiable: 1, source: 'DGAL / Arrete du 16 mars 2016 / OIE',
  },
  {
    id: 'salmonellose-pondeuses', species_id: 'laying_hens', condition: 'Salmonellose (poules pondeuses)',
    symptoms: 'Diarrhee, chute de ponte, mortalite accrue chez les poussins. Risque de contamination des oeufs (salmonellose humaine).',
    causes: 'Salmonella enteritidis, S. typhimurium ; transmission feco-orale, aliments, rongeurs',
    treatment: 'Antibiotiques apres antibiogramme (rare). Lots positifs souvent abattus ou retires du circuit des oeufs de consommation.',
    prevention: 'Plan national de lutte Salmonella : depistage obligatoire des lots (chiffonnettes). Vaccination des poulettes en elevage. Nettoyage-desinfection entre lots. Deration.',
    notifiable: 0, source: 'DGAL / Plan Salmonella / ITAVI',
  },
  // Ovins
  {
    id: 'brucellose-ovins', species_id: 'sheep', condition: 'Brucellose ovine (Brucella melitensis)',
    symptoms: 'Avortements, metrites, orchites. Zoonose grave : fievre de Malte chez l\'homme.',
    causes: 'Brucella melitensis ; transmission par les avortons, le lait, le contact direct',
    treatment: 'Pas de traitement — abattage. La France est officiellement indemne.',
    prevention: 'Prophylaxie obligatoire : depistage serologique annuel. Controle a l\'introduction. Surveillance a l\'abattoir.',
    notifiable: 1, source: 'DGAL / GDS France',
  },
  {
    id: 'fco-ruminants', species_id: 'dairy_cattle', condition: 'Fievre Catarrhale Ovine (FCO / Bluetongue)',
    symptoms: 'Bovins : fievre, oedeme de la face, erosions buccales, boiterie, chute de production. Ovins : fievre, langue bleue, jetage, oedemee face, mortalite plus elevee.',
    causes: 'Virus FCO (Orbivirus) ; transmission par des moucherons Culicoides (pas de transmission directe)',
    treatment: 'Traitement symptomatique. Declaration obligatoire.',
    prevention: 'Vaccination disponible (BTV-4, BTV-8). Vaccination obligatoire ou recommandee selon les serotypes circulants. Desinsectisation. Restriction de mouvements dans les zones reglementees.',
    notifiable: 1, source: 'DGAL / GDS France / OIE',
  },
  // Caprins
  {
    id: 'caev-caprins', species_id: 'goats', condition: 'CAEV (Arthrite Encephalite Caprine Virale)',
    symptoms: 'Arthrite chronique, encephalite chez les jeunes, mammite indurative, amaigrissement progressif',
    causes: 'Virus CAEV (Lentivirus) ; transmission par le colostrum et le lait, contact direct',
    treatment: 'Pas de traitement. Evolution chronique et lente.',
    prevention: 'Programme GDS d\'eradication volontaire : depistage serologique, colostrum thermalise, separation des chevreaux a la naissance dans les troupeaux positifs.',
    notifiable: 0, source: 'GDS France / IDELE',
  },
  // Campagnes GDS
  {
    id: 'gds-campagnes', species_id: 'dairy_cattle', condition: 'Campagnes de prophylaxie GDS — organisation',
    symptoms: 'Non applicable (organisation sanitaire)',
    causes: 'Prophylaxie collective obligatoire pour la maitrise des maladies reglementees',
    treatment: 'Les GDS (Groupements de Defense Sanitaire) organisent les campagnes annuelles de depistage : prises de sang, prelevements de lait, tuberculinations. Les resultats conditionnent la qualification sanitaire du cheptel et la delivrance de l\'ASDA (Attestation Sanitaire a Delivrance Anticipee).',
    prevention: 'Adhesion obligatoire au GDS departemental. Participation a toutes les campagnes de prophylaxie. ASDA valide 12 mois, renouvellement conditionne au depistage. Introduction d\'animaux : controle sanitaire prealable obligatoire.',
    notifiable: 0, source: 'GDS France / DGAL / Code Rural art. L224-1',
  },
  // Antibioresistance
  {
    id: 'ecoantibio', species_id: 'dairy_cattle', condition: 'Plan EcoAntibio — reduction des antibiotiques',
    symptoms: 'Non applicable (politique publique)',
    causes: 'Antibioresistance liee a l\'utilisation excessive d\'antibiotiques en elevage',
    treatment: 'Plan EcoAntibio 2 (2017-2022 et prolonge) : objectif de reduction de 50% des antibiotiques critiques (fluoroquinolones, cephalosporines 3e/4e generation). ALEA (Animal Level of Exposure to Antimicrobials) par espece et par exploitation.',
    prevention: 'Prescription veterinaire obligatoire. Registre des traitements. Alternatives : vaccination, biosecurite, phytotherapie. Antibiogramme obligatoire pour les antibiotiques critiques. Bilan sanitaire annuel avec le veterinaire traitant.',
    notifiable: 0, source: 'DGAL / ANSES / Plan EcoAntibio',
  },
  // Equins
  {
    id: 'aie-equins', species_id: 'horses', condition: 'Anemie Infectieuse des Equides (AIE)',
    symptoms: 'Fievre recurrente, anemie, oedeme, amaigrissement. Portage asymptomatique frequent.',
    causes: 'Virus AIE (Lentivirus) ; transmission par les insectes piqueurs (taons), materiel contamine, voie transplacentaire',
    treatment: 'Pas de traitement. Les animaux positifs sont porteurs a vie.',
    prevention: 'Test de Coggins (AGID) ou ELISA obligatoire pour tout rassemblement, exportation, changement de proprietaire. Isolement et abattage des positifs.',
    notifiable: 1, source: 'DGAL / IFCE / Code Rural art. L223-1',
  },
];

for (const ah of animalHealth) {
  db.run(
    `INSERT OR REPLACE INTO animal_health (id, species_id, condition, symptoms, causes, treatment, prevention, notifiable, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'FR')`,
    [ah.id, ah.species_id, ah.condition, ah.symptoms, ah.causes, ah.treatment, ah.prevention, ah.notifiable, ah.source]
  );
}

console.log(`Inserted ${animalHealth.length} animal health entries.`);

// ────────────────────────────────────────
// 7. Housing Requirements
// ────────────────────────────────────────
const housingRequirements = [
  {
    species_id: 'dairy_cattle', age_class: 'adulte', system: 'logette',
    space_per_head_m2: 6.0, ventilation: 'Ventilation naturelle avec faitage ouvert ; minimum 500 m3/h par vache',
    flooring: 'Logettes avec matelas ou litiere profonde ; couloir de circulation beton strie ou caillebotis',
    temperature_range: '-10 a 25 C (stress thermique au-dessus de 25 C)', lighting: 'Lumiere naturelle + eclairage artificiel 150-200 lux pendant 16 h',
    source: 'IDELE / Arrete du 25 octobre 1982',
  },
  {
    species_id: 'dairy_cattle', age_class: 'adulte', system: 'aire_paillee',
    space_per_head_m2: 8.0, ventilation: 'Ventilation naturelle ; faitage ouvert et bardage ajoure',
    flooring: 'Paille profonde ; paillage regulier (8-10 kg/vache/jour)',
    temperature_range: '-10 a 25 C', lighting: 'Lumiere naturelle + eclairage artificiel 150-200 lux',
    source: 'IDELE / Arrete du 25 octobre 1982',
  },
  {
    species_id: 'dairy_cattle', age_class: 'veau', system: 'igloo_ou_niche',
    space_per_head_m2: 2.0, ventilation: 'Ventilation naturelle ; igloos individuels ou niches collectives a l\'exterieur',
    flooring: 'Paille sur sol dur ; litiere seche',
    temperature_range: '-5 a 25 C (veaux : eviter les courants d\'air)',
    lighting: 'Lumiere naturelle ; eclairage artificiel en stabulation',
    source: 'IDELE / Directive 2008/119/CE',
  },
  {
    species_id: 'pigs', age_class: 'porcs charcutiers', system: 'interieur',
    space_per_head_m2: 0.65, ventilation: 'Ventilation mecanique ; vitesse d\'air max 0,2 m/s au niveau des animaux',
    flooring: 'Caillebotis partiel ; partie pleine (min. 40%) avec zone de couchage seche',
    temperature_range: '18-22 C (porcs charcutiers)', lighting: 'Minimum 40 lux pendant 8 heures par jour',
    source: 'Arrete du 16 janvier 2003 / IFIP',
  },
  {
    species_id: 'pigs', age_class: 'truies', system: 'groupe',
    space_per_head_m2: 2.25, ventilation: 'Ventilation mecanique ; chauffage lampe infrarouge pour les nids a porcelets (30-32 C)',
    flooring: 'Caillebotis partiel ; zone de couchage paillee',
    temperature_range: '18-20 C (truies), 30-32 C (nid a porcelets)', lighting: 'Minimum 40 lux pendant 8 heures',
    source: 'Arrete du 16 janvier 2003 / IFIP',
  },
  {
    species_id: 'pigs', age_class: 'porcelets sevres', system: 'interieur',
    space_per_head_m2: 0.20, ventilation: 'Ventilation mecanique ; chauffage radiant ou plancher chauffant',
    flooring: 'Caillebotis partiel ou total ; zone de couchage chauffee',
    temperature_range: '25-28 C (porcelets sevres)', lighting: 'Minimum 40 lux pendant 8 heures',
    source: 'Arrete du 16 janvier 2003 / IFIP',
  },
  {
    species_id: 'laying_hens', age_class: 'adulte', system: 'au_sol_voliere',
    space_per_head_m2: 0.11, ventilation: 'Ventilation mecanique ou naturelle ; controle de l\'ammoniac',
    flooring: 'Litiere sur au moins 1/3 de la surface ; caillebotis avec tapis de dejection ; perchoirs',
    temperature_range: '15-24 C', lighting: 'Minimum 20 lux ; programme lumineux 16L:8D ; lumiere naturelle par fenetres',
    source: 'Arrete du 1er fevrier 2002 / ITAVI',
  },
  {
    species_id: 'broilers', age_class: 'poussin', system: 'interieur',
    space_per_head_m2: 0.04, ventilation: 'Ventilation mecanique ; ammoniac max 20 ppm',
    flooring: 'Litiere integrale (copeaux de bois ou paille hachee)',
    temperature_range: '33 C (jour 1) descendant a 20 C (jour 35)', lighting: 'Minimum 20 lux ; 6 heures d\'obscurite continues',
    source: 'Arrete du 28 juin 2010 / ITAVI',
  },
  {
    species_id: 'sheep', age_class: 'brebis', system: 'bergerie',
    space_per_head_m2: 1.5, ventilation: 'Ventilation naturelle ; eviter les courants d\'air au niveau des animaux',
    flooring: 'Paille sur sol dur ; litiere epaisse',
    temperature_range: '5-20 C', lighting: 'Lumiere naturelle ; eclairage pour les soins',
    source: 'IDELE / Directive 98/58/CE',
  },
  {
    species_id: 'goats', age_class: 'adulte', system: 'interieur',
    space_per_head_m2: 1.5, ventilation: 'Ventilation naturelle ; chevres sensibles aux courants d\'air',
    flooring: 'Paille profonde ou caillebotis avec aire de couchage ; aires surelevees souhaitees',
    temperature_range: '5-25 C', lighting: 'Lumiere naturelle + eclairage 16 h pour chevres laitieres',
    source: 'IDELE / Directive 98/58/CE',
  },
  {
    species_id: 'horses', age_class: 'adulte', system: 'box',
    space_per_head_m2: 12.0, ventilation: 'Ventilation naturelle ; ouverture haute et basse ; eviter l\'ammoniac',
    flooring: 'Litiere de paille, copeaux ou lin sur sol dur ; curage regulier',
    temperature_range: '5-25 C', lighting: 'Lumiere naturelle par fenetres ou porte ouverte ; 8-16 h de lumiere',
    source: 'IFCE / Arrete du 25 octobre 1982',
  },
];

for (const hr of housingRequirements) {
  db.run(
    `INSERT INTO housing_requirements (species_id, age_class, system, space_per_head_m2, ventilation, flooring, temperature_range, lighting, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'FR')`,
    [hr.species_id, hr.age_class, hr.system, hr.space_per_head_m2, hr.ventilation, hr.flooring, hr.temperature_range, hr.lighting, hr.source]
  );
}

console.log(`Inserted ${housingRequirements.length} housing requirements.`);

// ────────────────────────────────────────
// 8. Breeding Guidance
// ────────────────────────────────────────
const breedingGuidance = [
  {
    species_id: 'dairy_cattle', topic: 'velage',
    guidance: 'Gestation moyenne 280 jours. Tarissement 6-8 semaines avant le velage. Ration de transition 3 semaines avant. NEC cible 3,0-3,5 au velage. Intervalle velage-velage cible 365-400 jours. Races principales : Prim\'Holstein (65% du cheptel laitier), Montbeliarde (18%), Normande (8%).',
    calendar: JSON.stringify({ insemination: 'Toute l\'annee (IA)', diagnostic_gestation: '30-90 jours apres IA', tarissement: '6-8 semaines avant velage', velage: 'Toute l\'annee', remise_a_la_reproduction: '60-90 jours apres velage' }),
    gestation_days: 280,
    source: 'IDELE / INRAE',
  },
  {
    species_id: 'beef_cattle', topic: 'velage',
    guidance: 'Gestation moyenne 283 jours (variations raciales : 275-295 jours). Velages groupes au printemps (fevrier-avril) pour les races allaitantes. Taureau 1:25-30 vaches en monte naturelle. Races principales : Charolaise (40% du cheptel allaitant), Limousine (28%), Blonde d\'Aquitaine (12%), Salers, Aubrac.',
    calendar: JSON.stringify({ mise_a_la_reproduction: 'Avr-Juin', diagnostic_gestation: 'Sep-Nov', velage: 'Fev-Avr', sevrage: 'Sep-Oct' }),
    gestation_days: 283,
    source: 'IDELE / Chambres d\'Agriculture',
  },
  {
    species_id: 'pigs', topic: 'mise_bas',
    guidance: 'Duree de gestation 114 jours (3 mois, 3 semaines, 3 jours). Transfert en maternite 5-7 jours avant la mise bas. Objectif 2,3-2,5 portees par truie et par an. Moyenne 14-16 porcelets nes vivants par portee. Sevrage a 21-28 jours. Races : Large White x Landrace (truies), Pietrain ou Duroc (verrats terminaux).',
    calendar: JSON.stringify({ saillie_ou_IA: 'Production continue', diagnostic_gestation: '28 jours apres saillie', transfert_maternite: '7 jours avant mise bas', mise_bas: '114 jours apres saillie', sevrage: '21-28 jours apres mise bas' }),
    gestation_days: 114,
    source: 'IFIP / INRAE',
  },
  {
    species_id: 'laying_hens', topic: 'periode_de_ponte',
    guidance: 'Maturite sexuelle vers 18-20 semaines. Pic de ponte (95%+) vers 26-30 semaines. Duree de ponte 72-100 semaines (cycles de plus en plus longs grace a la genetique). Mue forcee interdite en France.',
    calendar: JSON.stringify({ elevage_poulettes: '0-18 semaines', entree_en_ponte: '18-20 semaines', pic_de_ponte: '26-30 semaines', reforme: '72-100 semaines' }),
    gestation_days: 21,
    source: 'ITAVI / INRAE',
  },
  {
    species_id: 'sheep', topic: 'agnelage',
    guidance: 'Gestation moyenne 147 jours. Saison de lutte octobre-novembre (races saisonnieres) ou toute l\'annee (Lacaune, Ile-de-France). Echographie a 45-60 jours. Augmenter l\'alimentation 6 dernieres semaines (flushing). Races principales : Lacaune (lait), Ile-de-France, Berrichon du Cher, Texel (viande).',
    calendar: JSON.stringify({ lutte: 'Oct-Nov (saisonnier)', echographie: 'Dec-Jan', agnelage: 'Mar-Avr', sevrage: 'Jul-Aout' }),
    gestation_days: 147,
    source: 'IDELE / INRAE',
  },
  {
    species_id: 'goats', topic: 'mise_bas',
    guidance: 'Gestation moyenne 150 jours. Chevres sont des reproductrices saisonnieres (jours courts). Saison de lutte septembre-novembre. Chevrettage fevrier-avril. Moyenne 1,8-2,2 chevreaux par portee. Races principales : Alpine (55%), Saanen (40%), Poitevine, Pyrenees.',
    calendar: JSON.stringify({ lutte: 'Sep-Nov', diagnostic_gestation: 'Nov-Dec', chevrettage: 'Fev-Avr', sevrage: '8-12 semaines' }),
    gestation_days: 150,
    source: 'IDELE / INRAE',
  },
  {
    species_id: 'horses', topic: 'reproduction',
    guidance: 'Gestation de la jument : 335-342 jours (environ 11 mois). Saison de monte : fevrier a juillet (lumieres artificielles pour avancer). IA (insemination artificielle) largement utilisee en France (IFCE reglemente). Poulinage mars-juin. Races : Selle Francais, Trotteur Francais, pur-sang, trait (Percheron, Breton, Comtois).',
    calendar: JSON.stringify({ saison_monte: 'Fev-Juil', diagnostic_gestation: '14 jours (echo)', poulinage: 'Mar-Juin', sevrage: '6 mois' }),
    gestation_days: 340,
    source: 'IFCE / Haras Nationaux',
  },
];

for (const bg of breedingGuidance) {
  db.run(
    `INSERT INTO breeding_guidance (species_id, topic, guidance, calendar, gestation_days, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, 'FR')`,
    [bg.species_id, bg.topic, bg.guidance, bg.calendar, bg.gestation_days, bg.source]
  );
}

console.log(`Inserted ${breedingGuidance.length} breeding guidance entries.`);

// ────────────────────────────────────────
// 9. FTS5 Search Index
// ──────────────────────────────��─────────

// Clear existing FTS data
db.run(`DELETE FROM search_index`);

// Welfare standards -> FTS
for (const w of welfareStandards) {
  db.run(
    `INSERT INTO search_index (title, body, species, category, jurisdiction) VALUES (?, ?, ?, ?, 'FR')`,
    [
      w.standard,
      `${w.legal_minimum} ${w.best_practice} ${w.regulation_ref}`,
      w.species_id,
      `welfare/${w.category}`,
    ]
  );
}

// Movement rules -> FTS
for (const mr of movementRules) {
  const speciesName = species.find(s => s.id === mr.species_id)?.name ?? mr.species_id;
  db.run(
    `INSERT INTO search_index (title, body, species, category, jurisdiction) VALUES (?, ?, ?, ?, 'FR')`,
    [
      `${speciesName} — ${mr.rule_type}`,
      `${mr.rule} ${mr.exceptions ?? ''} ${mr.regulation_ref}`,
      mr.species_id,
      `movement/${mr.rule_type}`,
    ]
  );
}

// Animal health -> FTS
for (const ah of animalHealth) {
  db.run(
    `INSERT INTO search_index (title, body, species, category, jurisdiction) VALUES (?, ?, ?, ?, 'FR')`,
    [
      ah.condition,
      `${ah.symptoms} ${ah.causes} ${ah.treatment} ${ah.prevention}`,
      ah.species_id,
      ah.notifiable ? 'health/maladie_reglementee' : 'health',
    ]
  );
}

// Housing -> FTS
for (const hr of housingRequirements) {
  const speciesName = species.find(s => s.id === hr.species_id)?.name ?? hr.species_id;
  db.run(
    `INSERT INTO search_index (title, body, species, category, jurisdiction) VALUES (?, ?, ?, ?, 'FR')`,
    [
      `${speciesName} hebergement — ${hr.system}`,
      `${hr.ventilation} ${hr.flooring} ${hr.temperature_range} ${hr.lighting}`,
      hr.species_id,
      'housing',
    ]
  );
}

// Feed -> FTS
for (const fr of feedRequirements) {
  const speciesName = species.find(s => s.id === fr.species_id)?.name ?? fr.species_id;
  db.run(
    `INSERT INTO search_index (title, body, species, category, jurisdiction) VALUES (?, ?, ?, ?, 'FR')`,
    [
      `${speciesName} alimentation — ${fr.production_stage}`,
      `${fr.example_ration} ${fr.notes}`,
      fr.species_id,
      'feed',
    ]
  );
}

// Breeding -> FTS
for (const bg of breedingGuidance) {
  const speciesName = species.find(s => s.id === bg.species_id)?.name ?? bg.species_id;
  db.run(
    `INSERT INTO search_index (title, body, species, category, jurisdiction) VALUES (?, ?, ?, ?, 'FR')`,
    [
      `${speciesName} reproduction — ${bg.topic}`,
      bg.guidance,
      bg.species_id,
      'breeding',
    ]
  );
}

// Stocking density -> FTS
for (const sd of stockingDensities) {
  const speciesName = species.find(s => s.id === sd.species_id)?.name ?? sd.species_id;
  db.run(
    `INSERT INTO search_index (title, body, species, category, jurisdiction) VALUES (?, ?, ?, ?, 'FR')`,
    [
      `${speciesName} densite — ${sd.housing_type}`,
      `${sd.age_class}: ${sd.density_value} ${sd.density_unit}, minimum legal ${sd.legal_minimum}, recommande ${sd.recommended}`,
      sd.species_id,
      'stocking_density',
    ]
  );
}

const ftsCount = db.get<{ count: number }>('SELECT COUNT(*) as count FROM search_index');
console.log(`FTS5 search index: ${ftsCount?.count ?? 0} entries.`);

// ────────────────────────────────────────
// 10. Metadata
// ──────────────────────────────���─────────
const totalRows = species.length + welfareStandards.length + stockingDensities.length +
  feedRequirements.length + movementRules.length + animalHealth.length +
  housingRequirements.length + breedingGuidance.length;

db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('last_ingest', ?)", [now]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('build_date', ?)", [now]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('jurisdiction', 'FR')", []);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('mcp_name', 'France Livestock MCP')", []);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('species_count', ?)", [String(species.length)]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('welfare_count', ?)", [String(welfareStandards.length)]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('movement_count', ?)", [String(movementRules.length)]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('health_count', ?)", [String(animalHealth.length)]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('total_rows', ?)", [String(totalRows)]);

// ────────────────────────────────────────
// 11. Coverage JSON
// ────────────────────────────────────────
writeFileSync('data/coverage.json', JSON.stringify({
  mcp_name: 'France Livestock MCP',
  jurisdiction: 'FR',
  build_date: now,
  status: 'populated',
  species_count: species.length,
  species: species.map(s => ({ id: s.id, name: s.name })),
  welfare_standards_count: welfareStandards.length,
  stocking_densities_count: stockingDensities.length,
  feed_requirements_count: feedRequirements.length,
  movement_rules_count: movementRules.length,
  animal_health_count: animalHealth.length,
  housing_requirements_count: housingRequirements.length,
  breeding_guidance_count: breedingGuidance.length,
  total_rows: totalRows,
  fts_entries: ftsCount?.count ?? 0,
  sources: [
    'DGAL (Direction Generale de l\'Alimentation)',
    'Code Rural et de la Peche Maritime',
    'BDNI (Base de Donnees Nationale d\'Identification)',
    'GDS France (Groupements de Defense Sanitaire)',
    'IDELE (Institut de l\'Elevage)',
    'IFIP (Institut du Porc)',
    'ITAVI (Institut Technique de l\'Aviculture)',
    'IFCE (Institut Francais du Cheval et de l\'Equitation)',
    'INRAE (Institut National de Recherche pour l\'Agriculture)',
    'INAO (Institut National de l\'Origine et de la Qualite)',
    'Reglement (CE) 1/2005 (transport)',
    'Reglement (CE) 1099/2009 (abattage)',
    'Reglement (UE) 2018/848 (agriculture biologique)',
  ],
}, null, 2));

db.close();

console.log('\nIngestion terminee.');
console.log(`  Especes:             ${species.length}`);
console.log(`  Normes bien-etre:    ${welfareStandards.length}`);
console.log(`  Densites:            ${stockingDensities.length}`);
console.log(`  Alimentation:        ${feedRequirements.length}`);
console.log(`  Regles mouvement:    ${movementRules.length}`);
console.log(`  Sante animale:       ${animalHealth.length}`);
console.log(`  Hebergement:         ${housingRequirements.length}`);
console.log(`  Reproduction:        ${breedingGuidance.length}`);
console.log(`  Total enregistrements: ${totalRows}`);
console.log(`  Index FTS:           ${ftsCount?.count ?? 0}`);
