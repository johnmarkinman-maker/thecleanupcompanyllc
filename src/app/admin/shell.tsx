import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { logout } from "./actions";
import { AdminTabs } from "./ui";

export function AdminShell({ title, children, actions }: { title: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <LogoMark className="h-7 w-7" /> Admin
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/" className="text-muted hover:text-ink">
              View site
            </Link>
            <form action={logout}>
              <button className="text-muted hover:text-ink">Sign out</button>
            </form>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-3 sm:px-6">
          <AdminTabs />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">{title}</h1>
          {actions}
        </div>
        {children}
      </main>
    </>
  );
}

export const Table = ({ children }: { children: React.ReactNode }) => (
  <div className="overflow-x-auto rounded-[12px] border border-line bg-white">
    <table className="w-full min-w-[640px] text-left text-sm [&_td]:px-4 [&_td]:py-3 [&_td]:align-top [&_th]:px-4 [&_th]:py-3 [&_th]:font-medium [&_th]:text-muted [&_thead]:border-b [&_thead]:border-line [&_tbody_tr+tr]:border-t [&_tbody_tr+tr]:border-line">
      {children}
    </table>
  </div>
);

export const fmt = (d: unknown) =>
  d ? new Date(d as string).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) : "";
