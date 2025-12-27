"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats/stats-card";
import { DataTable } from "@/components/dashboard/table/data-table";
import { TableActions } from "@/components/dashboard/table/table-actions";
import { Pagination } from "@/components/dashboard/table/pagination";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { WelcomeSection } from "@/components/dashboard/welcome-section";
import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  Edit,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

// Mock stats data
const statsData = [
  {
    icon: Building2,
    label: "Total Branches",
    value: "12",
    variant: "default" as const,
  },
  {
    icon: Users,
    label: "Total Staff",
    value: "145",
    variant: "default" as const,
  },
  {
    icon: DollarSign,
    label: "Total Portfolio",
    value: "NGN 2.5B",
    variant: "success" as const,
  },
  {
    icon: TrendingUp,
    label: "Active Clients",
    value: "8,450",
    variant: "success" as const,
  },
];

// Mock branches data
const branchesData = Array.from({ length: 12 }, (_, i) => ({
  id: `BRN-${1001 + i}`,
  name: [
    "Abuja Central",
    "Lagos Island",
    "Port Harcourt Main",
    "Kano City",
    "Ibadan North",
    "Enugu Metro",
    "Kaduna Central",
    "Jos Plateau",
    "Calabar South",
    "Maiduguri",
    "Warri Delta",
    "Benin City",
  ][i],
  code: `BRN${String(1001 + i).padStart(4, "0")}`,
  manager: [
    "Chukwudi Okonkwo",
    "Aisha Mohammed",
    "Emeka Nwankwo",
    "Fatima Bello",
    "Oluwaseun Adeyemi",
    "Ngozi Okeke",
    "Ibrahim Usman",
    "Grace Okafor",
    "Ahmed Hassan",
    "Chioma Eze",
    "Uche Nnadi",
    "Blessing Okoro",
  ][i],
  staff: 8 + i * 2,
  clients: 500 + i * 150,
  activeLo: 80 + i * 10,
  savingsAccounts: 400 + i * 100,
  portfolio: `${1.5 + i * 0.3}M`,
  address: [
    "23 Constitution Avenue, Central Business District",
    "45 Marina Street, Lagos Island",
    "12 Aba Road, Port Harcourt",
    "89 Murtala Mohammed Way, Kano",
    "34 Ring Road, Ibadan",
    "67 Presidential Road, Enugu",
    "23 Ahmadu Bello Way, Kaduna",
    "45 Yakubu Gowon Way, Jos",
    "12 Murtala Mohammed Highway, Calabar",
    "89 Shehu Laminu Way, Maiduguri",
    "34 Effurun-Sapele Road, Warri",
    "67 Akpakpava Road, Benin City",
  ][i],
  phone: `+234 ${800 + i}000${1000 + i * 111}`,
  email: `${
    [
      "abuja",
      "lagos",
      "portharcourt",
      "kano",
      "ibadan",
      "enugu",
      "kaduna",
      "jos",
      "calabar",
      "maiduguri",
      "warri",
      "benin",
    ][i]
  }@seashore.com`,
  status: i === 0 || i === 11 ? "inactive" : "active",
  openedDate: `2024-0${Math.floor(i / 2) + 1}-15`,
}));

const columns = [
  {
    header: "Branch Code",
    accessor: "code",
    className: "font-medium text-gray-900 dark:text-white",
  },
  {
    header: "Branch Name",
    accessor: "name",
    className: "font-semibold text-gray-900 dark:text-white",
  },
  {
    header: "Manager",
    accessor: "manager",
    className: "text-gray-600 dark:text-gray-400",
  },
  {
    header: "Staff",
    accessor: "staff",
    className: "text-gray-900 dark:text-white",
  },
  {
    header: "Clients",
    accessor: "clients",
    className: "text-gray-900 dark:text-white",
  },
  {
    header: "Portfolio",
    accessor: "portfolio",
    cell: (value: string) => `NGN ${value}`,
    className: "font-semibold text-gray-900 dark:text-white",
  },
  {
    header: "Status",
    accessor: "status",
    cell: (value: string) => <StatusBadge status={value as any} />,
  },
];

export default function BranchesPage() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredBranches =
    filterStatus === "all"
      ? branchesData
      : branchesData.filter((branch) => branch.status === filterStatus);

  return (
    <DashboardLayout title="Branch Management">
      {/* Welcome Section */}
      <WelcomeSection
        userName="Emmanuel"
        description="Manage all branch locations, staff assignments, and performance metrics."
        actionButton={
          <Button
            onClick={() => router.push("/branches/create")}
            className="h-11 px-6 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-white text-sm font-semibold rounded-full shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Branch
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {statsData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { label: "All Branches", value: "all" },
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => setFilterStatus(filter.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              filterStatus === filter.value
                ? "bg-yellow-500 text-gray-900"
                : "bg-white dark:bg-[#1e293b] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-[#1e293b] rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
          All Branches
        </h3>

        <TableActions
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onFilterClick={() => console.log("Filter clicked")}
          onExportClick={() => console.log("Export clicked")}
        />

        <DataTable
          columns={columns}
          data={filteredBranches.slice(
            (currentPage - 1) * pageSize,
            currentPage * pageSize
          )}
          onRowClick={(row) => router.push(`/branches/${row.id}/edit`)}
          actionMenu={(row) => (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => router.push(`/branches/${row.id}/edit`)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredBranches.length / pageSize)}
          pageSize={pageSize}
          totalItems={filteredBranches.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Branch Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {branchesData.slice(0, 6).map((branch) => (
          <div
            key={branch.id}
            className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-yellow-500 dark:hover:border-yellow-500 transition-colors cursor-pointer"
            onClick={() => router.push(`/branches/${branch.id}/edit`)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {branch.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {branch.code}
                  </p>
                </div>
              </div>
              <StatusBadge status={branch.status as any} />
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{branch.address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4" />
                <span>{branch.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4" />
                <span className="truncate">{branch.email}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Staff
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {branch.staff}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Clients
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {branch.clients}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Portfolio
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {branch.portfolio}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
