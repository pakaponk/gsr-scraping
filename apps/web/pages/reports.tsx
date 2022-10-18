import { Box, Container, Heading } from '@chakra-ui/react';
import { NextPage } from 'next';

const Reports: NextPage = () => {
  return (
    <Box bgColor="gray.100">
      <Container py={12} minHeight="100vh" maxWidth="container.xl">
        <Heading>Reports</Heading>
      </Container>
    </Box>
  );
};

export default Reports;
