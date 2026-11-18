"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useWishlist } from "@/lib/wishlist-store";

type Mode = "login" | "register" | "forgot" | "reset";

const COPY: Record<Mode, { title: string; button: string; sub: string }> = {
  login: { title: "Welcome back", button: "Sign in", sub: "Sign in to view orders, wishlist and saved addresses." },
  register: { title: "Create your account", button: "Create account", sub: "Save addresses, track orders and keep a wishlist." },
  forgot: { title: "Reset your password", button: "Send reset link", sub: "We'll email you a link to choose a new password." },
  reset: { title: "Choose a new password", button: "Update password", sub: "Enter a new password for your account." },
};

export default function AuthForm({ mode }: { mode: Mode }) {
  const params = useSearchParams();
  const rawNext = params.get("next") ?? "/account";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/account";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const loadWishlist = useWishlist((s) => s.load);
  const copy = COPY[mode];

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") ?? "").trim();
    const password = String(f.get("password") ?? "");
    const supabase = createClient();
    const origin = window.location.origin;

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await loadWishlist();
        // Full navigation: the client router may hold a prefetched redirect-to-login for protected pages
        window.location.assign(next);
      } else if (mode === "register") {
        if (password.length < 8) throw new Error("Password must be at least 8 characters");
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: String(f.get("name") ?? "").trim(), phone: String(f.get("phone") ?? "").trim() },
            emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });
        if (error) throw error;
        if (data.session) {
          await loadWishlist();
          window.location.assign(next);
        } else {
          setInfo("Account created. Please check your email to confirm your address, then sign in.");
        }
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${origin}/auth/callback?next=/reset-password`,
        });
        if (error) throw error;
        setInfo("If an account exists for that email, a reset link is on its way.");
      } else {
        if (password.length < 8) throw new Error("Password must be at least 8 characters");
        if (password !== String(f.get("confirm") ?? "")) throw new Error("Passwords do not match");
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setInfo("Password updated. Redirecting…");
        setTimeout(() => window.location.assign("/account"), 900);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container-page flex justify-center py-14">
      <div className="w-full max-w-md rounded-3xl border border-line bg-white p-7 sm:p-9">
        <h1 className="text-4xl font-semibold">{copy.title}</h1>
        <p className="mt-1.5 text-sm text-stone">{copy.sub}</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {mode === "register" && (
            <>
              <div>
                <label className="label" htmlFor="name">Full name</label>
                <input id="name" name="name" required autoComplete="name" className="input" />
              </div>
              <div>
                <label className="label" htmlFor="phone">Phone</label>
                <input id="phone" name="phone" type="tel" autoComplete="tel" className="input" />
              </div>
            </>
          )}
          {mode !== "reset" && (
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required autoComplete="email" className="input" />
            </div>
          )}
          {mode !== "forgot" && (
            <div>
              <label className="label" htmlFor="password">{mode === "reset" ? "New password" : "Password"}</label>
              <input id="password" name="password" type="password" required minLength={mode === "login" ? undefined : 8} autoComplete={mode === "login" ? "current-password" : "new-password"} className="input" />
            </div>
          )}
          {mode === "reset" && (
            <div>
              <label className="label" htmlFor="confirm">Confirm password</label>
              <input id="confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" className="input" />
            </div>
          )}

          {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-800">{error}</p>}
          {info && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">{info}</p>}

          <button disabled={busy} className="btn-dark w-full">{busy ? "Please wait…" : copy.button}</button>
        </form>

        <div className="mt-6 space-y-2 text-center text-sm text-stone">
          {mode === "login" && (
            <>
              <p><Link href="/forgot-password" className="underline">Forgot your password?</Link></p>
              <p>New here? <Link href={`/register?next=${encodeURIComponent(next)}`} className="font-medium text-gold-dark underline">Create an account</Link></p>
            </>
          )}
          {mode === "register" && (
            <p>Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-medium text-gold-dark underline">Sign in</Link></p>
          )}
          {(mode === "forgot" || mode === "reset") && <p><Link href="/login" className="underline">Back to sign in</Link></p>}
          <p className="pt-2 text-xs">You can also <Link href="/collections/all" className="underline">continue as a guest</Link>. No account is needed to shop.</p>
        </div>
      </div>
    </div>
  );
}
