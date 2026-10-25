import { getProfile } from "@/app/actions/profile";
import { getAdvisoryRequests, getRelationship, getUserBenefitsPermissions } from "@/app/actions/benefits";
import { loadOrSignIn } from "@/lib/portal-data";
import { languageToLocale } from "@/lib/utils";
import RelationshipClient from "./RelationshipClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your relationship" };

export default async function RelationshipPage() {
  const { user, relationship, requests, permissions } = await loadOrSignIn(async () => {
    const [user, relationship, requests, permissions] = await Promise.all([
      getProfile(),
      getRelationship(),
      getAdvisoryRequests(),
      getUserBenefitsPermissions(),
    ]);
    return { user, relationship, requests, permissions };
  });

  return (
    <RelationshipClient
      tier={relationship.tier}
      manager={relationship.manager}
      requests={requests}
      canRequest={permissions.enabled && permissions.methods.private_advisory}
      locale={languageToLocale(user?.preferredLanguage || "en")}
    />
  );
}
