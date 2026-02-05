
import React from "react";
import { Outlet } from 'react-router-dom';
import Sidebar from "./Sidebar";
import { Navigation } from "../components/Navigation";
import ScrollToTop from "../components/ScrollToTop";

const Layout: React.FC = () => {
  return (
    <div className="flex h-screen bg-[#F3F0E7] font-sans overflow-hidden">
      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <aside className="hidden md:block h-full flex-shrink-0 shadow-xl z-20">
         <Sidebar />
      </aside>
      
      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header / Navigation */}
        <div className="sticky top-0 z-30 w-full bg-[#F3F0E7]">
           <Navigation />
        </div>
        
        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 scroll-smooth">
          <Outlet />
        </main>
      </div>

      <ScrollToTop />
    </div>
  )
}

export default Layout;
