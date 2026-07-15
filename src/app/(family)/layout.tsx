import { FamilyApp } from "@/components/family-app";

export default function FamilyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <>
      <FamilyApp />
      {children}
    </>
  );
}
