import DashboardLayout from "@/components/dashboard/DashboardLayout";

// DashboardSeeker now just renders the layout shell with child routes via <Outlet />
export default function DashboardSeeker() {
  return <DashboardLayout />;
}
