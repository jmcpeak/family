import { Suspense } from "react";
import { FamilyApp } from "@/components/family-app";
import { getIsAuthenticated } from "@/lib/auth";

export default async function FamilyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<React.JSX.Element> {
  const initialAuthenticated = await getIsAuthenticated();

  return (
    <>
      <Suspense fallback={null}>
        <FamilyApp initialAuthenticated={initialAuthenticated} />
      </Suspense>
      {children}
    </>
  );
}
