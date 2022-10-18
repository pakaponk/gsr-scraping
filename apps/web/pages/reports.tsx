import {
  Box,
  Center,
  Container,
  Heading,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
} from '@chakra-ui/react';
import { NextPage } from 'next';
import { Navbar } from '../src/Components/Navbar';
import { useAuth } from '../src/Hooks/useAuth';

interface Report {
  id: string;
  keyword: string;
  totalAdwords: number;
  totalLinks: number;
  totalSearchResults: string;
  updatedAt: string;
}

type ReportListProps = {
  reports: Report[];
};

const mockReports: Report[] = [
  {
    id: 'test-report-1',
    keyword: 'google',
    totalAdwords: 10,
    totalLinks: 100,
    totalSearchResults: '100000000',
    updatedAt: new Date().toISOString(),
  },
];

const ReportList = ({ reports }: ReportListProps) => {
  return (
    <TableContainer
      width="full"
      bgColor="gray.200"
      borderRadius="8px"
      shadow="base"
    >
      <Table>
        <Thead>
          <Tr>
            <Th>Keyword</Th>
            <Th isNumeric>Total Adwords</Th>
            <Th isNumeric>Total Links</Th>
            <Th isNumeric>Total Search Results</Th>
            <Th>Updated At</Th>
          </Tr>
        </Thead>
        <Tbody bgColor="white">
          {reports.map(
            ({
              id,
              keyword,
              totalAdwords,
              totalLinks,
              totalSearchResults,
              updatedAt,
            }) => {
              return (
                <Tr key={id}>
                  <Td>{keyword}</Td>
                  <Td isNumeric>{totalAdwords}</Td>
                  <Td isNumeric>{totalLinks}</Td>
                  <Td isNumeric>{totalSearchResults}</Td>
                  <Td>{updatedAt}</Td>
                </Tr>
              );
            }
          )}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

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
            <VStack spacing={8} alignItems="start">
              <Heading>Reports</Heading>
              <ReportList reports={mockReports} />
            </VStack>
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
