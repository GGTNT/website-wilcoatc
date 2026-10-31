import { notFound } from "next/navigation";
import Docs from "@/components/Docs";
import { PAGES } from "@/lib/docs";
import { loadGitHub } from "@/lib/github";

export const revalidate = 3600;
export const dynamicParams = false;

// /docs is the first page; every other page is /docs/<id>.
export function generateStaticParams() {
  return [{ slug: [] }, ...PAGES.slice(1).map(p => ({ slug: [p.id] }))];
}

export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const id = slug?.[0] ?? PAGES[0].id;
  if (!PAGES.some(p => p.id === id)) notFound();
  return <Docs id={id} gh={await loadGitHub()} />;
}
