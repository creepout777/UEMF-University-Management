import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  inactive: "bg-gray-100 text-gray-600 border-gray-200",
  graduated: "bg-blue-100 text-blue-700 border-blue-200",
  suspended: "bg-red-100 text-red-700 border-red-200",
  enrolled: "bg-emerald-100 text-emerald-700 border-emerald-200",
  dropped: "bg-red-100 text-red-700 border-red-200",
  completed: "bg-blue-100 text-blue-700 border-blue-200",
  paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  overdue: "bg-red-100 text-red-700 border-red-200",
  waived: "bg-gray-100 text-gray-600 border-gray-200",
  on_leave: "bg-amber-100 text-amber-700 border-amber-200",
  undergraduate: "bg-sky-100 text-sky-700 border-sky-200",
  graduate: "bg-indigo-100 text-indigo-700 border-indigo-200",
  doctoral: "bg-purple-100 text-purple-700 border-purple-200",
  lecture: "bg-blue-100 text-blue-700 border-blue-200",
  lab: "bg-orange-100 text-orange-700 border-orange-200",
  tutorial: "bg-teal-100 text-teal-700 border-teal-200",
  seminar: "bg-purple-100 text-purple-700 border-purple-200",
  urgent: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-blue-100 text-blue-700 border-blue-200",
  low: "bg-gray-100 text-gray-600 border-gray-200",
  midterm: "bg-amber-100 text-amber-700 border-amber-200",
  final: "bg-red-100 text-red-700 border-red-200",
  quiz: "bg-sky-100 text-sky-700 border-sky-200",
  assignment: "bg-teal-100 text-teal-700 border-teal-200",
  project: "bg-purple-100 text-purple-700 border-purple-200",
  practical: "bg-orange-100 text-orange-700 border-orange-200",
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = statusStyles[status] ?? "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border capitalize", style, className)}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
