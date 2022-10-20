import {
  Center,
  Container,
  Flex,
  Icon,
  Progress,
  Spinner,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { FaFileCsv } from 'react-icons/fa';
import { NextPage } from 'next';
import { Layout } from '../../src/Components/Layout';
import { useQuery } from '@tanstack/react-query';
import { fetchScrapingJob } from '../../src/api';
import { useRouter } from 'next/router';

function Loading() {
  return (
    <Center flexGrow="1">
      <Spinner size="xl" color="blue.500" />
    </Center>
  );
}

const ScrapingDetail: NextPage = () => {
  const router = useRouter();
  const scrapingJobId = router.query.id as string;

  const { isLoading, data } = useQuery(
    ['scraping-jobs', scrapingJobId],
    () => fetchScrapingJob(scrapingJobId),
    {
      refetchInterval: 1000 * 5,
    }
  );

  const percent = isLoading
    ? null
    : (data.scrapingJob.totalScrapedKeywords / data.scrapingJob.totalKeywords) *
      100;

  if ((percent ?? 0) >= 100) {
    router.push('/reports');
  }

  return (
    <Layout>
      <Container
        display="flex"
        flexDirection="column"
        py={12}
        minHeight="calc(100vh - 64px)"
      >
        {isLoading && <Loading />}
        {!isLoading && (
          <Center flexGrow="1">
            <Stack
              direction="row"
              spacing={4}
              pl={6}
              pr={8}
              py={8}
              width="full"
              bgColor="gray.200"
              shadow="md"
              borderRadius="8px"
            >
              <Icon as={FaFileCsv} boxSize={16} color="gray.700" />
              <VStack
                spacing={4}
                width="full"
                maxWidth={'calc(100% - 80px)'}
                align="stretch"
              >
                <Flex justify="space-between" color="gray.500">
                  <Text noOfLines={1}>{data.scrapingJob.filename}</Text>
                  <Text flexShrink={0}>{percent?.toFixed(0)} %</Text>
                </Flex>
                <Progress
                  value={percent!}
                  height={4}
                  colorScheme="blue"
                  borderRadius={8}
                />
              </VStack>
            </Stack>
          </Center>
        )}
      </Container>
    </Layout>
  );
};

export default ScrapingDetail;
