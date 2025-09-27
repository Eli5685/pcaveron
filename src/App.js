import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CatalogPage from './pages/CatalogPage';
import ProductPage from './pages/ProductPage';
import AboutPage from './pages/AboutPage';
import { diagnosticEnv } from './utils/envDiagnostic';
import './styles/App.css';
import Footer from './components/Footer/Footer';
import Navigation from './components/Navigation/Navigation';

function App() {
  const [isWebApp, setIsWebApp] = useState(false);
  const [tg, setTg] = useState(null);

  useEffect(() => {
    // Run environment diagnostic
    diagnosticEnv();
    
    // Check if running as Telegram Mini App
    if (window.Telegram?.WebApp) {
      const webapp = window.Telegram.WebApp;
      setTg(webapp);
      setIsWebApp(true);
      webapp.ready();
      webapp.expand();
      
      // Set theme
      document.body.style.backgroundColor = webapp.themeParams.bg_color || '#ffffff';
    } else {
      // Running as standalone web app
      setIsWebApp(false);
      console.log('Running as standalone web application');
    }
  }, []);

  return (
    <div className="App">
      <Router>
        <Navigation isWebApp={isWebApp} />
        <main
          className={`app-shell ${isWebApp ? 'app-shell--webapp' : 'app-shell--standalone'}`}
          role="main"
        >
          <Routes>
            <Route path="/" element={<CatalogPage tg={tg} isWebApp={isWebApp} />} />
            <Route path="/product/:id" element={<ProductPage tg={tg} isWebApp={isWebApp} />} />
            <Route path="/about" element={<AboutPage tg={tg} isWebApp={isWebApp} />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </div>
  );
}

export default App;