import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardFooter, Input, Button, Checkbox } from "@heroui/react";
import { Icon } from '@iconify/react';
import { useAuthStore } from '../stores/useAuthStore';
import { useTranslation } from 'react-i18next';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { login, loginWithGoogle, isLoading: isAuthLoading } = useAuthStore();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/', { replace: true });
      } else {
        setError(t('invalidCredentials'));
      }
    } catch (err: any) {
      setError(err.message || t('loginError'));
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    await loginWithGoogle();
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-background to-background/80">
      <Card className="w-full max-w-md bg-content1/60 backdrop-blur-md border border-divider shadow-lg">
        <CardHeader className="flex flex-col gap-1 text-center pb-6">
          <Icon icon="lucide:bar-chart-2" className="text-primary text-4xl mx-auto mb-2" />
          <h1 className="text-2xl font-bold">{t('welcome')}</h1>
          <p className="text-sm text-foreground/80">{t('loginToAccount')}</p>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardBody className="flex flex-col gap-4">
            {error && (
              <div className="bg-danger/10 border border-danger/20 rounded-lg p-3">
                <p className="text-danger text-sm">{error}</p>
              </div>
            )}
            <Input
              label={t('email')}
              placeholder={t('enterEmail')}
              type="email"
              variant="bordered"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              startContent={<Icon icon="lucide:mail" className="text-default-400" />}
              isRequired
            />
            <Input
              label={t('password')}
              placeholder={t('enterPassword')}
              type="password"
              variant="bordered"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              startContent={<Icon icon="lucide:lock" className="text-default-400" />}
              isRequired
            />
            <div className="flex justify-between items-center">
              <Checkbox 
                isSelected={rememberMe}
                onValueChange={setRememberMe}
              >
                {t('rememberMe')}
              </Checkbox>
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                {t('forgotPassword')}
              </Link>
            </div>
            <Button 
              color="primary" 
              className="w-full mt-2" 
              size="lg"
              type="submit"
              isLoading={isAuthLoading}
              isDisabled={!email || !password || isAuthLoading}
            >
              {isAuthLoading ? t('loggingIn') : t('login')}
            </Button>
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-divider"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-content1 px-2 text-foreground/50">{t('orContinueWith')}</span>
              </div>
            </div>
            <Button 
              variant="bordered" 
              className="w-full" 
              startContent={<Icon icon="logos:google-icon" />}
              onClick={handleGoogleSignIn}
              isLoading={isAuthLoading}
              isDisabled={isAuthLoading}
            >
              {isAuthLoading ? t('signingIn') : t('signInWithGoogle')}
            </Button>
          </CardBody>
        </form>
        <CardFooter className="justify-center pt-0">
          <p className="text-sm text-foreground/80">
            {t('noAccount')} <Link to="/signup" className="text-primary font-medium hover:underline">{t('signUp')}</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;