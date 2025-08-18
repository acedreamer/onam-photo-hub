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
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-ivory border-t border-gray-200/80 flex justify-around items-center z-40">
      {navItems.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          end
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center w-full h-full text-gray-500 transition-colors",
              isActive ? "text-dark-leaf-green" : "hover:text-dark-leaf-green/70"
            )
          }
        >
          <item.icon className="h-7 w-7 mb-1" />
          <span className="text-xs font-medium tracking-wide">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;