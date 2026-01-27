import React, { useEffect, useState } from 'react';
import { cardapioService } from '../../services/api/cardapio.service';
import './GlobalIngredientesCard.css';

interface GlobalIngredientesCardProps {
  onToggle: (ingrediente: string, indisponivel: boolean) => void;
  indisponiveis: string[];
  todosIngredientes: string[];
}

const GlobalIngredientesCard: React.FC<GlobalIngredientesCardProps> = ({ onToggle, indisponiveis, todosIngredientes }) => {
  // Ingredientes que não podem ser marcados como indisponíveis globalmente
  const bloqueados = [
    'maionese',
    'tomate',
    'pao de hamburguer',
    'pao frances',
    'batata',
    'chocolate',
    'frango',
    'hamburguer 200g',
    'ovos',
    'queijo',
    'queijo em cubos',
    'alface',
  ];
  return (
    <div className="global-ingredientes-card">
      <h3>Gestão Global de Ingredientes</h3>
      <div className="ingredientes-list">
        {todosIngredientes
          .filter((ing) => !bloqueados.includes(ing.toLowerCase().trim()))
          .map((ing) => {
            const indispo = indisponiveis.includes(ing);
            return (
              <button
                key={ing}
                className={`ingrediente-badge ${indispo ? 'indisponivel' : 'disponivel'}`}
                onClick={() => onToggle(ing, !indispo)}
              >
                <span className="badge-icon">{indispo ? '✕' : '✓'}</span> {ing}
              </button>
            );
          })}
      </div>
    </div>
  );
};

export default GlobalIngredientesCard;
