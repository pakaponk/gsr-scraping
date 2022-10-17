import {
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  Stack,
} from '@chakra-ui/react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { fetchSignup } from '../api';

type FormValue = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type SignUpFormProps = {
  onSuccess: () => void;
};

export function SignupForm({ onSuccess }: SignUpFormProps) {
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
