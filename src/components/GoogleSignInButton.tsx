import { useGoogleLogin } from '@react-oauth/google';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import React from 'react';
import { useAuthStore } from '../stores/useAuthStore';

interface GoogleSignInButtonProps {
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
  text?: string;
  disabled?: boolean;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  onError,
  text = 'Continue with Google',
  disabled = false,
}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const handleGoogleLoginSuccess = useAuthStore(
    (state) => state.handleGoogleLoginSuccess
  );

  // Check if Google OAuth is available
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isGoogleAvailable = GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'your-google-client-id.apps.googleusercontent.com';

  let login: (() => void) | null = null;

  // Only initialize useGoogleLogin if Google is available
  if (isGoogleAvailable) {
    try {
      login = useGoogleLogin({
        onSuccess: async (codeResponse) => {
          setIsLoading(true);
          try {
            const result = await fetch(
              `${import.meta.env.VITE_API_URL}/auth/google-callback`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: codeResponse.code }),
              }
            );

            if (!result.ok) {
              const errorText = await result.text();
              console.error('Backend error:', result.status, errorText);
              throw new Error(`Backend error: ${result.status} - ${errorText}`);
            }

            const data = await result.json();

            if (data.success) {
              handleGoogleLoginSuccess(data);
              onSuccess?.(data);
            } else {
              throw new Error(data.error || 'Google authentication failed');
            }
          } catch (error) {
            console.error('Google auth error:', error);
            onError?.(error);
          } finally {
            setIsLoading(false);
          }
        },
        flow: 'auth-code',
      });
    } catch (error) {
      console.warn('Google OAuth not available:', error);
    }
  }

  // Don't render if Google OAuth is not available
  if (!isGoogleAvailable) {
    return null;
  }

  return (
    <Button
      variant="bordered"
      size="lg"
      fullWidth
      isLoading={isLoading}
      isDisabled={disabled}
      onClick={() => login && login()}
      startContent={
        !isLoading && <Icon icon="logos:google-icon" className="text-lg" />
      }
      className="font-medium border-default-200 hover:border-default-300"
    >
      {text}
    </Button>
  );
};

export default GoogleSignInButton;
