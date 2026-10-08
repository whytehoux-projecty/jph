/**
 * Country-aware onboarding configuration.
 * Each supported country declares its identification documents, postal code,
 * phone and regional formats. Forms read from this single source of truth.
 * To add a country, add an entry to COUNTRY_CONFIGS.
 */

export type IdGroup = 'primary' | 'taxId' | 'address';

export interface IdOption {
    id: string;
    label: string;
    description: string;
    group: IdGroup;
}

export interface CountryConfig {
    code: string;
    name: string;
    flag: string;
    dialCode: string;
    phone: {
        /** Validates the national significant digits (no leading trunk 0, no spaces). */
        nationalPattern: RegExp;
        placeholder: string;
        hint: string;
        /** Optional display formatter for digits typed by the user. */
        format?: (digits: string) => string;
    };
    postal: {
        label: string;
        pattern: RegExp;
        placeholder: string;
        hint: string;
        /** ISO code understood by zippopotam.us, if the country is supported for lookup. */
        lookupCode?: string;
    };
    regionLabel: string;
    regions?: string[];
    businessTaxIdLabel: string;
    businessTaxIdPattern?: RegExp;
    entityTypes: { value: string; label: string }[];
    idOptions: IdOption[];
}

export const GROUP_LABELS: Record<IdGroup, { title: string; description: string }> = {
    primary: { title: 'Primary identification', description: 'Government-issued photo identification.' },
    taxId: { title: 'Identification numbers', description: 'Tax or social identification numbers.' },
    address: { title: 'Proof of address', description: 'Recent document showing your current address.' },
};

/** Personal account types are the same for every country. */
export const PERSONAL_ACCOUNT_TYPES = [
    { value: 'SAVINGS', label: 'Savings Account', description: 'Earn interest on your balance and grow your savings.' },
    { value: 'CHECKING', label: 'Checking Account', description: 'Everyday spending, bill payments and transfers.' },
] as const;

const digitsOnly = (s: string) => s.replace(/\D/g, '');

const fmtNA = (d: string) => {
    const x = d.slice(0, 10);
    if (x.length <= 3) return x;
    if (x.length <= 6) return `(${x.slice(0, 3)}) ${x.slice(3)}`;
    return `(${x.slice(0, 3)}) ${x.slice(3, 6)}-${x.slice(6)}`;
};

const US_STATES = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','District of Columbia','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];

export const COUNTRY_CONFIGS: Record<string, CountryConfig> = {
    US: {
        code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1',
        phone: { nationalPattern: /^[2-9]\d{2}[2-9]\d{6}$/, placeholder: '(555) 234-5678', hint: 'US format: (XXX) XXX-XXXX', format: fmtNA },
        postal: { label: 'ZIP code', pattern: /^\d{5}(-\d{4})?$/, placeholder: '10001', hint: '5 digits, e.g. 10001', lookupCode: 'us' },
        regionLabel: 'State', regions: US_STATES,
        businessTaxIdLabel: 'Employer Identification Number (EIN)', businessTaxIdPattern: /^\d{2}-?\d{7}$/,
        entityTypes: [
            { value: 'LLC', label: 'LLC' }, { value: 'CORPORATION', label: 'Corporation' },
            { value: 'PARTNERSHIP', label: 'Partnership' }, { value: 'SOLE_PROPRIETORSHIP', label: 'Sole Proprietorship' },
            { value: 'OTHER', label: 'Other' },
        ],
        idOptions: [
            { id: 'US_DRIVERS_LICENSE', group: 'primary', label: "Driver's license", description: 'State-issued with photo and current address.' },
            { id: 'US_STATE_ID', group: 'primary', label: 'State ID card', description: 'REAL ID-compliant non-driver identification.' },
            { id: 'US_MILITARY_ID', group: 'primary', label: 'Military ID', description: 'Active or veteran U.S. service card.' },
            { id: 'US_PASSPORT', group: 'primary', label: 'Passport', description: 'U.S. or international passport.' },
            { id: 'US_SSN', group: 'taxId', label: 'Social Security number (SSN)', description: 'Primary taxpayer identifier for U.S. persons.' },
            { id: 'US_ITIN', group: 'taxId', label: 'Individual Taxpayer Identification Number (ITIN)', description: 'Used for certain non-citizens.' },
            { id: 'US_UTILITY_BILL', group: 'address', label: 'Utility bill', description: 'Electricity, water, or gas statement under 90 days old.' },
            { id: 'US_LEASE', group: 'address', label: 'Lease agreement', description: 'Signed current residential rental contract.' },
            { id: 'US_BANK_STATEMENT', group: 'address', label: 'Bank statement', description: 'Recent mail from another financial institution.' },
        ],
    },
    DE: {
        code: 'DE', name: 'Germany', flag: '🇩🇪', dialCode: '+49',
        phone: { nationalPattern: /^1\d{9,10}$|^[2-9]\d{5,11}$/, placeholder: '151 2345 6789', hint: 'German number without the leading 0' },
        postal: { label: 'Postleitzahl (PLZ)', pattern: /^\d{5}$/, placeholder: '10115', hint: '5 digits, e.g. 10115', lookupCode: 'de' },
        regionLabel: 'Bundesland',
        regions: ['Baden-Württemberg','Bayern','Berlin','Brandenburg','Bremen','Hamburg','Hessen','Mecklenburg-Vorpommern','Niedersachsen','Nordrhein-Westfalen','Rheinland-Pfalz','Saarland','Sachsen','Sachsen-Anhalt','Schleswig-Holstein','Thüringen'],
        businessTaxIdLabel: 'Handelsregister number / Steuernummer',
        entityTypes: [
            { value: 'GMBH', label: 'GmbH' }, { value: 'AG', label: 'AG' }, { value: 'UG', label: 'UG (haftungsbeschränkt)' },
            { value: 'OHG_KG', label: 'OHG / KG' }, { value: 'SOLE_PROPRIETORSHIP', label: 'Einzelunternehmen' }, { value: 'OTHER', label: 'Other' },
        ],
        idOptions: [
            { id: 'DE_PERSONALAUSWEIS', group: 'primary', label: 'Personalausweis', description: 'German national identity card.' },
            { id: 'DE_REISEPASS', group: 'primary', label: 'Reisepass', description: 'German or other valid passport.' },
            { id: 'DE_AUFENTHALTSTITEL', group: 'primary', label: 'Aufenthaltstitel', description: 'Residence permit for non-EU residents.' },
            { id: 'DE_STEUER_ID', group: 'taxId', label: 'Steuerliche Identifikationsnummer', description: '11-digit personal tax ID issued by the Bundeszentralamt für Steuern.' },
            { id: 'DE_MELDEBESCHEINIGUNG', group: 'address', label: 'Meldebescheinigung', description: 'Certificate of registration issued by your local registry office.' },
            { id: 'DE_UTILITY_BILL', group: 'address', label: 'Utility bill', description: 'Electricity, water, gas or internet bill under 90 days old.' },
            { id: 'DE_BANK_STATEMENT', group: 'address', label: 'Bank statement', description: 'Recent statement from another financial institution.' },
            { id: 'DE_MIETVERTRAG', group: 'address', label: 'Mietvertrag', description: 'Signed current rental agreement.' },
        ],
    },
    CA: {
        code: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '+1',
        phone: { nationalPattern: /^[2-9]\d{2}[2-9]\d{6}$/, placeholder: '(416) 555-0123', hint: 'Canadian format: (XXX) XXX-XXXX', format: fmtNA },
        postal: { label: 'Postal code', pattern: /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i, placeholder: 'M5V 2T6', hint: 'Format A1A 1A1', lookupCode: 'ca' },
        regionLabel: 'Province / Territory',
        regions: ['Alberta','British Columbia','Manitoba','New Brunswick','Newfoundland and Labrador','Northwest Territories','Nova Scotia','Nunavut','Ontario','Prince Edward Island','Quebec','Saskatchewan','Yukon'],
        businessTaxIdLabel: 'Business Number (BN)', businessTaxIdPattern: /^\d{9}(\s?[A-Z]{2}\s?\d{4})?$/i,
        entityTypes: [
            { value: 'CORPORATION', label: 'Corporation' }, { value: 'PARTNERSHIP', label: 'Partnership' },
            { value: 'SOLE_PROPRIETORSHIP', label: 'Sole Proprietorship' }, { value: 'OTHER', label: 'Other' },
        ],
        idOptions: [
            { id: 'CA_DRIVERS_LICENCE', group: 'primary', label: "Driver's licence", description: 'Provincial or territorial licence with photo.' },
            { id: 'CA_PROVINCIAL_ID', group: 'primary', label: 'Provincial / territorial photo ID', description: 'Non-driver photo identification card.' },
            { id: 'CA_PASSPORT', group: 'primary', label: 'Passport', description: 'Canadian or international passport.' },
            { id: 'CA_PR_CARD', group: 'primary', label: 'Permanent Resident Card', description: 'Issued by IRCC to permanent residents.' },
            { id: 'CA_SIN', group: 'taxId', label: 'Social Insurance Number (SIN)', description: '9-digit number used for tax and employment.' },
            { id: 'CA_UTILITY_BILL', group: 'address', label: 'Utility bill', description: 'Electricity, water, gas or telecom bill under 90 days old.' },
            { id: 'CA_LEASE', group: 'address', label: 'Lease agreement', description: 'Signed current residential rental contract.' },
            { id: 'CA_BANK_STATEMENT', group: 'address', label: 'Bank statement', description: 'Recent statement from another financial institution.' },
            { id: 'CA_PROPERTY_TAX', group: 'address', label: 'Property tax notice', description: 'Current municipal property tax bill.' },
        ],
    },
    ZA: {
        code: 'ZA', name: 'South Africa', flag: '🇿🇦', dialCode: '+27',
        phone: { nationalPattern: /^[1-9]\d{8}$/, placeholder: '82 123 4567', hint: 'South African number without the leading 0' },
        postal: { label: 'Postal code', pattern: /^\d{4}$/, placeholder: '2001', hint: '4 digits, e.g. 2001', lookupCode: 'za' },
        regionLabel: 'Province',
        regions: ['Eastern Cape','Free State','Gauteng','KwaZulu-Natal','Limpopo','Mpumalanga','North West','Northern Cape','Western Cape'],
        businessTaxIdLabel: 'CIPC registration number', businessTaxIdPattern: /^\d{4}\/\d{6}\/\d{2}$/,
        entityTypes: [
            { value: 'PTY_LTD', label: '(Pty) Ltd' }, { value: 'CC', label: 'Close Corporation (CC)' },
            { value: 'NPC', label: 'Non-Profit Company (NPC)' }, { value: 'SOLE_PROPRIETORSHIP', label: 'Sole Proprietor' }, { value: 'OTHER', label: 'Other' },
        ],
        idOptions: [
            { id: 'ZA_SMART_ID', group: 'primary', label: 'Smart ID card', description: 'South African national identity card.' },
            { id: 'ZA_GREEN_ID', group: 'primary', label: 'Green barcoded ID book', description: 'Legacy South African identity document.' },
            { id: 'ZA_PASSPORT', group: 'primary', label: 'Passport', description: 'South African or international passport.' },
            { id: 'ZA_DRIVERS_LICENCE', group: 'primary', label: "Driver's licence", description: 'Valid card-format licence with photo.' },
            { id: 'ZA_ID_NUMBER', group: 'taxId', label: 'South African ID number', description: '13-digit national identity number.' },
            { id: 'ZA_TAX_NUMBER', group: 'taxId', label: 'SARS income tax reference number', description: '10-digit tax number issued by SARS.' },
            { id: 'ZA_UTILITY_BILL', group: 'address', label: 'Utility or municipal bill', description: 'Rates, electricity or water account under 90 days old.' },
            { id: 'ZA_BANK_STATEMENT', group: 'address', label: 'Bank statement', description: 'Recent statement from another financial institution.' },
            { id: 'ZA_LEASE', group: 'address', label: 'Lease agreement', description: 'Signed current residential rental contract.' },
        ],
    },
    AU: {
        code: 'AU', name: 'Australia', flag: '🇦🇺', dialCode: '+61',
        phone: { nationalPattern: /^[2-478]\d{8}$/, placeholder: '412 345 678', hint: 'Australian number without the leading 0' },
        postal: { label: 'Postcode', pattern: /^\d{4}$/, placeholder: '2000', hint: '4 digits, e.g. 2000', lookupCode: 'au' },
        regionLabel: 'State / Territory',
        regions: ['Australian Capital Territory','New South Wales','Northern Territory','Queensland','South Australia','Tasmania','Victoria','Western Australia'],
        businessTaxIdLabel: 'Australian Business Number (ABN)', businessTaxIdPattern: /^\d{2}\s?\d{3}\s?\d{3}\s?\d{3}$/,
        entityTypes: [
            { value: 'PTY_LTD', label: 'Proprietary Limited (Pty Ltd)' }, { value: 'PARTNERSHIP', label: 'Partnership' },
            { value: 'TRUST', label: 'Trust' }, { value: 'SOLE_PROPRIETORSHIP', label: 'Sole Trader' }, { value: 'OTHER', label: 'Other' },
        ],
        idOptions: [
            { id: 'AU_DRIVERS_LICENCE', group: 'primary', label: "Driver's licence", description: 'State or territory licence with photo.' },
            { id: 'AU_PASSPORT', group: 'primary', label: 'Passport', description: 'Australian or international passport.' },
            { id: 'AU_PHOTO_CARD', group: 'primary', label: 'Photo card / Proof of Age card', description: 'State-issued photo identification.' },
            { id: 'AU_MEDICARE', group: 'primary', label: 'Medicare card', description: 'Secondary identification only.' },
            { id: 'AU_CITIZENSHIP', group: 'primary', label: 'Citizenship certificate', description: 'Australian citizenship certificate.' },
            { id: 'AU_TFN', group: 'taxId', label: 'Tax File Number (TFN)', description: '9-digit number issued by the ATO.' },
            { id: 'AU_UTILITY_BILL', group: 'address', label: 'Utility bill', description: 'Electricity, water or gas bill under 90 days old.' },
            { id: 'AU_RATES_NOTICE', group: 'address', label: 'Council rates notice', description: 'Current local council rates notice.' },
            { id: 'AU_BANK_STATEMENT', group: 'address', label: 'Bank statement', description: 'Recent statement from another financial institution.' },
            { id: 'AU_LEASE', group: 'address', label: 'Lease agreement', description: 'Signed current residential rental contract.' },
        ],
    },
    TH: {
        code: 'TH', name: 'Thailand', flag: '🇹🇭', dialCode: '+66',
        phone: { nationalPattern: /^[2-9]\d{7,8}$/, placeholder: '81 234 5678', hint: 'Thai number without the leading 0' },
        postal: { label: 'Postal code', pattern: /^\d{5}$/, placeholder: '10110', hint: '5 digits, e.g. 10110' },
        regionLabel: 'Province',
        businessTaxIdLabel: 'Tax ID / Juristic person registration number', businessTaxIdPattern: /^\d{13}$/,
        entityTypes: [
            { value: 'CO_LTD', label: 'Company Limited (Co., Ltd.)' }, { value: 'PUBLIC_CO', label: 'Public Company Limited' },
            { value: 'PARTNERSHIP', label: 'Registered Partnership' }, { value: 'SOLE_PROPRIETORSHIP', label: 'Sole Proprietorship' }, { value: 'OTHER', label: 'Other' },
        ],
        idOptions: [
            { id: 'TH_NATIONAL_ID', group: 'primary', label: 'Thai National ID card', description: '13-digit citizen identity card.' },
            { id: 'TH_PASSPORT', group: 'primary', label: 'Passport', description: 'Thai or international passport.' },
            { id: 'TH_DRIVERS_LICENCE', group: 'primary', label: "Driver's licence", description: 'Valid Thai licence with photo.' },
            { id: 'TH_WORK_PERMIT', group: 'primary', label: 'Work permit', description: 'For foreign nationals working in Thailand.' },
            { id: 'TH_TAX_ID', group: 'taxId', label: 'Taxpayer identification number', description: '13-digit tax ID issued by the Revenue Department.' },
            { id: 'TH_HOUSE_REGISTRATION', group: 'address', label: 'House registration (Tabien Baan)', description: 'Official household registration document.' },
            { id: 'TH_UTILITY_BILL', group: 'address', label: 'Utility bill', description: 'Electricity, water or phone bill under 90 days old.' },
            { id: 'TH_BANK_STATEMENT', group: 'address', label: 'Bank statement', description: 'Recent statement from another financial institution.' },
            { id: 'TH_LEASE', group: 'address', label: 'Lease agreement', description: 'Signed current residential rental contract.' },
        ],
    },
    OTHER: {
        code: 'OTHER', name: 'Other country', flag: '🌍', dialCode: '+',
        phone: { nationalPattern: /^\d{6,14}$/, placeholder: '1234567890', hint: 'Enter your dial code (e.g. +44) then your number' },
        postal: { label: 'Postal code', pattern: /^[A-Za-z0-9][A-Za-z0-9 -]{1,9}$/, placeholder: 'Postal code', hint: '2-10 letters or digits' },
        regionLabel: 'State / Province / Region',
        businessTaxIdLabel: 'Company registration / Tax ID',
        entityTypes: [
            { value: 'COMPANY', label: 'Limited Company' }, { value: 'PARTNERSHIP', label: 'Partnership' },
            { value: 'SOLE_PROPRIETORSHIP', label: 'Sole Proprietorship' }, { value: 'OTHER', label: 'Other' },
        ],
        idOptions: [
            { id: 'OTHER_PASSPORT', group: 'primary', label: 'Passport', description: 'Valid international passport.' },
            { id: 'OTHER_NATIONAL_ID', group: 'primary', label: 'National ID card', description: 'Government-issued national identity card.' },
            { id: 'OTHER_DRIVERS_LICENCE', group: 'primary', label: "Driver's licence", description: 'Valid licence with photo.' },
            { id: 'OTHER_TAX_ID', group: 'taxId', label: 'Tax identification number', description: 'Your national taxpayer number.' },
            { id: 'OTHER_UTILITY_BILL', group: 'address', label: 'Utility bill', description: 'Bill under 90 days old.' },
            { id: 'OTHER_BANK_STATEMENT', group: 'address', label: 'Bank statement', description: 'Recent statement from another financial institution.' },
        ],
    },
};

