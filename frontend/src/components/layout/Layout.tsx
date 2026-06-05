import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
// import { SiteBreakingTicker } from "./SiteBreakingTicker";

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* <SiteBreakingTicker /> */}
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
