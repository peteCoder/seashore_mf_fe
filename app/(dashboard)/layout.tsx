import ProtectedRoute from "@/components/ProtectedRoutes";

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
