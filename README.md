# gsr-scraping

This is a monorepo of Google Search Result scraping service
There are 2 applications:

1. `web`
2. `api`

## Getting Started

### Prerequisite

Install [Yarn v1](https://classic.yarnpkg.com/lang/en/), [Docker Desktop](https://www.docker.com/products/docker-desktop) and [Firebase CLI](https://firebase.google.com/docs/cli)

### Installation

```bash
yarn install
```

### First time Configuration

1. At `apps/api`, Duplicate `.env.example` into `.env`
2. Inside `.env`, Change `AUTH_SECURE_SESSION_SALT` to be value with at least length of 16
2. At root directory, run `docker-compose -f ./docker-compose.development.yml up -d` to start Postgres and Redis
3. Go to `apps/api`, run `yarn prisma migrate dev` to set database schema

### Running the app

At root directory
```bash
yarn run dev
```

### Test
At `apps/api` directory

```bash
yarn run test --runInBand
yarn run test:e2e --runInBand
```

## Known Issue

### When run `yarn run test`, jest will log `This usually means that there are asynchronous operations that weren't stopped in your tests.`

Happen because of delete operations which wrapped in `prisma.$transction()` in afterEach, seem to be able to solve by await each delete operation instead of wrapped it in a transaction
