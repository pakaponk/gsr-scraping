import {
  Button,
  Container,
  Flex,
  FormControl,
  Heading,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
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
import { useForm } from 'react-hook-form';
import { FaSearch } from 'react-icons/fa';
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

function SearchForm({ keyword }: { keyword: string }) {
  const { register, handleSubmit, setValue } = useForm<{ keyword: string }>();

  const router = useRouter();

  const onValid: Parameters<typeof handleSubmit>[0] = ({ keyword }) => {
    if (keyword.length > 1) {
      router.push(`/reports?keyword=${encodeURIComponent(keyword)}`);
    } else {
      router.push(`/reports`);
    }
  };

  setValue('keyword', keyword);

  return (
    <HStack as="form" spacing={4} width="full" onSubmit={handleSubmit(onValid)}>
      <InputGroup width="full" maxWidth="400px">
        <InputLeftElement
          pointerEvents="none"
          // eslint-disable-next-line react/no-children-prop
          children={<Icon as={FaSearch} color="blue" />}
        />
        <Input
          {...register('keyword', {
            setValueAs: (value) => value.trim(),
          })}
          type="text"
          borderRadius="full"
          backgroundColor="white"
          enterKeyHint="search"
        />
      </InputGroup>
      <Button
        type="submit"
        borderRadius="8px"
        colorScheme="blue"
        variant="solid"
        onClick={() => {}}
      >
        Search
      </Button>
    </HStack>
  );
}

const Reports: NextPage = () => {
  const [{ user }] = useAuth();
  const router = useRouter();
  const keyword = (router.query.keyword as string) ?? '';

  const { data, isLoading } = useQuery(
    ['my-reports', user?.id, keyword],
    () => {
      if (keyword.length === 0) {
        return fecthReports();
      } else {
        return fecthReports(keyword);
      }
    }
  );
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
          <SearchForm keyword={keyword} />
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
