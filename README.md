PDV Lanchonete – Cardápio Digital

Sistema de PDV e cardápio digital para lanchonete, com foco em operação diária, pedidos e área administrativa.

Stack

Frontend

React (CRA)

TypeScript

Zustand (estado global)

React Router

ESLint

Backend / Serviços

Supabase (Auth + Database)

Estrutura do Projeto
src/
 ├─ components/        # Componentes reutilizáveis (UI, layout, common)
 ├─ pages/             # Páginas (PDV, Admin, Auth)
 ├─ store/             # Estados globais (Zustand)
 ├─ services/          # Integrações externas (Supabase)
 ├─ hooks/             # Hooks customizados
 ├─ utils/             # Funções utilitárias
 ├─ styles/            # Estilos globais / tema
 └─ types/             # Tipos compartilhados

Fluxo Geral da Aplicação

Usuário acessa o PDV

Visualiza cardápio

Realiza pedidos

Admin

Acesso protegido por rota privada

Gerenciamento de pedidos e estados

Estado

Carrinho e usuário controlados via Zustand

Dados

Persistência e autenticação via Supabase

Scripts Disponíveis
npm install        # Instala dependências
npm start          # Ambiente de desenvolvimento
npm run build      # Build de produção
npm test           # Testes (quando configurados)

Variáveis de Ambiente
REACT_APP_SUPABASE_URL=
REACT_APP_SUPABASE_KEY=
