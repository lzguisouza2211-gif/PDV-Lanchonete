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
  onAddItem: (produto: any) => void
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
    <section style={{ marginBottom: 32 }}>
      <div
        style={{
          padding: '12px 0',
          marginBottom: 16,
          borderBottom: '1px solid #eee',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 20,
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
            onAdd={() =>
              onAddItem({
                id: item.id,
                nome: item.nome,
                preco: item.preco,
                descricao: item.descricao,
                ingredientes: item.ingredientes || [],
              })
            }
            lojaAberta={lojaAberta}
            justAdded={produtoAdicionado === String(item.id)}
          />
        ))}
      </div>
    </section>
  )
}