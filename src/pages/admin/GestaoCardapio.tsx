import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { cardapioService } from '../../services/api/cardapio.service';
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

interface IngredientesIndisponivelMap {
  [produtoId: string]: string[];
}

const ORDEM_CATEGORIAS = [
  'Lanches',
  'Macarrão',
  'Porções',
  'Omeletes',
  'Bebidas',
  'Cervejas',
  'Doces',
];

function GestaoCardapio() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('');
  const [editingPriceId, setEditingPriceId] = useState<number | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState('');
  const [ingredientesIndisponiveis, setIngredientesIndisponiveis] = useState<IngredientesIndisponivelMap>({});

  useEffect(() => {
    fetchProdutos();
  }, []);

  async function fetchProdutos() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cardapio')
        .select('*')
        .order('categoria', { ascending: true })
        .order('nome', { ascending: true });

      if (error) throw error;
      
      const produtosData = (data || []) as Produto[];
      setProdutos(produtosData);
      
      // Carregar ingredientes indisponíveis
      const indisponiveis = await cardapioService.listarIngredientesIndisponiveisHoje();
      setIngredientesIndisponiveis(indisponiveis);
      
      if (produtosData && produtosData.length > 0) {
        const categoriasUnicas = Array.from(new Set(produtosData.map(p => p.categoria)));
        const primeiraCategoriaPreferencial = ORDEM_CATEGORIAS.find(cat => categoriasUnicas.includes(cat));
        setCategoriaSelecionada(primeiraCategoriaPreferencial || categoriasUnicas[0]);
      }
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      alert('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  }

  const handleToggleDisponibilidade = async (id: number, disponivel: boolean) => {
    try {
      const { error } = await supabase
        .from('cardapio')
        .update({ disponivel })
        .eq('id', id);

      if (error) throw error;
      
      setProdutos(produtos.map(p => 
        p.id === id ? { ...p, disponivel } : p
      ));
    } catch (error) {
      console.error('Erro ao atualizar disponibilidade:', error);
      alert('Erro ao atualizar');
    }
  };

  const handleSavePrice = async (id: number) => {
    try {
      const novoPreco = parseFloat(editingPriceValue);
      if (isNaN(novoPreco) || novoPreco <= 0) {
        alert('Preço inválido');
        return;
      }

      const { error } = await supabase
        .from('cardapio')
        .update({ preco: novoPreco })
        .eq('id', id);

      if (error) throw error;
      
      setProdutos(produtos.map(p => 
        p.id === id ? { ...p, preco: novoPreco } : p
      ));
      setEditingPriceId(null);
    } catch (error) {
      console.error('Erro ao atualizar preço:', error);
      alert('Erro ao atualizar preço');
    }
  };

  const handleToggleIngrediente = async (produtoId: number | string, ingrediente: string) => {
    try {
      const idStr = String(produtoId);
      const lista = ingredientesIndisponiveis[idStr] || [];
      const jaIndisponivel = lista.includes(ingrediente);
      
      // Atualização otimista
      setIngredientesIndisponiveis(prev => ({
        ...prev,
        [idStr]: jaIndisponivel
          ? prev[idStr].filter(ing => ing !== ingrediente)
          : [...(prev[idStr] || []), ingrediente]
      }));
      
      // Sincroniza com banco
      await cardapioService.definirIngredienteIndisponivel(idStr, ingrediente, !jaIndisponivel);
    } catch (error) {
      console.error('Erro ao atualizar ingrediente:', error);
      alert('Erro ao atualizar ingrediente');
      // Recarregar
      fetchProdutos();
    }
  };

  // Extrai ingredientes da descrição
  const extrairIngredientes = (descricao: string): string[] => {
    if (!descricao) return [];
    // Divide por vírgula e limpa espaços
    return descricao
      .split(',')
      .map(ing => ing.trim())
      .filter(ing => ing.length > 0);
  };

  const categoriasOrdenadas = React.useMemo(() => {
    const categoriasUnicas = Array.from(new Set(produtos.map(p => p.categoria)));
    const ordenadas = ORDEM_CATEGORIAS.filter(cat => categoriasUnicas.includes(cat));
    const restantes = categoriasUnicas.filter(cat => !ORDEM_CATEGORIAS.includes(cat));
    return [...ordenadas, ...restantes];
  }, [produtos]);

  const produtosFiltrados = produtos.filter(produto => {
    const matchesCategoria = produto.categoria === categoriaSelecionada;
    const matchesSearch = searchTerm === '' || 
                         produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategoria && matchesSearch;
  });

  const produtosCategoria = produtos.filter(p => p.categoria === categoriaSelecionada);
  const disponiveis = produtosCategoria.filter(p => p.disponivel).length;

  if (loading) {
    return (
      <div className="admin-container">
        <main className="admin-main">
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p style={{ fontSize: '1.1rem', color: '#666' }}>Carregando...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <main className="admin-main gestao-layout">
        <section className="gestao-main">
          {/* Header */}
          <div className="gestao-header">
            <div>
              <h1 className="gestao-title">{categoriaSelecionada}</h1>
              <p className="gestao-subtitle">
                {disponiveis} de {produtosCategoria.length} produtos disponíveis
              </p>
            </div>

            <div className="gestao-header-actions">
              <div className="gestao-categoria-select-wrapper">
                <label className="gestao-categoria-label">Categoria</label>
                <select
                  value={categoriaSelecionada}
                  onChange={(e) => setCategoriaSelecionada(e.target.value)}
                  className="gestao-categoria-select"
                >
                  {categoriasOrdenadas.map(cat => {
                    const total = produtos.filter(p => p.categoria === cat).length;
                    const dispo = produtos.filter(p => p.categoria === cat && p.disponivel).length;
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
                  className="search-input"
                />
              </div>
            </div>
          </div>

          {/* Produtos Grid */}
          {produtosFiltrados.length === 0 ? (
            <div className="gestao-empty">
              <p>Nenhum produto encontrado</p>
            </div>
          ) : (
            <div className="gestao-grid">
              {produtosFiltrados.map(produto => (
                <div key={produto.id} className="gestao-card">
                  {/* Nome */}
                  <div className="card-header">
                    <h4 className="card-nome">{produto.nome}</h4>
                  </div>

                  {/* Preço */}
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
                        <button 
                          onClick={() => handleSavePrice(produto.id)}
                          className="preco-btn-save"
                        >
                          ✓
                        </button>
                        <button 
                          onClick={() => setEditingPriceId(null)}
                          className="preco-btn-cancel"
                        >
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

                  {/* Status Buttons */}
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

                  {/* Ingredientes - Direto da descrição */}
                  {produto.descricao && (
                    <div className="card-ingredientes-inline">
                      <div className="ingredientes-label">Ingredientes:</div>
                      <div className="ingredientes-buttons">
                        {extrairIngredientes(produto.descricao).map(ing => {
                          const indispo = (ingredientesIndisponiveis[String(produto.id)] || []).includes(ing);
                          return (
                            <button
                              key={ing}
                              className={`ingrediente-badge ${indispo ? 'indisponivel' : 'disponivel'}`}
                              onClick={() => handleToggleIngrediente(produto.id, ing)}
                              title={indispo ? 'Marcar como disponível' : 'Marcar como indisponível'}
                            >
                              {ing}
                              <span className="badge-icon">{indispo ? '✕' : '✓'}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default GestaoCardapio;
