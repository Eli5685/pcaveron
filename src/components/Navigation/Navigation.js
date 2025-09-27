import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const NavContainer = styled.nav`
  display: none;

  @media (min-width: 1024px) {
    display: block;
    position: sticky;
    top: 0;
    z-index: 120;
    background: rgba(8, 12, 24, 0.78);
    backdrop-filter: blur(16px) saturate(160%);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 24px 48px rgba(8, 12, 24, 0.42);
  }
`;

const NavContent = styled.div`
  max-width: min(1520px, calc(100% - 120px));
  margin: 0 auto;
  padding: 24px 32px;
  display: grid;
  grid-template-columns: minmax(220px, auto) 1fr auto;
  align-items: center;
  column-gap: 48px;
`;

const Brand = styled(Link)`
  text-decoration: none;
  color: #f8fbff;
  display: grid;
  row-gap: 6px;
  text-transform: uppercase;
  letter-spacing: 0.28em;
  transition: transform 0.2s ease, opacity 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    opacity: 0.92;
  }
`;

const BrandTitle = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.34em;
`;

const BrandSubtitle = styled.span`
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.42em;
  opacity: 0.65;
`;

const PrimaryNav = styled.div`
  display: grid;
  grid-auto-flow: column;
  gap: 16px;
  align-items: center;
  justify-content: start;
`;

const PrimaryLink = styled(Link)`
  color: rgba(244, 248, 255, 0.92);
  text-decoration: none;
  padding: 12px 26px;
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  border: 1px solid transparent;
  transition: all 0.25s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.28);
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 16px 36px rgba(8, 12, 24, 0.32);
  }

  &.active {
    background: rgba(255, 255, 255, 0.18);
    border-color: rgba(255, 255, 255, 0.35);
    color: #ffffff;
    box-shadow: 0 20px 42px rgba(8, 12, 24, 0.42);
  }
`;

const AuxControls = styled.div`
  display: grid;
  row-gap: 6px;
  justify-items: end;
  color: rgba(209, 218, 232, 0.82);
`;

const AuxTag = styled.span`
  font-size: 0.75rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
`;

const AuxLink = styled.a`
  color: #9cd1ff;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  letter-spacing: 0.06em;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.85;
  }
`;

const Navigation = ({ isWebApp }) => {
  const location = useLocation();

  if (isWebApp) {
    return null;
  }

  return (
    <NavContainer role="navigation" aria-label="Главная навигация">
      <NavContent>
        <Brand to="/" aria-label="Вернуться на главную страницу каталога">
          <BrandTitle>Averon</BrandTitle>
          <BrandSubtitle>Commerce Desk</BrandSubtitle>
        </Brand>

        <PrimaryNav role="menubar" aria-label="Основные разделы сайта">
          <PrimaryLink
            to="/"
            role="menuitem"
            className={location.pathname === '/' ? 'active' : ''}
          >
            Каталог
          </PrimaryLink>
          <PrimaryLink
            to="/about"
            role="menuitem"
            className={location.pathname === '/about' ? 'active' : ''}
          >
            О компании
          </PrimaryLink>
        </PrimaryNav>

        <AuxControls>
          <AuxTag>служба поддержки</AuxTag>
          <AuxLink
            href="https://t.me/averon_support"
            target="_blank"
            rel="noopener noreferrer"
          >
            t.me/averon_support
          </AuxLink>
        </AuxControls>
      </NavContent>
    </NavContainer>
  );
};

export default Navigation;
