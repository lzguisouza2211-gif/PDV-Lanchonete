
import React, { useEffect, useState } from 'react';
import { listarProdutosDisponiveisPorCategoriaTipo, atualizarDisponibilidadeProduto, ProdutoDisponibilidade } from '../../services/produtosDisponibilidade.service';
import { supabase } from '../../services/supabaseClient';
import './GlobalIngredientesCard.css';

const CATEGORIAS = [
  { label: 'Refrigerante', value: 'refrigerante' },
  { label: 'Del Valle', value: 'del valle' },
];
const TIPOS = ['lata', '600ml', '2L'];

export default function GestaoRefrigerantes() {
  const [categoria, setCategoria] = useState(CATEGORIAS[0].value);
  const [tipo, setTipo] = useState(TIPOS[0]);
  const [sabores, setSabores] = useState<ProdutoDisponibilidade[]>([]);
  const [novoSabor, setNovoSabor] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function carregarSabores() {
    setLoading(true);
    setErro(null);
    try {
      const lista = await listarProdutosDisponiveisPorCategoriaTipo(categoria, tipo);
      setSabores(lista);
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarSabores();
    // eslint-disable-next-line
  }, [tipo, categoria]);

  async function handleToggleDisponibilidade(id: number, disponivel: boolean) {
    try {
      await atualizarDisponibilidadeProduto(id, disponivel);
      carregarSabores();
    } catch (e: any) {
      setErro(e.message);
    }
  }

  async function handleAdicionarSabor(e: React.FormEvent) {
    e.preventDefault();
    if (!novoSabor.trim()) return;
    setLoading(true);
    setErro(null);
    try {
      const { error } = await supabase.from('produtos_disponibilidade').insert({
        categoria,
        tipo,
        sabor: novoSabor.trim(),
        disponivel: true,
      });
      if (error) throw error;
      setNovoSabor('');
      carregarSabores();
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="global-ingredientes-card">
      <h3>Gestão de Bebidas</h3>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        <label className="gestao-categoria-label">Categoria</label>
        <select
          className="gestao-categoria-select"
          value={categoria}
          onChange={e => setCategoria(e.target.value)}
          style={{ minWidth: 120 }}
        >
          {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <label className="gestao-categoria-label">Tipo</label>
        <select
          className="gestao-categoria-select"
          value={tipo}
          onChange={e => setTipo(e.target.value)}
          style={{ minWidth: 100 }}
        >
          {TIPOS.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
        </select>
      </div>
      <form className="gestao-form-row" onSubmit={handleAdicionarSabor} style={{ marginBottom: 12 }}>
        <input
          className="gestao-input"
          type="text"
          placeholder="Novo sabor"
          value={novoSabor}
          onChange={e => setNovoSabor(e.target.value)}
          disabled={loading}
          style={{ maxWidth: 200 }}
        />
        <button className="gestao-btn verde" type="submit" disabled={loading || !novoSabor.trim()}>
          Adicionar
        </button>
      </form>
      {erro && <div className="gestao-erro" style={{ marginBottom: 8 }}>{erro}</div>}
      {loading ? (
        <div className="gestao-empty">Carregando...</div>
      ) : (
        <div className="ingredientes-list" style={{ gap: '0.5rem', marginTop: 8 }}>
          {sabores.length === 0 && <div className="gestao-empty">Nenhum sabor cadastrado</div>}
          {sabores.map((sabor) => (
            <button
              key={sabor.id}
              className={`ingrediente-badge ${sabor.disponivel ? 'disponivel' : 'indisponivel'}`}
              style={{ fontSize: '1rem', padding: '0.4rem 1.1rem', minWidth: 120, justifyContent: 'center', display: 'flex', alignItems: 'center' }}
              onClick={() => handleToggleDisponibilidade(sabor.id, !sabor.disponivel)}
            >
              <span className="badge-icon">{sabor.disponivel ? '✓' : '✕'}</span> {sabor.sabor} <span style={{ fontSize: 12, color: '#888', marginLeft: 6 }}>{tipo.toUpperCase()}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