export const COUNTRY_LIST: CountryConfig[] = ['US', 'DE', 'CA', 'ZA', 'AU', 'TH', 'OTHER'].map((c) => COUNTRY_CONFIGS[c]);

export function getCountryConfig(code: string | undefined | null): CountryConfig | null {
    if (!code) return null;
    return COUNTRY_CONFIGS[code] ?? null;
}

/** Returns the national digits with any trunk-prefix 0 and dial code removed. */
export function toNationalDigits(country: CountryConfig, input: string): string {
    let d = digitsOnly(input);
    const dial = digitsOnly(country.dialCode);
    if (dial && d.startsWith(dial) && d.length > dial.length + 5 && country.code !== 'US' && country.code !== 'CA') d = d.slice(dial.length);
    if (country.code !== 'US' && country.code !== 'CA' && d.startsWith('0')) d = d.replace(/^0+/, '');
    return d;
}

export function validatePhone(country: CountryConfig, input: string): boolean {
    if (country.code === 'OTHER') return /^\+?\d[\d\s().-]{6,18}$/.test(input.trim());
    return country.phone.nationalPattern.test(toNationalDigits(country, input));
}

export function normalizePhone(country: CountryConfig, input: string): string {
    if (country.code === 'OTHER') return `+${digitsOnly(input)}`;
    return `${country.dialCode} ${toNationalDigits(country, input)}`;
}

export function validatePostalFormat(country: CountryConfig, input: string): boolean {
    return country.postal.pattern.test(input.trim());
}

/** Required identification rule: at least one primary photo ID. */
export function validateIdSelection(country: CountryConfig, selected: string[]): string | null {
    if (selected.length === 0) return 'Select at least one identification you hold';
    const hasPrimary = country.idOptions.some((o) => o.group === 'primary' && selected.includes(o.id));
    if (!hasPrimary) return 'Select at least one primary photo ID';
    return null;
}
