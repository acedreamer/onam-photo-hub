import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import UploadFab from "./UploadFab";
import Header from "./Header";

const Layout = () => {
  return (
    <div className="min-h-screen bg-ivory font-sans">
      <Header />
      <main className="pb-28 pt-20 px-4">
        <Outlet />
      </main>
      <BottomNav />
      <UploadFab />
    </div>
  );
};

export default Layout;