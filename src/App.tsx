import { Link, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Procedure from "./pages/Procedure";
import BasicRules from "./pages/BasicRules";
import Materials from "./pages/Materials";
import UtensilDetail from "./pages/UtensilDetail";
import Halachos from "./pages/Halachos";

function TopBar() {
  const location = useLocation();
  const nav = useNavigate();

  const pathname = location.pathname;
  const isHome = pathname === "/";
  const showBack = !isHome; // show back button on every non-home route

  const pillSm = (active: boolean) =>
    `whitespace-nowrap rounded-xl px-3 py-1 text-sm ring-1 ring-slate-200
     shadow-sm bg-white/70 hover:bg-white transition ${active ? "bg-white" : ""}`;

  return (
    <header className="sticky top-[env(safe-area-inset-top,0px)] z-20 border-b border-slate-200 bg-gradient-to-r from-sky-50 to-emerald-50">
      <div className="mx-auto w-full max-w-screen-xl px-3 sm:px-4">
        {/* ---------- sm+ : single compact row (5-column grid) ---------- */}
        <div className="hidden sm:block py-2">
          {showBack && (
            <button
              onClick={() => nav("/")}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-4xl font-extrabold text-slate-800"
              aria-label="Back to home"
              title="Back to home"
            >
              ←
            </button>
          )}
          <div className="grid grid-cols-5 items-center gap-2">
            {/* title */}
            <Link
              to="/"
              className="justify-self-center text-xl font-extrabold tracking-tight text-slate-800"
            >
              Keilim
            </Link>

            {/* Left option */}
            <NavLink
              to="/procedure"
              className={({ isActive }) =>
                `justify-self-start text-center whitespace-nowrap rounded-2xl px-3 py-1.5 text-sm
                ring-1 ring-slate-200 shadow-sm bg-white/70 hover:bg-white transition
                ${isActive ? "bg-white" : ""}`
              }
            >
              Procedure
            </NavLink>

            {/* Middle-right option */}
            <NavLink
              to="/rules"
              className={({ isActive }) =>
                `justify-self-center text-center whitespace-nowrap rounded-2xl px-3 py-1.5 text-sm
                ring-1 ring-slate-200 shadow-sm bg-white/70 hover:bg-white transition
                ${isActive ? "bg-white" : ""}`
              }
            >
              Basic Rules
            </NavLink>

            {/* Right option */}
            <NavLink
              to="/materials"
              className={({ isActive }) =>
                `justify-self-end text-center whitespace-nowrap rounded-2xl px-3 py-1.5 text-sm
                ring-1 ring-slate-200 shadow-sm bg-white/70 hover:bg-white transition
                ${isActive ? "bg-white" : ""}`
              }
            >
              Materials
            </NavLink>

            {/* Far-right option */}
            <NavLink
              to="/halachos"
              className={({ isActive }) =>
                `justify-self-end text-center whitespace-nowrap rounded-2xl px-3 py-1.5 text-sm
                ring-1 ring-slate-200 shadow-sm bg-white/70 hover:bg-white transition
                ${isActive ? "bg-white" : ""}`
              }
            >
              Halachos
            </NavLink>
          </div>
        </div>

        {/* ---------- mobile : two very short rows ---------- */}
        <div className="sm:hidden">
          <div className="relative flex items-center justify-center py-1">
            {showBack && (
              <button
                onClick={() => nav("/")}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-4xl font-extrabold text-slate-800"
                aria-label="Back to home"
                title="Back to home"
              >
                ←
              </button>
            )}
            
            <Link to="/" className="text-lg font-extrabold tracking-tight text-slate-800">
              Keilim
            </Link>
          </div>

          <nav className="-mx-3 px-3 pb-1 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2">
              <NavLink to="/procedure" className={({ isActive }) => pillSm(isActive)}>
                Procedure
              </NavLink>
              <NavLink to="/rules" className={({ isActive }) => pillSm(isActive)}>
                Basic Rules
              </NavLink>
              <NavLink to="/materials" className={({ isActive }) => pillSm(isActive)}>
                Materials
              </NavLink>
              <NavLink to="/halachos" className={({ isActive }) => pillSm(isActive)}>
                Halachos
              </NavLink>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <TopBar />
      {/* tighter vertical padding for content */}
      <main className="mx-auto w-full max-w-screen-xl px-3 sm:px-4 py-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/procedure" element={<Procedure />} />
          <Route path="/rules" element={<BasicRules />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/halachos" element={<Halachos />} />
          <Route path="/utensil/:id" element={<UtensilDetail />} />
        </Routes>
      </main>
      <footer className="border-t">
        <div className="mx-auto w-full max-w-screen-xl px-3 sm:px-4 py-4 text-sm text-gray-600">
          © {new Date().getFullYear()} Keilim — educational use only; always ask a Rav for psak. Sources include STAR-K, CRC, OU, and published poskim.
        </div>
      </footer>
    </div>
  );
}
