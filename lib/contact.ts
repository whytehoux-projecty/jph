import { PUBLIC_CONTACT } from '@/src/content/facts';

/**
 * Contact details the portal may show. They come from the commercial site's
 * PUBLIC_CONTACT, which holds bracketed placeholders ("[Phone]") until the
 * bank supplies verified details; a placeholder is never shown.
 */
const real = (v: string) => (v && !/^\[.*\]$/.test(v.trim()) ? v.trim() : null);

export function publishedContact() {
  const phone = real(PUBLIC_CONTACT.phone);
  const fraudPhone = real(PUBLIC_CONTACT.fraudPhone);
  return {
    phone,
    phoneTel: phone ? phone.replace(/[^\d+]/g, '') : null,
    fraudPhone,
    fraudPhoneTel: fraudPhone ? fraudPhone.replace(/[^\d+]/g, '') : null,
    email: real(PUBLIC_CONTACT.email),
  };
}
