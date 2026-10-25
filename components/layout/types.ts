/** The signed-in customer as the portal shell needs it (from getProfile). */
export interface PortalProfile {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  tier?: string;
  pinSetupComplete?: boolean;
  profilePhotoUrl?: string | null;
  hideBalance?: boolean;
  profileType?: string;
}
