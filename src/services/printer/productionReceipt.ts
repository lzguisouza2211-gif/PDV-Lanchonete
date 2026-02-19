import escpos from 'escpos';
import { Order } from '../../types/index';
import { separatorLine, formatItemLine } from '../../utils/receiptLayout';

/**
 * Imprime notinha de produção (cozinha)
 * - Foco em itens e observações
 * - Não mostra valores
 */
export async function printProductionReceipt(order: Order, printer: escpos.Printer) {
  printer
    .align('LT')
    .style('B')
    .size(2, 2)
    .text('PRODUÇÃO')
    .size(1, 1)
    .style('NORMAL')
    .text('')
    .text('PEDIDO #' + order.orderNumber)
    .text(new Date(order.createdAt).toLocaleString('pt-BR'))
    .text(separatorLine())
    .text('');

  const seen = new Set();
  for (const item of order.items) {
    const key = item.name + (item.observations || '') + JSON.stringify(item.addons || []) + JSON.stringify(item.removes || []);
    if (seen.has(key)) continue;
    seen.add(key);
    printer.text(formatItemLine({ name: item.name, quantity: item.quantity }, 48));
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
    printer.text('');
  }

  printer.text(separatorLine());
  printer.text(order.isDelivery ? 'DELIVERY' : 'BALCÃO');
  printer.text('');
  printer.cut();
  await printer.close();
}
