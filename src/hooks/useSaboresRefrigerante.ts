import { useEffect, useState } from 'react';
import { listarSaboresRefrigerantePorTipo } from '../services/refrigeranteSabores.service';

export function useSaboresRefrigerante(tipo: string) {
  const [sabores, setSabores] = useState<{ id: number; sabor: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setErro(null);
    listarSaboresRefrigerantePorTipo(tipo)
      .then((data) => setSabores(data))
      .catch((e) => setErro(e.message))
      .finally(() => setLoading(false));
  }, [tipo]);

  return { sabores, loading, erro };
}
