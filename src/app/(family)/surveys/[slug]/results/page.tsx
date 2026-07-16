import { notFound } from "next/navigation";
import { isSurveySlug } from "@/lib/surveys";

interface SurveyResultsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SurveyResultsPage({
  params,
}: SurveyResultsPageProps): Promise<null> {
  const { slug } = await params;
  if (!isSurveySlug(slug)) {
    notFound();
  }

  return null;
}
