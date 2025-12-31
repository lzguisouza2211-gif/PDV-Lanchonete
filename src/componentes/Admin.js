import React, { useState, useEffect, useCallback } from 'react';
import './Admin.css';

function Admin() {
    const [pedidos, setPedidos] = useState([]);
    const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
    const [statusAtualizando, setStatusAtualizando] = useState(null);
    const [audio] = useState(new Audio('/notification.mp3'));
    const [somHabilitado, setSomHabilitado] = useState(false);

    // Função para tocar o som (memoizada para não mudar a cada render)
    const tocarSom = useCallback(() => {
        audio.volume = 1; // Definir volume no máximo
        audio.play().catch((err) => console.error('Erro ao tocar som:', err));
    }, [audio]);

    // Carregar pedidos e tocar som quando houver novo pedido
    useEffect(() => {
        const carregarPedidos = () => {
            fetch('http://192.168.1.3:3000/pedidos')
                .then((res) => res.json())
                .then((data) => {
                    const pedidosOrdenados = data.sort((a, b) => b.id - a.id);
                    
                    // Se chegou um novo pedido e o som estiver habilitado, tocar som
                    if (pedidos.length < pedidosOrdenados.length && somHabilitado) {
                        tocarSom();
                    }
                    setPedidos(pedidosOrdenados);
                })
                .catch((err) => console.error('Erro ao carregar os pedidos:', err));
        };

        carregarPedidos();
        const intervalo = setInterval(carregarPedidos, 5000);
        return () => clearInterval(intervalo);
    }, [pedidos, somHabilitado, tocarSom]);

    // Forçar ativação do áudio com interação do usuário
    const ativarSom = () => {
        setSomHabilitado(true);
        audio.play().catch(() => console.log("Som ativado, aguardando pedido."));
    };

    // (tocarSom agora definido acima com useCallback)

    const atualizarStatus = (id, status) => {
        setStatusAtualizando(id);

        fetch(`http://192.168.1.3:3000/pedidos/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        })
            .then(() => {
                setPedidos((pedidos) =>
                    pedidos.map((pedido) =>
                        pedido.id === id ? { ...pedido, status } : pedido
                    )
                );
            })
            .finally(() => setStatusAtualizando(null));
    };

    const calcularTotalPedido = (pedido) => {
        let total = pedido.total;
        pedido.itens.forEach(item => {
            if (item.adicionais && item.adicionais.length > 0) {
                item.adicionais.forEach(ad => {
                    total += ad.preco;
                });
            }
        });
        return total.toFixed(2);
    };

    return (
        <div className="admin-container">
            <h1>Interno Pedidos</h1>
            
            {/* Botão para ativar som manualmente */}
            <button onClick={ativarSom}>🔊 Testar Som</button>
            
            <div className="pedidos-lista">
                {pedidos.map((pedido) => (
                    <div key={pedido.id} className="pedido">
                        <h3>Cliente: {pedido.cliente}</h3>
                        <p>Total: R$ {calcularTotalPedido(pedido)}</p>
                        <p>Status: {pedido.status}</p>
                        <button onClick={() => setPedidoSelecionado(pedido)}>Ver Detalhes</button>
                        <div className="botoes-status">
                            <button
                                disabled={statusAtualizando === pedido.id}
                                onClick={() => atualizarStatus(pedido.id, 'Aceito')}
                            >
                                Aceitar Pedido
                            </button>
                            <button
                                disabled={statusAtualizando === pedido.id}
                                onClick={() => atualizarStatus(pedido.id, 'Em produção')}
                            >
                                Em produção
                            </button>
                            <button
                                disabled={statusAtualizando === pedido.id}
                                onClick={() => atualizarStatus(pedido.id, 'Finalizado')}
                            >
                                Finalizado
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {pedidoSelecionado && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Detalhes do Pedido</h2>
                        <p><strong>Cliente:</strong> {pedidoSelecionado.cliente}</p>
                        <p><strong>Tipo de Entrega:</strong> {pedidoSelecionado.tipoEntrega}</p>
                        {pedidoSelecionado.tipoEntrega === 'entrega' && (
                            <p><strong>Endereço:</strong> {pedidoSelecionado.endereco}</p>
                        )}
                        <p><strong>Forma de Pagamento:</strong> {pedidoSelecionado.formaPagamento}</p>
                        {pedidoSelecionado.formaPagamento === 'dinheiro' && (
                            <p><strong>Troco:</strong> R$ {pedidoSelecionado.troco}</p>
                        )}
                        <h3>Itens:</h3>
                        <ul>
                            {pedidoSelecionado.itens.map((item, index) => (
                                <li key={index}>
                                    {item.nome} - R$ {item.preco.toFixed(2)}
                                    {item.adicionais && item.adicionais.length > 0 && (
                                        <ul>
                                            {item.adicionais.map((ad, idx) => (
                                                <li key={idx}>+ {ad.nome} (R$ {ad.preco.toFixed(2)})</li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            ))}
                        </ul>
                        <p><strong>Total Corrigido:</strong> R$ {calcularTotalPedido(pedidoSelecionado)}</p>
                        <button onClick={() => setPedidoSelecionado(null)}>Fechar</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Admin;
