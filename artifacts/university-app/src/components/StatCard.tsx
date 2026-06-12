import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: "green" | "navy" | "amber" | "red" | "blue" | "purple";
  subtitle?: string;
}

const colorMap = {
  green:  { bg: "bg-emerald-50",  icon: "text-emerald-600",  border: "border-emerald-100" },
  navy:   { bg: "bg-blue-50",     icon: "text-blue-700",     border: "border-blue-100" },
  amber:  { bg: "bg-amber-50",    icon: "text-amber-600",    border: "border-amber-100" },
  red:    { bg: "bg-red-50",      icon: "text-red-600",      border: "border-red-100" },
  blue:   { bg: "bg-sky-50",      icon: "text-sky-600",      border: "border-sky-100" },
  purple: { bg: "bg-purple-50",   icon: "text-purple-600",   border: "border-purple-100" },
};

export default function StatCard({ label, value, icon: Icon, color = "green", subtitle }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={cn("bg-card rounded-xl border p-5 shadow-sm", c.border)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", c.bg)}>
          <Icon className={cn("w-5 h-5", c.icon)} />
        </div>
      </div>
    </div>
  );
}
