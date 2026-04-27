# Node.js Workshop — Day 2

A NestJS application demonstrating four core concepts for the workshop audience.

---

## 🏗 Project Structure

```
src/
├── prisma/          → PrismaService (DB lifecycle: OnModuleInit / OnModuleDestroy)
├── auth/            → JWT register/login, Guards vs Middleware
├── posts/           → Feature module, DI, CRUD with Prisma
├── pdf/             → Worker Threads — PDF generation off the event loop
└── common/          → LoggerMiddleware (middleware example)
```

---

## ⚡ Quick Start

```bash
npm install
npm run start:dev
```

App runs at **http://localhost:3000**

---

## 📋 Concepts Covered

### 1 — Database Integration (Prisma + SQLite)
- `prisma/schema.prisma` — User & Post models
- `PrismaService` wraps Prisma v7 with better-sqlite3 adapter
- Lifecycle hooks: `onModuleInit` connects, `onModuleDestroy` disconnects
- Migration: `npx prisma migrate dev`

### 2 — NestJS Fundamentals
| Concept | File |
|---|---|
| Module | `auth.module.ts`, `posts.module.ts`, `pdf.module.ts` |
| Controller | `auth.controller.ts`, `posts.controller.ts` |
| Service (DI) | `auth.service.ts`, `posts.service.ts` |
| Global Module | `prisma.module.ts` — `@Global()` |
| Lifecycle | `PrismaService` — `OnModuleInit` / `OnModuleDestroy` |

### 3 — Authentication Flow
- `POST /auth/register` — bcrypt hash → save user
- `POST /auth/login` — verify password → sign JWT → return `access_token`
- `JwtStrategy` — validates Bearer token, attaches `req.user`
- `JwtAuthGuard` — protects routes with `@UseGuards(JwtAuthGuard)`

**Middleware vs Guards:**
| | Middleware | Guard |
|---|---|---|
| When | Before routing | After routing, before handler |
| Knows handler? | ❌ | ✅ |
| Use for | Logging, CORS | Auth, roles |

### 4 — Worker Threads (PDF Generation)
- `GET /pdf/post/:id` — spawns a Worker Thread
- Worker renders PDF with `pdfkit` — **never blocks the event loop**
- Main thread stays free to handle other requests

---

## 🔌 API Endpoints

```
POST   /auth/register          — { name, email, password }
POST   /auth/login             — { email, password } → { access_token }

GET    /posts                  — list all posts (public)
GET    /posts/:id              — get one post (public)
POST   /posts                  — create post (JWT required)
DELETE /posts/:id              — delete own post (JWT required)

GET    /pdf/post/:id           — download post as PDF (JWT required)
```

---

## 🧪 Test the Full Flow

```bash
# 1. Register
curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"secret123"}' | jq

# 2. Login → copy the access_token
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret123"}' | jq

# 3. Create a post (replace TOKEN)
curl -s -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"Hello World","body":"My first post via NestJS!"}' | jq

# 4. List posts (public)
curl -s http://localhost:3000/posts | jq

# 5. Download PDF (replace TOKEN and 1 with post id)
curl -s http://localhost:3000/pdf/post/1 \
  -H "Authorization: Bearer TOKEN" \
  --output post-1.pdf && open post-1.pdf
```


[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
