"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  FiHome,
  FiUsers,
  FiShoppingBag,
  FiBarChart2,
  FiSettings,
  FiMenu,
  FiX,
  FiLogOut,
  FiUser,
  FiPackage,
  FiGrid,
  FiTag,
  FiUserCheck,
} from "react-icons/fi";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: FiHome },
    { name: "Products", href: "/admin/products", icon: FiShoppingBag },
    { name: "Categories", href: "/admin/categories", icon: FiGrid },
    { name: "Orders", href: "/admin/orders", icon: FiPackage },
    { name: "Promocodes", href: "/admin/promocodes", icon: FiTag },
    { name: "Users", href: "/admin/users", icon: FiUsers },
    { name: "Profile", href: "/admin/profile", icon: FiUserCheck },
    { name: "Analytics", href: "/admin/analytics", icon: FiBarChart2 },
    { name: "Settings", href: "/admin/settings", icon: FiSettings },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform 
                      ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
                      transition-transform duration-300 ease-in-out lg:translate-x-0`}
      >
        <div className="flex justify-between items-center px-4 h-16 border-b border-gray-200">
          <Link href="/admin" className="flex items-center space-x-3">
            <Image
              src="/icons/myoulog.png"
              alt="MYOU"
              width={32}
              height={32}
              className="object-contain"
            />
            <span className="text-xl font-bold text-gray-900">Admin</span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 text-gray-500 rounded-md hover:text-gray-600 focus:outline-none lg:hidden"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <nav className="overflow-y-auto flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md
                          ${
                            isActive
                              ? "text-pink-600 bg-pink-100"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5
                              ${
                                isActive
                                  ? "text-pink-600"
                                  : "text-gray-400 group-hover:text-gray-500"
                              }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 p-4 w-full border-t border-gray-200">
          <button
            onClick={() => {
              /* Handle logout */
            }}
            className="flex items-center px-2 py-2 w-full text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50"
          >
            <FiLogOut className="mr-3 w-5 h-5 text-gray-400" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div
        className={`lg:pl-64 flex flex-col min-h-screen transition-all duration-300 ${
          isSidebarOpen ? "pl-64" : "pl-0"
        }`}
      >
        {/* Top header */}
        <header className="sticky top-0 z-40 bg-white shadow-sm">
          <div className="flex justify-between items-center px-4 h-16">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className={`p-2 rounded-md text-gray-500 hover:text-gray-600 focus:outline-none ${
                isSidebarOpen ? "hidden" : ""} lg:hidden`}
            >
              <FiMenu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Admin User</span>
              <Link
                href="/auth/signup"
                className="flex justify-center items-center w-8 h-8 bg-pink-100 rounded-full transition-colors hover:bg-pink-200"
              >
                <FiUser className="w-5 h-5 text-pink-600" />
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="overflow-x-hidden flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
