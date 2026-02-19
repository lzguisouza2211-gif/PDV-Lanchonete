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
    .align('LT')
    .style('B')
    .text(STORE_NAME)
    .style('NORMAL')
    .text('PEDIDO #' + order.orderNumber)
    .text(new Date(order.createdAt).toLocaleString('pt-BR'))
    .text(separatorLine())
    .text('');

  printer.text(alignLeftRight('Item', 'Valor', 48));

  const seen = new Set();
  for (const item of order.items) {
    const key = item.name + (item.observations || '') + JSON.stringify(item.addons || []) + JSON.stringify(item.removes || []);
    if (seen.has(key)) continue;
    seen.add(key);
    printer.text(formatItemLine({ name: item.name, quantity: item.quantity, price: item.price }, 48, { showPrice: true, centerQty: false }));
    if (item.addons && item.addons.length > 0) {
      for (const add of item.addons) {
        printer.text('   + ' + add.nome);
      }
    }
    if (item.removes && item.removes.length > 0) {
      for (const ret of item.removes) {
        printer.text('   - Sem ' + ret.nome);
      }
    }
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
