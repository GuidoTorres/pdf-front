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
      setError(t('signUpPage.passwordsMismatch'));
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(t('signUpPage.passwordTooShort'));
      setIsLoading(false);
      return;
    }

    if (!agreeToTerms) {
      setError(t('signUpPage.mustAcceptTerms'));
      setIsLoading(false);
      return;
    }

    try {
      const success = await register(email, password, name);
      if (success) {
        navigate('/');
      } else {
        setError(t('signUpPage.errorCreatingAccount'));
      }
    } catch (err: any) {
      setError(err.message || t('signUpPage.errorCreatingAccount'));
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
        setError(t('signUpPage.googleSignUpError'));
      }
      // No necesitamos navegar aquí, el listener se encargará
    } catch (err: any) {
      setError(err.message || t('signUpPage.googleSignUpError'));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-background to-background/80 px-4 overflow-x-hidden">
      <Card className="w-full max-w-md bg-content1/60 backdrop-blur-md border border-divider shadow-lg overflow-hidden">
        <CardHeader className="flex flex-col gap-1 text-center pb-6">
          <Icon icon="lucide:bar-chart-2" className="text-primary text-4xl mx-auto mb-2" />
          <h1 className="text-2xl font-bold">{t('signUpPage.createAccount')}</h1>
          <p className="text-sm text-foreground/80">{t('signUpPage.getStarted')}</p>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardBody className="flex flex-col gap-4 overflow-x-hidden px-6">
            {error && (
              <div className="bg-danger/10 border border-danger/20 rounded-lg p-3">
                <p className="text-danger text-sm">{error}</p>
              </div>
            )}
            <Input
              label={t('signUpPage.name')}
              placeholder={t('signUpPage.enterName')}
              variant="bordered"
              value={name}
              onChange={(e) => setName(e.target.value)}
              startContent={<Icon icon="lucide:user" className="text-default-400" />}
              isRequired
            />
            <Input
              label={t('signUpPage.email')}
              placeholder={t('signUpPage.enterEmail')}
              type="email"
              variant="bordered"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              startContent={<Icon icon="lucide:mail" className="text-default-400" />}
              isRequired
            />
            <Input
              label={t('signUpPage.password')}
              placeholder={t('signUpPage.createPassword')}
              type="password"
              variant="bordered"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              startContent={<Icon icon="lucide:lock" className="text-default-400" />}
              isRequired
            />
            <Input
              label={t('signUpPage.confirmPassword')}
              placeholder={t('signUpPage.confirmPassword')}
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
              className="items-start"
            >
              <div className="text-sm text-wrap break-words leading-relaxed">
                {t('signUpPage.agreeTo')}{' '}
                <Link to="/terms" className="text-primary hover:underline">
                  {t('signUpPage.terms')}
                </Link>{' '}
                {t('signUpPage.and')}{' '}
                <Link to="/privacy" className="text-primary hover:underline">
                  {t('signUpPage.privacy')}
                </Link>
              </div>
            </Checkbox>
            <Button 
              color="primary" 
              className="w-full mt-2" 
              size="lg"
              type="submit"
              isLoading={isLoading}
              isDisabled={!name || !email || !password || !confirmPassword || !agreeToTerms}
            >
              {isLoading ? t('signUpPage.creatingAccount') : t('signUpPage.signUp')}
            </Button>
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-divider"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-content1 px-2 text-foreground/50">{t('signUpPage.orContinueWith')}</span>
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
              {isGoogleLoading ? t('signUpPage.signingUp') : t('signUpPage.signUpWithGoogle')}
            </Button>
          </CardBody>
        </form>
        <CardFooter className="justify-center pt-0">
          <p className="text-sm text-foreground/80 text-center text-wrap break-words">
            {t('signUpPage.haveAccount')}{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              {t('signUpPage.login')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignUpPage;