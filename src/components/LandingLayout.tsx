import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from './theme-toggle';
import LanguageToggle from './LanguageToggle';
import { Footer } from './sections/footer'; // Re-using the footer from the landing page

const LandingLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();

  const navLinks = [
    { name: t('layout.nav.home', 'Home'), href: '#hero' },
    { name: t('layout.nav.features', 'Features'), href: '#features' },
    { name: t('layout.nav.howItWorks', 'How it works'), href: '#how-it-works' },
    { name: t('layout.nav.pricing', 'Pricing'), href: '#pricing' },
  ];

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    const href = e.currentTarget.href;
    const targetId = href.replace(/.*#/, "");
    const elem = document.getElementById(targetId);
    elem?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80 text-foreground">
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-md border-b border-divider">
        <div className="flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center">
            <Icon icon="lucide:bar-chart-2" className="text-primary text-2xl mr-2" />
            <span className="font-bold text-xl">StatementAI</span>
          </Link>
          <div className="hidden md:flex items-center gap-x-8">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} onClick={handleScroll} className="text-foreground/80 hover:text-foreground">
                {link.name}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-x-4">
            <LanguageToggle />
            <ThemeToggle />
            <Link to="/login">
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
                {t('layout.nav.login', 'Login')}
              </button>
            </Link>
          </div>
        </div>
      </div>

      <main className="pt-20">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default LandingLayout;
