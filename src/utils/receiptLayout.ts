// Utilitários de layout para recibos ESC/POS (32 colunas)

/**
 * Retorna uma linha separadora (32 colunas)
 */
export function separatorLine(char: string = '-') {
  return char.repeat(32);
}

/**
 * Alinha texto à esquerda e à direita na mesma linha (32 colunas)
 */
export function alignLeftRight(left: string, right: string, width: number = 32) {
  const leftStr = left.length > width - right.length ? left.slice(0, width - right.length - 1) + '…' : left;
  const space = width - leftStr.length - right.length;
  return leftStr + ' '.repeat(space > 0 ? space : 0) + right;
}

/**
 * Formata linha de item para produção ou entrega
 * options: { showPrice?: boolean, centerQty?: boolean }
 */
export function formatItemLine(
  item: { name: string; quantity: number; price?: number },
  width: number = 32,
  options: { showPrice?: boolean; centerQty?: boolean } = {}
) {
  const qty = item.quantity.toString();
  if (options.showPrice && typeof item.price === 'number') {
    // Nome à esquerda, quantidade centralizada, preço à direita
    const nameMax = options.centerQty ? 14 : 18;
    const name = item.name.length > nameMax ? item.name.slice(0, nameMax - 1) + '…' : item.name;
    const qtyPad = options.centerQty ? Math.floor((6 - qty.length) / 2) : 1;
    const qtyStr = ' '.repeat(qtyPad) + qty + ' '.repeat(6 - qty.length - qtyPad);
    const price = item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    return alignLeftRight(name + qtyStr, price, width);
  } else {
    // Quantidade + nome (produção)
    const qtyStr = qty.padStart(2, ' ');
    const name = item.name.length > width - 4 ? item.name.slice(0, width - 5) + '…' : item.name;
    return qtyStr + '  ' + name;
  }
}
