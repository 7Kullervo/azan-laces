"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const MAX_MB = 5;

/** Uploads straight to the Supabase Storage bucket (admin-only write policy). */
export async function uploadImage(file: File, folder: string): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Only image files are allowed");
  if (file.size > MAX_MB * 1024 * 1024) throw new Error(`Images must be under ${MAX_MB} MB`);
  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const supabase = createClient();
  const { error } = await supabase.storage.from("product-images").upload(path, file, { cacheControl: "31536000", upsert: false });
  if (error) throw new Error(error.message);
  return supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
}

interface Props {
  images: string[];
  onChange: (urls: string[]) => void;
  folder: string;
  multiple?: boolean;
}

export default function ImageUploader({ images, onChange, folder, multiple = true }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError("");
    try {
      const urls: string[] = [];
      for (const f of Array.from(files)) urls.push(await uploadImage(f, folder));
      onChange(multiple ? [...images, ...urls] : urls.slice(0, 1));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  function move(i: number, d: number) {
    const next = [...images];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {images.map((url, i) => (
          <div key={url + i} className="group relative h-28 w-24 overflow-hidden rounded-xl border border-line bg-cream">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            {i === 0 && multiple && <span className="absolute left-1 top-1 rounded bg-ink px-1.5 py-0.5 text-[9px] uppercase text-ivory">Main</span>}
            <button type="button" onClick={() => onChange(images.filter((_, k) => k !== i))} aria-label="Remove image" className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow">
              <X size={13} />
            </button>
            {multiple && images.length > 1 && (
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-white/85 px-1 py-0.5">
                <button type="button" onClick={() => move(i, -1)} aria-label="Move left" disabled={i === 0} className="disabled:opacity-30"><ArrowLeft size={14} /></button>
                <button type="button" onClick={() => move(i, 1)} aria-label="Move right" disabled={i === images.length - 1} className="disabled:opacity-30"><ArrowRight size={14} /></button>
              </div>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={busy}
          className="flex h-28 w-24 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-line text-xs text-stone transition hover:border-gold hover:text-gold-dark disabled:opacity-50"
        >
          <ImagePlus size={20} />
          {busy ? "Uploading…" : "Upload"}
        </button>
      </div>
      <input ref={input} type="file" accept="image/*" multiple={multiple} hidden onChange={(e) => onFiles(e.target.files)} />
      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
    </div>
  );
}
