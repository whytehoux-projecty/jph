import { redirect } from "next/navigation";

// Old address of the transfer form; the hub now lives at /transfer.
export default async function TransferSendRedirect({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const q = new URLSearchParams();
  if (sp.type) q.set("type", sp.type);
  if (sp.method) q.set("method", sp.method);
  redirect(q.toString() ? `/transfer?${q}` : "/transfer");
}
