import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seashore Financial Company - Authentication",
  description: "Login to your Seashore Financial Company account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left Sidebar */}
      <div className="hidden lg:flex lg:w-[384px] bg-[#1a2332] dark:bg-[#0f172a] relative overflow-hidden">
        {/* Diagonal lines pattern */}
        <div className="absolute inset-0">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="diagonal-lines"
                x="0"
                y="0"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <line
                  x1="0"
                  y1="40"
                  x2="40"
                  y2="0"
                  stroke="#2d3b4e"
                  className="dark:stroke-[#1e293b]"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#diagonal-lines)" />
          </svg>
        </div>

        {/* Logo and company name */}
        <div className="relative z-10 flex items-center px-12 py-16">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="w-14 h-14 relative shrink-0">
              <svg
                viewBox="0 0 56 56"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Sun */}
                <circle cx="28" cy="20" r="10" fill="#F59E0B" />
                {/* Waves */}
                <path
                  d="M8 36C8 36 14 30 20 30C26 30 28 36 34 36C40 36 46 30 46 30"
                  stroke="#F59E0B"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M8 44C8 44 14 38 20 38C26 38 28 44 34 44C40 44 46 38 46 38"
                  stroke="#F59E0B"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </div>
            {/* Company name */}
            <div className="text-white">
              <div className="text-[22px] font-bold leading-tight tracking-wide">
                SEASHORE FINANCIAL
              </div>
              <div className="text-[22px] font-bold leading-tight tracking-wide">
                COMPANY
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 bg-[#e8eaed] dark:bg-[#0f172a] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}
