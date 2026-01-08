# 🍔 Luizão Lanches - Cardápio Digital

Sistema de PDV e cardápio digital para lanchonete, com foco em operação diária, pedidos e área administrativa.

## 🚀 Stack

- **Frontend**: React + Vite + TypeScript
- **Estado**: Zustand
- **Roteamento**: React Router
- **Backend**: Supabase (Auth + Database + Realtime)
- **Gráficos**: Recharts

## 📁 Estrutura do Projeto

```
src/
 ├─ components/
 │   ├─ pdv/          # Componentes do PDV (ProductCard, CartDrawer, etc)
 │   ├─ admin/        # Componentes administrativos
 │   └─ common/       # Componentes comuns
 ├─ pages/
 │   ├─ pdv/          # Página do cardápio
 │   └─ admin/          # Páginas administrativas
 ├─ store/            # Estados globais (Zustand)
 ├─ services/         # Integrações (Supabase)
 ├─ hooks/            # Hooks customizados
 ├─ utils/            # Funções utilitárias
 └─ types/            # Tipos TypeScript
```

## 🛠️ Instalação

```bash
# Instalar dependências
npm install

# Criar arquivo .env com as variáveis do Supabase
cp .env.example .env
# Editar .env e preencher com suas credenciais

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-key-aqui
```

**Importante**: Nunca commite o arquivo `.env` no git!

## 📊 Migrations do Supabase

Execute as migrations na ordem no Supabase SQL Editor:

1. `001_criacao-de-tabelas.sql`
2. `002_populando-tabela-cardapio.sql`
3. `003_tabela_admins.sql`
4. `004_timestamps_pedidos.sql`
5. `005_policies_rls.sql`
6. `006_whatsapp_n8n_trigger.sql`
7. `007_tabela_fechamentos_caixa.sql`

## 🚀 Deploy no Vercel

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente no painel do Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. O arquivo `vercel.json` já está configurado
4. Deploy automático a cada push na branch principal

## ✅ Checklist de Testes para Produção

### Desktop
- [ ] Cardápio carrega corretamente
- [ ] Adicionar itens ao carrinho funciona
- [ ] Carrinho abre e fecha corretamente
- [ ] Finalizar pedido funciona
- [ ] Modal de sucesso aparece após pedido
- [ ] Admin consegue ver pedidos
- [ ] Admin consegue alterar status
- [ ] Financeiro carrega dados corretamente
- [ ] Gráfico de faturamento renderiza
- [ ] Fechamento de caixa funciona

### Mobile
- [ ] Cardápio responsivo
- [ ] Botões touch-friendly (mínimo 44x44px)
- [ ] Carrinho funciona em mobile
- [ ] Formulário de pedido funciona
- [ ] Teclado não cobre campos importantes
- [ ] Scroll funciona corretamente

### Funcionalidades
- [ ] Pedidos são salvos no banco
- [ ] Realtime funciona (novos pedidos aparecem)
- [ ] Timeout de 15s funciona em conexão lenta
- [ ] Erros são exibidos de forma amigável
- [ ] Prevenção de envio duplo funciona
- [ ] Carrinho só limpa após sucesso

### Segurança
- [ ] Usuários anônimos não podem alterar pedidos
- [ ] Apenas admin pode alterar status
- [ ] Policies RLS estão ativas
- [ ] Variáveis de ambiente não estão expostas

## 📝 Funcionalidades

### PDV / Cardápio
- ✅ Visualização por categorias
- ✅ Carrinho com controle de quantidade
- ✅ Formulário de pedido completo
- ✅ Modal de sucesso animado
- ✅ Responsivo e mobile-first

### Admin
- ✅ Dashboard com métricas
- ✅ Gerenciamento de pedidos
- ✅ Alteração de status
- ✅ Financeiro com gráficos
- ✅ Fechamento de caixa
- ✅ Itens mais vendidos

### Robustez
- ✅ Timeout de 15s para pedidos
- ✅ Tratamento de erros de rede
- ✅ Prevenção de envio duplo
- ✅ Normalização de payload
- ✅ Mensagens de erro amigáveis

## 🔒 Segurança

- Row Level Security (RLS) ativo no Supabase
- Usuários anônimos só podem inserir pedidos
- Apenas admins podem alterar status
- Policies documentadas nas migrations

## 📞 Suporte

Para problemas ou dúvidas, verifique:
1. Console do navegador (F12)
2. Logs do Supabase
3. Variáveis de ambiente configuradas
4. Migrations executadas

## 📄 Licença

ISC
