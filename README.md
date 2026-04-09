# UniSurvive

Magyar egyetemistáknak készült MVP platform, ahol tantárgyakhoz kapcsolódó jegyzetek, ZH tippek, tapasztalatok és túlélő infók gyűlnek össze egy helyen.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS + shadcn-style UI elemek
- Prisma ORM
- PostgreSQL
- Zod + React Hook Form

## Indítás

1. Másold a `.env.example` fájlt `.env` néven.
2. Indíts PostgreSQL-t:

```bash
docker compose up -d
```

3. Generáld a Prisma klienst és pushold a sémát:

```bash
npm run db:generate
npm run db:push
```

4. Seedeld a demo adatokat:

```bash
npm run db:seed
```

5. Indítsd a fejlesztői szervert:

```bash
npm run dev
```

## Demo login

- Email: `demo@unisurvive.hu`
- Jelszó: `demo12345`
