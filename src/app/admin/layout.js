import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";

export default async function AdminLayout({ children }) {
  // 1. Check for your custom secure cookie!
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');

  // 2. The Gatekeeper: If the token is missing, kick them to login
  if (!token) {
    redirect("/login");
  }

  // 3. Render the Admin Panel
  return (
    <div className="min-h-screen bg-navy flex text-white font-sans selection:bg-gold selection:text-navy">
      <AdminSidebar />
      <main className="flex-1 md:ml-64 p-8">
        {children}
      </main>
    </div>
  );
}