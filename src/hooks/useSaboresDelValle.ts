import { useEffect, useState } from 'react';
import { listarSaboresDelValle } from '../services/delValleSabores.service';

export function useSaboresDelValle() {
  const [sabores, setSabores] = useState<{ id: number; sabor: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setErro(null);
    listarSaboresDelValle()
      .then((data) => setSabores(data))
      .catch((e) => setErro(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { sabores, loading, erro };
}
