// infrastructure/geoLookup.ts
import geoip from 'geoip-country';
import { GeoInfoIp } from '../types/rule.type';

export function geoLookup(ip: string): GeoInfoIp | undefined {
  const geo = geoip.lookup(ip); // remplace par ton appel réel à geo-ip
  if (!geo) return undefined;

  return {
    country: geo.country?.toUpperCase(),
    country_name: geo.name,
    continent: geo.continent?.toUpperCase(),
    continent_name: geo.continent_name,
    phone: geo.phone,
    capital: geo.capital,
    currency: geo.currency,
    languages: geo.languages,
  };
}
