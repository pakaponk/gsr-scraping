import { faker } from '@faker-js/faker';
import { build } from '@jackfranklin/test-data-bot';
import { User } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

const dtoBuilder = build<Pick<User, 'name' | 'email' | 'password'>>(
  'CreateUserDto',
  {
    fields: {
      name: faker.name.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(8),
    },
  },
);

describe('CreateUserDto', () => {
  it('should pass the validation when it is valid', async () => {
    const dto = dtoBuilder();

    const obj = plainToInstance(CreateUserDto, dto);

    const errors = await validate(obj);
    expect(errors).toHaveLength(0);
  });
  it('should fail when the given name is empty', async () => {
    const dto = dtoBuilder({
      overrides: {
        name: '',
      },
    });

    const obj = plainToInstance(CreateUserDto, dto);

    const errors = await validate(obj);

    expect(errors[0].constraints).toMatchInlineSnapshot(`
      Object {
        "isNotEmpty": "name should not be empty",
      }
    `);
  });
  it('should fail when the given email is NOT an email', async () => {
    const dto = dtoBuilder({
      overrides: {
        email: 'not_email',
      },
    });

    const obj = plainToInstance(CreateUserDto, dto);

    const errors = await validate(obj);

    expect(errors[0].constraints).toMatchInlineSnapshot(`
      Object {
        "isEmail": "email must be an email",
      }
    `);
  });
  it('should fail when the given password length is less than 8', async () => {
    const dto = dtoBuilder({
      overrides: {
        password: '8',
      },
    });

    const obj = plainToInstance(CreateUserDto, dto);

    const errors = await validate(obj);

    expect(errors[0].constraints).toMatchInlineSnapshot(`
      Object {
        "minLength": "password must be longer than or equal to 8 characters",
      }
    `);
  });
});
