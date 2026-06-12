import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
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
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/students/:id" component={StudentDetail} />
        <Route path="/students" component={Students} />
        <Route path="/courses" component={Courses} />
        <Route path="/faculty" component={Faculty} />
        <Route path="/departments" component={Departments} />
        <Route path="/enrollments" component={Enrollments} />
        <Route path="/grades" component={Grades} />
        <Route path="/schedules" component={Schedules} />
        <Route path="/exams" component={Exams} />
        <Route path="/fees" component={Fees} />
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
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
