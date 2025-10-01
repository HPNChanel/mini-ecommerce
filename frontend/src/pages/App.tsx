import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { fetchHealth } from "../api/health";

export default function App() {
  const { data } = useQuery({ queryKey: ["health"], queryFn: fetchHealth });

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-slate-100">
      <div className="max-w-xl text-center space-y-4 p-8 bg-white shadow rounded-xl">
        <h1 className="text-4xl font-bold text-slate-900">Mini E-commerce</h1>
        <p className="text-slate-600">
          A production-ready starter for building modern commerce experiences with FastAPI and
          React.
        </p>
        <div className="flex flex-col items-center space-y-3">
          <p className="text-sm text-slate-500">
            Backend status: <span className="font-semibold">{data?.status ?? "Checking..."}</span>
          </p>
          <Button asChild>
            <a href="/docs" target="_blank" rel="noreferrer">
              Explore API Docs
            </a>
          </Button>
        </div>
      </div>
    </main>
  );
}
