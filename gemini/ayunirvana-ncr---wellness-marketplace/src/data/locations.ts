import { DelhiNCRArea } from '../types';

export const DELHI_NCR_AREAS: DelhiNCRArea[] = [
  // South Delhi
  { id: 'del-hauzkhas', name: 'Hauz Khas, South Delhi', zone: 'South Delhi', coordinates: { latitude: 28.5494, longitude: 77.2001 } },
  { id: 'del-gk', name: 'Greater Kailash (GK 1 & 2), South Delhi', zone: 'South Delhi', coordinates: { latitude: 28.5393, longitude: 77.2341 } },
  { id: 'del-saket', name: 'Saket & Malviya Nagar, South Delhi', zone: 'South Delhi', coordinates: { latitude: 28.5245, longitude: 77.2066 } },
  { id: 'del-vasantkunj', name: 'Vasant Kunj & Vasant Vihar, South Delhi', zone: 'South Delhi', coordinates: { latitude: 28.5284, longitude: 77.1517 } },
  { id: 'del-defcol', name: 'Defence Colony & Lajpat Nagar', zone: 'South Delhi', coordinates: { latitude: 28.5727, longitude: 77.2344 } },

  // Gurugram (Gurgaon)
  { id: 'ggn-cybercity', name: 'DLF Phase 2 & Cyber City, Gurugram', zone: 'Gurugram', coordinates: { latitude: 28.4908, longitude: 77.0898 } },
  { id: 'ggn-golfcourse', name: 'Golf Course Road & Sector 54, Gurugram', zone: 'Gurugram', coordinates: { latitude: 28.4412, longitude: 77.1025 } },
  { id: 'ggn-sohna', name: 'Sohna Road & Subhash Chowk, Gurugram', zone: 'Gurugram', coordinates: { latitude: 28.4194, longitude: 77.0422 } },
  { id: 'ggn-sec56', name: 'Sector 56 & Golf Course Ext., Gurugram', zone: 'Gurugram', coordinates: { latitude: 28.4239, longitude: 77.1098 } },

  // Noida & Greater Noida
  { id: 'noida-sec18', name: 'Sector 18 & Atta Market, Noida', zone: 'Noida', coordinates: { latitude: 28.5708, longitude: 77.3261 } },
  { id: 'noida-sec62', name: 'Sector 62 & Fortis Corridor, Noida', zone: 'Noida', coordinates: { latitude: 28.6258, longitude: 77.3678 } },
  { id: 'noida-sec137', name: 'Sector 137 & Noida Expressway', zone: 'Noida', coordinates: { latitude: 28.5132, longitude: 77.4042 } },
  { id: 'grnoida-parichowk', name: 'Pari Chowk & Alpha, Greater Noida', zone: 'Greater Noida', coordinates: { latitude: 28.4682, longitude: 77.5098 } },

  // Faridabad
  { id: 'fbd-nit', name: 'NIT Faridabad (1, 2, 3, 5)', zone: 'Faridabad', coordinates: { latitude: 28.3965, longitude: 77.3061 } },
  { id: 'fbd-sec15', name: 'Sector 14 & 15, Faridabad', zone: 'Faridabad', coordinates: { latitude: 28.4116, longitude: 77.3243 } },
  { id: 'fbd-greenfield', name: 'Greenfields Colony & Surajkund, Faridabad', zone: 'Faridabad', coordinates: { latitude: 28.4729, longitude: 77.2917 } },

  // Ghaziabad
  { id: 'ghz-indirapuram', name: 'Indirapuram (Vaibhav Khand / Ahinsa)', zone: 'Ghaziabad', coordinates: { latitude: 28.6415, longitude: 77.3712 } },
  { id: 'ghz-vaishali', name: 'Vaishali & Kaushambi, Ghaziabad', zone: 'Ghaziabad', coordinates: { latitude: 28.6438, longitude: 77.3385 } },
  { id: 'ghz-rajnagar', name: 'Raj Nagar Extension, Ghaziabad', zone: 'Ghaziabad', coordinates: { latitude: 28.6974, longitude: 77.4328 } },

  // Central, West & East Delhi
  { id: 'del-cp', name: 'Connaught Place & Barakhamba', zone: 'Central Delhi', coordinates: { latitude: 28.6304, longitude: 77.2177 } },
  { id: 'del-rajouri', name: 'Rajouri Garden & Punjabi Bagh', zone: 'West Delhi', coordinates: { latitude: 28.6493, longitude: 77.1231 } },
  { id: 'del-mayurvihar', name: 'Mayur Vihar Phase 1 & 2', zone: 'East Delhi', coordinates: { latitude: 28.6083, longitude: 77.2963 } },
];

/**
 * Calculates distance in kilometers between two geo-coordinates using Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}
