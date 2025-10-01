import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { LogOut, Menu, ShoppingBag } from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition hover:text-slate-900 ${isActive ? "text-slate-900" : "text-slate-500"}`;

export function Header(): JSX.Element {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { cart } = useCart();

  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-md border border-slate-200 p-2 text-slate-600 md:hidden"
            aria-label="Toggle menu"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <Menu className="h-4 w-4" />
          </button>
          <Link to="/" className="text-lg font-semibold tracking-tight text-slate-900">
            Lumen & Loom
          </Link>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/catalog" className={navLinkClass}>
            Catalog
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
          {isAuthenticated ? (
            <NavLink to="/orders" className={navLinkClass}>
              Orders
            </NavLink>
          ) : null}
          {user?.role === "admin" ? (
            <NavLink to="/admin" className={navLinkClass}>
              Admin
            </NavLink>
          ) : null}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/cart"
            className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            <span className="inline-flex h-5 min-w-[1.5rem] items-center justify-center rounded-full bg-slate-900 px-1 text-xs font-semibold text-white">
              {itemCount}
            </span>
          </Link>
          {isAuthenticated ? (
            <Button
              type="button"
              variant="ghost"
              className="hidden items-center gap-2 rounded-full border border-transparent px-3 py-1.5 text-sm font-medium text-slate-600 hover:border-slate-200 hover:bg-slate-50 md:flex"
              onClick={() => {
                void logout();
              }}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          ) : (
            <Button asChild className="hidden rounded-full px-4 py-1.5 text-sm font-semibold md:flex">
              <Link to="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </div>

      {isMenuOpen ? (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <nav className="flex flex-col px-4 py-4">
            <NavLink to="/catalog" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>
              Catalog
            </NavLink>
            <NavLink to="/about" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>
              About
            </NavLink>
            {isAuthenticated ? (
              <NavLink to="/orders" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>
                Orders
              </NavLink>
            ) : null}
            {user?.role === "admin" ? (
              <NavLink to="/admin" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>
                Admin
              </NavLink>
            ) : null}
            <div className="mt-4 flex items-center gap-3">
              {isAuthenticated ? (
                <Button
                  type="button"
                  className="flex-1 rounded-full bg-slate-900 text-white"
                  onClick={() => {
                    void logout();
                    setIsMenuOpen(false);
                  }}
                >
                  Sign out
                </Button>
              ) : (
                <Button asChild className="flex-1 rounded-full">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    Sign in
                  </Link>
                </Button>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
