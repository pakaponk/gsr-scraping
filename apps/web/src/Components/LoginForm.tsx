import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Stack,
} from '@chakra-ui/react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { fetchLogin } from '../api';

type FormValue = {
  email: string;
  password: string;
};

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValue>();

  const { mutateAsync: login } = useMutation((credential: FormValue) => {
    return fetchLogin(credential);
  });

  const onValid: Parameters<typeof handleSubmit>[0] = async ({
    email,
    password,
  }) => {
    await login({ email, password });
  };

  return (
    <Stack as="form" spacing={4} width="full" onSubmit={handleSubmit(onValid)}>
      <FormControl isInvalid={!!errors.email}>
        <FormLabel htmlFor="email">Email address</FormLabel>
        <Input
          {...register('email', {
            required: 'Please fill your email',
            setValueAs: (value) => value.trim(),
          })}
          type="email"
          placeholder="Email"
        />
        <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={!!errors.password}>
        <FormLabel htmlFor="password">Password</FormLabel>
        <Input
          {...register('password', {
            required: 'Please fill your password',
          })}
          type="password"
          placeholder="Password"
        />
        <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
      </FormControl>
      <Button type="submit" variant="solid" colorScheme="blue">
        Sign in
      </Button>
    </Stack>
  );
}
