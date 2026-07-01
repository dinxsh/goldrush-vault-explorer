import { redirect } from "next/navigation";

// The vault listing now lives at the site root ("/") and the nav links to it as
// "Earn". This legacy route just forwards there so old bookmarks and the
// detail-page "Back" links keep working. Vault detail pages remain at
// /earn/[slug].
export default function EarnRedirect() {
  redirect("/");
}
