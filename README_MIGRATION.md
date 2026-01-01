Migração (opção A) — stubs criados

- `tsconfig.json` criado para habilitar TypeScript no frontend
- Estrutura criada em `src/app`, `src/pages`, `src/components`, `src/services`, `src/store`, `src/hooks`, `src/types`, `src/utils`, `src/styles`
- Não removi ou converti os arquivos JS originais; esta etapa prepara a migração incremental.

Próximos passos sugeridos:
- Instalar dependências: `typescript`, `zustand`, `@supabase/supabase-js` (quando começar integrações)
- Converter `App.js` e `index.js` para `index.tsx`/`App.tsx` quando estiver pronto
- Substituir fetchs hardcoded por `services/*` (adapter → supabase services)
