import { NavLink } from "react-router-dom";
import { Home, Images, Camera } from "lucide-react";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/gallery", icon: Images, label: "Gallery" },
  { href: "/upload", icon: Camera, label: "Upload" },
];

const BottomNav = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-sidebar text-sidebar-foreground shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-50">
      <nav className="flex justify-around items-center h-full">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 transition-all duration-300 ease-in-out transform hover:text-sidebar-foreground ${
                isActive
                  ? 'text-sidebar-primary-foreground scale-110'
                  : 'text-sidebar-foreground/70'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className="w-6 h-6"
                  fill={isActive ? 'currentColor' : 'none'}
                />
                <span className="text-xs">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default BottomNav;