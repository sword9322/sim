import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className={`${sidebarOpen ? "ml-64" : "ml-20"} transition-all duration-300`}>
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};