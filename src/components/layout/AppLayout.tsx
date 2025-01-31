import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { Link, Outlet } from 'react-router-dom';
import { FiUser } from 'react-icons/fi';
import { useAuth } from "@/contexts/AuthContext";

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className={`${sidebarOpen ? "ml-64" : "ml-20"} transition-all duration-300`}>
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)}>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, {user?.email}
            </span>
            <Link 
              to="/profile"
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              <FiUser className="w-4 h-4" />
              Profile
            </Link>
            <button 
              onClick={logout}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </TopBar>
        <main className="p-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};