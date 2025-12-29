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
  Bell,
  Settings,
  Building2,
  TrendingUp,
  Calculator,
  CreditCard,
  Wallet,
  Receipt,
  UserPlus,
  UserCheck,
  FileSpreadsheet,
  BarChart3,
  PieChart,
  DollarSign,
  HandCoins,
  ArrowUpDown,
  BookOpen,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface MenuItem {
  href: string;
  icon: any;
  label: string;
  roles?: string[];
  submenu?: { href: string; label: string; icon?: any }[];
}

interface MenuSection {
  section: string;
  items: MenuItem[];
}

const menuItems: MenuSection[] = [
  {
    section: "OVERVIEW",
    items: [
      {
        href: "/dashboard",
        icon: LayoutDashboard,
        label: "Dashboard",
      },
      {
        href: "/reports",
        icon: FileSpreadsheet,
        label: "Reports",
        submenu: [
          { href: "/reports/overview", label: "Overview", icon: BarChart3 },
          {
            href: "/reports/financial",
            label: "Financial Reports",
            icon: DollarSign,
          },
          {
            href: "/reports/loan-portfolio",
            label: "Loan Portfolio",
            icon: Coins,
          },
          {
            href: "/reports/savings-analysis",
            label: "Savings Analysis",
            icon: PiggyBank,
          },
          {
            href: "/reports/branch-performance",
            label: "Branch Performance",
            icon: Building2,
          },
          {
            href: "/reports/client-analytics",
            label: "Client Analytics",
            icon: Users,
          },
        ],
      },
    ],
  },
  {
    section: "APPROVALS & REQUESTS",
    items: [
      {
        href: "/approvals",
        icon: ClipboardCheck,
        label: "Approvals",
        roles: ["manager", "director", "admin"],
        submenu: [
          { href: "/approvals/loans", label: "Loan Approvals", icon: Coins },
          {
            href: "/approvals/savings",
            label: "Savings Accounts",
            icon: PiggyBank,
          },
          {
            href: "/approvals/transactions",
            label: "Transaction Approvals",
            icon: ArrowUpDown,
          },
          {
            href: "/approvals/clients",
            label: "Client Approvals",
            icon: UserCheck,
          },
        ],
      },
    ],
  },
  {
    section: "CLIENT MANAGEMENT",
    items: [
      {
        href: "/clients",
        icon: Users,
        label: "Clients",
        submenu: [
          { href: "/clients", label: "All Clients", icon: Users },
          { href: "/clients/new", label: "Add New Client", icon: UserPlus },
          {
            href: "/clients/pending",
            label: "Pending Approval",
            icon: UserCheck,
          },
          { href: "/clients/active", label: "Active Clients", icon: UserCheck },
          {
            href: "/clients/inactive",
            label: "Inactive Clients",
            icon: AlertCircle,
          },
        ],
      },
    ],
  },
  {
    section: "LOAN MANAGEMENT",
    items: [
      {
        href: "/loans",
        icon: Coins,
        label: "Loans",
        submenu: [
          { href: "/loans", label: "All Loans", icon: BookOpen },
          { href: "/loans/apply", label: "New Application", icon: FileText },
          {
            href: "/loans/pending",
            label: "Pending Approval",
            icon: ClipboardCheck,
          },
          {
            href: "/loans/approved",
            label: "Approved Loans",
            icon: CheckCircle,
          },
          { href: "/loans/active", label: "Active Loans", icon: TrendingUp },
          { href: "/loans/overdue", label: "Overdue Loans", icon: AlertCircle },
          {
            href: "/loans/completed",
            label: "Completed Loans",
            icon: ShieldCheck,
          },
        ],
      },
      {
        href: "/loan-repayments",
        icon: HandCoins,
        label: "Repayments",
        submenu: [
          { href: "/loan-repayments", label: "All Repayments", icon: Receipt },
          {
            href: "/loan-repayments/schedule",
            label: "Payment Schedule",
            icon: Calendar,
          },
          {
            href: "/loan-repayments/history",
            label: "Payment History",
            icon: BookOpen,
          },
        ],
      },
      {
        href: "/loan-calculator",
        icon: Calculator,
        label: "Loan Calculator",
      },
    ],
  },
  {
    section: "SAVINGS MANAGEMENT",
    items: [
      {
        href: "/savings",
        icon: PiggyBank,
        label: "Savings Accounts",
        submenu: [
          { href: "/savings", label: "All Accounts", icon: BookOpen },
          { href: "/savings/new", label: "Open New Account", icon: UserPlus },
          {
            href: "/savings/pending",
            label: "Pending Approval",
            icon: ClipboardCheck,
          },
          {
            href: "/savings/active",
            label: "Active Accounts",
            icon: CheckCircle,
          },
          {
            href: "/savings/suspended",
            label: "Suspended Accounts",
            icon: AlertCircle,
          },
          { href: "/savings/closed", label: "Closed Accounts", icon: XCircle },
        ],
      },
      {
        href: "/savings-transactions",
        icon: ArrowUpDown,
        label: "Transactions",
        submenu: [
          {
            href: "/savings-transactions",
            label: "All Transactions",
            icon: Receipt,
          },
          {
            href: "/savings-transactions/deposits",
            label: "Deposits",
            icon: TrendingUp,
          },
          {
            href: "/savings-transactions/withdrawals",
            label: "Withdrawals",
            icon: TrendingDown,
          },
          {
            href: "/savings-transactions/pending",
            label: "Pending Approval",
            icon: ClipboardCheck,
          },
        ],
      },
    ],
  },
  {
    section: "FINANCIAL OPERATIONS",
    items: [
      {
        href: "/transactions",
        icon: CreditCard,
        label: "All Transactions",
        submenu: [
          {
            href: "/transactions",
            label: "Transaction History",
            icon: BookOpen,
          },
          {
            href: "/transactions/pending",
            label: "Pending Transactions",
            icon: ClipboardCheck,
          },
          {
            href: "/transactions/completed",
            label: "Completed",
            icon: CheckCircle,
          },
          {
            href: "/transactions/failed",
            label: "Failed Transactions",
            icon: AlertCircle,
          },
        ],
      },
      {
        href: "/accounting",
        icon: Wallet,
        label: "Accounting",
        roles: ["manager", "director", "admin"],
        submenu: [
          { href: "/accounting/overview", label: "Overview", icon: PieChart },
          {
            href: "/accounting/ledger",
            label: "General Ledger",
            icon: BookOpen,
          },
          {
            href: "/accounting/cash-flow",
            label: "Cash Flow",
            icon: TrendingUp,
          },
          {
            href: "/accounting/balances",
            label: "Account Balances",
            icon: Wallet,
          },
        ],
      },
    ],
  },
  {
    section: "STAFF & ADMINISTRATION",
    items: [
      {
        href: "/staffs",
        icon: UserCog,
        label: "Staff Management",
        roles: ["manager", "director", "admin"],
        submenu: [
          { href: "/staffs", label: "All Staff", icon: Users },
          { href: "/staffs/new", label: "Add New Staff", icon: UserPlus },
          { href: "/staffs/active", label: "Active Staff", icon: UserCheck },
          {
            href: "/staffs/inactive",
            label: "Inactive Staff",
            icon: AlertCircle,
          },
        ],
      },
      {
        href: "/branches",
        icon: Building2,
        label: "Branches",
        roles: ["director", "admin"],
        submenu: [
          { href: "/branches", label: "All Branches", icon: Building2 },
          { href: "/branches/new", label: "Add New Branch", icon: Plus },
          {
            href: "/branches/performance",
            label: "Branch Performance",
            icon: TrendingUp,
          },
        ],
      },
    ],
  },
  {
    section: "SYSTEM",
    items: [
      {
        href: "/notifications",
        icon: Bell,
        label: "Notifications",
      },
      {
        href: "/settings",
        icon: Settings,
        label: "Settings",
        roles: ["manager", "director", "admin"],
        submenu: [
          {
            href: "/settings/general",
            label: "General Settings",
            icon: Settings,
          },
          { href: "/settings/security", label: "Security", icon: ShieldCheck },
          {
            href: "/settings/notifications",
            label: "Notification Preferences",
            icon: Bell,
          },
          {
            href: "/settings/interest-rates",
            label: "Interest Rates",
            icon: Percent,
          },
          { href: "/settings/fees", label: "Fees & Charges", icon: DollarSign },
        ],
      },
    ],
  },
];

