import { ChakraProvider, Text, useToast } from '@chakra-ui/react';
import {
  Hydrate,
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import { useState } from 'react';
import { FetchError } from '../src/api/utils';
import { AuthProvider } from '../src/Hooks/useAuth';

function MyApp({
  Component,
  pageProps,
}: AppProps<{ dehydratedState: Record<string, unknown> }>) {
  const toast = useToast();

  function showFetchErrorToast(error: FetchError) {
    toast({
      title: 'Something went wrong',
      description: (
        <>
          <Text>Network error: {error.message}</Text>
          <Text>
            Please check your internet connection or contact our support
          </Text>
        </>
      ),
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  }

  const [queryClient] = useState(
    () =>
      new QueryClient({
        mutationCache: new MutationCache({
          onError: (error) => {
            if (error instanceof FetchError) {
              showFetchErrorToast(error);
            }
          },
        }),
        queryCache: new QueryCache({
          onError: (error) => {
            if (error instanceof FetchError) {
              showFetchErrorToast(error);
            }
          },
        }),
      })
  );

  return (
    <ChakraProvider>
      <QueryClientProvider client={queryClient}>
        <Hydrate state={pageProps.dehydratedState}>
          <AuthProvider>
            <Component {...pageProps} />
          </AuthProvider>
        </Hydrate>
      </QueryClientProvider>
    </ChakraProvider>
  );
}

export default MyApp;
