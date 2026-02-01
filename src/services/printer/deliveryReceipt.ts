import escpos from 'escpos';
import { Order } from '../../types/index';
import { separatorLine, alignLeftRight, formatItemLine } from '../../utils/receiptLayout';

const STORE_NAME = 'Lanchonete Luizão';

/**
 * Imprime notinha de entrega (cliente/motoboy)
 * - Mostra valores, pagamento e endereço
 */
export async function printDeliveryReceipt(order: Order, printer: escpos.Printer) {
  printer
    .align('CT')
    .style('B')
    .text(STORE_NAME)
    .style('NORMAL')
    .text('PEDIDO #' + order.orderNumber)
    .text(new Date(order.createdAt).toLocaleString('pt-BR'))
    .text(separatorLine())
    .text('');

  // Cabeçalho dos itens
  printer.text(alignLeftRight('Item', 'Valor', 32));


  for (const item of order.items) {
    // Nome à esquerda, quantidade centralizada, preço à direita
    printer.text(formatItemLine({ name: item.name, quantity: item.quantity, price: undefined }, 32, { showPrice: false, centerQty: false }));
    // Adicionais
    if (item.adicionais && item.adicionais.length > 0) {
      for (const add of item.adicionais) {
        printer.text('   + ' + add.nome);
      }
    }
    // Retirados
    if (item.retirados && item.retirados.length > 0) {
      for (const ret of item.retirados) {
        printer.text('   - Sem ' + ret.nome);
      }
    }
    // Observações (opcional)
    if (item.observations) {
      printer.text('  Obs: ' + item.observations);
    }
  }

  printer.text(separatorLine());
  // Removido subtotal (igual ao total)
  if (order.deliveryFee) {
    printer.text(alignLeftRight('Entrega', order.deliveryFee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 32));
  }
  printer.style('B');
  printer.text(alignLeftRight('TOTAL', order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 32));
  printer.style('NORMAL');
  printer.text('');
  printer.text('Pagamento: ' + order.paymentMethod);
  if (order.troco) printer.text('Troco: R$ ' + Number(order.troco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
  if (order.customerName) printer.text('Cliente: ' + order.customerName);
  if (order.customerPhone) printer.text('Fone: ' + order.customerPhone);
  if (order.isDelivery && order.deliveryAddress) printer.text('Endereço: ' + order.deliveryAddress);
  printer.text('');
  printer.cut();
  await printer.close();
}
