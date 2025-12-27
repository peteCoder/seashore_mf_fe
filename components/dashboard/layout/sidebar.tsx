"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Users,
  UserCog,
  Coins,
  PiggyBank,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
  {
    section: "BUSINESS OVERVIEW",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/reports", icon: FileText, label: "Reports & Monitoring" },
      {
        href: "/approvals",
        icon: ClipboardCheck,
        label: "Approvals",
        roles: ["manager", "director", "admin"],
      },
    ],
  },
  {
    section: "USER & ACCESS MANAGEMENT",
    items: [
      { href: "/clients", icon: Users, label: "Clients" },
      { href: "/staffs", icon: UserCog, label: "Staffs" },
    ],
  },
  {
    section: "BUSINESS OPERATIONS",
    items: [
      {
        href: "/loan-management",
        icon: Coins,
        label: "Loan management",
        submenu: [
          { href: "/loans/overview", label: "Overview" },
          { href: "/loans/accounts", label: "Accounts" },
          { href: "/loans/transactions", label: "Transactions" },
        ],
      },
      {
        href: "/savings",
        icon: PiggyBank,
        label: "Savings",
        submenu: [
          { href: "/savings/overview", label: "Overview" },
          { href: "/savings/accounts", label: "Accounts" },
          { href: "/savings/transactions", label: "Transactions" },
        ],
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>(["/savings"]);

  const toggleExpand = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href)
        ? prev.filter((item) => item !== href)
        : [...prev, href]
    );
  };

  return (
    <aside className="w-60 sm:w-[260px] h-screen bg-white dark:bg-[#1e293b] border-r border-gray-200 dark:border-gray-800 flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#4a5a3f] dark:bg-[#9d8420] rounded-full flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xs sm:text-sm">SF</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate">
              SEASHORE FINANCE
            </h1>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
              ID - A240530
            </p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-3 sm:p-4 space-y-4 sm:space-y-6 overflow-y-auto">
        {menuItems.map((section, idx) => {
          // Filter items based on user role
          const visibleItems = section.items.filter((item) => {
            if (!item.roles) return true; // No role restriction
            return user?.user_role && item.roles.includes(user.user_role);
          });

          // Don't render section if no visible items
          if (visibleItems.length === 0) return null;

          return (
            <div key={idx}>
              <h3 className="text-[10px] sm:text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 sm:mb-3 px-1">
                {section.section}
              </h3>
              <ul className="space-y-0.5 sm:space-y-1">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href;
                  const isExpanded = expandedItems.includes(item.href);
                  const hasSubmenu = item.submenu && item.submenu.length > 0;

                  return (
                    <li key={item.href}>
                      {hasSubmenu ? (
                        <>
                          <button
                            onClick={() => toggleExpand(item.href)}
                            className={cn(
                              "w-full flex items-center justify-between gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors",
                              pathname.startsWith(item.href)
                                ? "bg-[#fef3c7] dark:bg-[#9d8420]/20 text-gray-900 dark:text-white"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            )}
                          >
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                              <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                              <span className="truncate">{item.label}</span>
                            </div>
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                            )}
                          </button>
                          {isExpanded && (
                            <ul className="mt-1 ml-5 sm:ml-7 space-y-0.5 sm:space-y-1">
                              {item.submenu.map((subitem) => (
                                <li key={subitem.href}>
                                  <Link
                                    href={subitem.href}
                                    className={cn(
                                      "flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors",
                                      pathname === subitem.href
                                        ? "bg-[#fef3c7] dark:bg-[#9d8420]/20 text-gray-900 dark:text-white"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    )}
                                  >
                                    <FileText className="w-3 h-3 shrink-0" />
                                    <span className="truncate">
                                      {subitem.label}
                                    </span>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </>
                      ) : (
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors",
                            isActive
                              ? "bg-[#fef3c7] dark:bg-[#9d8420]/20 text-gray-900 dark:text-white"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          )}
                        >
                          <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
