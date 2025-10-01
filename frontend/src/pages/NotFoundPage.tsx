import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

export function NotFoundPage(): JSX.Element {
  return (
    <div className="mx-auto flex h-[70vh] w-full max-w-4xl flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-4xl font-semibold text-slate-900">Page not found</h1>
      <p className="max-w-md text-sm text-slate-500">
        The page you&apos;re looking for doesn&apos;t exist. Explore our catalog or return to the homepage to continue browsing.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button asChild className="rounded-full">
          <Link to="/">Go home</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/catalog">Browse catalog</Link>
        </Button>
      </div>
    </div>
  );
}
