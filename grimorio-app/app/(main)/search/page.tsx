import { SearchClient } from "@/components/search/search-client";

export default async function SearchPage(
  props: PageProps<"/search">
) {
  const sp = await props.searchParams;
  const query = typeof sp.q === "string" ? sp.q : "";

  return <SearchClient initialQuery={query} />;
}