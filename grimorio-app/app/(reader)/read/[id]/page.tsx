import { ReaderView } from "@/components/reader/reader-view";
import type { CatalogItem } from "@/lib/types";

export const metadata = {
  title: "Leitor",
};

export default async function ReadPage(props: PageProps<"/read/[id]">) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const repoId = typeof sp.repo === "string" ? sp.repo : undefined;
  const fallbackUrl =
    typeof sp.url === "string" ? sp.url : undefined;
  const fallbackType =
    typeof sp.type === "string"
      ? (sp.type as CatalogItem["type"])
      : undefined;

  return (
    <ReaderView
      itemId={id}
      repoId={repoId}
      fallbackUrl={fallbackUrl}
      fallbackType={fallbackType}
    />
  );
}