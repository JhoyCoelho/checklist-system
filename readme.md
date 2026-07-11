# Checklist System

Aplicação web para criação de checklists técnicos com assinatura digital, justificativas de atraso e fluxo de aprovação administrativa.

## O que a aplicação faz

- Cadastro e autenticação de usuários com roles de administrador e técnico
- Criação de checklists a partir de templates
- Respostas com status, texto livre e assinatura digital
- Geração de PDF do checklist
- Registro de justificativas para preenchimento fora do prazo
- Aprovação administrativa com assinatura do responsável
- Envio de e-mails com o resultado do checklist

## Stack

- Next.js App Router
- React
- Prisma ORM
- PostgreSQL
- Tailwind CSS
- Puppeteer para geração de PDF
- NextAuth para autenticação

## Configuração local

1. Clone o repositório e instale as dependências:

```bash
npm install
```

2. Crie um arquivo `.env` na raiz com as variáveis abaixo:

```env
DATABASE_URL="sua_connection_string_do_banco"
NEXTAUTH_SECRET="um_segredo_forte"
NEXTAUTH_URL="http://localhost:3000"

EMAIL_USER="seu_email"
EMAIL_PASS="sua_senha_de_app"
```

3. Execute as migrações do banco:

```bash
npx prisma migrate dev
```

4. Inicie a aplicação:

```bash
npm run dev
```

A aplicação ficará disponível em:

```text
http://localhost:3000/checklist
```

## Estrutura principal

- `src/app` — páginas, rotas e telas da aplicação
- `src/lib` — autenticação, e-mail, Prisma e geração de PDF
- `prisma` — schema e migrações do banco

## Observações

- O projeto já inclui os arquivos de migração do Prisma para facilitar a configuração inicial.
- Os PDFs são gerados automaticamente a partir das respostas e assinaturas do checklist.
- O fluxo administrativo fica disponível em `/admin` e `/admin/pending`.
