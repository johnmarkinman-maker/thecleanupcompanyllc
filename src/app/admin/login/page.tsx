import { redirect } from "next/navigation";
import { LogoMark } from "@/components/Logo";
import { isAdmin } from "@/lib/auth";
import { LoginForm } from "../ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-[16px] border border-line bg-white p-8">
        <div className="flex items-center gap-2 font-semibold">
          <LogoMark className="h-8 w-8" /> The Cleanup Company
        </div>
        <h1 className="mt-6 text-2xl font-semibold">Admin sign in</h1>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
