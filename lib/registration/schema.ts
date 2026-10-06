import { z } from 'zod';

export const registrationSchema = z.object({
    // Type
    applicationType: z.enum(['PERSONAL', 'BUSINESS']),
    
    // Personal Details (if PERSONAL or primary applicant)
    title: z.string().optional(),
    fullLegalName: z.string().min(2, "Full legal name is required"),
    gender: z.string().optional(),
    maritalStatus: z.string().optional(),
    nationality: z.string().min(2, "Nationality is required"),
    countryOfResidence: z.string().min(2, "Country of residence is required"),
    dateOfBirth: z.string().min(10, "Date of birth is required"),
    ssnItin: z.string().min(4, "SSN / ITIN / Foreign TIN is required"),
    mothersMaidenName: z.string().min(2, "Mother's maiden name is required"),

    // Next of Kin (Personal only)
    nextOfKinName: z.string().optional(),
    nextOfKinRelationship: z.string().optional(),
    nextOfKinPhone: z.string().optional(),
    nextOfKinAddress: z.string().optional(),

    // Business Details
    entityType: z.string().optional(),
    businessRegistrationNo: z.string().optional(),
    uboDeclaration: z.string().optional(), // JSON string

    // Contact
    residentialAddress: z.string().min(5, "Residential address is required"),
    mailingAddress: z.string().min(5, "Mailing address is required"),
    primaryPhoneType: z.string().min(2, "Primary phone type is required"),
    secondaryPhone: z.string().optional(),

    // Employment & CDD
    employmentStatus: z.string().min(2, "Employment status is required"),
    occupation: z.string().min(2, "Occupation is required"),
    employerName: z.string().min(2, "Employer name is required"),
    employerAddress: z.string().optional(),
    primarySourceOfFunds: z.string().min(2, "Source of funds is required"),
    estimatedAnnualIncome: z.string().min(2, "Estimated annual income is required"),
    purposeOfAccount: z.string().min(2, "Purpose of account is required"),
    expectedMonthlyVolume: z.string().min(2, "Expected monthly volume is required"),

    // Identity
    primaryIdType: z.string().min(2, "ID Type is required"),
    idNumber: z.string().min(2, "ID Number is required"),
    stateCountryOfIssuance: z.string().min(2, "Issuing authority is required"),
    issueDate: z.string().min(10, "Issue date is required"),
    expirationDate: z.string().min(10, "Expiration date is required"),
    
    // Proof of Address
    poaWaiverRequested: z.boolean().default(false),
    proofOfAddressType: z.string().optional(),

    // Tax & Compliance
    isUsTaxPerson: z.boolean(),
    w9Certification: z.boolean().default(false),
    w8benCertification: z.boolean().default(false),
    foreignTaxResidencies: z.string().optional(),
    isPep: z.boolean(),
    pepDetails: z.string().optional(),
    sanctionsDeclaration: z.boolean().refine(val => val === true, "You must clear the sanctions declaration"),

    // Account Preferences
    overdraftProtection: z.boolean().default(false),
    debitCardRequest: z.boolean().default(false),
    nameToAppearOnCard: z.string().optional(),
    statementPreference: z.string().min(2, "Statement preference is required"),

    // Funding
    fundingMethod: z.string().min(2, "Funding method is required"),
    externalAccountRoutingNumber: z.string().optional(),
    externalAccountNumber: z.string().optional(),
    initialDepositAmount: z.number().min(0, "Invalid amount"),

    // Consents
    electronicCommunicationsDisclosure: z.boolean().refine(val => val === true, "Must accept disclosure"),
    depositAccountAgreement: z.boolean().refine(val => val === true, "Must accept agreement"),
    marketingConsent: z.boolean().default(true),
    
    // Signatures
    signatureDate: z.string().min(10, "Signature date is required"),
}).superRefine((data, ctx) => {
    if (data.applicationType === 'BUSINESS') {
        if (!data.entityType) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Entity type is required", path: ["entityType"] });
        }
        if (!data.businessRegistrationNo) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Registration number is required", path: ["businessRegistrationNo"] });
        }
    }
    
    if (data.isPep && !data.pepDetails) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please provide PEP details", path: ["pepDetails"] });
    }
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;
