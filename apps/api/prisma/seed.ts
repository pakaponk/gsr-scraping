import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { userBuilder, reportBuilder } from '../test/utils/mock';

const prisma = new PrismaClient();

const mockUsersPromise = Promise.all(
  [
    userBuilder({
      overrides: {
        name: 'John Doe',
        email: 'john.doe@pakaponk.dev',
        password: '1q2w3e4r',
      },
    }),
    userBuilder({
      overrides: {
        name: 'Jane Doe',
        email: 'jane.doe@pakaponk.dev',
        password: '1q2w3e4r',
      },
    }),
  ].map(async (user) => {
    const hashedPassword = await argon2.hash(user.password);
    return {
      ...user,
      password: hashedPassword,
    };
  }),
);

async function seed() {
  const mockUsers = await mockUsersPromise;

  await prisma.user.createMany({
    data: mockUsers,
    skipDuplicates: true,
  });

  const mockReports = mockUsers.flatMap((mockUser) => {
    return Array.from({ length: 3 }, () => {
      return reportBuilder({
        overrides: {
          userId: mockUser.id,
        },
        traits: 'success',
      });
    });
  });

  await prisma.report.createMany({
    data: mockReports,
  });
}

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e.message);
    await prisma.$disconnect();
    process.exit(1);
  });
