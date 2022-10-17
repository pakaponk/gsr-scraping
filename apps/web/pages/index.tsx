import {
  Button,
  Container,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import type { NextPage } from 'next';
import { useState } from 'react';

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
        Login
      </Button>
    </Stack>
  );
}

function SignupForm() {
  return (
    <Stack as="form" spacing={4} width="full">
      <FormControl>
        <FormLabel htmlFor="name">Name</FormLabel>
        <Input type="text" name="name" />
      </FormControl>
      <FormControl>
        <FormLabel htmlFor="email">Email address</FormLabel>
        <Input type="email" name="email" />
      </FormControl>
      <FormControl>
        <FormLabel htmlFor="password">Password</FormLabel>
        <Input type="password" name="password" />
        <FormHelperText>Must have at least 8 characters</FormHelperText>
      </FormControl>
      <FormControl>
        <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
        <Input type="password" name="confirmPassword" />
      </FormControl>
      <Button type="submit" variant="solid" colorScheme="blue">
        Sign up
      </Button>
    </Stack>
  );
}

const Home: NextPage = () => {
  const [formState, setFormState] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');

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
            {formState === 'SIGNUP' && <SignupForm />}
          </Flex>
        </VStack>
      </Container>
    </Flex>
  );
};

export default Home;
