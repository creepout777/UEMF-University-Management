import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ExternalLink, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

export default function TelegramLinkCard() {
  const { user } = useAuth();
  const [isLinking, setIsLinking] = useState(false);

  const fetchToken = async () => {
    const res = await fetch("/api/telegram/link-token", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("uemf_token")}`
      }
    });
    if (!res.ok) throw new Error("Failed to get link token");
    return res.json();
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["telegram-link-token"],
    queryFn: fetchToken,
    enabled: isLinking,
  });

  return (
    <div className="bg-card border border-card-border rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 text-blue-500">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.213-3.05 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.776 1.008z"/>
          </svg>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Link Telegram</h2>
          <p className="text-xs text-muted-foreground">Receive your schedule and progress via Telegram</p>
        </div>
      </div>

      {!isLinking ? (
        <Button onClick={() => setIsLinking(true)} variant="outline" className="w-full text-xs" size="sm">
          Link my account
        </Button>
      ) : isLoading ? (
        <Skeleton className="h-9 w-full rounded-md" />
      ) : error ? (
        <div className="text-xs text-red-500 flex items-center gap-2 mt-2">
          <AlertCircle className="w-4 h-4" /> Error loading link.
          <Button variant="link" onClick={() => refetch()} className="p-0 h-auto text-xs">Retry</Button>
        </div>
      ) : data ? (
        <div className="bg-muted/30 p-3 rounded-lg border border-border mt-2 space-y-2">
          <p className="text-xs text-foreground font-medium">Click the button below to open Telegram and start the bot.</p>
          <Button asChild className="w-full text-xs bg-[#0088cc] hover:bg-[#0088cc]/90 text-white" size="sm">
            <a href={data.botUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3.5 h-3.5 mr-2" /> Open Telegram
            </a>
          </Button>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Link expires at {new Date(data.expiresAt).toLocaleTimeString()}
          </p>
        </div>
      ) : null}
    </div>
  );
}
