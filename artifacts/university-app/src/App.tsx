import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth, type UserRole } from "@/contexts/AuthContext";
import { getToken } from "@/lib/api";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Students from "@/pages/Students";
import StudentDetail from "@/pages/StudentDetail";
import Courses from "@/pages/Courses";
import Faculty from "@/pages/Faculty";
import Departments from "@/pages/Departments";
import Enrollments from "@/pages/Enrollments";
import Grades from "@/pages/Grades";
import Schedules from "@/pages/Schedules";
import Exams from "@/pages/Exams";
import Fees from "@/pages/Fees";
import Announcements from "@/pages/Announcements";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
      queryFn: async ({ queryKey }) => {
        const url = queryKey[0] as string;
        const token = getToken();
        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      },
    },
  },
});

interface ProtectedRouteProps {
  component: React.ComponentType;
  allowedRoles?: UserRole[];
}

function ProtectedRoute({ component: Component, allowedRoles }: ProtectedRouteProps) {
  const { user } = useAuth();
  if (!user) return <Redirect to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Redirect to="/" />;
  return <Component />;
}

function Router() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route>
          <Redirect to="/login" />
        </Route>
      </Switch>
    );
  }

  return (
    <Layout>
      <Switch>
        <Route path="/login"><Redirect to="/" /></Route>
        <Route path="/" component={Dashboard} />
        <Route path="/students/:id">
          {(params) => <ProtectedRoute component={StudentDetail} allowedRoles={["admin", "administration", "teacher"]} />}
        </Route>
        <Route path="/students">
          <ProtectedRoute component={Students} allowedRoles={["admin", "administration", "teacher"]} />
        </Route>
        <Route path="/courses" component={Courses} />
        <Route path="/faculty">
          <ProtectedRoute component={Faculty} allowedRoles={["admin", "administration", "teacher"]} />
        </Route>
        <Route path="/departments">
          <ProtectedRoute component={Departments} allowedRoles={["admin", "administration", "teacher"]} />
        </Route>
        <Route path="/enrollments" component={Enrollments} />
        <Route path="/grades" component={Grades} />
        <Route path="/schedules" component={Schedules} />
        <Route path="/exams" component={Exams} />
        <Route path="/fees">
          <ProtectedRoute component={Fees} allowedRoles={["admin", "administration", "student"]} />
        </Route>
        <Route path="/announcements" component={Announcements} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
