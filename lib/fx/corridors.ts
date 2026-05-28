export type CorridorStatus = 'active' | 'coming_soon';

export type Corridor = {
  pair: string;
  sourceCurrency: 'USD';
  country: string;
  currency: string;
  flag: string;
  rate: number;
  precision: number;
  region: 'SOUTHEAST ASIA' | 'GLOBAL';
  status: CorridorStatus;
};

export const USD_CORRIDORS: Corridor[] = [
  { pair: 'USD → PHP', sourceCurrency: 'USD', country: 'PH', currency: 'PHP', flag: '🇵🇭', rate: 56.42, precision: 2, region: 'SOUTHEAST ASIA', status: 'active' },
  { pair: 'USD → MYR', sourceCurrency: 'USD', country: 'MY', currency: 'MYR', flag: '🇲🇾', rate: 4.71, precision: 2, region: 'SOUTHEAST ASIA', status: 'active' },
  { pair: 'USD → IDR', sourceCurrency: 'USD', country: 'ID', currency: 'IDR', flag: '🇮🇩', rate: 16284, precision: 0, region: 'SOUTHEAST ASIA', status: 'active' },
  { pair: 'USD → VND', sourceCurrency: 'USD', country: 'VN', currency: 'VND', flag: '🇻🇳', rate: 25385, precision: 0, region: 'SOUTHEAST ASIA', status: 'active' },
  { pair: 'USD → THB', sourceCurrency: 'USD', country: 'TH', currency: 'THB', flag: '🇹🇭', rate: 35.82, precision: 2, region: 'SOUTHEAST ASIA', status: 'active' },
  { pair: 'USD → SGD', sourceCurrency: 'USD', country: 'SG', currency: 'SGD', flag: '🇸🇬', rate: 1.345, precision: 3, region: 'SOUTHEAST ASIA', status: 'active' },
  { pair: 'USD → EUR', sourceCurrency: 'USD', country: 'EU', currency: 'EUR', flag: '🇪🇺', rate: 0.924, precision: 3, region: 'GLOBAL', status: 'active' },
  { pair: 'USD → GBP', sourceCurrency: 'USD', country: 'GB', currency: 'GBP', flag: '🇬🇧', rate: 0.789, precision: 3, region: 'GLOBAL', status: 'active' },
  { pair: 'USD → INR', sourceCurrency: 'USD', country: 'IN', currency: 'INR', flag: '🇮🇳', rate: 83.42, precision: 2, region: 'GLOBAL', status: 'coming_soon' },
  { pair: 'USD → AUD', sourceCurrency: 'USD', country: 'AU', currency: 'AUD', flag: '🇦🇺', rate: 1.54, precision: 2, region: 'GLOBAL', status: 'coming_soon' },
  { pair: 'USD → JPY', sourceCurrency: 'USD', country: 'JP', currency: 'JPY', flag: '🇯🇵', rate: 157.2, precision: 1, region: 'GLOBAL', status: 'coming_soon' },
];

export const ACTIVE_USD_CORRIDORS = USD_CORRIDORS.filter((corridor) => corridor.status === 'active');

export function getUsdCorridorByCurrency(currency: string) {
  const normalized = currency.toUpperCase();
  return USD_CORRIDORS.find((corridor) => corridor.currency === normalized);
}

export function getUsdCorridorByCountry(country: string) {
  const normalized = country.toUpperCase();
  return USD_CORRIDORS.find((corridor) => corridor.country === normalized);
}

export function formatUsd(amount: number) {
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}
