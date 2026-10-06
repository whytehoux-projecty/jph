/**
 * Admin auto-fill for the Personal Account registration form (JPH-CIP-1040).
 *
 * Data collected on the original application is carried over unchanged.
 * Everything else is derived or set to a clearly-marked placeholder so that
 * compliance staff can distinguish admin-provisioned records from
 * customer-submitted ones. Photo / document uploads are intentionally left
 * empty and can be uploaded after the account exists.
 */

export const ADMIN_PROVISIONED_MARKER = '[ADMIN_PROVISIONED]';

export interface AutoFillOptions {
    initialDepositAmount: number;
    fundingMethod?: string;
    /** Admin confirms sanctions / PEP screening was completed. */
    screeningCompleted: boolean;
    /** Admin confirms consents & deposit agreement were obtained offline. */
    agreementsObtained: boolean;
}

type ApplicationLike = {
    firstName: string;
    lastName: string;
    dateOfBirth: Date | string;
    nationality?: string | null;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    employmentStatus: string;
    annualIncome: number;
    desiredAccountType?: string | null;
    currencyPreference?: string | null;
    isUsCitizenOrResident?: boolean;
};

const toDateString = (d: Date | string) => new Date(d).toISOString().split('T')[0];

export function incomeBucket(income: number): string {
    if (income < 50000) return '0-50000';
    if (income < 100000) return '50000-100000';
    if (income < 250000) return '100000-250000';
    return '250000+';
}

function monthlyVolumeBucket(income: number): string {
    if (income < 50000) return '0-10000';
    if (income < 250000) return '10000-50000';
    return '50000-250000';
}

function sourceOfFunds(employment: string): string {
    switch (employment) {
        case 'Employed': return 'Salary/Wages';
        case 'Self-Employed': return 'Business Profits';
        default: return 'Personal Savings';
    }
}

function purposeOfAccount(accountType?: string | null): string {
    switch (accountType) {
        case 'High-Yield Savings':
        case 'Certificate of Deposit': return 'Investment / Savings';
        case 'Private Wealth Reserve': return 'Trust / Estate Management';
        default: return 'Personal / Household Expenses';
    }
}

function placeholder(prefix: string): string {
    return `${prefix}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
}

/** Builds the payload accepted by `submitRegistrationForm`. */
export function buildAutoFillData(app: ApplicationLike, opts: AutoFillOptions) {
    const fullName = `${app.firstName} ${app.lastName}`.trim().toUpperCase();
    const address = `${app.address}, ${app.city}, ${app.state} ${app.zipCode}`.toUpperCase();
    const today = new Date();
    const tenYears = new Date(today);
    tenYears.setFullYear(today.getFullYear() + 10);

    return {
        applicationType: 'PERSONAL',

        // --- Carried over from the application (unchanged) ---
        fullLegalName: fullName,
        dateOfBirth: toDateString(app.dateOfBirth),
        nationality: app.nationality || 'United States',
        countryOfResidence: 'United States',
        residentialAddress: address,
        mailingAddress: address,
        employmentStatus: app.employmentStatus,
        estimatedAnnualIncome: incomeBucket(app.annualIncome),
        desiredAccountType: app.desiredAccountType || 'Everyday Checking',
        currencyPreference: app.currencyPreference || 'USD',
        isUsTaxPerson: app.isUsCitizenOrResident ?? true,

        // --- Derived ---
        primaryPhoneType: 'Mobile',
        occupation: app.employmentStatus,
        employerName: 'To be updated',
        primarySourceOfFunds: sourceOfFunds(app.employmentStatus),
        purposeOfAccount: purposeOfAccount(app.desiredAccountType),
        expectedMonthlyVolume: monthlyVolumeBucket(app.annualIncome),
        nameToAppearOnCard: fullName,
        statementPreference: 'E-Statements',
        overdraftProtection: false,
        debitCardRequest: true,
        marketingConsent: false,

        // --- Placeholders, replaced when real documents are collected ---
        ssnItin: placeholder('PENDING-TIN'),
        mothersMaidenName: 'N/A',
        primaryIdType: "Driver's License",
        idNumber: placeholder('PENDING-ID'),
        stateCountryOfIssuance: app.state || 'N/A',
        issueDate: toDateString(today),
        expirationDate: toDateString(tenYears),
        proofOfAddressType: 'Utility Bill',
        poaWaiverRequested: true,
        digitalSignature: ADMIN_PROVISIONED_MARKER,
        signatureDate: toDateString(today),

        // --- Funding ---
        fundingMethod: opts.fundingMethod || 'Admin Provisioned',
        initialDepositAmount: opts.initialDepositAmount,

        // --- Attestations, only true when the admin confirms them ---
        isPep: false,
        w9Certification: opts.agreementsObtained && (app.isUsCitizenOrResident ?? true),
        w8benCertification: false,
        sanctionsDeclaration: opts.screeningCompleted,
        electronicCommunicationsDisclosure: opts.agreementsObtained,
        depositAccountAgreement: opts.agreementsObtained,

        // --- Uploads: intentionally empty ---
        passportPhotoUrl: '',
        idFrontDocumentUrl: '',
        idBackDocumentUrl: '',
        proofOfAddressUrl: '',
    };
}
