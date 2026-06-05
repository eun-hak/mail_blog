import { BrowserRouter, Routes, Route } from "react-router-dom";
import { EmailProvider } from "./context/EmailContext";
import { Layout } from "./components/layout/Layout";
import { HomePage } from "./pages/HomePage";
import { ArticlePage } from "./pages/ArticlePage";
import { CategoryPage } from "./pages/CategoryPage";
import { SearchPage } from "./pages/SearchPage";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { SubscribePage } from "./pages/SubscribePage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { TermsPage } from "./pages/TermsPage";

export default function App() {
  return (
    <BrowserRouter>
      <EmailProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="article/:id" element={<ArticlePage />} />
            <Route path="category/:slug" element={<CategoryPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="subscribe" element={<SubscribePage />} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="terms" element={<TermsPage />} />
          </Route>
        </Routes>
      </EmailProvider>
    </BrowserRouter>
  );
}
