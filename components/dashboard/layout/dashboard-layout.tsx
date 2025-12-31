"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "./sidebar";
import { TopHeader } from "./top-header";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  profileImage?: string; // Add this
}

export function DashboardLayout({
  children,
  title,
  profileImage, // Add this
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a]">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop: always visible, Mobile: slide-in */}
      <div
        className={`fixed top-0 left-0 h-full z-50 lg:z-30 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Desktop Header */}
        <div className="flex items-center gap-1.5 sticky top-0 z-20 bg-white dark:bg-[#1e293b] border-b border-gray-200 dark:border-gray-800 px-6 lg:px-8 py-4">
          <div className="block lg:hidden">
            {/* <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            > */}
            <div className="p-1 mr-3" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </div>

            {/* </Button> */}
          </div>

          <div className="flex-1">
            <TopHeader
              title={title}
              profileImage={profileImage} // Pass it here
            />
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
