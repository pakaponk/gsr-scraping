import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

const mockUsersPromise = Promise.all(
  [
    {
      name: 'John Doe',
      email: 'john.doe@pakapon.dev',
      password: '1q2w3e4r',
    },
    {
      name: 'Jane Doe',
      email: 'jane.doe@pakapon.dev',
      password: '1q2w3e4r',
    },
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
