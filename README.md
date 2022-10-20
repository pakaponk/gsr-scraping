# gsr-scraping

This is a monorepo of Google Search Result scraping service
There are 2 applications:

1. `web`
2. `api`

There are example csv files available at the root directory. feel free to use it when you test the scraping functionality

## Getting Started

### Prerequisite

Install [Yarn v1](https://classic.yarnpkg.com/lang/en/) and [Docker Desktop](https://www.docker.com/products/docker-desktop)

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

- `web` is available at `http://localhost:3000`
- `api` is available at `http://localhost:5001`

### Test
At `apps/api` directory

```bash
yarn run test --runInBand
yarn run test:e2e --runInBand
```

## Decision Making

### Scraping

To handle multiple scraping requests, I decide to transform each keyword from the CSV file into a scraping job then put them in queue via Bull.js.
The worker will gradually handle this job as soon as possible.

To avoid getting blocked by Google, I chose to rotate `User-Agent` but evidently that was not enough since I still got blocked by Google.
In order mitigating this problem, I planned to use serverless function as a proxy service to simulate "Rotating IP" but unfortunately I cannot finish it in time.

To help user know the progress of the job, after considering the remaining time, I chose to regular poll the progress of the job although it was practically spamming our server by ourselves. To improve it, I would like to try using WebSocket or Long polling since I have never implemented it before. 

## Known Issue

### When run `yarn run test`, jest will log `This usually means that there are asynchronous operations that weren't stopped in your tests.`

Happen because of delete operations which wrapped in `prisma.$transction()` in afterEach, seem to be able to solve by await each delete operation instead of wrapped it in a transaction
