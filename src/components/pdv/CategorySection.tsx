import React from 'react'
import ProductCard from './ProductCard'

type CategorySectionProps = {
  categoria: string
  itens: Array<{
    id: number
    nome: string
    preco: number
    descricao?: string
    ingredientes?: string[]
  }>
  onAddItem: (produto: {
    id: number
    nome: string
    preco: number
    descricao?: string
    ingredientes?: string[]
  }) => void
  lojaAberta: boolean
  produtoAdicionado?: string | null
}

export default function CategorySection({
  categoria,
  itens,
  onAddItem,
  lojaAberta,
  produtoAdicionado,
}: CategorySectionProps) {
  return (
    <section
      style={{
        marginBottom: 48,
        scrollMarginTop: 180,
      }}
      id={`categoria-${categoria.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div
        style={{
          position: 'sticky',
          top: 160,
          background: '#fff8f2',
          padding: '16px 0',
          marginBottom: 24,
          zIndex: 10,
          borderBottom: '2px solid #c0392b',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 700,
            color: '#c0392b',
            textTransform: 'capitalize',
          }}
        >
          {categoria}
        </h2>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 20,
        }}
      >
        {itens.map((item) => (
          <ProductCard
            key={item.id}
            id={item.id}
            nome={item.nome}
            preco={item.preco}
            descricao={item.descricao}
            onAdd={() => onAddItem({
              id: item.id,
              nome: item.nome,
              preco: item.preco,
              descricao: item.descricao,
              ingredientes: item.ingredientes || [],
            })}
            lojaAberta={lojaAberta}
            justAdded={produtoAdicionado === String(item.id)}
          />
        ))}
      </div>
    </section>
  )
}

