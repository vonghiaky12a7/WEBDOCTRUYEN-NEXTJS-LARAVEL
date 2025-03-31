"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import Link from "next/link";
import ThemeSwitcher from "@/components/ThemeSwitcher"; // Đảm bảo file tồn tại
import Avatar from "@/components/Avatar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin/user", label: "Users", icon: "lucide:user" },
    { href: "/admin/story", label: "Story", icon: "lucide:book-open" },
    { href: "/admin/chapters", label: "Chapters", icon: "lucide:list" },
    { href: "/admin/genres", label: "Genres", icon: "lucide:list" },
  ];

  return (
    <div className="flex flex-col h-screen">
      {/* Navbar */}
      <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Admin Dashboard</h2>
        <div className="flex space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                pathname.startsWith(item.href)
                  ? "text-primary-600 bg-gray-100"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon icon={item.icon} className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Avatar + Theme Switch */}
        <div className="flex items-center space-x-5">
          <ThemeSwitcher />
          <Avatar />
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">{children}</div>
    </div>
  );
}
