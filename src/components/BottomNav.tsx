import { NavLink } from "react-router-dom";
import { Home, LayoutGrid, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/gallery", label: "Gallery", icon: LayoutGrid },
  { href: "/about", label: "About", icon: Info },
];

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-ivory/80 backdrop-blur-lg border-t border-gray-200 flex justify-around items-center z-50">
      {navItems.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          end
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center text-gray-500 transition-colors",
              isActive && "text-leaf-green"
            )
          }
        >
          <item.icon className="h-6 w-6 mb-1" />
          <span className="text-xs font-medium">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;