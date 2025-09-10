import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Button,
  Checkbox,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useAuthStore } from "../stores/useAuthStore";
import { useTranslation } from "react-i18next";
import GoogleSignInButton from "../components/GoogleSignInButton";

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { login, loginWithGoogle, isLoading: isAuthLoading } = useAuthStore();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const success = await login(email, password);
      if (success) {
        navigate("/", { replace: true });
      } else {
        setError(t("loginPage.invalidCredentials"));
      }
    } catch (err: any) {
      setError(err.message || t("loginPage.loginError"));
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    await loginWithGoogle();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-full max-w-md bg-content1/60 backdrop-blur-md border border-divider shadow-lg">
          <CardHeader className="flex flex-col gap-1 text-center pb-6">
            <Icon
              icon="lucide:bar-chart-2"
              className="text-primary text-4xl mx-auto mb-2"
            />
            <h1 className="text-2xl font-bold">{t("loginPage.welcome")}</h1>
            <p className="text-sm text-foreground/80">{t("loginPage.loginToAccount")}</p>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardBody className="flex flex-col gap-4">
              {error && (
                <div className="bg-danger/10 border border-danger/20 rounded-lg p-3">
                  <p className="text-danger text-sm">{error}</p>
                </div>
              )}
              <Input
                label={t("loginPage.email")}
                placeholder={t("loginPage.enterEmail")}
                type="email"
                variant="bordered"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                startContent={
                  <Icon icon="lucide:mail" className="text-default-400" />
                }
                isRequired
              />
              <Input
                label={t("loginPage.password")}
                placeholder={t("loginPage.enterPassword")}
                type="password"
                variant="bordered"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                startContent={
                  <Icon icon="lucide:lock" className="text-default-400" />
                }
                isRequired
              />
              <div className="flex justify-between items-center">
                <Checkbox isSelected={rememberMe} onValueChange={setRememberMe}>
                  {t("loginPage.rememberMe")}
                </Checkbox>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  {t("loginPage.forgotPassword")}
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
                {isAuthLoading ? t("loginPage.loggingIn") : t("loginPage.login")}
              </Button>
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-divider"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-content1 px-2 text-foreground/50">
                    {t("loginPage.orContinueWith")}
                  </span>
                </div>
              </div>
              <GoogleSignInButton
                text={t("loginPage.signInWithGoogle")}
                disabled={isAuthLoading}
                onSuccess={(data) => {
                  console.log("Google sign-in successful:", data);
                  navigate("/dashboard");
                }}
                onError={(error) => {
                  console.error("Google sign-in error:", error);
                  setError("Google sign-in failed. Please try again.");
                }}
              />
            </CardBody>
          </form>
          <CardFooter className="justify-center pt-0">
            <p className="text-sm text-foreground/80">
              {t("loginPage.noAccount")}{" "}
              <Link
                to="/signup"
                className="text-primary font-medium hover:underline"
              >
                {t("loginPage.signUp")}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
