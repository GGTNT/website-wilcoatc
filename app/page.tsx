import Site from "@/components/Site";
import { loadGitHub } from "@/lib/github";

// The GitHub figures are refreshed at most once an hour.
export const revalidate = 3600;

export default async function Page() {
  return <Site gh={await loadGitHub()} />;
}
