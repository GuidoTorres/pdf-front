import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { ThemeToggle } from './theme-toggle';
import LanguageToggle from './LanguageToggle';

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80 text-foreground">
      {/* Minimal header for auth pages */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-md border-b border-divider">
        <div className="flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center">
            <Icon icon="lucide:bar-chart-2" className="text-primary text-2xl mr-2" />
            <span className="font-bold text-xl">StatementAI</span>
          </Link>
          <div className="flex items-center gap-x-4">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main content area */}
      <main className="pt-20 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;