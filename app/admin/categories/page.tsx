import { Tags } from "lucide-react";
import AdminHeader from "../admin-header";
import CategoryManager from "../category-manager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 pt-16 sm:pt-20 font-sans">
      <div className="max-w-7xl mx-auto">
        <AdminHeader />

        <div className="flex items-center gap-3 mb-6">
          <Tags className="text-brand w-5 h-5" />
          <h1 className="text-3xl sm:text-5xl font-black italic tracking-tighter uppercase text-foreground">Categories</h1>
        </div>

        <CategoryManager />
      </div>
    </div>
  );
}
