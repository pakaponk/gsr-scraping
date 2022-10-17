import {
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import type { NextPage } from 'next';

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

const Home: NextPage = () => {
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
            <Heading textAlign="center">Sign in to your account</Heading>
            <Text>
              or{' '}
              <Button variant="link" colorScheme="blue">
                create a new account
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
            <LoginForm />
          </Flex>
        </VStack>
      </Container>
    </Flex>
  );
};

export default Home;
