import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logOut } from "../api/retailerApis";

interface AccountSidebarProps {
  activeItem?: string;
}

const MENU_ITEMS = [

  { label: "MY PROFILE", icon: "fa-user", path: "/my-profile" },
    { label: "MY ORDERS", icon: "fa-list", path: "/orders" },
  // { label: "MY FAVOURITES", icon: "fa-heart", path: "/wishlist" },
  {
    label: "MY PRESCRIPTION",
    icon: "fa-file-medical",
    path: "/my-prescriptions",
  },
  { label: "RECENTLY VIEWED", icon: "fa-eye", path: "/recently-viewed" },
  { label: "MY OFFERS", icon: "fa-percent", path: "/offers" },
];

const AccountSidebar: React.FC<AccountSidebarProps> = ({
  activeItem = "MY ORDERS",
}) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (e) {
      console.error(e);
    } finally {
      localStorage.clear();
      navigate("/");
      window.location.reload();
    }
  };

  return (
    <div className="w-full md:w-[280px] bg-white flex-shrink-0 font-sans shadow-md">
      <ul className="flex flex-col">
        {MENU_ITEMS.map((item) => {
          const isActive = item.label === activeItem;
          return (
            <li key={item.label}>
              <Link
                to={item.path}
                className={`flex items-center gap-4 px-6 py-4 text-sm font-bold uppercase tracking-wider transition-colors border-l-4 ${isActive
                  ? "bg-[#232320] text-white border-[#232320]"
                  : "bg-white text-[#525252] border-transparent hover:bg-gray-50"
                  }`}
              >
                <i className={`fa-solid ${item.icon} w-5 flex-shrink-0 text-center`}></i>
                <span className="flex-1">{item.label}</span>
              </Link>
            </li>
          );
        })}

        <li>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-4 text-sm font-bold uppercase tracking-wider transition-colors bg-white text-[#525252] border-l-4 border-transparent hover:bg-gray-50 text-left"
          >
            <i className="fa-solid fa-lock w-5 flex-shrink-0 text-center"></i>
            <span className="flex-1">LOGOUT</span>
          </button>
        </li>
      </ul>
    </div>
  );
};

export default AccountSidebar;
