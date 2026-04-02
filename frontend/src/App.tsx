import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/Landing';
import { LoginPage } from './pages/Login';
import { NotImplementedPage } from './pages/NotImplemented';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="*" element={<NotImplementedPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
