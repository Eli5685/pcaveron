import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';

const Page = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #0a0a0a;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  background: #000;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const BackLink = styled(Link)`
  color: #fff;
  text-decoration: none;
  padding: 10px 14px;
  border-radius: 10px;
  background: #111;
  border: 1px solid #222;
  font-weight: 700;
  transition: opacity .15s ease;
  &:hover { opacity: .9; }
`;

const Frame = styled.iframe`
  width: 100%;
  height: calc(100vh - 56px);
  border: 0;
  display: block;
  background: #000;
`;

const AboutPage = () => {
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  useEffect(() => {
    const handler = (event) => {
      if (event?.data === 'goToCatalog' || event?.data?.type === 'goToCatalog') {
        navigate('/');
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [navigate]);

  useEffect(() => {
    const wire = () => {
      const iframe = iframeRef.current;
      if (!iframe) return;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;

      const attachHandlers = () => {
        const candidates = Array.from(doc.querySelectorAll('a, button, [role="button"]'));
        candidates.forEach((el) => {
          const text = (el.textContent || '').trim().toLowerCase();
          if (!text) return;
          if (text.includes('открыть каталог')) {
            if (!el.__averonWired) {
              el.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate('/');
              });
              el.__averonWired = true;
              if (el.tagName === 'A') {
                el.setAttribute('href', '/');
                el.removeAttribute('target');
                el.removeAttribute('rel');
              }
            }
          }
        });
      };

      const removeFooter = () => {
        try {
          const footers = Array.from(doc.querySelectorAll('footer, [role="contentinfo"]'));
          footers.forEach((f) => f.remove());
          const nodes = Array.from(doc.querySelectorAll('body *'));
          nodes.forEach((el) => {
            const raw = (el.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
            if (!raw) return;
            if (raw.includes('©') && raw.includes('averon') && raw.includes('все права защищены')) {
              el.remove();
            }
          });
        } catch {}
      };

      attachHandlers();
      removeFooter();

      const observer = new MutationObserver(() => {
        attachHandlers();
        removeFooter();
      });
      if (doc.body) {
        observer.observe(doc.body, { childList: true, subtree: true });
      }

      iframe.__averonObserver = observer;
    };

    const iframe = iframeRef.current;
    if (!iframe) return;
    const onLoad = () => wire();
    iframe.addEventListener('load', onLoad);

    // If already loaded
    if (iframe.contentDocument?.readyState === 'complete') {
      wire();
    }

    return () => {
      iframe.removeEventListener('load', onLoad);
      const obs = iframe.__averonObserver;
      if (obs) {
        try { obs.disconnect(); } catch {}
      }
    };
  }, [navigate]);

  return (
    <Page>
      <TopBar>
        <BackLink to="/">← К каталогу</BackLink>
      </TopBar>
      <Frame ref={iframeRef} src="/about-us/index.html" title="О нас" />
    </Page>
  );
};

export default AboutPage;
