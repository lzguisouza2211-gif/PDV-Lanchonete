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
    .align('CT')
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

  for (const item of order.items) {
    printer.text(formatItemLine({ name: item.name, quantity: item.quantity }));
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
