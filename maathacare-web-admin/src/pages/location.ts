export interface District {
  code: string;
  name: string;
}

export interface MohArea {
  code: string;
  name: string;
}

// All districts from your registration file mapped to standard 3-letter codes
export const DISTRICTS: District[] = [
  // Central Province
  { code: 'KAN', name: 'Kandy' },
  { code: 'MTL', name: 'Matale' },
  { code: 'NEL', name: 'Nuwara Eliya' },
  // Western Province
  { code: 'COL', name: 'Colombo' },
  { code: 'GAM', name: 'Gampaha' },
  { code: 'KAL', name: 'Kalutara' },
  // Southern Province
  { code: 'GAL', name: 'Galle' },
  { code: 'MAT', name: 'Matara' },
  { code: 'HAM', name: 'Hambantota' },
  // Eastern Province
  { code: 'AMP', name: 'Ampara' },
  { code: 'BAT', name: 'Batticaloa' },
  { code: 'TRI', name: 'Trincomalee' },
  // North Central Province
  { code: 'ANU', name: 'Anuradhapura' },
  { code: 'POL', name: 'Polonnaruwa' },
  // Northern Province
  { code: 'JAF', name: 'Jaffna' },
  { code: 'KIL', name: 'Kilinochchi' },
  { code: 'MAN', name: 'Mannar' },
  { code: 'MUL', name: 'Mullaitivu' },
  { code: 'VAV', name: 'Vavuniya' },
  // North Western Province
  { code: 'KUR', name: 'Kurunegala' },
  { code: 'PUT', name: 'Puttalam' },
  // Sabaragamuwa Province
  { code: 'KEG', name: 'Kegalle' },
  { code: 'RAT', name: 'Ratnapura' },
  // Uva Province
  { code: 'BAD', name: 'Badulla' },
  { code: 'MON', name: 'Monaragala' }
];

