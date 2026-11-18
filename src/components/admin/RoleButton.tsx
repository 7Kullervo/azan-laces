"use client";

import { setUserRole } from "@/app/admin/actions";
import { useAction } from "./ui";

export default function RoleButton({ userId, role, self }: { userId: string; role: string; self: boolean }) {
  const { run, pending } = useAction();
  const isAdmin = role === "admin";
  return (
    <div className="flex items-center gap-2">
      <span className={`badge ${isAdmin ? "bg-gold text-white" : "bg-cream text-stone"}`}>{role}</span>
      {!self && (
        <button
          disabled={pending}
          onClick={() =>
            confirm(isAdmin ? "Remove admin access from this user?" : "Give this user full admin access?") &&
            run(() => setUserRole(userId, isAdmin ? "customer" : "admin"), "Role updated")
          }
          className="text-xs text-gold-dark underline"
        >
          {isAdmin ? "Remove admin" : "Make admin"}
        </button>
      )}
    </div>
  );
}
