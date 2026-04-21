import HomeClient from "@/components/HomeClient";
import { getUtensils } from "@/lib/utensilsData";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const result = await getUtensils();

  return (
    <HomeClient
      initialUtensils={result.items}
      initialSource={result.source}
      initialUpdatedAt={result.updatedAt}
    />
  );
}
