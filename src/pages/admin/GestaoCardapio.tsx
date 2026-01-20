import React, { useEffect, useMemo, useState } from 'react';
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
      const mapa = await cardapioService.listarIngredientesIndisponiveisHoje();
      const convertida: Record<number, string[]> = {};
      Object.entries(mapa).forEach(([key, lista]) => {
        convertida[Number(key)] = lista;
      });
      setIngredientesIndisponiveis(convertida);
    } catch (err) {
      console.error('Erro ao buscar ingredientes indisponíveis:', err);
    }
  }

  function extrairIngredientes(descricao: string): string[] {
    if (!descricao) return [];
    const texto = descricao.replace(/\n/g, ' ');
    const partes = texto.split(/,|\/| e /i).map((p) => p.trim()).filter(Boolean);
    return Array.from(new Set(partes));
  }

  async function toggleIngredienteDisponibilidade(produtoId: number, ingrediente: string) {
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
      );
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
              return (
                <div key={produto.id} className="gestao-card">
                  <div className="card-header">
                    <h4 className="card-nome">{produto.nome}</h4>
                    <span className="card-categoria">{produto.categoria}</span>
                  </div>

                  <p className="card-descricao">{produto.descricao}</p>

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

                  {CATEGORIAS_COM_INGREDIENTES.includes(produto.categoria) && ingredientes.length > 0 && (
                    <div className="card-ingredientes-inline">
                      <div className="ingredientes-label">Ingredientes</div>
                      <div className="ingredientes-buttons">
                        {ingredientes.map((ing) => {
                          const indispo = (ingredientesIndisponiveis[produto.id] || []).includes(ing);
                          return (
                            <button
                              key={ing}
                              className={`ingrediente-badge ${indispo ? 'indisponivel' : 'disponivel'}`}
                              onClick={() => toggleIngredienteDisponibilidade(produto.id, ing)}
                            >
                              <span className="badge-icon">{indispo ? '✕' : '✓'}</span> {ing}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
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
