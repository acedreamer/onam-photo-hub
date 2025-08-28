import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";
import UploadFab from "./UploadFab";
import Header from "./Header";

const Layout = () => {
  const location = useLocation();
  const showFab = location.pathname === '/' || location.pathname.startsWith('/profile');

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Header />
      <main className="flex-grow pb-28 pt-20 px-4 flex flex-col">
        <Outlet />
      </main>
      <BottomNav />
      {showFab && <UploadFab />}
    </div>
  );
};

export default Layout;