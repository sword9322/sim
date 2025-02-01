import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import SearchBar from "@/components/SearchBar";

interface TopBarProps {
  onMenuClick: () => void;
  children?: React.ReactNode;
}

export const TopBar = ({ onMenuClick, children }: TopBarProps) => {
  const handleSearch = (query: string) => {
    console.log("TopBar search:", query); // Debug log
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-gradient-to-r from-background to-accent/5 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="h-16 flex items-center justify-between px-6 py-4">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-secondary rounded-md transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="flex-1 max-w-xl mx-6">
          <SearchBar 
            onSearch={handleSearch}
            placeholder="Search content..."
          />
        </div>
        {children}
      </div>
    </header>
  );
};