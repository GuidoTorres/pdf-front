import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button, Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Tooltip } from "@heroui/react";
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from './theme-toggle';
import { useAuthStore } from '../stores/useAuthStore';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const sidebarItems = [
    { label: t('layout.sidebar.dashboard'), icon: 'lucide:layout-dashboard', href: '/' },
    { label: t('layout.sidebar.history'), icon: 'lucide:history', href: '/history' },
    { label: t('layout.sidebar.pricing'), icon: 'lucide:tag', href: '/pricing' },
    { label: t('layout.sidebar.settings'), icon: 'lucide:settings', href: '/settings' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80 text-foreground">
      {/* Full-width Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-md border-b border-divider">
        <div className="flex items-center justify-between px-6 h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Icon icon="lucide:bar-chart-2" className="text-primary text-3xl" />
              <span className="font-bold text-xl ml-2">StatementAI</span>
            </Link>
          </div>

          <div className="flex items-center gap-x-4">
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button isIconOnly variant="light">
                  <Icon icon="lucide:languages" className="text-2xl" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Language selection" onAction={(key) => i18n.changeLanguage(key as string)}>
                <DropdownItem key="en">English</DropdownItem>
                <DropdownItem key="es">Español</DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <ThemeToggle />

            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  isBordered
                  as="button"
                  className="transition-transform"
                  color="primary"
                  name={user?.name || user?.email || 'User'}
                  size="sm"
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="profile" className="h-14 gap-2">
                  <p className="font-semibold">{t('layout.profileMenu.signedInAs')}</p>
                  <p className="font-semibold">{user?.email}</p>
                </DropdownItem>
                <DropdownItem key="settings">{t('layout.profileMenu.settings')}</DropdownItem>
                <DropdownItem key="help_and_feedback">{t('layout.profileMenu.helpAndFeedback')}</DropdownItem>
                <DropdownItem key="logout" color="danger" onClick={handleLogout}>
                  {t('layout.profileMenu.logout')}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <div
          className={`fixed top-16 left-0 bottom-12 bg-background/60 backdrop-blur-md border-r border-divider transition-all duration-300 ease-in-out z-40 ${
            isSidebarCollapsed ? 'w-20' : 'w-48'
          }`}
        >
          <div className="flex flex-col h-full">
            <nav className="flex-1 py-10 px-2 space-y-2">
              {sidebarItems.map((item) => (
                <Tooltip content={item.label} placement="right" isDisabled={!isSidebarCollapsed} key={item.href}>
                  <Link
                    to={item.href}
                    className={`flex items-center py-2.5 rounded-lg text-foreground/80 hover:text-foreground hover:bg-primary/10 transition-all duration-200 ${
                      location.pathname === item.href ? 'bg-primary/10 text-primary font-semibold' : ''
                    } ${
                      isSidebarCollapsed ? 'justify-center' : 'px-4'
                    }`}
                  >
                    <Icon icon={item.icon} className={`text-2xl ${!isSidebarCollapsed ? 'mr-4' : ''}`} />
                    {!isSidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                </Tooltip>
              ))}
            </nav>

            <div className="border-t border-divider p-4">
              <Button
                isIconOnly
                variant="light"
                onPress={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="w-full"
              >
                <Icon icon={isSidebarCollapsed ? 'lucide:arrow-right-to-line' : 'lucide:arrow-left-to-line'} className="text-2xl" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ease-in-out p-6 pb-16 ${
          isSidebarCollapsed ? 'ml-20' : 'ml-48'
        }`}>
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-background/60 backdrop-blur-md border-t border-divider z-50">
        <div className="flex items-center justify-center px-6 h-12">
          <div className="flex items-center gap-x-6 text-sm">
            <Link to="/terms" className="text-foreground/80 hover:text-foreground">{t('layout.footer.terms')}</Link>
            <Link to="/privacy" className="text-foreground/80 hover:text-foreground">{t('layout.footer.privacy')}</Link>
            <Link to="/refund" className="text-foreground/80 hover:text-foreground">{t('layout.footer.refund')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
