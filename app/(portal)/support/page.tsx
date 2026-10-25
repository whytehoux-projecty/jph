import { getProfile } from "@/app/actions/profile";
import { getMyMessages } from "@/app/actions/support";
import { loadOrSignIn } from "@/lib/portal-data";
import { languageToLocale } from "@/lib/utils";
import { publishedContact } from "@/lib/contact";
import SupportClient from "./SupportClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Help and support" };

export default async function SupportPage() {
  const { user, messages } = await loadOrSignIn(async () => {
    const [user, messages] = await Promise.all([getProfile(), getMyMessages()]);
    return { user, messages };
  });

  return <SupportClient messages={messages} contact={publishedContact()} locale={languageToLocale(user?.preferredLanguage || "en")} />;
}