// Import missing icons
import {
  CheckCircle,
  XCircle,
  Calendar,
  TrendingDown,
  Plus,
  Percent,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([
    "/loans",
    "/savings",
  ]);

  const toggleExpand = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href)
        ? prev.filter((item) => item !== href)
        : [...prev, href]
    );
  };

  // Check if current path matches or is under a menu item
  const isPathActive = (itemHref: string, submenu?: any[]) => {
    if (pathname === itemHref) return true;
    if (submenu) {
      return submenu.some(
        (sub) => pathname === sub.href || pathname.startsWith(sub.href + "/")
      );
    }
    return pathname.startsWith(itemHref + "/");
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
                  const isActive = isPathActive(item.href, item.submenu);
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
                              isActive
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
                              {item.submenu.map((subitem) => {
                                const SubIcon = subitem.icon || FileText;
                                const isSubActive =
                                  pathname === subitem.href ||
                                  pathname.startsWith(subitem.href + "/");

                                return (
                                  <li key={subitem.href}>
                                    <Link
                                      href={subitem.href}
                                      className={cn(
                                        "flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors",
                                        isSubActive
                                          ? "bg-[#fef3c7] dark:bg-[#9d8420]/20 text-gray-900 dark:text-white"
                                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                      )}
                                    >
                                      <SubIcon className="w-3 h-3 shrink-0" />
                                      <span className="truncate">
                                        {subitem.label}
                                      </span>
                                    </Link>
                                  </li>
                                );
                              })}
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
