import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import UploadFab from "./UploadFab";

const Layout = () => {
  return (
    <div className="min-h-screen bg-ivory font-sans">
      <main className="pb-28 pt-8 px-4">
        <Outlet />
      </main>
      <BottomNav />
      <UploadFab />
    </div>
  );
};

export default Layout;