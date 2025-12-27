interface WelcomeSectionProps {
  userName: string;
  description: string;
  actionButton?: React.ReactNode;
}

export function WelcomeSection({
  userName,
  description,
  actionButton,
}: WelcomeSectionProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
      <div>
        <h1 className="text-2xl sm:text-[28px] capitalize font-bold text-gray-900 dark:text-white mb-1">
          Welcome, {userName} 👋
        </h1>
        <p className="text-sm sm:text-[15px] text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>

      {/* Action Button */}
      {actionButton && <div className="shrink-0">{actionButton}</div>}
    </div>
  );
}
