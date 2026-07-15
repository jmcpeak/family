import { notFound } from "next/navigation";
import { isSurveySlug } from "@/lib/surveys";

interface SurveyPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SurveyPage({
  params,
}: SurveyPageProps): Promise<null> {
  const { slug } = await params;
  if (!isSurveySlug(slug)) {
    notFound();
  }

  return null;
}
