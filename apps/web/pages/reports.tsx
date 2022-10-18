import { Box, Container, Heading } from '@chakra-ui/react';
import { NextPage } from 'next';
import { Navbar } from '../src/Components/Navbar';

const Reports: NextPage = () => {
  return (
    <Box pt="64px" bgColor="gray.100">
      <Navbar />
      <Container py={12} minHeight="calc(100vh - 64px)" maxWidth="container.xl">
        <Heading>Reports</Heading>
      </Container>
    </Box>
  );
};

export default Reports;
