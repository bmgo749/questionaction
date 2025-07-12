import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Router, Route } from "wouter";
import Home from "@/pages/Home";
import Categories from "@/pages/Categories";
import Trending from "@/pages/Trending";
import Question from "@/pages/Question";
import Market from "@/pages/Market";
import Category from "@/pages/Category";
import CreateArticle from "@/pages/CreateArticle";
import Article from "@/pages/Article";
import Profile from "@/pages/Profile";
import PublicProfile from "@/pages/PublicProfile";
import IQTest from "@/pages/IQTest";
import HelpCenter from "@/pages/HelpCenter";
import TermsOfService from "@/pages/TermsOfService";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import CookiePolicy from "@/pages/CookiePolicy";

import AuthPage from "@/pages/auth-page";
import PagePosts from "@/pages/PagePosts";
import PageCreate from "@/pages/PageCreate";
import PagePostView from "@/pages/PagePostView";
import Database from "@/pages/Database";
import Guilds from "@/pages/Guilds";
import GuildDetail from "@/pages/GuildDetail";
import PostGuild from "@/pages/PostGuild";
import ResetPassword from "@/pages/ResetPassword";
import NotFound from "@/pages/NotFound";
import { SecureRouteHandler } from "@/components/SecureRouteHandler";
import { RedirectToSecure } from "@/components/RedirectToSecure";



function AppRouter() {
  return (
    <Router>
      {/* Secure routes - handled by SecureRouter component */}
      <Route path="/v2/*">
        <SecureRouteHandler />
      </Route>
      
      {/* Standard routes - will auto-redirect to secure format */}
      <Route path="/"><RedirectToSecure path="/" /></Route>
      <Route path="/categories"><RedirectToSecure path="/categories" /></Route>
      <Route path="/trending"><RedirectToSecure path="/trending" /></Route>
      <Route path="/question"><RedirectToSecure path="/question" /></Route>
      <Route path="/market"><RedirectToSecure path="/market" /></Route>
      <Route path="/auth"><RedirectToSecure path="/auth" /></Route>
      <Route path="/profile"><RedirectToSecure path="/profile" /></Route>
      <Route path="/user/:userId"><RedirectToSecure path="/user/:userId" /></Route>
      <Route path="/iq-test"><RedirectToSecure path="/iq-test" /></Route>
      <Route path="/page"><RedirectToSecure path="/page" /></Route>
      <Route path="/page-create"><RedirectToSecure path="/page-create" /></Route>
      <Route path="/database"><RedirectToSecure path="/database" /></Route>
      <Route path="/guilds"><RedirectToSecure path="/guilds" /></Route>
      <Route path="/guild/:id"><RedirectToSecure path="/guild/:id" /></Route>
      <Route path="/postguild"><RedirectToSecure path="/postguild" /></Route>
      <Route path="/reset-password"><RedirectToSecure path="/reset-password" /></Route>
      <Route path="/category/:slug"><RedirectToSecure path="/category/:slug" /></Route>
      <Route path="/create-article"><RedirectToSecure path="/create-article" /></Route>
      <Route path="/article/:id"><RedirectToSecure path="/article/:id" /></Route>
      <Route path="/help-center"><RedirectToSecure path="/help-center" /></Route>
      <Route path="/terms-of-service"><RedirectToSecure path="/terms-of-service" /></Route>
      <Route path="/privacy-policy"><RedirectToSecure path="/privacy-policy" /></Route>
      <Route path="/cookie-policy"><RedirectToSecure path="/cookie-policy" /></Route>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <AppRouter />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
