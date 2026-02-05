
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SignUpModal from '../components/SignUpModal';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [openClaimCDModal, setOpenClaimCDModal] = useState(false);
  const [isInventoryVisible, setIsInventoryVisible] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const toggleInventoryMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsInventoryVisible(!isInventoryVisible);
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200 w-64 font-sans transition-all duration-300">
      {/* Sidebar Logo Area */}
      <div className="p-6 flex items-center justify-center border-b border-gray-100">
        <Link to="/" className="flex items-center gap-2 text-[#1F1F1F] hover:opacity-80 transition-opacity">
            <span className="font-script text-3xl font-bold transform -rotate-2">Multifolks</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4">
        <ul className="space-y-2">
          
          {/* Eye Checkup */}
          <li>
            <Link 
              to="/checkups" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                isActive('/checkups') || isActive('/new-eye-check')
                  ? 'bg-[#232320] text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-[#232320]'
              }`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                 <circle cx="12" cy="12" r="3"/>
              </svg>
              Eye checkup
            </Link>
          </li>

          {/* Order */}
          <li>
            <Link 
              to="/orders" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                isActive('/orders') 
                  ? 'bg-[#232320] text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-[#232320]'
              }`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              Order
            </Link>
          </li>

          {/* Inventory (Has Submenu) */}
          <li>
            <div 
              onClick={toggleInventoryMenu}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold cursor-pointer transition-all duration-200 ${
                isActive('/inventory') 
                  ? 'bg-[#F3F0E7] text-[#232320]' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-[#232320]'
              }`}
            >
              <div className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                  Inventory
              </div>
              <svg 
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className={`transition-transform duration-200 ${isInventoryVisible ? 'rotate-180' : ''}`}
              >
                  <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            
            {/* Sub-menu */}
            {isInventoryVisible && (
              <ul className="pl-11 pr-2 mt-1 space-y-1">
                <li>
                  <Link 
                    to="/inventory" 
                    className={`block px-3 py-2 rounded-lg text-xs font-bold transition-colors ${isActive('/inventory') ? 'text-[#232320] bg-[#F3F0E7]' : 'text-gray-400 hover:text-[#232320]'}`}
                  >
                    All Products
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/lens" 
                    className={`block px-3 py-2 rounded-lg text-xs font-bold transition-colors ${isActive('/lens') ? 'text-[#232320] bg-[#F3F0E7]' : 'text-gray-400 hover:text-[#232320]'}`}
                  >
                    Lens
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/frames" 
                    className={`block px-3 py-2 rounded-lg text-xs font-bold transition-colors ${isActive('/frames') ? 'text-[#232320] bg-[#F3F0E7]' : 'text-gray-400 hover:text-[#232320]'}`}
                  >
                    Frame
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Report */}
          <li>
            <Link 
              to="/reports" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                isActive('/reports') 
                  ? 'bg-[#232320] text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-[#232320]'
              }`}
            >
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <line x1="18" y1="20" x2="18" y2="10"></line>
                   <line x1="12" y1="20" x2="12" y2="4"></line>
                   <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
              Report
            </Link>
          </li>

          {/* Appointments */}
          <li>
            <Link 
              to="/appoitments" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                isActive('/appoitments') 
                  ? 'bg-[#232320] text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-[#232320]'
              }`}
            >
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                   <line x1="16" y1="2" x2="16" y2="6"></line>
                   <line x1="8" y1="2" x2="8" y2="6"></line>
                   <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Appointments
            </Link>
          </li>

          {/* Claim Report */}
          <li>
            <button 
              onClick={() => setOpenClaimCDModal(true)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 text-left ${
                openClaimCDModal 
                  ? 'bg-[#232320] text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-[#232320]'
              }`}
            >
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              Claim Report
            </button>
          </li>

        </ul>
      </nav>

      <div className="p-4 border-t border-gray-100">
           <div className="bg-[#F3CB0A]/20 rounded-xl p-4">
                <h4 className="text-xs font-bold text-[#9A7D00] uppercase mb-1">Need Help?</h4>
                <p className="text-xs text-[#525252] mb-3 font-medium">Contact our support team.</p>
                <button className="w-full bg-[#F3CB0A] text-[#1F1F1F] py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#E0BB09] transition-colors">
                    Support
                </button>
           </div>
      </div>

      <SignUpModal 
        isClaimCheck='true' 
        open={openClaimCDModal} 
        onHide={() => setOpenClaimCDModal(false)} 
        setOpen={() => setOpenClaimCDModal(true)} 
      />
    </div>
  );
}

export default Sidebar;
