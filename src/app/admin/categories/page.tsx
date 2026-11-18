import CategoryManager from "@/components/admin/CategoryManager";
import { PageHead } from "@/components/admin/ui";
import { getCategoryTree } from "@/lib/data";

export default async function AdminCategories() {
  const categories = await getCategoryTree();
  return (
    <>
      <PageHead title="Categories" />
      <CategoryManager categories={categories} />
    </>
  );
}
