import { Box, Center, Container, Spinner } from '@chakra-ui/react';
import { PropsWithChildren } from 'react';
import { useAuth } from '../Hooks/useAuth';
import { Navbar } from './Navbar';

function Loading() {
  return (
    <Center bgColor="gray.100" minHeight="100vh">
      <Spinner size="xl" color="blue.500" />
    </Center>
  );
}

function AuthLayout({ children }: PropsWithChildren) {
  return (
    <Box pt="64px" bgColor="gray.100">
      <Navbar />
      {children}
    </Box>
  );
}

function GuestLayout({ children }: PropsWithChildren) {
  return <Box bgColor="gray.100">{children}</Box>;
}

export function Layout({
  children,
  isLoginPage = false,
}: PropsWithChildren<{ isLoginPage?: boolean }>) {
  const [{ authState }] = useAuth();

  switch (authState) {
    case 'PENDING': {
      return <Loading />;
    }
    case 'AUTHENTICATED': {
      if (isLoginPage) return <Loading />;
      return <AuthLayout>{children}</AuthLayout>;
    }
    default:
      if (!isLoginPage) return <Loading />;
      return <GuestLayout>{children}</GuestLayout>;
  }
}
