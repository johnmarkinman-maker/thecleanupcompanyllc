import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import type { Testimonial } from "@/lib/data";
import { deleteTestimonial, saveTestimonial } from "../actions";
import { AdminShell } from "../shell";

export const dynamic = "force-dynamic";
export const metadata = { title: "Testimonials" };

function TForm({ t }: { t?: Testimonial }) {
  return (
    <form action={saveTestimonial} className="grid gap-3">
      {t && <input type="hidden" name="id" value={t.id} />}
      <label className="grid gap-1.5 text-sm font-medium">
        Quote (paste exactly as the customer wrote it)
        <textarea name="quote" defaultValue={t?.quote} required rows={3} className="field" />
      </label>
      <div className="grid gap-3 sm:grid-cols-4">
        <label className="grid gap-1.5 text-sm font-medium">
          Name
          <input name="name" defaultValue={t?.name} required className="field" />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Role
          <input name="role" defaultValue={t?.role ?? ""} className="field" />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Company
          <input name="company" defaultValue={t?.company ?? ""} className="field" />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Sort order
          <input name="sort" type="number" defaultValue={t?.sort ?? 0} className="field" />
        </label>
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="published" defaultChecked={t ? t.published : true} className="h-4 w-4" /> Show on site
        </label>
        <button className="btn btn-primary !min-h-10">{t ? "Save" : "Add testimonial"}</button>
      </div>
    </form>
  );
}

export default async function TestimonialsAdmin() {
  await requireAdmin();
  const rows = await sql<Testimonial>("select * from testimonials order by sort, id");
  return (
    <AdminShell title="Testimonials">
      <p className="mb-6 max-w-2xl text-sm text-muted">
        Only add real testimonials from real customers. The testimonials section on the home page stays hidden until at least one is set to show on site.
      </p>
      <div className="rounded-[12px] border border-line bg-white p-5">
        <h2 className="mb-4 font-semibold">Add a testimonial</h2>
        <TForm />
      </div>
      <div className="mt-8 grid gap-4">
        {rows.map((t) => (
          <div key={t.id} className="rounded-[12px] border border-line bg-white p-5">
            <TForm t={t} />
            <form action={deleteTestimonial} className="mt-3">
              <input type="hidden" name="id" value={t.id} />
              <button className="text-sm text-red-800 underline">Delete</button>
            </form>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
