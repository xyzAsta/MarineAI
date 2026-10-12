
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout() {
  const { pathname } = useLocation();

  const isFitPage = ["/about", "/contact"].includes(
    pathname.replace(/\/+$/, "") || "/"
  );

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <div
        className={`relative flex flex-1 flex-col ${
          isFitPage ? "pt-16" : ""
        }`}
      >
        <Outlet />
      </div>

      <Footer />
    </div>
  );
}
