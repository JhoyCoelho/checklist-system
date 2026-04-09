# 📋 Checklist System

Sistema web para criação e execução de checklists com assinatura digital, desenvolvido com foco em técnicos de campo.

---

## 🚀 Tecnologias utilizadas

* Next.js (App Router)
* React
* Prisma ORM
* PostgreSQL (Neon)
* TailwindCSS
* Signature Canvas (assinatura digital)

---

## 📌 Funcionalidades

✅ Seleção de templates de checklist
✅ Respostas com checkbox e texto
✅ Assinatura digital (canvas)
✅ Validação obrigatória antes do envio
✅ Armazenamento no banco de dados
✅ Preparado para geração de PDF

---

## 📷 Preview

*(adicione prints aqui depois se quiser)*

---

## ⚙️ Configuração do projeto

### 1. Clonar repositório

```bash
git clone https://github.com/seu-usuario/checklist-system.git
cd checklist-system
```

---

### 2. Instalar dependências

```bash
npm install
```

---

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz:

```env
DATABASE_URL="sua_connection_string_do_neon"
NEXTAUTH_SECRET="seu_segredo"
NEXTAUTH_URL="http://localhost:3000"

EMAIL_USER="seu_email"
EMAIL_PASS="sua_senha_de_app"
```

---

### 4. Rodar migrações do banco

```bash
npx prisma migrate dev
```

---

### 5. Rodar o projeto

```bash
npm run dev
```

Acesse:

```
http://localhost:3000/checklist
```

---

## 🧠 Estrutura do projeto

```
src/
 ├── app/
 │   ├── api/
 │   ├── checklist/
 │   └── layout.tsx
 ├── lib/
 │   └── prisma.ts
prisma/
 └── schema.prisma
```

---

## 📄 Futuras melhorias

* 📑 Geração de PDF organizada
* 📍 Geolocalização do checklist
* 📷 Upload de fotos
* ⚠️ Registro de ocorrências (ex: ferramenta perdida)
* 👤 Autenticação de usuários
* 📊 Dashboard administrativo

---

## 🧠 Observações

* O projeto utiliza TailwindCSS para estilização
* Banco de dados hospedado no Neon (PostgreSQL serverless)
* Assinatura é salva como imagem base64

---

## 👨‍💻 Autor

Desenvolvido por **Jhoy Coelho**
