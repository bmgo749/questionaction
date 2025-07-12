import { useLocation } from 'wouter';
import { extractOriginalPath } from '@/lib/security';
import Home from "@/pages/Home";
import Categories from "@/pages/Categories";
import Trending from "@/pages/Trending";
import Question from "@/pages/Question";
import Market from "@/pages/Market";
import Profile from "@/pages/Profile";
import IQTest from "@/pages/IQTest";
import PagePosts from "@/pages/PagePosts";
import PageCreate from "@/pages/PageCreate";
import PagePostView from "@/pages/PagePostView";
import Database from "@/pages/Database";
import Guilds from "@/pages/Guilds";
import GuildDetail from "@/pages/GuildDetail";
import PostGuild from "@/pages/PostGuild";
import ResetPassword from "@/pages/ResetPassword";
import Category from "@/pages/Category";
import CreateArticle from "@/pages/CreateArticle";
import Article from "@/pages/Article";
import PublicProfile from "@/pages/PublicProfile";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/NotFound";
import HelpCenter from "@/pages/HelpCenter";
import TermsOfService from "@/pages/TermsOfService";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import CookiePolicy from "@/pages/CookiePolicy";

export function SecureRouteHandler() {
  const [location] = useLocation();

  // Parse URL to extract both code and path
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const errorCode = urlParams.get('errorCode');

  // Get the real path from hash fragment (new format) or extract from code (old format)
  let realPath = '/';

  if (window.location.hash.startsWith('#')) {
    // New format: path is in hash fragment
    const hashPath = window.location.hash.slice(1);
    realPath = hashPath ? (hashPath.startsWith('/') ? hashPath : `/${hashPath}`) : '/';
  } else if (code && !errorCode) {
    // Old format: path might be embedded in code parameter
    const pathMatch = code.match(/^[^\/]+\/(.*)$/);
    if (pathMatch) {
      realPath = '/' + pathMatch[1];
    }
  }

  console.log(`🔒 SecureRouteHandler: location=${location}, code=${code}, errorCode=${errorCode}, hash=${window.location.hash}, realPath=${realPath}`);

  // Route the extracted path to the appropriate component
  if (realPath === '/') {
    return <Home />;
  } else if (realPath === '/categories') {
    return <Categories />;
  } else if (realPath === '/trending') {
    return <Trending />;
  } else if (realPath === '/question') {
    return <Question />;
  } else if (realPath === '/market') {
    return <Market />;
  } else if (realPath === '/profile') {
    return <Profile />;
  } else if (realPath === '/iq-test') {
    return <IQTest />;
  } else if (realPath === '/page') {
    return <PagePosts />;
  } else if (realPath === '/page-create') {
    return <PageCreate />;
  } else if (realPath.startsWith('/page-post/')) {
    const postId = realPath.split('/page-post/')[1];
    return <PagePostView postId={postId} />;
  } else if (realPath === '/database') {
    return <Database />;
  } else if (realPath === '/guilds') {
    return <Guilds />;
  } else if (realPath.startsWith('/guild/')) {
    return <GuildDetail />;
  } else if (realPath.startsWith('/postguild')) {
    return <PostGuild />;
  } else if (realPath === '/reset-password') {
    return <ResetPassword />;
  } else if (realPath.startsWith('/category/')) {
    const slug = realPath.split('/category/')[1];
    return <Category slug={slug} />;
  } else if (realPath === '/create-article') {
    return <CreateArticle />;
  } else if (realPath.startsWith('/article/')) {
    const articleId = realPath.split('/article/')[1];
    return <Article id={parseInt(articleId)} />;
  } else if (realPath.startsWith('/user/')) {
    const userId = realPath.split('/user/')[1];
    return <PublicProfile userId={userId} />;
  } else if (realPath === '/auth' || realPath === '/login' || realPath === '/register') {
    return <AuthPage />;
  } else if (realPath === '/help-center') {
    return <HelpCenter />;
  } else if (realPath === '/terms-of-service') {
    return <TermsOfService />;
  } else if (realPath === '/privacy-policy') {
    return <PrivacyPolicy />;
  } else if (realPath === '/cookie-policy') {
    return <CookiePolicy />;
  } else {
    return <NotFound />;
  }
}