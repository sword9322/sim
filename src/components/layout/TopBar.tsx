import { Menu, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TopBarProps {
  onMenuClick: () => void;
}

export const TopBar = ({ onMenuClick }: TopBarProps) => {
  return (
    <header className="h-16 border-b border-border bg-white/50 backdrop-blur-sm sticky top-0 z-30">
      <div className="h-full flex items-center justify-between px-4">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-secondary rounded-md transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="flex-1 max-w-xl mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search content..."
              className="pl-10 bg-secondary border-none"
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {/* Add user profile/settings buttons here */}
        </div>
      </div>
    </header>
  );
};