import { Report, User } from '@prisma/client';
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
    userId: perBuild(() => faker.datatype.uuid()),
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
