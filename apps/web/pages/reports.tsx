import { Box, Center, Container, Heading, Spinner } from '@chakra-ui/react';
import { NextPage } from 'next';
import { Navbar } from '../src/Components/Navbar';
import { useAuth } from '../src/Hooks/useAuth';

const Reports: NextPage = () => {
  const [{ authState }] = useAuth();

  switch (authState) {
    case 'PENDING': {
      return (
        <Center bgColor="gray.100" minHeight="100vh">
          <Spinner size="xl" color="blue.500" />
        </Center>
      );
    }
    case 'AUTHENTICATED': {
      return (
        <Box pt="64px" bgColor="gray.100">
          <Navbar />
          <Container
            py={12}
            minHeight="calc(100vh - 64px)"
            maxWidth="container.xl"
          >
            <Heading>Reports</Heading>
          </Container>
        </Box>
      );
    }
    default: {
      return null;
    }
  }
};

export default Reports;
