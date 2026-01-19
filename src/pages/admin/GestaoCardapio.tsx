import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { cardapioService } from '../../services/api/cardapio.service';
import { ingredientesService, Adicional, RetirarIngred } from '../../services/api/ingredientes.service';
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
  'Doces',
];

function GestaoCardapio() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('Todos');
  const [editingPriceId, setEditingPriceId] = useState<number | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState('');
  const [produtoSelecionadoIngredientes, setProdutoSelecionadoIngredientes] = useState<Produto | null>(null);
  const [adicionais, setAdicionais] = useState<Adicional[]>([]);
  const [retirar, setRetirar] = useState<RetirarIngred[]>([]);
  const [novoAdicional, setNovoAdicional] = useState({ nome: '', preco: '' });
  const [novoRetirar, setNovoRetirar] = useState('');
  const [loadingIngredientes, setLoadingIngredientes] = useState(false);

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
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      alert('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  }

  async function carregarIngredientes(produtoId: number) {
    try {
      setLoadingIngredientes(true);
      const [adicionaisData, retirarData] = await Promise.all([
        ingredientesService.getAdicionaisAdminPorProduto(produtoId),
        ingredientesService.getRetirarAdminPorProduto(produtoId),
      ]);
      setAdicionais(adicionaisData);
      setRetirar(retirarData);
    } catch (error) {
      console.error('Erro ao carregar ingredientes:', error);
    } finally {
      setLoadingIngredientes(false);
    }
  }

  async function abrirIngredientes(produto: Produto) {
    setProdutoSelecionadoIngredientes(produto);
    await carregarIngredientes(produto.id);
  }

  async function adicionarNovoAdicional() {
    if (!produtoSelecionadoIngredientes || !novoAdicional.nome || !novoAdicional.preco) {
      alert('Preencha nome e preço');
      return;
    }

    try {
      const resultado = await ingredientesService.criarAdicional(
        produtoSelecionadoIngredientes.id,
        novoAdicional.nome,
        parseFloat(novoAdicional.preco)
      );
      if (resultado) {
        setAdicionais([...adicionais, resultado]);
        setNovoAdicional({ nome: '', preco: '' });
      }
    } catch (error) {
      console.error('Erro ao adicionar:', error);
      alert('Erro ao adicionar');
    }
  }

  async function adicionarNovoRetirar() {
    if (!produtoSelecionadoIngredientes || !novoRetirar) {
      alert('Digite o nome do ingrediente');
      return;
    }

    try {
      const resultado = await ingredientesService.criarRetirar(
        produtoSelecionadoIngredientes.id,
        novoRetirar
      );
      if (resultado) {
        setRetirar([...retirar, resultado]);
        setNovoRetirar('');
      }
    } catch (error) {
      console.error('Erro ao adicionar:', error);
      alert('Erro ao adicionar');
    }
  }

  async function toggleAtivoAdicional(id: number, ativo: boolean) {
    try {
      await ingredientesService.atualizarAdicional(id, { ativo: !ativo });
      setAdicionais(adicionais.map(a => a.id === id ? { ...a, ativo: !ativo } : a));
    } catch (error) {
      console.error('Erro ao atualizar:', error);
    }
  }

  async function toggleAtivoRetirar(id: number, ativo: boolean) {
    try {
      await ingredientesService.atualizarRetirar(id, { ativo: !ativo });
      setRetirar(retirar.map(r => r.id === id ? { ...r, ativo: !ativo } : r));
    } catch (error) {
      console.error('Erro ao atualizar:', error);
    }
  }

  async function excluirAdicional(id: number) {
    if (!window.confirm('Deseja excluir este ingrediente?')) return;
    try {
      await ingredientesService.excluirAdicional(id);
      setAdicionais(adicionais.filter(a => a.id !== id));
    } catch (error) {
      console.error('Erro ao excluir:', error);
    }
  }

  async function excluirRetirar(id: number) {
    if (!window.confirm('Deseja excluir este ingrediente?')) return;
    try {
      await ingredientesService.excluirRetirar(id);
      setRetirar(retirar.filter(r => r.id !== id));
    } catch (error) {
      console.error('Erro ao excluir:', error);
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
    return ['Todos', ...ordenadas, ...restantes];
  }, [produtos]);

  const produtosFiltrados = produtos.filter(produto => {
    const matchesCategoria = categoriaSelecionada === 'Todos' || produto.categoria === categoriaSelecionada;
    const matchesSearch = searchTerm === '' || 
                         produto.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategoria && matchesSearch;
  });

  const produtosCategoria = categoriaSelecionada === 'Todos' 
    ? produtos 
    : produtos.filter(p => p.categoria === categoriaSelecionada);
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
                    if (cat === 'Todos') {
                      const total = produtos.length;
                      const dispo = produtos.filter(p => p.disponivel).length;
                      return (
                        <option key={cat} value={cat}>
                          Todos ({dispo}/{total})
                        </option>
                      );
                    }
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

                  {/* Botão Ingredientes */}
                  {['Lanches', 'Macarrão', 'Omeletes'].includes(produto.categoria) && (
                    <div style={{ marginTop: '12px' }}>
                      <button
                        onClick={() => abrirIngredientes(produto)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          backgroundColor: '#3498db',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: 600,
                        }}
                      >
                        🥘 Editar ingredientes
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Modal de Ingredientes */}
      {produtoSelecionadoIngredientes && (
        <div className="gestao-modal-overlay" onClick={() => setProdutoSelecionadoIngredientes(null)}>
          <div className="gestao-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gestao-modal-header">
              <h3>Ingredientes - {produtoSelecionadoIngredientes.nome}</h3>
              <button className="modal-close" onClick={() => setProdutoSelecionadoIngredientes(null)}>
                ✕
              </button>
            </div>

            {loadingIngredientes ? (
              <p style={{ padding: '12px' }}>Carregando ingredientes...</p>
            ) : (
              <div className="ingredientes-grid">
                <div className="ingredientes-col">
                  <h4>Adicionáveis</h4>
                  <div className="ingredientes-list">
                    {adicionais.map((item) => (
                      <div key={item.id} className="ingrediente-row">
                        <div>
                          <div className="ingrediente-nome">{item.nome}</div>
                          <div className="ingrediente-preco">R$ {item.preco.toFixed(2)}</div>
                        </div>
                        <div className="ingrediente-actions">
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={item.ativo}
                              onChange={() => toggleAtivoAdicional(item.id, item.ativo)}
                            />
                            <span className="slider" />
                          </label>
                          <button className="btn-danger" onClick={() => excluirAdicional(item.id)}>
                            Excluir
                          </button>
                        </div>
                      </div>
                    ))}
                    {adicionais.length === 0 && <p className="ingredientes-empty">Nenhum adicional</p>}
                  </div>

                  <div className="ingrediente-form">
                    <input
                      type="text"
                      placeholder="Nome do adicional"
                      value={novoAdicional.nome}
                      onChange={(e) => setNovoAdicional({ ...novoAdicional, nome: e.target.value })}
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Preço"
                      value={novoAdicional.preco}
                      onChange={(e) => setNovoAdicional({ ...novoAdicional, preco: e.target.value })}
                    />
                    <button className="btn-primary" onClick={adicionarNovoAdicional}>Adicionar</button>
                  </div>
                </div>

                <div className="ingredientes-col">
                  <h4>Removíveis</h4>
                  <div className="ingredientes-list">
                    {retirar.map((item) => (
                      <div key={item.id} className="ingrediente-row">
                        <div className="ingrediente-nome">{item.nome}</div>
                        <div className="ingrediente-actions">
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={item.ativo}
                              onChange={() => toggleAtivoRetirar(item.id, item.ativo)}
                            />
                            <span className="slider" />
                          </label>
                          <button className="btn-danger" onClick={() => excluirRetirar(item.id)}>
                            Excluir
                          </button>
                        </div>
                      </div>
                    ))}
                    {retirar.length === 0 && <p className="ingredientes-empty">Nenhum removível</p>}
                  </div>

                  <div className="ingrediente-form">
                    <input
                      type="text"
                      placeholder="Nome do ingrediente"
                      value={novoRetirar}
                      onChange={(e) => setNovoRetirar(e.target.value)}
                    />
                    <button className="btn-primary" onClick={adicionarNovoRetirar}>Adicionar</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default GestaoCardapio;
