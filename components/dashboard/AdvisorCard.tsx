import { Mail, Phone } from "lucide-react";
import { Card } from "@/components/ui/Card";

/**
 * The relationship manager staff have assigned to this customer
 * (User.accountManager*). Not rendered when none is assigned.
 */
export function AdvisorCard({
  name,
  title,
  phone,
  email,
}: {
  name: string;
  title?: string | null;
  phone?: string | null;
  email?: string | null;
}) {
  const linkClass =
    "inline-flex min-h-11 items-center gap-2 text-small text-fg-action underline-offset-[3px] hover:underline break-all";
  return (
    <Card className="p-5">
      <h2 className="font-sans text-h5 text-fg">Your relationship manager</h2>
      <p className="mt-3 text-body font-semibold text-fg">{name}</p>
      {title && <p className="text-small text-fg-muted">{title}</p>}
      {(phone || email) && (
        <ul className="mt-2">
          {phone && (
            <li>
              <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className={linkClass}>
                <Phone className="size-4 shrink-0" aria-hidden="true" />
                {phone}
              </a>
            </li>
          )}
          {email && (
            <li>
              <a href={`mailto:${email}`} className={linkClass}>
                <Mail className="size-4 shrink-0" aria-hidden="true" />
                {email}
              </a>
            </li>
          )}
        </ul>
      )}
    </Card>
  );
}
