export function Footer(): JSX.Element {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between md:px-6">
        <p>&copy; {new Date().getFullYear()} Lumen &amp; Loom. Crafted for thoughtful living.</p>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-slate-900">
            Privacy
          </a>
          <a href="#" className="hover:text-slate-900">
            Terms
          </a>
          <a href="mailto:hello@lumenloom.dev" className="hover:text-slate-900">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
