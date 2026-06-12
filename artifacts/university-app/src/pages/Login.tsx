import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function Login() {
  const { login, isLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await login(username, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  const demoUsers = [
    { label: "Admin", username: "admin", password: "admin123", color: "#dc2626", desc: "Full access" },
    { label: "Administration", username: "administration", password: "admin456", color: "#d97706", desc: "Ops access" },
    { label: "Teacher", username: "teacher", password: "teacher123", color: "#2563eb", desc: "Teaching access" },
    { label: "Student", username: "student", password: "student123", color: "#16a34a", desc: "Student access" },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: "hsl(210 20% 96%)" }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 p-10 text-white"
           style={{ backgroundColor: "hsl(220 55% 13%)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
               style={{ background: "linear-gradient(135deg, hsl(146 50% 42%), hsl(146 50% 28%))" }}>
            UE
          </div>
          <div>
            <div className="font-bold text-sm leading-tight">UEMF</div>
            <div className="text-white/50 text-xs">Université Euro-Méditerranéenne de Fès</div>
          </div>
        </div>

        <div>
          <GraduationCap className="w-12 h-12 mb-6 opacity-60" />
          <h2 className="text-3xl font-bold mb-3 leading-tight">University Management System</h2>
          <p className="text-white/60 text-sm leading-relaxed">
            A unified platform for managing students, faculty, courses, grades, schedules, and all administrative operations.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-3">Demo accounts</p>
          {demoUsers.map((u) => (
            <button
              key={u.username}
              type="button"
              onClick={() => { setUsername(u.username); setPassword(u.password); setError(null); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all hover:bg-white/10"
            >
              <span className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: u.color }}>
                {u.label[0]}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white/90">{u.label}</div>
                <div className="text-xs text-white/40">{u.desc} · {u.username} / {u.password}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-sm shadow-lg border-0">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center gap-2 lg:hidden mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                   style={{ background: "linear-gradient(135deg, hsl(146 50% 42%), hsl(146 50% 28%))" }}>
                UE
              </div>
              <span className="font-bold text-sm">UEMF</span>
            </div>
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full text-white"
                style={{ backgroundColor: "hsl(146 50% 36%)" }}
                disabled={isLoading}
              >
                {isLoading ? "Signing in…" : "Sign in"}
              </Button>
            </form>

            {/* Mobile demo accounts */}
            <div className="lg:hidden mt-4 border-t pt-4 space-y-1.5">
              <p className="text-xs text-muted-foreground mb-2">Quick sign-in:</p>
              {[
                { label: "Admin", username: "admin", password: "admin123" },
                { label: "Administration", username: "administration", password: "admin456" },
                { label: "Teacher", username: "teacher", password: "teacher123" },
                { label: "Student", username: "student", password: "student123" },
              ].map((u) => (
                <button
                  key={u.username}
                  type="button"
                  onClick={() => { setUsername(u.username); setPassword(u.password); setError(null); }}
                  className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-muted transition-colors text-muted-foreground"
                >
                  {u.label}: <span className="font-mono">{u.username} / {u.password}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
