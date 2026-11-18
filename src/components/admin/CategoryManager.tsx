"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteCategory, deleteSubcategory, saveCategory, saveSubcategory } from "@/app/admin/actions";
import type { Category } from "@/lib/types";
import ImageUploader from "./ImageUploader";
import { Card, useAction } from "./ui";

function CategoryCard({ cat }: { cat: Category }) {
  const { run, pending, error } = useAction();
  const [name, setName] = useState(cat.name);
  const [order, setOrder] = useState(String(cat.sort_order));
  const [image, setImage] = useState<string[]>(cat.image_url ? [cat.image_url] : []);
  const [subName, setSubName] = useState("");

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[180px] flex-1">
          <label className="label">Category name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
        </div>
        <div className="w-24">
          <label className="label">Order</label>
          <input type="number" min={0} value={order} onChange={(e) => setOrder(e.target.value)} className="input" />
        </div>
        <button
          disabled={pending}
          onClick={() => run(() => saveCategory({ id: cat.id, name, slug: cat.slug, image_url: image[0] ?? "", sort_order: parseInt(order) || 0 }), "Category saved")}
          className="btn-dark"
        >
          Save
        </button>
        <button
          disabled={pending}
          onClick={() => confirm(`Delete “${cat.name}” and its subcategories? Products stay but lose their category.`) && run(() => deleteCategory(cat.id), "Category deleted")}
          className="px-2 text-stone hover:text-red-700"
          aria-label="Delete category"
        >
          <Trash2 size={18} />
        </button>
      </div>
      <div>
        <p className="label">Collection image</p>
        <ImageUploader images={image} onChange={setImage} folder="categories" multiple={false} />
      </div>

      <div>
        <p className="label">Subcategories</p>
        <ul className="flex flex-wrap gap-2">
          {cat.children?.map((s) => (
            <li key={s.id} className="flex items-center gap-1.5 rounded-full border border-line bg-cream/50 py-1 pl-3.5 pr-2 text-sm">
              {s.name}
              <button
                disabled={pending}
                aria-label={`Delete ${s.name}`}
                onClick={() => confirm(`Delete subcategory “${s.name}”?`) && run(() => deleteSubcategory(s.id), "Subcategory deleted")}
                className="text-stone hover:text-red-700"
              >
                <Trash2 size={13} />
              </button>
            </li>
          ))}
        </ul>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!subName.trim()) return;
            run(() => saveSubcategory({ category_id: cat.id, name: subName, sort_order: (cat.children?.length ?? 0) + 1 }), "Subcategory added", (r) => r.ok && setSubName(""));
          }}
        >
          <input value={subName} onChange={(e) => setSubName(e.target.value)} placeholder="New subcategory name" className="input max-w-xs" />
          <button disabled={pending} className="btn-outline">Add</button>
        </form>
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </Card>
  );
}

export default function CategoryManager({ categories }: { categories: Category[] }) {
  const { run, pending, error } = useAction();
  const [name, setName] = useState("");

  return (
    <div className="space-y-5">
      <Card>
        <h2 className="mb-3 text-xl font-semibold">Add category</h2>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => saveCategory({ name, sort_order: categories.length + 1 }), "Category added", (r) => r.ok && setName(""));
          }}
        >
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" className="input max-w-sm" />
          <button disabled={pending} className="btn-dark">Add category</button>
        </form>
        {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      </Card>
      {categories.map((c) => <CategoryCard key={c.id + c.name + c.sort_order} cat={c} />)}
    </div>
  );
}
