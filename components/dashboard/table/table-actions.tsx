"use client";

import { Search, SlidersHorizontal, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TableActionsProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onFilterClick: () => void;
  onExportClick: () => void;
}

export function TableActions({
  searchValue,
  onSearchChange,
  onFilterClick,
  onExportClick,
}: TableActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-10 sm:h-11 bg-gray-50 dark:bg-[#0f172a] border-gray-200 dark:border-gray-800"
        />
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          variant="outline"
          size="default"
          onClick={onFilterClick}
          className="flex-1 sm:flex-none h-10 sm:h-11 gap-2 text-sm"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filter</span>
        </Button>
        <Button
          variant="outline"
          size="default"
          onClick={onExportClick}
          className="flex-1 sm:flex-none h-10 sm:h-11 gap-2 text-sm"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </div>
    </div>
  );
}
