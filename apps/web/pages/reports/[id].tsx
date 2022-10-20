import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Center,
  Code,
  Container,
  Flex,
  Grid,
  Heading,
  Spacer,
  Spinner,
  Text,
  useClipboard,
  VStack,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { NextPage } from 'next';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { fecthReport } from '../../src/api';
import { Layout } from '../../src/Components/Layout';

const numberFormatter = new Intl.NumberFormat('en-US').format;

interface Report {
  id: string;
  status: 'PENDING' | 'SUCCESS' | 'ERROR';
  keyword: string;
  totalAdwords: number;
  totalLinks: number;
  totalSearchResults: string;
  html: string;
}

function Loading() {
  return (
    <Center flexGrow="1">
      <Spinner size="xl" color="blue.500" />
    </Center>
  );
}

type PageBreadcrumbProps = Pick<Report, 'id' | 'keyword'>;
function PageBreadcrumb({ id, keyword }: PageBreadcrumbProps) {
  return (
    <Breadcrumb separator=">">
      <BreadcrumbItem>
        <NextLink href="/reports" passHref>
          <BreadcrumbLink>Reports</BreadcrumbLink>
        </NextLink>
      </BreadcrumbItem>

      <BreadcrumbItem isCurrentPage>
        <NextLink href={`/reports/${id}`} passHref>
          <BreadcrumbLink href="#">
            <Text as="span" noOfLines={1}>
              {keyword}
            </Text>
          </BreadcrumbLink>
        </NextLink>
      </BreadcrumbItem>
    </Breadcrumb>
  );
}

type StateProps = Pick<
  Report,
  'totalAdwords' | 'totalLinks' | 'totalSearchResults'
>;

function Stat({ totalLinks, totalAdwords, totalSearchResults }: StateProps) {
  return (
    <VStack alignItems="start" spacing={6} width="full">
      <Heading
        as="h3"
        color="gray.700"
        fontSize="2xl"
        fontWeight="semibold"
        textAlign="left"
      >
        Result
      </Heading>
      <Grid
        templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
        gap={6}
        width="full"
      >
        <VStack
          spacing={2}
          alignItems="start"
          p={8}
          bgColor="white"
          shadow="base"
          borderRadius="8px"
        >
          <Text fontSize="sm" fontWeight="medium" color="gray.500">
            Total Adwords
          </Text>
          <Text
            fontWeight="semibold"
            color="gray.900"
            fontSize={{ base: '3xl', md: '4xl' }}
            lineHeight="0.8"
          >
            {numberFormatter(totalAdwords)}
          </Text>
        </VStack>
        <VStack
          spacing={2}
          alignItems="start"
          p={8}
          bgColor="white"
          shadow="base"
          borderRadius="8px"
        >
          <Text fontSize="sm" fontWeight="medium" color="gray.500">
            Total Links
          </Text>
          <Text
            fontWeight="semibold"
            color="gray.900"
            fontSize={{ base: '3xl', md: '4xl' }}
            lineHeight="0.8"
          >
            {numberFormatter(totalLinks)}
          </Text>
        </VStack>
        <VStack
          spacing={2}
          alignItems="start"
          p={8}
          bgColor="white"
          shadow="base"
          borderRadius="8px"
        >
          <Text fontSize="sm" fontWeight="medium" color="gray.500">
            Total Search Results
          </Text>
          <Text
            fontWeight="semibold"
            color="gray.900"
            fontSize={{ base: '3xl', md: '4xl' }}
            lineHeight="0.8"
          >
            {numberFormatter(BigInt(totalSearchResults))}
          </Text>
        </VStack>
      </Grid>
    </VStack>
  );
}

type PreviewHtmlProps = Pick<Report, 'html'>;
function PreviewHtml({ html }: PreviewHtmlProps) {
  const { hasCopied, onCopy } = useClipboard(html);

  return (
    <VStack alignItems="start" spacing={6} width="full">
      <Flex width="full">
        <Heading
          as="h3"
          color="gray.700"
          fontSize="2xl"
          fontWeight="semibold"
          textAlign="left"
        >
          Preview HTML
        </Heading>
        <Spacer />
        <Button colorScheme="blue" variant="solid" size="sm" onClick={onCopy}>
          {hasCopied ? 'Copied' : 'Copy to Clipboard'}
        </Button>
      </Flex>
      <Box width="full" overflow="hidden" bgColor="black" borderRadius="8px">
        <Code
          m={4}
          noOfLines={{ base: 10, md: 20 }}
          maxWidth="full"
          overflow="hidden"
          color="yellow"
          bgColor="transparent"
        >
          {html}
        </Code>
      </Box>
    </VStack>
  );
}

function Scraping() {
  return (
    <Center
      width="full"
      minHeight="300px"
      borderColor="gray.500"
      borderStyle="dashed"
      borderWidth="4px"
      borderRadius="8px"
    >
      <VStack spacing={8}>
        <Text fontSize="4xl" color="gray.700">
          Scraping
        </Text>
        <Spinner size="xl" color="gray.500" />
      </VStack>
    </Center>
  );
}

const ReportDetail: NextPage = () => {
  const { query } = useRouter();

  const reportId = query.id as string;

  const { isLoading, data } = useQuery(['reports', reportId], () =>
    fecthReport(reportId)
  );

  return (
    <Layout>
      <Container
        display="flex"
        flexDirection="column"
        py={12}
        minHeight="calc(100vh - 64px)"
        maxWidth="container.xl"
      >
        {isLoading && <Loading />}
        {!isLoading && (
          <VStack alignItems="start" spacing={8}>
            <PageBreadcrumb id={data.report.id} keyword={data.report.keyword} />
            <VStack alignItems="start" spacing={4}>
              <Heading color="gray.900">Keyword</Heading>
              <Text fontSize="2xl">{data.report.keyword}</Text>
            </VStack>

            {data.report.status === 'PENDING' && <Scraping />}
            {data.report.status === 'SUCCESS' && (
              <>
                <Stat
                  totalAdwords={data.report.totalAdwords}
                  totalLinks={data.report.totalLinks}
                  totalSearchResults={data.report.totalSearchResults}
                />
                <PreviewHtml html={data.report.html} />
              </>
            )}
          </VStack>
        )}
      </Container>
    </Layout>
  );
};

export default ReportDetail;