// MOH Area mappings populated directly from your mobile registration lists
export const MOH_AREAS: Record<string, MohArea[]> = {
  KAN: [
    { code: 'AKU', name: 'Akurana' },
    { code: 'BAM', name: 'Bambaradeniya' },
    { code: 'DEL', name: 'Deltota' },
    { code: 'DOL', name: 'Doluwa' },
    { code: 'GLG', name: 'Galagedara' },
    { code: 'GLH', name: 'Galaha' },
    { code: 'GAM', name: 'Gampola (Udapalatha)' },
    { code: 'GIK', name: 'Ganga Ihala Korale' },
    { code: 'GWK', name: 'Gangawata Korale' },
    { code: 'HAR', name: 'Harispattuwa' },
    { code: 'HAS', name: 'Hasalaka' },
    { code: 'HAT', name: 'Hatharaliyadda' },
    { code: 'KAD', name: 'Kadugannawa' },
    { code: 'KMC', name: 'Kandy MC' },
    { code: 'KUN', name: 'Kundasale' },
    { code: 'MNK', name: 'Manikhinna' },
    { code: 'MDB', name: 'Medadumbara' },
    { code: 'NWP', name: 'Nawalapitiya (Pasbage)' },
    { code: 'PAN', name: 'Panvila' },
    { code: 'POO', name: 'Poojapitiya' },
    { code: 'THA', name: 'Thalathuoya' },
    { code: 'UDD', name: 'Udadumbara' },
    { code: 'UDN', name: 'Udunuwara' },
    { code: 'WAT', name: 'Wattegama (Pathadumbara)' },
    { code: 'YAT', name: 'Yatinuwara' }
  ],
  NEL: [
    { code: 'AMB', name: 'Ambagamuwa' },
    { code: 'BOG', name: 'Bogawanthalawa' },
    { code: 'GIN', name: 'Ginigathhena' },
    { code: 'HAN', name: 'Hanguranketha' },
    { code: 'KOT', name: 'Kotagala' },
    { code: 'KTH', name: 'Kothmale' },
    { code: 'LIN', name: 'Lindula' },
    { code: 'MAS', name: 'Maskeliya' },
    { code: 'MTH', name: 'Mathurata' },
    { code: 'NMC', name: 'MC Nuwaraeliya' },
    { code: 'NWT', name: 'Nawathispane' },
    { code: 'NUW', name: 'Nuwaraeliya' },
    { code: 'RAG', name: 'Ragala' },
    { code: 'WAL', name: 'Walapane' }
  ],
  MTL: [
    { code: 'AMK', name: 'Ambanganga Korale' },
    { code: 'DAM', name: 'Dambulla' },
    { code: 'DMC', name: 'MC Dambulla' },
    { code: 'GAL', name: 'Galewela' },
    { code: 'LGP', name: 'Laggala Pallegama' },
    { code: 'MAT', name: 'Matale' },
    { code: 'MMC', name: 'MC Matale' },
    { code: 'NAU', name: 'Naula' },
    { code: 'PAL', name: 'Pallepola' },
    { code: 'RAT', name: 'Rattota' },
    { code: 'UKU', name: 'Ukuwela' },
    { code: 'WIL', name: 'Wilgamuwa' },
    { code: 'YAT', name: 'Yatawatta' }
  ],
  AMP: [
    { code: 'AKK', name: 'Akkaraipattu' },
    { code: 'AMP', name: 'Ampara' },
    { code: 'DEH', name: 'Dehiattakandiya' },
    { code: 'MAH', name: 'Mahaoya' },
    { code: 'PAD', name: 'Padiyathalawa' },
    { code: 'UHA', name: 'Uhana' }
  ],
  BAT: [
    { code: 'ARA', name: 'Arayampathy' },
    { code: 'BAT', name: 'Batticaloa' },
    { code: 'CHE', name: 'Chenkaladi' },
    { code: 'ERA', name: 'Eravur' },
    { code: 'KAL', name: 'Kaluwanchikudy' },
    { code: 'KAT', name: 'Kattankudy' },
    { code: 'KIR', name: 'Kiran' },
    { code: 'ODD', name: 'Oddamavady' },
    { code: 'PAD', name: 'Paddipalai' },
    { code: 'VAL', name: 'Valaichenai' },
    { code: 'VEL', name: 'Vellavely' }
  ],
  TRI: [
    { code: 'EAC', name: 'Eachchilampatru' },
    { code: 'GOM', name: 'Gomarankadawela' },
    { code: 'KAN', name: 'Kanthale' },
    { code: 'KIN', name: 'Kinniya' },
    { code: 'KUC', name: 'Kuchchaveli' },
    { code: 'KUR', name: 'Kurinchakkerny' }
  ],
  ANU: [
    { code: 'ANU', name: 'Anuradhapura' },
    { code: 'GBW', name: 'Galenbindunuwewa' },
    { code: 'GNW', name: 'Galnewa' }
  ],
  POL: [
    { code: 'DIM', name: 'Dimbulagala' },
    { code: 'ELA', name: 'Elahera' },
    { code: 'HIN', name: 'Hingurakgoda' },
    { code: 'LAN', name: 'Lankapura' },
    { code: 'MED', name: 'Medirigiriya' },
    { code: 'THA', name: 'Thamankduwa' },
    { code: 'WEL', name: 'Welikanda' }
  ],
  JAF: [
    { code: 'CHA', name: 'Chankanai' },
    { code: 'CHV', name: 'Chavakachcheri' },
    { code: 'KAR', name: 'Karainagar' },
    { code: 'KVD', name: 'Karaveddy' },
    { code: 'KAY', name: 'Kayts' },
    { code: 'NAL', name: 'Nallur' },
    { code: 'PTP', name: 'Point Pedro' },
    { code: 'SAN', name: 'Sandilipay' },
    { code: 'TEL', name: 'Telippalai' },
    { code: 'UDU', name: 'Uduvil' }
  ],
  KIL: [
    { code: 'KAN', name: 'Kandawalai' },
    { code: 'KRC', name: 'Karachchi' },
    { code: 'PAL', name: 'Palai' },
    { code: 'POO', name: 'Poonakary' }
  ],
  MAN: [
    { code: 'MNT', name: 'Mannar Town' },
    { code: 'MUS', name: 'Musalai' },
    { code: 'NAN', name: 'Nanattan' }
  ],
  MUL: [
    { code: 'MAL', name: 'Mallavi' },
    { code: 'MUL', name: 'Mullaitivu' }
  ],
  VAV: [
    { code: 'CHE', name: 'Cheddikulam' },
    { code: 'VAV', name: 'Vavuniya' },
    { code: 'VAS', name: 'Vavuniya South' }
  ],
  KUR: [
    { code: 'ALA', name: 'Alawwa' },
    { code: 'GLG', name: 'Galgamuwa' },
    { code: 'GIR', name: 'Giribawa' },
    { code: 'KUR', name: 'Kurunegala' },
    { code: 'MAH', name: 'Maho' },
    { code: 'NAR', name: 'Narammala' },
    { code: 'POL', name: 'Polpithigama' },
    { code: 'RID', name: 'Rideegama' },
    { code: 'UDB', name: 'Udubeddawa' }
  ],
  PUT: [
    { code: 'ANA', name: 'Anamaduwa' },
    { code: 'ARA', name: 'Arachchikattuwa' },
    { code: 'CHI', name: 'Chilaw' },
    { code: 'DAN', name: 'Dankotuwa' },
    { code: 'KAR', name: 'Karuwalagaswewa' },
    { code: 'MAD', name: 'Madampe' },
    { code: 'MAR', name: 'Marawila' },
    { code: 'MUN', name: 'Mundal' },
    { code: 'NAT', name: 'Nattandiya' },
    { code: 'PAL', name: 'Pallama' },
    { code: 'WEN', name: 'Wennappuwa' }
  ],
  KEG: [
    { code: 'ARA', name: 'Aranayake' },
    { code: 'KEG', name: 'Kegalle' },
    { code: 'MAW', name: 'Mawanella' },
    { code: 'RAM', name: 'Rambukkana' },
    { code: 'RUW', name: 'Ruwanwella' },
    { code: 'WAR', name: 'Warakapola' },
    { code: 'YAT', name: 'Yatiyantota' }
  ],
  RAT: [
    { code: 'BAL', name: 'Balangoda' },
    { code: 'EHE', name: 'Eheliyagoda' },
    { code: 'EMB', name: 'Embilipitiya' },
    { code: 'RAT', name: 'Ratnapura' }
  ],
  BAD: [
    { code: 'BAD', name: 'Badulla' },
    { code: 'BAN', name: 'Bandarawela' },
    { code: 'DIY', name: 'Diyatalawa' },
    { code: 'ELL', name: 'Ella' },
    { code: 'HAL', name: 'Haldummulla' },
    { code: 'HAE', name: 'Hali Ela' },
    { code: 'HAP', name: 'Haputale' },
    { code: 'KAN', name: 'Kandaketiya' },
    { code: 'LUN', name: 'Lunugala' },
    { code: 'MAH', name: 'Mahiyanganaya' },
    { code: 'MEE', name: 'Meegahakivula' },
    { code: 'PAS', name: 'Passara' },
    { code: 'RID', name: 'Rideemaliyadda' },
    { code: 'SOR', name: 'Soranathota' },
    { code: 'UVP', name: 'Uva Paranagama' },
    { code: 'WEL', name: 'Welimada' }
  ],
  MON: [
    { code: 'BAD', name: 'Badalkumbura' },
    { code: 'BIB', name: 'Bibile' },
    { code: 'BUT', name: 'Buttala' },
    { code: 'KAT', name: 'Katharagama' },
    { code: 'MAD', name: 'Madulla' },
    { code: 'MED', name: 'Medagama' },
    { code: 'MON', name: 'Monaragala' },
    { code: 'SEV', name: 'Sevanagala' },
    { code: 'SIY', name: 'Siyambalanduwa' },
    { code: 'THA', name: 'Thanamalwila' },
    { code: 'WEL', name: 'Wellawaya' }
  ],
  COL: [
    { code: 'BOR', name: 'Boralesgamuwa' },
    { code: 'CMC', name: 'Colombo MC' },
    { code: 'DEH', name: 'Dehiwala' },
    { code: 'HAN', name: 'Hanwella' },
    { code: 'HOM', name: 'Homagama' },
    { code: 'KAD', name: 'Kaduwela' },
    { code: 'KOL', name: 'Kolonnawa' },
    { code: 'MAH', name: 'Maharagama' },
    { code: 'MOR', name: 'Moratuwa' },
    { code: 'PAD', name: 'Padukka' },
    { code: 'PIL', name: 'Piliyandala' },
    { code: 'RAT', name: 'Ratmalana' }
  ],
  GAM: [
    { code: 'ATT', name: 'Attanagalla' },
    { code: 'BIY', name: 'Biyagama' },
    { code: 'DIV', name: 'Divulapitiya' },
    { code: 'DOM', name: 'Dompe' },
    { code: 'GAM', name: 'Gampaha' },
    { code: 'JAE', name: 'Ja-Ela' },
    { code: 'KAT', name: 'Katana' },
    { code: 'KEL', name: 'Kelaniya' },
    { code: 'MAH', name: 'Mahara' },
    { code: 'MIN', name: 'Minuwangoda' },
    { code: 'MIR', name: 'Mirigama' },
    { code: 'NEG', name: 'Negombo' },
    { code: 'RAG', name: 'Ragama' },
    { code: 'SEE', name: 'Seeduwa' },
    { code: 'WAT', name: 'Wattala' }
  ],
  KAL: [
    { code: 'AGA', name: 'Agalawatta' },
    { code: 'BAN', name: 'Bandaragama' },
    { code: 'BER', name: 'Beruwala' },
    { code: 'BUL', name: 'Bulathsinhala' },
    { code: 'DOD', name: 'Dodangoda' },
    { code: 'HOR', name: 'Horana' },
    { code: 'KAL', name: 'Kalutara' },
    { code: 'MAD', name: 'Madurawala' },
    { code: 'MAT', name: 'Matugama' },
    { code: 'MIL', name: 'Millaniya' },
    { code: 'PAL', name: 'Palindanuwara' },
    { code: 'PAN', name: 'Panadura' },
    { code: 'WAL', name: 'Walallawita' }
  ],
  MAT: [
    { code: 'AKU', name: 'Akuressa' },
    { code: 'ATH', name: 'Athuraliya' },
    { code: 'DEV', name: 'Devinuwara' },
    { code: 'DIC', name: 'Dickwella' },
    { code: 'HAK', name: 'Hakmana' },
    { code: 'KAM', name: 'Kamburupitiya' },
    { code: 'KIP', name: 'Kirinda Puhulwella' },
    { code: 'KTP', name: 'Kotapola' },
    { code: 'MAL', name: 'Malimbada' },
    { code: 'MMC', name: 'Matara MC' },
    { code: 'MPS', name: 'Matara PS' },
    { code: 'MOR', name: 'Morawaka' },
    { code: 'MUL', name: 'Mulatiyana' },
    { code: 'PAS', name: 'Pasgoda' },
    { code: 'PIT', name: 'Pitabeddara' },
    { code: 'THI', name: 'Thihagoda' },
    { code: 'WEL', name: 'Weligama' },
    { code: 'WLP', name: 'Welipitiya' }
  ],
  GAL: [
    { code: 'AKM', name: 'Akmeemana' },
    { code: 'AMB', name: 'Ambalangoda' },
    { code: 'BAD', name: 'Baddegama' },
    { code: 'BAL', name: 'Balapitiya' },
    { code: 'BOP', name: 'Bope Poddala' },
    { code: 'ELP', name: 'Elpitiya' },
    { code: 'GMC', name: 'Galle MC' },
    { code: 'GON', name: 'Gonapinuwala' },
    { code: 'HAB', name: 'Habaraduwa' },
    { code: 'HIK', name: 'Hikkaduwa' },
    { code: 'IMA', name: 'Imaduwa' },
    { code: 'KAR', name: 'Karandeniya' },
    { code: 'NEL', name: 'Neluwa' },
    { code: 'NIY', name: 'Niyagama' },
    { code: 'RAT', name: 'Rathgama' },
    { code: 'THA', name: 'Thawalama' },
    { code: 'UDG', name: 'Udugama' },
    { code: 'WVD', name: 'Welivitiya Divithura' },
    { code: 'YAK', name: 'Yakkalamulla' }
  ],
  HAM: [
    { code: 'AMB', name: 'Ambalantota' },
    { code: 'ANG', name: 'Angunakolapelessa' },
    { code: 'BEL', name: 'Beliatta' },
    { code: 'HAM', name: 'Hambantota' },
    { code: 'KAT', name: 'Katuwana' },
    { code: 'LUN', name: 'Lunugamvehera' },
    { code: 'OKE', name: 'Okewela' },
    { code: 'SOO', name: 'Sooriyawewa' },
    { code: 'TAN', name: 'Tangalle' },
    { code: 'TIS', name: 'Tissamaharama' },
    { code: 'WAL', name: 'Walasmulla' },
    { code: 'WEE', name: 'Weeraketiya' }
  ]
};