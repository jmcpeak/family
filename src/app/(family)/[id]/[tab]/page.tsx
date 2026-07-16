import { notFound, redirect } from "next/navigation";
import { isTabKey } from "@/lib/family-editor";

interface FamilyMemberTabPageProps {
  params: Promise<{
    id: string;
    tab: string;
  }>;
}

export default async function FamilyMemberTabPage({
  params,
}: FamilyMemberTabPageProps): Promise<null> {
  const { id, tab } = await params;
  if (!isTabKey(tab)) {
    notFound();
  }

  const memberPath = `/${encodeURIComponent(id)}`;
  if (tab === "family") {
    redirect(memberPath);
  }

  redirect(`${memberPath}?tab=${encodeURIComponent(tab)}`);
}
