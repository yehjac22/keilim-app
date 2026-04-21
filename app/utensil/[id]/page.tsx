import UtensilDetailClient from "@/components/UtensilDetailClient";
import { getUtensils } from "@/lib/utensilsData";

export default async function UtensilDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getUtensils();
  const utensil = result.items.find((candidate) => candidate.id === id);

  return (
    <UtensilDetailClient
      id={id}
      initialUtensil={utensil ?? null}
      initialSource={result.source}
      initialUpdatedAt={result.updatedAt}
    />
  );
}
