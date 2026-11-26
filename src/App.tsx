import { Route, Routes } from 'react-router-dom';
import { SiteHeader } from './components/SiteHeader';
import { SiteFooter } from './components/SiteFooter';
import { ScrollManager } from './components/ScrollManager';
import { HomePage } from './pages/HomePage';
import { CasesPage } from './pages/CasesPage';
import { CaseDetailPage } from './pages/CaseDetailPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <div className="app">
      <a className="skip-link" href="#main-content">
        跳到主要内容
      </a>
      <ScrollManager />
      <SiteHeader />
      <div id="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cases" element={<CasesPage />} />
          <Route path="/cases/:slug" element={<CaseDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
      <SiteFooter />
    </div>
  );
}
