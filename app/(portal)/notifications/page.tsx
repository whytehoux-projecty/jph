import { getNotifications } from "@/app/actions/notifications";
import { getProfile } from "@/app/actions/profile";
import { loadOrSignIn } from "@/lib/portal-data";
import { languageToLocale } from "@/lib/utils";
import NotificationsClient, { type NotificationView } from "./NotificationsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const { user, notifications } = await loadOrSignIn(async () => {
    const [user, notifications] = await Promise.all([getProfile(), getNotifications()]);
    return { user, notifications };
  });
  const fmt = new Intl.DateTimeFormat(languageToLocale(user?.preferredLanguage || "en"), { dateStyle: "medium", timeStyle: "short" });

  const views: NotificationView[] = notifications.map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    isRead: n.isRead,
    createdAt: n.createdAt.toISOString(),
    when: fmt.format(n.createdAt),
  }));

  return <NotificationsClient initial={views} />;
}
