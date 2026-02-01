import type { NextApiRequest, NextApiResponse } from 'next';
import escpos from 'escpos';
import { printProductionReceipt } from '../../src/services/printer/productionReceipt';
import { printDeliveryReceipt } from '../../src/services/printer/deliveryReceipt';
import { Order } from '../../src/types/index';

// Configuração do dispositivo USB (ajuste se necessário)
const device = new escpos.USB();
const printer = new escpos.Printer(device);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { order, type } = req.body as { order: Order; type: 'production' | 'delivery' };
  if (!order || !type) {
    return res.status(400).json({ error: 'Dados inválidos' });
  }

  try {
    device.open(async function () {
      if (type === 'production') {
        await printProductionReceipt(order, printer);
      } else {
        await printDeliveryReceipt(order, printer);
      }
      res.status(200).json({ success: true });
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Erro ao imprimir' });
  }
}
