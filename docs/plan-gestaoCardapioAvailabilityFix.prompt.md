## Plan: Corrigir disponibilidade no cardápio (/gestao-cardapio)

Objetivo: Quando um produto é desabilitado em /gestao-cardapio, ele deve desaparecer do cardápio público e voltar quando reabilitado. Unificar a fonte de verdade, padronizar escrita/leitura e garantir atualização em tempo real.

Passos
1) Mapear schema de disponibilidade
- Confirmar coluna/tabela de disponibilidade em supabase/migration/017_disponibilidade_produtos.sql
- Rever políticas em 018_policies_cardapio_update.sql
- Alinhar tipos em src/types/index.ts

2) Revisar toggle na gestão do cardápio
- Ver src/components/admin/QuickMenuManagement.tsx
- Identificar função de handler (toggle) e serviço chamado
- Verificar update no campo correto (ex.: produtos.disponivel)

3) Unificar fonte de disponibilidade
- Definir coluna única (ex.: produtos.disponivel)
- Padronizar serviços/mutações para escrever nessa coluna
- Remover divergências (flags duplicadas/tabelas auxiliares se existirem)

4) Ajustar hook de cardápio
- Em src/hooks/useCardapio.ts, garantir filtro por disponibilidade
- Conferir selects/joins para incluir `disponivel` no fetch quando necessário

5) Realtime de disponibilidade
- Em src/hooks/useProdutosDisponibilidadeRealtime.ts, garantir que updates reflitam no estado do cardápio (refetch/diff)
- Validar assinatura no canal/tabela corretos

6) Validar UI/PDV
- Em src/components/pdv/ProductCard.tsx, ocultar/bloquear interação quando `disponivel === false`
- Opcional: mostrar rótulo de indisponível para admins

Teste rápido
- Desabilitar um produto em /gestao-cardapio
- Verificar sumiço imediato no cardápio (ou após refetch breve)
- Reabilitar e checar retorno
- Observar logs do serviço/hook e eventos realtime

Notas
- Evitar cache desatualizado: invalidar queries ou atualizar store/local state
- Confirmar RLS para leitura pública de `disponivel`
- Garantir que as páginas admin e pública usem o mesmo tipo/shape de produto