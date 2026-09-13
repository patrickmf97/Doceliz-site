<div align="center">

# 🍰 DoceLiz

### Site institucional e catálogo digital para confeitaria artesanal

<p>
  <a href="https://doceliz-site.vercel.app" target="_blank">
    <strong>🌐 Ver projeto online</strong>
  </a>
</p>

<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
<img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
<img src="https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E" alt="Supabase">
<img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel">
<img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">

</div>

---

## 📸 Preview

> **Projeto em produção:** [doceliz-site.vercel.app](https://doceliz-site.vercel.app)

O DoceLiz foi desenvolvido com uma identidade visual delicada e artesanal, priorizando uma experiência simples para o cliente conhecer os produtos e realizar uma encomenda.

### Interface

- Página inicial com apresentação da marca
- Cardápio organizado por categorias
- Cards de produtos com descrição e preço
- Carrinho de compras
- Fluxo de pedido direcionado ao WhatsApp
- Layout responsivo para dispositivos móveis

---

## 🎯 Sobre o projeto

O **DoceLiz** é uma aplicação web criada para uma confeitaria artesanal que precisava de uma presença digital própria para apresentar seu catálogo e facilitar o processo de encomendas.

A proposta foi transformar um cardápio tradicional em uma experiência digital mais organizada, permitindo que o cliente:

1. Conheça a marca;
2. Navegue pelo cardápio;
3. Filtre os produtos por categoria;
4. Adicione produtos ao carrinho;
5. Revise seu pedido;
6. Finalize o contato através do WhatsApp.

O projeto também possui uma estrutura preparada para gerenciamento administrativo de produtos, imagens e pedidos utilizando o Supabase.

---

## ✨ Funcionalidades

### 🛍️ Experiência do cliente

- [x] Página inicial
- [x] Apresentação da marca
- [x] Cardápio digital
- [x] Categorias de produtos
- [x] Exibição de preço e descrição
- [x] Carrinho de compras
- [x] Controle de quantidade
- [x] Resumo do pedido
- [x] Finalização via WhatsApp
- [x] Design responsivo

### ⚙️ Estrutura administrativa

- [x] Banco de dados PostgreSQL
- [x] Supabase Storage para imagens
- [x] Autenticação
- [x] Row Level Security (RLS)
- [x] Políticas de acesso administrativo
- [ ] Dashboard administrativo completo
- [ ] Gerenciamento visual de pedidos
- [ ] Relatórios e métricas

---

## 🧩 Stack

### Front-end

| Tecnologia | Utilização |
|---|---|
| **React** | Construção da interface |
| **JavaScript** | Lógica da aplicação |
| **HTML5** | Estrutura |
| **CSS3** | Estilização |
| **Vite** | Desenvolvimento e build |

### Back-end / Dados

| Tecnologia | Utilização |
|---|---|
| **Supabase** | Backend as a Service |
| **PostgreSQL** | Banco de dados |
| **Supabase Auth** | Autenticação |
| **Supabase Storage** | Armazenamento de imagens |
| **RLS** | Controle de acesso aos dados |

### Deploy

| Serviço | Utilização |
|---|---|
| **Vercel** | Hospedagem e deploy |
| **GitHub** | Versionamento e código-fonte |

---

## 🏗️ Arquitetura

```text
                         ┌─────────────────────┐
                         │       Cliente       │
                         │     Navegador       │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │      Front-end      │
                         │    React + Vite     │
                         └──────────┬──────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
          ┌─────────────────┐             ┌─────────────────┐
          │    Supabase     │             │    WhatsApp     │
          │                 │             │                 │
          │ PostgreSQL      │             │    Pedidos      │
          │ Authentication  │             │    /Contato     │
          │ Storage         │             │                 │
          │ RLS             │             └─────────────────┘
          └─────────────────┘
```

---

## 🔐 Segurança

O projeto utiliza os recursos de segurança do Supabase para controlar o acesso aos dados.

Entre as regras implementadas:

- 🔒 Row Level Security (RLS)
- 🔑 Operações administrativas condicionadas à autenticação
- 👤 Controle de acesso por função
- 🖼️ Políticas específicas para armazenamento de imagens
- 📦 Separação entre leitura pública e operações administrativas

> Nenhuma chave privada ou `service_role` deve ser exposta no código do front-end.

---

## 📁 Estrutura do projeto

```text
doceliz-site/
│
├── src/
│   ├── components/
│   ├── ...
│   │
│   └── App.*
│
├── public/
│
├── index.html
├── package.json
├── vite.config.js
├── .gitignore
└── README.md
```

A estrutura pode evoluir conforme novas funcionalidades administrativas forem implementadas.

---

## 🚀 Como executar localmente

### Pré-requisitos

- Node.js
- npm
- Uma conta/projeto no Supabase

### 1. Clone o repositório

```bash
git clone https://github.com/patrickmf97/Doceliz-site.git
```

### 2. Acesse o projeto

```bash
cd Doceliz-site
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon
```

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

O Vite exibirá no terminal o endereço local para acessar a aplicação.

### 6. Gere a versão de produção

```bash
npm run build
```

---

## 🌐 Deploy

O projeto está conectado ao GitHub e publicado na **Vercel**.

### Produção

👉 **[Acessar DoceLiz](https://doceliz-site.vercel.app)**

O deploy é realizado a partir da branch principal do repositório.

---

## 📱 Responsividade

A interface foi pensada principalmente para uma experiência de compra simples em dispositivos móveis, sem deixar de atender usuários em telas maiores.

O layout contempla:

- 📱 Smartphones
- 📲 Tablets
- 💻 Desktops

---

## 🧠 Decisões técnicas

### Por que React?

React permite dividir a interface em componentes reutilizáveis e facilita a evolução do projeto conforme novas funcionalidades são adicionadas.

### Por que Supabase?

O Supabase oferece PostgreSQL, autenticação, storage e políticas de segurança em uma única plataforma, permitindo construir rapidamente uma estrutura de backend sem a necessidade de manter um servidor próprio.

### Por que WhatsApp?

Como o negócio trabalha com encomendas personalizadas, o WhatsApp funciona como uma etapa final de atendimento, permitindo confirmar detalhes do pedido diretamente com o cliente.

---

## 🔮 Roadmap

### Próxima etapa

- [ ] Criar painel administrativo
- [ ] CRUD completo de produtos
- [ ] Upload de imagens pelo painel
- [ ] Gerenciamento de categorias
- [ ] Visualização de pedidos
- [ ] Alteração do status do pedido

### Futuras melhorias

- [ ] Dashboard com métricas
- [ ] Histórico de pedidos
- [ ] Sistema de clientes
- [ ] Notificações
- [ ] Integração com pagamentos
- [ ] SEO avançado
- [ ] Analytics
- [ ] PWA

---

## 💡 O que este projeto demonstra

Este projeto foi desenvolvido para colocar em prática conceitos de desenvolvimento web moderno, incluindo:

- Desenvolvimento de interfaces com React
- Componentização
- Gerenciamento de estado
- Integração com APIs
- Integração com banco de dados
- Autenticação
- Storage
- Segurança com RLS
- Responsividade
- Git/GitHub
- Deploy contínuo
- Integração entre front-end e serviços backend

---

## 👨‍💻 Desenvolvedor

**Patrick Morais**

Desenvolvedor focado em criar aplicações web modernas, funcionais e orientadas às necessidades reais de pequenos negócios.

- 💻 GitHub: [@patrickmf97](https://github.com/patrickmf97)
- 🌐 Projeto: [DoceLiz](https://doceliz-site.vercel.app)

---

## 📄 Licença

Este repositório contém código desenvolvido para o projeto **DoceLiz**.

A identidade visual, marca, textos, imagens e demais conteúdos comerciais da DoceLiz pertencem aos seus respectivos proprietários.

---

<div align="center">

### 🍰 DoceLiz — feito à mão, todos os dias.

**Desenvolvido por Patrick Morais**

</div>
