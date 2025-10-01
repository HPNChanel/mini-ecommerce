export function AboutPage(): JSX.Element {
  return (
    <div className="bg-white">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-16 text-slate-600 md:px-6">
        <h1 className="text-3xl font-semibold text-slate-900">The Lumen &amp; Loom promise</h1>
        <p>
          We design elevated essentials for the wardrobe and home with a commitment to traceable materials, thoughtful
          production partners, and timeless silhouettes that stay in your rotation for years.
        </p>
        <div className="grid gap-6 rounded-3xl border border-slate-200 bg-slate-50 p-8 md:grid-cols-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Considered materials</h2>
            <p className="text-sm">
              From certified organic cotton to recycled cashmere, every fabric is selected for its hand feel and low impact.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Small batch craft</h2>
            <p className="text-sm">
              We collaborate with family-owned workshops to produce in small batches, reducing waste and ensuring fair wages.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Planet-positive loop</h2>
            <p className="text-sm">
              Carbon-neutral shipping, recyclable packaging, and a take-back program to keep pieces in circulation longer.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
