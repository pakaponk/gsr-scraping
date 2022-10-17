import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  CloseButton,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import type { NextPage } from 'next';
import { useState } from 'react';
import { SignupForm } from '../src/Components/SignupForm';

function LoginForm() {
  return (
    <Stack as="form" spacing={4} width="full">
      <FormControl>
        <FormLabel htmlFor="email">Email address</FormLabel>
        <Input type="email" name="email" placeholder="Email" />
      </FormControl>
      <FormControl>
        <FormLabel htmlFor="password">Password</FormLabel>
        <Input type="password" name="password" placeholder="Password" />
      </FormControl>
      <Button type="submit" variant="solid" colorScheme="blue">
        Sign in
      </Button>
    </Stack>
  );
}

type SuccessSignupAlertProps = {
  onClose: () => void;
};

function SuccessSignupAlert({ onClose }: SuccessSignupAlertProps) {
  return (
    <Alert status="success" borderRadius="8px">
      <AlertIcon />
      <Box flexGrow={1}>
        <AlertTitle>Success!</AlertTitle>
        <AlertDescription>
          Your account have been created successfuly
        </AlertDescription>
      </Box>
      <CloseButton
        alignSelf="flex-start"
        position="relative"
        right="-1"
        top="-1"
        onClick={onClose}
      />
    </Alert>
  );
}

const Home: NextPage = () => {
  const [formState, setFormState] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');

  const {
    isOpen: isSignupAlertShown,
    onOpen: showSignupAlert,
    onClose: closeSignupAlert,
  } = useDisclosure({
    defaultIsOpen: false,
  });

  const headingLabel =
    formState === 'LOGIN' ? 'Sign in to your account' : 'Create a new account';
  const toggleFormLabel =
    formState === 'LOGIN'
      ? 'create a new account'
      : 'sign in with an existing account';

  const toggleForm = () => {
    setFormState((state) => (state === 'LOGIN' ? 'SIGNUP' : 'LOGIN'));
  };

  return (
    <Flex direction="column" bgColor="gray.100">
      <Container display="flex" minH="100vh">
        <VStack
          spacing="8"
          justifyContent="center"
          alignItems="center"
          flexGrow="1"
        >
          {isSignupAlertShown && (
            <SuccessSignupAlert onClose={closeSignupAlert} />
          )}
          <VStack spacing="2">
            <Heading textAlign="center">{headingLabel}</Heading>
            <Text>
              or{' '}
              <Button variant="link" colorScheme="blue" onClick={toggleForm}>
                {toggleFormLabel}
              </Button>
            </Text>
          </VStack>
          <Flex
            minWidth={{ base: 'calc(100vw - 32px)', sm: '400px' }}
            p={8}
            bgColor="white"
            shadow="md"
            borderRadius="8px"
          >
            {formState === 'LOGIN' && <LoginForm />}
            {formState === 'SIGNUP' && (
              <SignupForm
                onSuccess={() => {
                  setFormState('LOGIN');
                  showSignupAlert();
                }}
              />
            )}
          </Flex>
        </VStack>
      </Container>
    </Flex>
  );
};

export default Home;
