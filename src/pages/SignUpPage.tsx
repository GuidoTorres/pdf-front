import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardFooter, Input, Button, Checkbox } from "@heroui/react";
import { Icon } from '@iconify/react';
import { useAuthStore } from '../stores/useAuthStore';
import { useTranslation } from 'react-i18next';

const SignUpPage: React.FC = () => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, loginWithGoogle } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validaciones
    if (password !== confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(t('passwordTooShort'));
      setIsLoading(false);
      return;
    }

    if (!agreeToTerms) {
      setError(t('mustAcceptTerms'));
      setIsLoading(false);
      return;
    }

    try {
      const success = await register(email, password, name);
      if (success) {
        navigate('/');
      } else {
        setError(t('errorCreatingAccount'));
      }
    } catch (err: any) {
      setError(err.message || t('errorCreatingAccount'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError('');

    try {
      const success = await loginWithGoogle();
      if (!success) {
        setError(t('errorSigningUpWithGoogle'));
      }
      // No necesitamos navegar aquí, el listener se encargará
    } catch (err: any) {
      setError(err.message || t('errorSigningUpWithGoogle'));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-background to-background/80">
      <Card className="w-full max-w-md bg-content1/60 backdrop-blur-md border border-divider shadow-lg">
        <CardHeader className="flex flex-col gap-1 text-center pb-6">
          <Icon icon="lucide:bar-chart-2" className="text-primary text-4xl mx-auto mb-2" />
          <h1 className="text-2xl font-bold">{t('createAccount')}</h1>
          <p className="text-sm text-foreground/80">{t('signUpToGetStarted')}</p>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardBody className="flex flex-col gap-4">
            {error && (
              <div className="bg-danger/10 border border-danger/20 rounded-lg p-3">
                <p className="text-danger text-sm">{error}</p>
              </div>
            )}
            <Input
              label={t('fullName')}
              placeholder={t('enterFullName')}
              variant="bordered"
              value={name}
              onChange={(e) => setName(e.target.value)}
              startContent={<Icon icon="lucide:user" className="text-default-400" />}
              isRequired
            />
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
              placeholder={t('createPassword')}
              type="password"
              variant="bordered"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              startContent={<Icon icon="lucide:lock" className="text-default-400" />}
              isRequired
            />
            <Input
              label={t('confirmPassword')}
              placeholder={t('confirmPassword')}
              type="password"
              variant="bordered"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              startContent={<Icon icon="lucide:lock" className="text-default-400" />}
              isRequired
            />
            <Checkbox 
              isSelected={agreeToTerms}
              onValueChange={setAgreeToTerms}
            >
              {t('agreeToTerms')} <Link to="/terms" className="text-primary">{t('termsOfService')}</Link> {t('and')}{' '}
              <Link to="/privacy" className="text-primary">{t('privacyPolicy')}</Link>
            </Checkbox>
            <Button 
              color="primary" 
              className="w-full mt-2" 
              size="lg"
              type="submit"
              isLoading={isLoading}
              isDisabled={!name || !email || !password || !confirmPassword || !agreeToTerms}
            >
              {isLoading ? t('creatingAccount') : t('signUp')}
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
              isLoading={isGoogleLoading}
              isDisabled={isLoading}
            >
              {isGoogleLoading ? t('signingIn') : t('signInWithGoogle')}
            </Button>
          </CardBody>
        </form>
        <CardFooter className="justify-center pt-0">
          <p className="text-sm text-foreground/80">
            {t('alreadyHaveAccount')} <Link to="/login" className="text-primary font-medium hover:underline">{t('login')}</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignUpPage;