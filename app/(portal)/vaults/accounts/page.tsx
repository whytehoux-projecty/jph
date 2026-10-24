import { redirect } from "next/navigation";

// Kept for old links and bookmarks: accounts now live at /vaults.
export default function VaultsAccountsRedirect() {
  redirect("/vaults");
}
