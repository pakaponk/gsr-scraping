import { Center, Container, Heading } from '@chakra-ui/react';
import type { NextPage } from 'next';

const Home: NextPage = () => {
  return (
    <Container display="flex" minH="100vh">
      <Center flexGrow="1">
        <Heading>Hello Next.js</Heading>
      </Center>
    </Container>
  );
};

export default Home;
