import {
  Button,
  Container,
  Flex,
  FormControl,
  Heading,
  Input,
  Spacer,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
} from '@chakra-ui/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { ChangeEventHandler, PropsWithChildren, useRef } from 'react';
import { fecthReports, fetchUploadKeywordFile } from '../src/api';
import { Layout } from '../src/Components/Layout';
import { useAuth } from '../src/Hooks/useAuth';

interface Report {
  id: string;
  keyword: string;
  totalAdwords: number;
  totalLinks: number;
  totalSearchResults: number;
  updatedAt: string;
}

type ReportListProps = {
  reports: Report[];
};

const ReportList = ({ reports }: ReportListProps) => {
  const router = useRouter();

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
                <Tr
                  key={id}
                  onClick={() => router.push(`/reports/${id}`)}
                  _hover={{ bgColor: 'gray.100', cursor: 'pointer' }}
                >
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

type FileInputButtonProps = {
  onFileSelected: ChangeEventHandler<HTMLInputElement>;
};

function FileInputButton({
  children,
  onFileSelected,
}: PropsWithChildren<FileInputButtonProps>) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <form>
      <FormControl hidden>
        <Input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onClick={() => {
            // Allow users to select the same file as the previous one
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
          onChange={onFileSelected}
        />
      </FormControl>
      <Button
        variant="solid"
        colorScheme="blue"
        onClick={() => {
          fileInputRef.current?.click();
        }}
      >
        {children}
      </Button>
    </form>
  );
}

const Reports: NextPage = () => {
  const [{ user }] = useAuth();
  const router = useRouter();

  const { data, isLoading } = useQuery(['my-reports', user?.id], fecthReports);
  const reports = data?.reports ?? [];

  const { mutateAsync: uploadKeywordFile } = useMutation((file: File) => {
    return fetchUploadKeywordFile(file);
  });

  const onUpload: FileInputButtonProps['onFileSelected'] = async (event) => {
    const file = event.target.files?.[0] ?? null;

    if (file) {
      const { scrapingJob } = await uploadKeywordFile(file);
      router.push(`/scrapingJobs/${scrapingJob.id}`);
    }
  };

  return (
    <Layout>
      <Container py={12} minHeight="calc(100vh - 64px)" maxWidth="container.xl">
        <VStack spacing={8} alignItems="start">
          <Flex width="full">
            <Heading>Reports</Heading>
            <Spacer />
            <FileInputButton onFileSelected={onUpload}>
              Upload keywords
            </FileInputButton>
          </Flex>
          {!isLoading && <ReportList reports={reports} />}
        </VStack>
      </Container>
    </Layout>
  );
};

export default Reports;
