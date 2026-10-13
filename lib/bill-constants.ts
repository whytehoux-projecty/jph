export interface BillCategory {
  id: string;
  label: string;
  description: string;
  aliases: string[];
}

export const BILL_CATEGORIES: BillCategory[] = [
  { id: "UTILITIES", label: "Electricity & Gas", description: "Power, heating & natural gas grids", aliases: ["UTILITIES", "ENERGY", "POWER"] },
  { id: "TELECOM", label: "Telecom & Internet", description: "Broadband, fiber, cellular & mobile lines", aliases: ["TELECOM", "INTERNET", "MOBILE", "BROADBAND"] },
  { id: "WATER", label: "Water & Municipal", description: "Municipal water authorities & sanitation", aliases: ["WATER", "MUNICIPAL"] },
  { id: "TV", label: "Media & Streaming", description: "Cable TV, digital media & subscriptions", aliases: ["TV", "MEDIA", "ENTERTAINMENT"] },
  { id: "INSURANCE", label: "Insurance Policies", description: "Property, health, vehicle & life underwriting", aliases: ["INSURANCE"] },
  { id: "CREDIT", label: "Card & Financing", description: "Revolving credit cards & loan settlement", aliases: ["CREDIT", "CREDIT_CARD", "LOAN"] },
  { id: "RENT", label: "Rent & Housing", description: "Commercial lease, corporate housing & mortgage", aliases: ["RENT", "HOUSING", "MORTGAGE"] },
  { id: "EDUCATION", label: "Tuition & Academics", description: "Universities, colleges & school fees", aliases: ["EDUCATION", "TUITION"] },
  { id: "COUNCIL", label: "Public Sector & Tax", description: "Municipal tax, revenue clearing & rates", aliases: ["COUNCIL", "TAX", "GOVERNMENT"] },
  { id: "OTHER", label: "General Corporate", description: "Commercial vendor services & corporate bills", aliases: ["OTHER", "GENERAL"] },
];

export function normalizeBillCategory(categoryStr: string | null | undefined): string {
  if (!categoryStr) return "OTHER";
  const upper = categoryStr.toUpperCase().trim();
  for (const cat of BILL_CATEGORIES) {
    if (cat.id === upper || cat.aliases.includes(upper)) {
      return cat.id;
    }
  }
  return "OTHER";
}

export interface BillRegion {
  value: string;
  label: string;
  code: string;
}

export const BILL_REGIONS: BillRegion[] = [
  { value: "all", label: "Global / All Regions", code: "GLB" },
  { value: "usa", label: "United States (US)", code: "USA" },
  { value: "canada", label: "Canada (CA)", code: "CAN" },
  { value: "uk", label: "United Kingdom (UK)", code: "GBR" },
  { value: "germany", label: "Germany (DE)", code: "DEU" },
  { value: "france", label: "France (FR)", code: "FRA" },
  { value: "central-europe", label: "Central Europe (EU)", code: "EUR" },
  { value: "east-asia", label: "East Asia (JP, KR, CN)", code: "ASI" },
  { value: "west-africa", label: "West Africa (NG, GH)", code: "AFR" },
];

export function normalizeBillCountry(countryStr: string | null | undefined): string {
  if (!countryStr) return "usa";
  const lower = countryStr.toLowerCase().trim();
  if (lower === "all" || lower === "global") return "all";
  if (lower === "us" || lower === "united states" || lower === "usa") return "usa";
  if (lower === "ca" || lower === "canada") return "canada";
  if (lower === "uk" || lower === "gb" || lower === "united kingdom" || lower === "great britain") return "uk";
  if (lower === "de" || lower === "germany" || lower === "deutschland") return "germany";
  if (lower === "fr" || lower === "france") return "france";
  if (lower.includes("europe") || lower === "eu") return "central-europe";
  if (lower.includes("asia") || lower === "jp" || lower === "kr" || lower === "cn") return "east-asia";
  if (lower.includes("africa") || lower === "ng" || lower === "gh") return "west-africa";
  
  const found = BILL_REGIONS.find(r => r.value === lower);
  return found ? found.value : lower;
}
