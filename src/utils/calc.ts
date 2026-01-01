export function calcularTotal(itens: Array<{ preco: number; quantidade: number }>) {
  return itens.reduce((s, i) => s + i.preco * i.quantidade, 0)
}
