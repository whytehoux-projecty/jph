/**
 * Config-driven schema for the Transfers page.
 *
 * Everything the UI renders (transfer types, first question, gated fields,
 * validation, help copy) is described here as data, so the admin portal can
 * later add/edit/remove methods and fields by serving an object of the same
 * shape (e.g. from TransferMethodConfig.formConfig) without touching JSX.
 *
 * Limits and processing times are NOT defined here: they come from
 * TransferMethodConfig in the database (see app/(portal)/transfer/page.tsx).
 * No fees are defined: submitTransfer does not charge any.
 */
import type { MaskName, ValidatorName } from "./validators";

export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "radio"
  | "amount"
  | "date"
  | "checkbox"
  | "account-select"
  | "account-lookup"
  | "notice";

export interface Option {
  value: string;
  label: string;
  description?: string;
}

export interface Condition {
  field: string;
  equals: string | string[];
}

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  help?: string;
  /** Defaults to true. Optional fields are skipped by validation. */
  required?: boolean;
  options?: Option[];
  /** A gate must be answered before any later field is revealed. */
  gate?: boolean;
  showIf?: Condition;
  validate?: ValidatorName;
  mask?: MaskName;
  maxLength?: number;
  /** Field must equal another field (re-enter / confirm step). */
  confirmOf?: string;
  /** account-select: exclude the account chosen in this field. */
  excludeFrom?: string;
  defaultValue?: string;
  /** Show a fiat to stablecoin estimate under the amount. */
  stableEstimate?: boolean;
  /** Text for notice fields / label beside checkbox. */
  content?: string;
  /** Mask the value on the review screen. */
  sensitive?: boolean;
  /** Prefix shown inside the input. */
  prefix?: string;
}

export interface VariantInfo {
  processing: string;
  limits: string;
  fees: string;
  note?: string;
}

export interface FeeRule {
  flat: number;
  pct: number;
  /** Extra flat fee looked up from another field's value (e.g. network). */
  flatBy?: { field: string; map: Record<string, number> };
}

export interface VariantDef {
  label: string;
  /** Maps to TransferMethodConfig.methodId. */
  methodId: string;
  transactionType: string | { field: string; map: Record<string, string> };
  fields: FieldDef[];
  info: VariantInfo;
  fee: FeeRule;
  perTransferLimit: number;
}

export interface TransferTypeDef {
  id: string;
  title: string;
  description: string;
  illustration: "internal" | "wire" | "wallet" | "p2p";
  gate: {
    name: string;
    label: string;
    help?: string;
    options: Option[];
  };
  about: { what: string; how: string; steps: string[] };
  variants: Record<string, VariantDef>;
}

/* ---------------------------- shared pieces ---------------------------- */

const fromAccount = (label = "From account"): FieldDef => ({
  name: "fromAccountId",
  label,
  type: "account-select",
  help: "The account the money is taken from.",
});

const amountField = (extra: Partial<FieldDef> = {}): FieldDef => ({
  name: "amount",
  label: "Amount (USD)",
  type: "amount",
  mask: "amount",
  validate: "amount",
  prefix: "$",
  placeholder: "0.00",
  ...extra,
});

const timingFields = (): FieldDef[] => [
  {
    name: "timing",
    label: "When should this be sent?",
    type: "radio",
    defaultValue: "now",
    options: [
      { value: "now", label: "Send now" },
      { value: "scheduled", label: "Schedule for later" },
    ],
  },
  {
    name: "scheduledDate",
    label: "Send on",
    type: "date",
    validate: "futureDate",
    showIf: { field: "timing", equals: "scheduled" },
    help: "Our payments team will send it on or after this date.",
  },
];

const memoField = (label = "Reference / memo", required = false): FieldDef => ({
  name: "memo",
  label,
  type: "text",
  required,
  maxLength: 140,
  placeholder: "What is this payment for?",
});

const ackField = (name: string, content: string): FieldDef => ({
  name,
  label: "Acknowledgement",
  type: "checkbox",
  content,
});

const ACCOUNT_TYPES: Option[] = [
  { value: "checking", label: "Checking" },
  { value: "savings", label: "Savings" },
];

/* ------------------------- international wires -------------------------- */

export const IBAN_COUNTRIES = ["GB", "DE", "FR", "ES", "IT", "NL", "IE", "CH", "AE", "SA"];
export const NON_IBAN_COUNTRIES = ["CA", "AU", "IN", "CN", "JP", "SG", "HK", "MX", "ZA", "NG", "US"];

