import AdminLayoutClient from "@/components/AdminLayoutClient";
import { cookies } from "next/headers";

export default async function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const userRole = cookieStore.get("user_role")?.value;

  return (
    <AdminLayoutClient userRole={userRole}>{children}</AdminLayoutClient>
  );
}
