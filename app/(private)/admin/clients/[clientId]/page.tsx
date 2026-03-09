import { redirect } from "next/navigation";

export default async function ClientDetailsPage(props: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await props.params;
  redirect(`/admin/clients/${clientId}/overview`);
}
