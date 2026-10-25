/** Rules shared by the deposit page and its server actions. */

/** Branch cash orders below this are better served by an ATM. */
export const TELLER_ORDER_MINIMUM = 500;

/** Cheque photos: accepted types and the largest upload, after the browser downsizes them. */
export const CHEQUE_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const CHEQUE_IMAGE_MAX_BYTES = 4 * 1024 * 1024;
