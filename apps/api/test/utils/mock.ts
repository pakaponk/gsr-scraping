import { Report, ScrapingJob, User } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { build, perBuild } from '@jackfranklin/test-data-bot';

export const userBuilder = build<User>('User', {
  fields: {
    id: perBuild(() => faker.datatype.uuid()),
    name: perBuild(() => faker.name.fullName()),
    email: perBuild(() => faker.internet.email()),
    password: faker.internet.password(),
    createdAt: perBuild(() => new Date()),
    updatedAt: perBuild(() => new Date()),
  },
});

export const reportBuilder = build<Report>('Report', {
  fields: {
    id: perBuild(() => faker.datatype.uuid()),
    userId: null,
    scrapingJobId: null,
    keyword: perBuild(() => faker.word.noun()),
    status: 'PENDING',
    totalAdwords: null,
    totalLinks: null,
    totalSearchResults: null,
    html: null,
    createdAt: perBuild(() => new Date()),
    updatedAt: perBuild(() => new Date()),
  },
  traits: {
    success: {
      overrides: {
        status: 'SUCCESS',
        totalAdwords: perBuild(() => faker.datatype.number({ max: 20 })),
        totalLinks: perBuild(() => faker.datatype.number({ max: 1000 })),
        totalSearchResults: perBuild(() =>
          faker.datatype.bigInt({
            min: 100_000_000,
            max: 999_999_999_999_999,
          }),
        ),
      },
    },
    error: {
      overrides: {
        status: 'ERROR',
      },
    },
  },
});

export const scrapingJobBuilder = build<ScrapingJob>('ScrapingJob', {
  fields: {
    id: perBuild(() => faker.datatype.uuid()),
    userId: null,
    filename: perBuild(() => `${faker.word.noun()}.csv`),
    totalKeywords: perBuild(() => faker.datatype.number({ min: 1, max: 100 })),
    totalScrapedKeywords: 0,
    createdAt: perBuild(() => new Date()),
    updatedAt: perBuild(() => new Date()),
  },
});
