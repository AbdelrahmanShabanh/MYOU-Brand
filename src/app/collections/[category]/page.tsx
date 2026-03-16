import CollectionClient from "./CollectionClient";

export default async function CollectionPage({
  params,
}: {
  params: Promise<any>;
}) {
  const resolvedParams = await params;
  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <CollectionClient category={resolvedParams.category} />
    </div>
  );
}
