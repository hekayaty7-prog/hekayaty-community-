import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CommunityProvider } from "@/contexts/SupabaseCommunityContext";
import { Layout } from "@/components/Layout";
import { Community } from "@/pages/Community";
import ThreadList from "@/pages/ThreadList";
import NewThread from "@/pages/NewThread";
import ThreadDetail from "@/pages/ThreadDetail";
import BookClubs from "@/pages/BookClubs";
import NewClub from "@/pages/NewClub";
import ClubDetail from "@/pages/ClubDetail";
import Workshops from "@/pages/Workshops";
import NewWorkshop from "@/pages/NewWorkshop";
import WorkshopDetail from "@/pages/WorkshopDetail";
import Gallery from "@/pages/Gallery";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import NotFound from "@/pages/not-found";
import { SupabaseTest } from "@/components/SupabaseTest";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Community} />
      <Route path="/threads" component={ThreadList} />
      <Route path="/threads/new" component={NewThread} />
      <Route path="/threads/:id" component={ThreadDetail} />
      <Route path="/clubs" component={BookClubs} />
      <Route path="/clubs/new" component={NewClub} />
      <Route path="/clubs/:id" component={ClubDetail} />
      <Route path="/workshops" component={Workshops} />
      <Route path="/workshops/new" component={NewWorkshop} />
      <Route path="/workshops/:id" component={WorkshopDetail} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/test" component={SupabaseTest} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CommunityProvider>
          <Layout>
            <Toaster />
            <Router />
          </Layout>
        </CommunityProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
