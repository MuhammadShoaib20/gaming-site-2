'use client';

import LoginForm from '@/components/LoginForm';
import AccessKeyScreen from '@/components/AccessKeyScreen';

type Props = {
  hasAccess: boolean;
  siteName: string;
  siteLogo: string | null;
  adminPath: string;
  message?: string;
};

export default function LoginWithAccessKey({
  hasAccess,
  siteName,
  siteLogo,
  adminPath,
  message,
}: Props) {
  if (!hasAccess) {
    return <AccessKeyScreen onSuccess={() => window.location.reload()} />;
  }

  return <LoginForm siteName={siteName} siteLogo={siteLogo} adminPath={adminPath} message={message} />;
}
