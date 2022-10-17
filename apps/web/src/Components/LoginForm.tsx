import { Button, FormControl, FormLabel, Input, Stack } from '@chakra-ui/react';

export function LoginForm() {
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
