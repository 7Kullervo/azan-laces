"use client";

import { deleteMessage, setMessageRead } from "@/app/admin/actions";
import { useAction } from "./ui";

interface M {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function MessageItem({ m }: { m: M }) {
  const { run, pending } = useAction();
  return (
    <li className={`rounded-2xl border bg-white p-5 ${m.is_read ? "border-line" : "border-gold"}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold">{m.name} {!m.is_read && <span className="badge ml-1 bg-gold text-white">New</span>}</p>
          <p className="text-xs text-stone">
            <a href={`mailto:${m.email}`} className="underline">{m.email}</a>{m.phone ? ` · ${m.phone}` : ""} · {new Date(m.created_at).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
        <div className="flex gap-3 text-sm">
          <button disabled={pending} onClick={() => run(() => setMessageRead(m.id, !m.is_read), "Updated")} className="text-gold-dark underline">
            Mark {m.is_read ? "unread" : "read"}
          </button>
          <button disabled={pending} onClick={() => confirm("Delete this message?") && run(() => deleteMessage(m.id), "Deleted")} className="text-red-700 underline">Delete</button>
        </div>
      </div>
      <p className="mt-3 whitespace-pre-line text-sm">{m.message}</p>
    </li>
  );
}
