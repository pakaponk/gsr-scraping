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
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { useMutation } from '@tanstack/react-query';
import type { NextPage } from 'next';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { fetchSignup } from '../src/api';

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

type FormValue = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type SignUpFormProps = {
  onSuccess: () => void;
};

function SignupForm({ onSuccess }: SignUpFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValue>();

  const { mutateAsync: signup } = useMutation(
    (newUser: Omit<FormValue, 'confirmPassword'>) => {
      return fetchSignup(newUser);
    }
  );

  const onValid: Parameters<typeof handleSubmit>[0] = async ({
    name,
    email,
    password,
    confirmPassword,
  }) => {
    if (password !== confirmPassword) {
      setError(
        'confirmPassword',
        {
          type: 'mismatch',
          message: 'Should be the same as Password',
        },
        {
          shouldFocus: true,
        }
      );
      return;
    }

    try {
      await signup({ name, email, password });
      onSuccess();
    } catch (error) {
      setError('email', {
        type: 'notUnique',
        message: 'Thie email has already been used',
      });
    }
  };

  return (
    <Stack as="form" spacing={4} width="full" onSubmit={handleSubmit(onValid)}>
      <FormControl isInvalid={!!errors.name} isDisabled={isSubmitting}>
        <FormLabel htmlFor="name">Name</FormLabel>
        <Input
          {...register('name', {
            required: 'Please fill your name',
            setValueAs: (value) => value.trim(),
          })}
          type="text"
        />
        <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={!!errors.email} isDisabled={isSubmitting}>
        <FormLabel htmlFor="email">Email address</FormLabel>
        <Input
          {...register('email', {
            required: 'Please fill your email address',
            setValueAs: (value) => value.trim(),
          })}
          type="email"
        />
        <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={!!errors.password} isDisabled={isSubmitting}>
        <FormLabel htmlFor="password">Password</FormLabel>
        <Input
          {...register('password', {
            required: 'Please fill your password',
            minLength: {
              value: 8,
              message: 'Password must have at least 8 characters',
            },
          })}
          type="password"
        />
        {!errors.password ? (
          <FormHelperText>Must have at least 8 characters</FormHelperText>
        ) : (
          <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
        )}
      </FormControl>
      <FormControl
        isInvalid={!!errors.confirmPassword}
        isDisabled={isSubmitting}
      >
        <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
        <Input
          {...register('confirmPassword', {
            required: 'Please fill your confirm password',
          })}
          type="password"
        />
        <FormErrorMessage>{errors.confirmPassword?.message}</FormErrorMessage>
      </FormControl>
      <Button
        type="submit"
        variant="solid"
        colorScheme="blue"
        isLoading={isSubmitting}
      >
        Sign up
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
