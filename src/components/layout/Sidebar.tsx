import { Link, useLocation } from "react-router-dom";
import { FileText, Music2, Film, Gamepad2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const location = useLocation();
  
  const menuItems = [
    { icon: FileText, label: "Documents", path: "/documents" },
    { icon: Music2, label: "Music", path: "/music" },
    { icon: Film, label: "Videos", path: "/videos" },
    { icon: Gamepad2, label: "Games", path: "/games" },
  ];

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white border-r border-border transition-all duration-300",
        isOpen ? "w-64" : "w-20"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {isOpen && <h1 className="text-xl font-semibold">MediaHub</h1>}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-secondary rounded-md transition-colors"
          >
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
        <nav className="flex-1 py-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-4 py-3 mb-1 transition-colors",
                "hover:bg-secondary rounded-md mx-2",
                location.pathname === item.path && "bg-secondary",
                !isOpen && "justify-center"
              )}
            >
              <item.icon size={20} className="shrink-0" />
              {isOpen && <span className="ml-3">{item.label}</span>}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
};