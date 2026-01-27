import React, { useEffect, useMemo, useState } from 'react';
import GlobalIngredientesCard from '../../components/admin/GlobalIngredientesCard';
import GestaoRefrigerantes from '../../components/admin/GestaoRefrigerantes';
import { supabase } from '../../services/supabaseClient';
import { cardapioService } from '../../services/api/cardapio.service';
import { deliveryFeeService } from '../../services/api/deliveryFee.service';
import './GestaoCardapio.css';

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  disponivel: boolean;
  ingredientes?: string[];
}

const ORDEM_CATEGORIAS = [
  'Lanches',
  'Macarrão',
  'Porções',
  'Omeletes',
  'Bebidas',
  'Cervejas',
  'Sucos',
  'Refrigerantes',
  'Especiais',
  'Combos',
];

const CATEGORIAS_COM_INGREDIENTES = ['Lanches', 'Macarrão', 'Omeletes'];

function GestaoCardapio() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('Todos');
  const [editingPriceId, setEditingPriceId] = useState<number | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState('');
  const [ingredientesIndisponiveis, setIngredientesIndisponiveis] = useState<Record<number, string[]>>({});
  const [ingredientesGlobaisIndisponiveis, setIngredientesGlobaisIndisponiveis] = useState<string[]>([]);
  const [todosIngredientes, setTodosIngredientes] = useState<string[]>([]);
  const [taxaEntrega, setTaxaEntrega] = useState(0);
  const [novoValorTaxaEntrega, setNovoValorTaxaEntrega] = useState('0');
  const [editingTaxaEntrega, setEditingTaxaEntrega] = useState(false);
  const [savingTaxaEntrega, setSavingTaxaEntrega] = useState(false);

  useEffect(() => {
    fetchProdutos();
    fetchTaxaEntrega();
  }, []);

  // Realtime para mudanças de ingredientes indisponíveis
  useEffect(() => {
    const channel = supabase
      .channel('admin-ingredientes-indisponiveis-rt')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ingredientes_indisponiveis_dia',
        },
        () => {
          fetchIngredientesIndisponiveis();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchProdutos() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cardapio')
        .select('id, nome, descricao, preco, categoria, disponivel, ingredientes');

      if (error) throw error;

      const produtosData = (data || []) as Produto[];
      setProdutos(produtosData);
      await fetchIngredientesIndisponiveis();
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
      alert('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  }

  async function fetchTaxaEntrega() {
    try {
      const fee = await deliveryFeeService.getDeliveryFee();
      if (fee !== null && fee !== undefined) {
        setTaxaEntrega(fee);
        setNovoValorTaxaEntrega(fee.toFixed(2));
      }
    } catch (err) {
      console.error('Erro ao buscar taxa de entrega:', err);
    }
  }

  async function handleSaveTaxaEntrega() {
    try {
      const valor = parseFloat(novoValorTaxaEntrega.replace(',', '.'));
      if (isNaN(valor) || valor < 0) {
        alert('Valor inválido');
        return;
      }
      setSavingTaxaEntrega(true);
      await deliveryFeeService.updateDeliveryFee(valor);
      setTaxaEntrega(valor);
      setEditingTaxaEntrega(false);
    } catch (err) {
      console.error('Erro ao salvar taxa de entrega:', err);
      alert('Erro ao salvar taxa de entrega');
    } finally {
      setSavingTaxaEntrega(false);
    }
  }

  async function fetchIngredientesIndisponiveis() {
    try {
      // Busca todos os ingredientes do dia (indisponivel TRUE e FALSE)
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from('ingredientes_indisponiveis_dia')
        .select('ingrediente, indisponivel')
        .eq('valid_on', today);
      if (error) throw error;
      // Monta lista de ingredientes indisponíveis (TRUE)
      const indisponiveis = (data || []).filter((row: any) => row.indisponivel === true).map((row: any) => row.ingrediente);
      setIngredientesGlobaisIndisponiveis(indisponiveis);
    } catch (err) {
      console.error('Erro ao buscar ingredientes indisponíveis:', err);
    }
  }
  // Monta lista de ingredientes apenas da tabela ingredientes_indisponiveis_dia, ordenados alfabeticamente
  // Atualiza lista global de ingredientes a partir dos produtos do cardápio
  useEffect(() => {
    // Extrai todos os ingredientes únicos e ordenados dos produtos
    const ingredientesSet = new Set<string>();
    produtos.forEach((produto) => {
      if (Array.isArray(produto.ingredientes)) {
        produto.ingredientes.forEach((ing) => {
          if (ing && typeof ing === 'string') {
            ingredientesSet.add(ing.trim().toLowerCase());
          }
        });
      }
    });
    const ingredientes = Array.from(ingredientesSet).filter(Boolean).sort((a, b) => a.localeCompare(b, 'pt-BR'));
    setTodosIngredientes(ingredientes);
  }, [produtos]);
  // Handler para toggle global
  async function handleToggleIngredienteGlobal(ingrediente: string, indisponivel: boolean) {
    try {
      await cardapioService.definirIngredienteIndisponivel(null, ingrediente, indisponivel, true);
      await fetchIngredientesIndisponiveis();
    } catch (err) {
      console.error('Erro ao atualizar ingrediente global:', err);
      await fetchIngredientesIndisponiveis();
    }
  }

  function extrairIngredientes(descricao: string): string[] {
    if (!descricao) return [];
    const texto = descricao.replace(/\n/g, ' ');
    const partes = texto.split(/,|\/| e /i).map((p) => p.trim()).filter(Boolean);
    return Array.from(new Set(partes));
  }

  async function toggleIngredienteDisponibilidade(produtoId: number, ingrediente: string, global: boolean = false) {
    // Se global, aplica/remover para todos os produtos
    if (global) {
      try {
        await cardapioService.definirIngredienteIndisponivel(null, ingrediente, true, true);
        await fetchIngredientesIndisponiveis();
      } catch (err: any) {
        console.error('Erro ao atualizar ingrediente global:', err);
        await fetchIngredientesIndisponiveis();
        const msg = err?.message || '';
        if (msg.includes('ingredientes_indisponiveis_dia')) {
          alert('Tabela ingredientes_indisponiveis_dia não existe. Rode a migration 019 no Supabase.');
        } else {
          alert('Erro ao atualizar ingrediente global');
        }
      }
      return;
    }
    // Individual por produto
    const indisponiveisProduto = ingredientesIndisponiveis[produtoId] || [];
    const jaIndisponivel = indisponiveisProduto.includes(ingrediente);
    try {
      setIngredientesIndisponiveis((prev) => ({
        ...prev,
        [produtoId]: jaIndisponivel
          ? prev[produtoId]?.filter((ing) => ing !== ingrediente) || []
          : [...(prev[produtoId] || []), ingrediente],
      }));
      await cardapioService.definirIngredienteIndisponivel(
        String(produtoId),
        ingrediente,
        !jaIndisponivel,
        false
      );
      await fetchIngredientesIndisponiveis();
    } catch (err: any) {
      console.error('Erro ao atualizar ingrediente:', err);
      await fetchIngredientesIndisponiveis();
      const msg = err?.message || '';
      if (msg.includes('ingredientes_indisponiveis_dia')) {
        alert('Tabela ingredientes_indisponiveis_dia não existe. Rode a migration 019 no Supabase.');
      } else {
        alert('Erro ao atualizar ingrediente');
      }
    }
  }

  async function handleToggleDisponibilidade(id: number, disponivel: boolean) {
    try {
      const { error } = await supabase
        .from('cardapio')
        .update({ disponivel })
        .eq('id', id);

      if (error) throw error;

      setProdutos((prev) => prev.map((p) => (p.id === id ? { ...p, disponivel } : p)));
    } catch (err) {
      console.error('Erro ao atualizar disponibilidade:', err);
      alert('Erro ao atualizar');
    }
  }

  async function handleSavePrice(id: number) {
    const novoPreco = parseFloat(editingPriceValue.replace(',', '.'));
    if (isNaN(novoPreco) || novoPreco <= 0) {
      alert('Preço inválido');
      return;
    }

    try {
      const { error } = await supabase
        .from('cardapio')
        .update({ preco: novoPreco })
        .eq('id', id);

      if (error) throw error;

      setProdutos((prev) => prev.map((p) => (p.id === id ? { ...p, preco: novoPreco } : p)));
      setEditingPriceId(null);
    } catch (err) {
      console.error('Erro ao salvar preço:', err);
      alert('Erro ao salvar preço');
    }
  }

  const categoriasOrdenadas = useMemo(() => {
    const existentes = Array.from(new Set(produtos.map((p) => p.categoria)));
    const ordenadas = ORDEM_CATEGORIAS.filter((c) => existentes.includes(c));
    const restantes = existentes.filter((c) => !ORDEM_CATEGORIAS.includes(c)).sort();
    return ['Todos', ...ordenadas, ...restantes];
  }, [produtos]);

  const produtosFiltrados = useMemo(() => {
    return produtos.filter((produto) => {
      const matchCategoria =
        categoriaSelecionada === 'Todos' || produto.categoria === categoriaSelecionada;
      const termo = searchTerm.toLowerCase();
      const matchTexto =
        produto.nome.toLowerCase().includes(termo) || produto.descricao?.toLowerCase().includes(termo);
      return matchCategoria && matchTexto;
    });
  }, [produtos, categoriaSelecionada, searchTerm]);

  return (
    <div className="gestao-container">
      <header className="gestao-header">
        <div>
          <p className="gestao-subtitle">Administração</p>
          <h1 className="gestao-title">Gestão de Cardápio</h1>
        </div>
        <div className="gestao-actions">
          <div className="gestao-fee-card">
            <div className="fee-label">Taxa de entrega</div>
            {editingTaxaEntrega ? (
              <div className="fee-edit">
                <input
                  type="number"
                  step="0.01"
                  value={novoValorTaxaEntrega}
                  onChange={(e) => setNovoValorTaxaEntrega(e.target.value)}
                  disabled={savingTaxaEntrega}
                />
                <button onClick={handleSaveTaxaEntrega} disabled={savingTaxaEntrega}>
                  {savingTaxaEntrega ? '...' : 'Salvar'}
                </button>
                <button
                  onClick={() => {
                    setEditingTaxaEntrega(false);
                    setNovoValorTaxaEntrega(taxaEntrega.toFixed(2));
                  }}
                  disabled={savingTaxaEntrega}
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="fee-display" onClick={() => setEditingTaxaEntrega(true)}>
                R$ {taxaEntrega.toFixed(2)}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="gestao-main">
        {/* Card global de ingredientes */}
        <GlobalIngredientesCard
          onToggle={handleToggleIngredienteGlobal}
          indisponiveis={ingredientesGlobaisIndisponiveis}
          todosIngredientes={todosIngredientes}
        />
        <GestaoRefrigerantes />
        <section className="gestao-filtros">
          <div className="gestao-categoria-select-wrapper">
            <label className="gestao-categoria-label">Categoria</label>
            <select
              value={categoriaSelecionada}
              onChange={(e) => setCategoriaSelecionada(e.target.value)}
              className="gestao-categoria-select"
            >
              {categoriasOrdenadas.map((cat) => {
                const total = cat === 'Todos'
                  ? produtos.length
                  : produtos.filter((p) => p.categoria === cat).length;
                const dispo = cat === 'Todos'
                  ? produtos.filter((p) => p.disponivel).length
                  : produtos.filter((p) => p.categoria === cat && p.disponivel).length;
                return (
                  <option key={cat} value={cat}>
                    {cat} ({dispo}/{total})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="gestao-search">
            <input
              type="text"
              placeholder="Buscar produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </section>

        {loading ? (
          <div className="gestao-empty">Carregando...</div>
        ) : produtosFiltrados.length === 0 ? (
          <div className="gestao-empty">Nenhum produto encontrado</div>
        ) : (
          <div className="gestao-grid">
            {produtosFiltrados.map((produto) => {
              const ingredientes = Array.isArray(produto.ingredientes) && produto.ingredientes.length > 0
                ? produto.ingredientes
                : extrairIngredientes(produto.descricao);
              // Ingredientes indisponíveis globalmente presentes neste produto
              const indisponiveisNoProduto = ingredientesGlobaisIndisponiveis.filter((ing) =>
                ingredientes.map((i) => i.toLowerCase().trim()).includes(ing.toLowerCase().trim())
              );
              return (
                <div key={produto.id} className="gestao-card">
                  <div className="card-header">
                    <h4 className="card-nome">{produto.nome}</h4>
                    <span className="card-categoria">{produto.categoria}</span>
                  </div>

                  <p className="card-descricao">{produto.descricao}</p>

                  {indisponiveisNoProduto.length > 0 && (
                    <div
                      style={{
                        margin: '8px 0',
                        padding: '8px 10px',
                        borderRadius: 10,
                        background: '#fff7ed',
                        border: '1px dashed #f39c12',
                        color: '#b35c00',
                        fontSize: 13,
                        fontWeight: 600,
                        lineHeight: 1.3,
                      }}
                    >
                      Ingrediente indisponível hoje: {indisponiveisNoProduto.join(', ')}
                    </div>
                  )}

                  <div className="card-preco-section">
                    {editingPriceId === produto.id ? (
                      <div className="preco-edit">
                        <input
                          type="number"
                          step="0.01"
                          value={editingPriceValue}
                          onChange={(e) => setEditingPriceValue(e.target.value)}
                          className="preco-input"
                          autoFocus
                        />
                        <button onClick={() => handleSavePrice(produto.id)} className="preco-btn-save">
                          ✓
                        </button>
                        <button onClick={() => setEditingPriceId(null)} className="preco-btn-cancel">
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div
                        className="preco-display"
                        onClick={() => {
                          setEditingPriceId(produto.id);
                          setEditingPriceValue(produto.preco.toFixed(2));
                        }}
                      >
                        <span className="preco-label">Preço:</span>
                        <span className="preco-valor">R$ {produto.preco.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <div className="card-status">
                    <button
                      className={`status-btn-verde ${produto.disponivel ? 'ativo' : ''}`}
                      onClick={() => handleToggleDisponibilidade(produto.id, true)}
                    >
                      ✓ Disponível
                    </button>
                    <button
                      className={`status-btn-vermelho ${!produto.disponivel ? 'ativo' : ''}`}
                      onClick={() => handleToggleDisponibilidade(produto.id, false)}
                    >
                      ✕ Indisponível
                    </button>
                  </div>

                  {/* Ingredientes clicáveis removidos do card de produto */}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default GestaoCardapio;
