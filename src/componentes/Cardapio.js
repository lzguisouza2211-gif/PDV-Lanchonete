import React, { useState, useEffect } from 'react';
import { useCartWithPedidos } from '../store/useCart'
import './Cardapio.css';

function Cardapio() {
    const [cardapio, setCardapio] = useState({});
    const [categoriaAtiva, setCategoriaAtiva] = useState('Lanches');
    const [carrinho, setCarrinho] = useState([]);
    const [mensagem, setMensagem] = useState('');
    const [modalAberto, setModalAberto] = useState(false);
    const [modalItem, setModalItem] = useState(null);
    const [nome, setNome] = useState('');
    const [tipoEntrega, setTipoEntrega] = useState('');
    const [endereco, setEndereco] = useState('');
    const [formaPagamento, setFormaPagamento] = useState('');
    const [troco, setTroco] = useState('');

    const adicionais = [
        { nome: 'Milho', preco: 4.0 },
        { nome: 'Batata', preco: 4.0 },
        { nome: 'Ovo', preco: 4.0 },
        { nome: 'Hambúrguer', preco: 8.0 },
        { nome: 'Cheddar', preco: 8.0 },
        { nome: 'Bacon', preco: 8.0 },
    ];

    useEffect(() => {
        fetch('http://192.168.1.3:3000/cardapio')
            .then((res) => res.json())
            .then((data) => {
                setCardapio(data);
            })
            .catch(() => {});
    }, []);

    const adicionarAoCarrinho = (item) => {
        const novoItem = { ...item, adicionais: [] };
        setCarrinho([...carrinho, novoItem]);
        setMensagem(`${item.nome} foi adicionado ao carrinho!`);
        setTimeout(() => setMensagem(''), 3000);
    };

    const removerDoCarrinho = (index) => {
        const novoCarrinho = [...carrinho];
        novoCarrinho.splice(index, 1);
        setCarrinho(novoCarrinho);
    };

    const adicionarAdicional = (adicional) => {
        if (modalItem !== null) {
            const novoCarrinho = [...carrinho];
            novoCarrinho[modalItem].adicionais.push(adicional);
            setCarrinho(novoCarrinho);
        }
    };

        const { criarPedido } = useCartWithPedidos()

    const calcularTotal = () => {
        return carrinho.reduce((total, item) => {
            const totalAdicionais = item.adicionais.reduce((soma, adicional) => soma + adicional.preco, 0);
            return total + item.preco + totalAdicionais;
        }, 0);
    };

    const finalizarPedido = () => {
        if (!nome) {
            alert('Por favor, insira seu nome.');
            return;
        }
        if (!tipoEntrega) {
            alert('Por favor, selecione se é entrega ou retirada.');
            return;
        }
        if (tipoEntrega === 'entrega' && !endereco) {
            alert('Por favor, insira o endereço para entrega.');
            return;
        }
        if (!formaPagamento) {
            alert('Por favor, selecione uma forma de pagamento.');
            return;
        }
        if (carrinho.length === 0) {
            alert('O carrinho está vazio.');
            return;
        }

        const pedido = {
            cliente: nome,
            tipoEntrega,
            try {
                const created = await criarPedido(pedido)
                if (created) {
                    alert('Pedido enviado com sucesso!');
                    setCarrinho([]);
                    setNome('');
                    setTipoEntrega('');
                    setEndereco('');
                    setFormaPagamento('');
                    setTroco('');
                    setModalAberto(false);
                } else {
                    alert('Erro ao enviar o pedido.');
                }
            } catch (e) {
                alert('Erro ao enviar o pedido.');
            }
                setTipoEntrega('');
                setEndereco('');
                setFormaPagamento('');
                setTroco('');
                setModalAberto(false);
            })
            .catch(() => {});
    };

    return (
        <div className="container">
            <header>
                <h1>Luizão Lanches</h1>
                <p>Cardápio Digital</p>
            </header>

            <nav className="menu-horizontal">
                {Object.keys(cardapio).map((categoria) => (
                    <button
                        key={categoria}
                        onClick={() => setCategoriaAtiva(categoria)}
                        className={categoriaAtiva === categoria ? 'ativo' : ''}
                    >
                        {categoria}
                    </button>
                ))}
            </nav>

            <main>
                <div className="cardapio">
                    {cardapio[categoriaAtiva] &&
                        cardapio[categoriaAtiva].map((item, index) => (
                            <div className="card" key={index}>
                                <h3>{item.nome}</h3>
                                <p>R$ {item.preco.toFixed(2)}</p>
                                <button onClick={() => adicionarAoCarrinho(item)}>Adicionar</button>
                            </div>
                        ))}
                </div>

                <div className="carrinho-bolha" onClick={() => setModalAberto(!modalAberto)}>
                    🛒 {carrinho.length}
                </div>

                {modalAberto && (
                    <div className="modal">
                        <div className="modal-content">
                            <h2>Seu Carrinho</h2>
                            <div className="carrinho-itens">
                                {carrinho.map((item, index) => (
                                    <div className="carrinho-item" key={index}>
                                        <span>{item.nome}</span>
                                        <span>R$ {item.preco.toFixed(2)}</span>
                                        <button onClick={() => setModalItem(index)}>Adicionais</button>
                                        <button onClick={() => removerDoCarrinho(index)}>Remover</button>
                                    </div>
                                ))}
                            </div>
                            <div className="total-carrinho">
                                Total: R$ {calcularTotal().toFixed(2)}
                            </div>

                            <div className="form-finalizar">
                                <input
                                    type="text"
                                    placeholder="Seu nome"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                />
                                <div>
                                    <label>
                                        <input
                                            type="radio"
                                            name="tipoEntrega"
                                            value="retirada"
                                            onChange={(e) => setTipoEntrega(e.target.value)}
                                        />
                                        Retirada
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="tipoEntrega"
                                            value="entrega"
                                            onChange={(e) => setTipoEntrega(e.target.value)}
                                        />
                                        Entrega
                                    </label>
                                </div>
                                {tipoEntrega === 'entrega' && (
                                    <input
                                        type="text"
                                        placeholder="Endereço"
                                        value={endereco}
                                        onChange={(e) => setEndereco(e.target.value)}
                                    />
                                )}
                                <div>
                                    <label>
                                        <input
                                            type="radio"
                                            name="formaPagamento"
                                            value="cartao"
                                            onChange={(e) => setFormaPagamento(e.target.value)}
                                        />
                                        Cartão
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="formaPagamento"
                                            value="dinheiro"
                                            onChange={(e) => setFormaPagamento(e.target.value)}
                                        />
                                        Dinheiro
                                    </label>
                                </div>
                                {formaPagamento === 'dinheiro' && (
                                    <input
                                        type="text"
                                        placeholder="Troco para quanto?"
                                        value={troco}
                                        onChange={(e) => setTroco(e.target.value)}
                                    />
                                )}
                            </div>

                            <button onClick={finalizarPedido}>Finalizar Pedido</button>
                            <button onClick={() => setModalAberto(false)}>Fechar</button>
                        </div>
                    </div>
                )}

                {modalItem !== null && (
                    <div className="modal">
                        <div className="modal-content">
                            <h3>Adicionais para {carrinho[modalItem].nome}</h3>
                            {adicionais.map((adicional, index) => (
                                <button key={index} onClick={() => adicionarAdicional(adicional)}>
                                    {adicional.nome} (+R$ {adicional.preco.toFixed(2)})
                                </button>
                            ))}
                            <button onClick={() => setModalItem(null)}>Fechar</button>
                        </div>
                    </div>
                )}      
            </main>
            {mensagem && <div className="toast">{mensagem}</div>}
        </div>
    );
}

export default Cardapio;