const COUNTRY_OPTIONS: Option[] = [
  { value: "GB", label: "United Kingdom" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "ES", label: "Spain" },
  { value: "IT", label: "Italy" },
  { value: "NL", label: "Netherlands" },
  { value: "IE", label: "Ireland" },
  { value: "CH", label: "Switzerland" },
  { value: "AE", label: "United Arab Emirates" },
  { value: "SA", label: "Saudi Arabia" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  { value: "IN", label: "India" },
  { value: "CN", label: "China" },
  { value: "JP", label: "Japan" },
  { value: "SG", label: "Singapore" },
  { value: "HK", label: "Hong Kong" },
  { value: "MX", label: "Mexico" },
  { value: "ZA", label: "South Africa" },
  { value: "NG", label: "Nigeria" },
];

const CURRENCY_OPTIONS: Option[] = ["USD", "EUR", "GBP", "CAD", "AUD", "CHF", "JPY", "SGD", "AED", "INR"].map((c) => ({
  value: c,
  label: c,
}));

const internationalFields: FieldDef[] = [
  {
    name: "country",
    label: "Beneficiary bank country",
    type: "select",
    gate: true,
    options: COUNTRY_OPTIONS,
    help: "The country decides whether an IBAN or a local account number is needed.",
  },
  { name: "recipientName", label: "Beneficiary full name", type: "text", validate: "name", maxLength: 70 },
  { name: "addressStreet", label: "Beneficiary street address", type: "text", maxLength: 70 },
  { name: "addressCity", label: "City / town", type: "text", maxLength: 35 },
  { name: "addressPostal", label: "Postal code", type: "text", maxLength: 16 },
  { name: "bankName", label: "Beneficiary bank name", type: "text", maxLength: 70 },
  { name: "bankAddress", label: "Beneficiary bank address (city, country)", type: "text", maxLength: 100 },
  {
    name: "swiftCode",
    label: "SWIFT / BIC",
    type: "text",
    validate: "bic",
    mask: "upper",
    maxLength: 11,
    placeholder: "DEUTDEFF",
  },
  {
    name: "iban",
    label: "IBAN",
    type: "text",
    validate: "iban",
    mask: "iban",
    sensitive: true,
    placeholder: "GB82 WEST 1234 5698 7654 32",
    showIf: { field: "country", equals: IBAN_COUNTRIES },
  },
  {
    name: "accountNumber",
    label: "Account number",
    type: "text",
    validate: "account",
    mask: "digits17",
    sensitive: true,
    showIf: { field: "country", equals: NON_IBAN_COUNTRIES },
  },
  {
    name: "localCode",
    label: "Local bank code (sort code, BSB, IFSC, transit no.)",
    type: "text",
    maxLength: 20,
    showIf: { field: "country", equals: NON_IBAN_COUNTRIES },
  },
  {
    name: "intermediaryBank",
    label: "Intermediary bank (optional)",
    type: "text",
    required: false,
    maxLength: 70,
    help: "Only fill this if the beneficiary bank asked for one.",
  },
  fromAccount(),
  amountField({ help: "The amount taken from your account, in US dollars." }),
  {
    name: "currency",
    label: "Beneficiary receives in",
    type: "select",
    options: CURRENCY_OPTIONS,
    defaultValue: "USD",
    help: "The currency the beneficiary's account is held in.",
  },
  {
    name: "purpose",
    label: "Purpose of payment",
    type: "select",
    options: [
      { value: "family", label: "Family support" },
      { value: "services", label: "Payment for services" },
      { value: "goods", label: "Purchase of goods" },
      { value: "education", label: "Education / tuition" },
      { value: "investment", label: "Investment" },
      { value: "property", label: "Property" },
      { value: "other", label: "Other" },
    ],
  },
  {
    name: "charges",
    label: "Who pays the bank charges?",
    type: "radio",
    defaultValue: "SHA",
    options: [
      { value: "SHA", label: "SHA: shared", description: "You pay ours, the beneficiary pays theirs (most common)." },
      { value: "OUR", label: "OUR: you pay all", description: "Beneficiary receives the full amount." },
      { value: "BEN", label: "BEN: beneficiary pays", description: "All charges are deducted from the payment." },
    ],
  },
  { ...memoField("Message to beneficiary (max 140 characters)") },
  ...timingFields(),
  ackField("ackScreening", "I confirm the details are correct and understand international payments are screened for compliance and can take longer."),
];

/* ------------------------------ digital wallet ------------------------------ */

const NETWORK_LABEL: Record<string, string> = {
  erc20: "Ethereum (ERC-20)",
  trc20: "Tron (TRC-20)",
  polygon: "Polygon",
  solana: "Solana",
  base: "Base",
};

const walletFields = (networks: string[]): FieldDef[] => [
  {
    name: "network",
    label: "Network",
    type: "radio",
    gate: true,
    help: "The receiving wallet must support this network, or the money can be lost.",
    options: networks.map((n) => ({ value: n, label: NETWORK_LABEL[n] })),
  },
  fromAccount("Bank account"),
  {
    name: "walletOwnership",
    label: "Whose wallet is this?",
    type: "radio",
    options: [
      { value: "own", label: "My own wallet" },
      { value: "third", label: "Someone else's wallet" },
    ],
  },
  {
    name: "recipientName",
    label: "Wallet owner's full name",
    type: "text",
    validate: "name",
    help: "Required by law for payments to someone else's wallet.",
    showIf: { field: "walletOwnership", equals: "third" },
  },
  {
    name: "walletAddress",
    label: "Wallet address",
    type: "text",
    validate: "wallet",
    sensitive: true,
  },
  {
    name: "walletAddressConfirm",
    label: "Re-enter wallet address",
    type: "text",
    confirmOf: "walletAddress",
    help: "Type it again rather than pasting, so any mistake is caught.",
  },
  amountField({ label: "Amount (US dollars)" }),
  {
    name: "exchangeRef",
    label: "Exchange deposit reference",
    type: "text",
    required: false,
    maxLength: 64,
    help: "Only needed if the receiving exchange asks for one.",
  },
  ackField("ackAddress", "I have checked the wallet address and network. I understand a crypto transfer can't be reversed once sent."),
];

const walletVariant = (asset: string, networks: string[]): VariantDef => ({
  label: asset,
  methodId: "crypto",
  transactionType: "CRYPTO_WITHDRAWAL",
  perTransferLimit: 0,
  fee: { flat: 0, pct: 0 },
  info: {
    processing: "",
    limits: "",
    fees: "",
    note: `${asset} transfers can't be reversed once sent.`,
  },
  fields: walletFields(networks),
});

/* -------------------------------- definitions -------------------------------- */

const achFields = (extra: FieldDef[] = [], instant = false): FieldDef[] => [
  { name: "recipientName", label: "Account holder name", type: "text", validate: "name", maxLength: 70 },
  { name: "routingNumber", label: "Routing number (ABA)", type: "text", validate: "routing", mask: "digits9", placeholder: "9 digits", help: "Found on the bottom-left of a check." },
  { name: "accountNumber", label: "Account number", type: "text", validate: "account", mask: "digits17", sensitive: true },
  { name: "accountNumberConfirm", label: "Re-enter account number", type: "text", mask: "digits17", confirmOf: "accountNumber" },
  { name: "accountType", label: "Account type", type: "radio", options: ACCOUNT_TYPES },
  ...extra,
  fromAccount(),
  amountField(),
  memoField(instant ? "Remittance information (max 140 characters)" : "Reference / memo"),
  ...(instant ? [] : timingFields()),
];

export const TRANSFER_TYPES: TransferTypeDef[] = [
  {
    id: "internal",
    title: "Within Heritage Trust",
    description: "Between your accounts or to another customer",
    illustration: "internal",
    gate: {
      name: "destination",
      label: "Where is the money going?",
      help: "Choose where the money is going.",
      options: [
        { value: "own", label: "My own accounts", description: "Move money between your accounts." },
        { value: "other", label: "Another customer", description: "Pay someone who banks with us." },
      ],
    },
    about: {
      what: "Move money inside the bank, between your own accounts or to another customer, with no outside network involved.",
      how: "Choose the destination first. We then ask only for what that route needs, and show the recipient's masked name so you can confirm it.",
      steps: ["Choose the destination", "Pick accounts and amount", "Review the summary", "Confirm with your PIN"],
    },
    variants: {
      own: {
        label: "Own accounts",
        methodId: "internal",
        transactionType: "LOCAL_TRANSFER",
        perTransferLimit: 0,
        fee: { flat: 0, pct: 0 },
        info: { processing: "", limits: "", fees: "" },
        fields: [
          fromAccount(),
          { name: "toAccountId", label: "To account", type: "account-select", excludeFrom: "fromAccountId", help: "Must be different from the source account." },
          amountField(),
          memoField(),
          ...timingFields(),
        ],
      },
      other: {
        label: "Another customer",
        methodId: "internal",
        transactionType: "LOCAL_TRANSFER",
        perTransferLimit: 0,
        fee: { flat: 0, pct: 0 },
        info: { processing: "", limits: "", fees: "" },
        fields: [
          fromAccount(),
          { name: "toAccountNumber", label: "Recipient account number", type: "account-lookup", validate: "account", mask: "digits17", help: "We will show the account holder's masked name." },
          amountField(),
          memoField(),
          ...timingFields(),
        ],
      },
    },
  },
  {
    id: "wire",
    title: "To another bank",
    description: "ACH, domestic wire, international wire or FedNow",
    illustration: "wire",
    gate: {
      name: "method",
      label: "Which transfer method?",
      help: "Each method asks for different details.",
      options: [
        { value: "ach", label: "ACH", description: "US bank transfer, usually 1 to 3 business days." },
        { value: "wire_domestic", label: "Domestic wire", description: "US wire, usually the same business day. Can't be recalled." },
        { value: "wire_international", label: "International wire (SWIFT)", description: "To a bank account outside the US." },
        { value: "fednow", label: "FedNow", description: "Instant US payment, any day, any time." },
      ],
    },
    about: {
      what: "Send money to accounts at other banks, in the US or abroad, over ACH, Fedwire, SWIFT or the instant FedNow service.",
      how: "Choose the method and the form adapts to it. Routing and account numbers are checked as you type before you can continue.",
      steps: ["Choose the method", "Enter beneficiary and bank details", "Review every field", "Confirm with your PIN"],
    },
    variants: {
      ach: {
        label: "ACH",
        methodId: "ach",
        transactionType: "INT_WIRE",
        perTransferLimit: 0,
        fee: { flat: 0, pct: 0 },
        info: { processing: "", limits: "", fees: "" },
        fields: [
          ...achFields([
            { name: "entryClass", label: "Payment type", type: "radio", defaultValue: "PPD", options: [
              { value: "PPD", label: "Personal (PPD)" },
              { value: "CCD", label: "Business (CCD)" },
            ] },
            { name: "speed", label: "Speed", type: "radio", defaultValue: "standard", options: [
              { value: "standard", label: "Standard", description: "Usually 1 to 3 business days." },
              { value: "same_day", label: "Same day", description: "Arrives the same business day if sent before the daily cut-off." },
            ] },
          ]),
        ],
      },
      wire_domestic: {
        label: "Domestic wire",
        methodId: "wire_domestic",
        transactionType: "INT_WIRE",
        perTransferLimit: 0,
        fee: { flat: 0, pct: 0 },
        info: { processing: "", limits: "", fees: "", note: "A wire can't be recalled once it has been sent." },
        fields: [
          { name: "recipientName", label: "Beneficiary full name", type: "text", validate: "name", maxLength: 70 },
          { name: "addressStreet", label: "Beneficiary street address", type: "text", maxLength: 70 },
          { name: "addressCity", label: "City", type: "text", maxLength: 35 },
          { name: "addressState", label: "State", type: "text", maxLength: 2, mask: "upper", placeholder: "NY" },
          { name: "addressPostal", label: "ZIP code", type: "text", maxLength: 10 },
          { name: "bankName", label: "Beneficiary bank name", type: "text", maxLength: 70 },
          { name: "routingNumber", label: "ABA routing number", type: "text", validate: "routing", mask: "digits9" },
          { name: "accountNumber", label: "Account number", type: "text", validate: "account", mask: "digits17", sensitive: true },
          { name: "accountNumberConfirm", label: "Re-enter account number", type: "text", mask: "digits17", confirmOf: "accountNumber" },
          fromAccount(),
          amountField(),
          { name: "purpose", label: "Purpose of wire", type: "select", options: [
            { value: "family", label: "Family support" },
            { value: "services", label: "Payment for services" },
            { value: "goods", label: "Purchase of goods" },
            { value: "property", label: "Property" },
            { value: "other", label: "Other" },
          ] },
          memoField("Message to beneficiary (max 140 characters)"),
          ackField("ackIrreversible", "I understand a wire is irreversible once released."),
        ],
      },
      wire_international: {
        label: "International wire",
        methodId: "wire_international",
        transactionType: "INT_WIRE",
        perTransferLimit: 0,
        fee: { flat: 0, pct: 0 },
        info: { processing: "", limits: "", fees: "", note: "International payments are screened for compliance and can take longer." },
        fields: internationalFields,
      },
      fednow: {
        label: "FedNow",
        methodId: "fednow",
        transactionType: "INT_WIRE",
        perTransferLimit: 0,
        fee: { flat: 0, pct: 0 },
        info: { processing: "", limits: "", fees: "", note: "Instant payments can't be cancelled or recalled." },
        fields: [
          ...achFields([], true),
          ackField("ackInstant", "I understand FedNow payments are instant and final once sent."),
        ],
      },
    },
  },
  {
    id: "wallet",
    title: "To a crypto wallet",
    description: "Send USDT or USDC to a wallet",
    illustration: "wallet",
    gate: {
      name: "asset",
      label: "Which stablecoin?",
      help: "Both are designed to hold a value of one US dollar.",
      options: [
        { value: "usdt", label: "USDT", description: "Tether USD" },
        { value: "usdc", label: "USDC", description: "USD Coin" },
      ],
    },
    about: {
      what: "Send US dollar stablecoins from your account to a wallet you or someone else controls.",
      how: "Choose the coin and network. The address is checked against that network's format and must be entered twice.",
      steps: ["Choose the stablecoin", "Choose the network", "Check the address and amount", "Confirm with your PIN"],
    },
    variants: {
      usdt: walletVariant("USDT", ["erc20", "trc20", "polygon", "solana"]),
      usdc: walletVariant("USDC", ["erc20", "polygon", "solana", "base"]),
    },
  },
  {
    id: "p2p",
    title: "Zelle, Cash App or Venmo",
    description: "Pay friends and family",
    illustration: "p2p",
    gate: {
      name: "service",
      label: "Which service?",
      options: [
        { value: "zelle", label: "Zelle", description: "Email or US mobile number." },
        { value: "cashapp", label: "Cash App", description: "Send to a $Cashtag." },
        { value: "venmo", label: "Venmo", description: "Send to an @username." },
      ],
    },
    about: {
      what: "Send small payments to friends and family by email, phone number or username.",
      how: "Choose the service, enter who you are paying and the amount. We ask for the recipient's name so you can double-check it.",
      steps: ["Choose the service", "Enter recipient and amount", "Review the summary", "Confirm with your PIN"],
    },
    variants: {
      zelle: {
        label: "Zelle",
        methodId: "zelle",
        transactionType: "INT_WIRE",
        perTransferLimit: 0,
        fee: { flat: 0, pct: 0 },
        info: { processing: "", limits: "", fees: "", note: "Only pay people you know and trust." },
        fields: [
          { name: "zelleIdentifier", label: "Recipient email or mobile number", type: "text", validate: "emailOrPhone", placeholder: "name@email.com or 555 123 4567" },
          { name: "recipientName", label: "Recipient name", type: "text", validate: "name", help: "As it appears on their Zelle profile." },
          fromAccount(),
          amountField(),
          { ...memoField("Note (max 140 characters)") , name: "note" },
        ],
      },
      cashapp: {
        label: "Cash App",
        methodId: "cashapp",
        transactionType: "INT_WIRE",
        perTransferLimit: 0,
        fee: { flat: 0, pct: 0 },
        info: { processing: "", limits: "", fees: "", note: "Only pay people you know and trust." },
        fields: [
          { name: "cashtag", label: "Recipient $Cashtag", type: "text", validate: "cashtag", placeholder: "$username" },
          { name: "recipientName", label: "Recipient name", type: "text", validate: "name" },
          fromAccount(),
          amountField(),
          { ...memoField("Note (max 140 characters)"), name: "note" },
        ],
      },
      venmo: {
        label: "Venmo",
        methodId: "venmo",
        transactionType: "INT_WIRE",
        perTransferLimit: 0,
        fee: { flat: 0, pct: 0 },
        info: { processing: "", limits: "", fees: "", note: "Only pay people you know and trust." },
        fields: [
          { name: "venmoUsername", label: "Recipient @username", type: "text", validate: "venmo", placeholder: "@username" },
          { name: "recipientName", label: "Recipient name", type: "text", validate: "name" },
          fromAccount(),
          amountField(),
          { ...memoField("Note (max 140 characters)"), name: "note" },
        ],
      },
    },
  },
];

export const getTransferType = (id: string | null | undefined) =>
  TRANSFER_TYPES.find((t) => t.id === id) ?? null;

/* ---------------------------- engine helpers ---------------------------- */

export const conditionMet = (c: Condition | undefined, values: Record<string, string>) => {
  if (!c) return true;
  const v = values[c.field] ?? "";
  return Array.isArray(c.equals) ? c.equals.includes(v) : v === c.equals;
};

/**
 * Visible fields in order. A gate field that is not answered hides every
 * field after it (progressive reveal).
 */
export function getVisibleFields(fields: FieldDef[], values: Record<string, string>): FieldDef[] {
  const out: FieldDef[] = [];
  for (const f of fields) {
    if (!conditionMet(f.showIf, values)) continue;
    out.push(f);
    if (f.gate && !values[f.name]) break;
  }
  return out;
}

export const resolveTransactionType = (v: VariantDef, values: Record<string, string>) =>
  typeof v.transactionType === "string"
    ? v.transactionType
    : v.transactionType.map[values[v.transactionType.field]] ?? "INT_WIRE";
