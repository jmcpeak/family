import { notFound } from "next/navigation";
import { isTabKey } from "@/lib/family-editor";

interface FamilyMemberTabPageProps {
  params: Promise<{
    tab: string;
  }>;
}

export default async function FamilyMemberTabPage({
  params,
}: FamilyMemberTabPageProps): Promise<null> {
  const { tab } = await params;
  if (!isTabKey(tab)) {
    notFound();
  }

  return null;
}
