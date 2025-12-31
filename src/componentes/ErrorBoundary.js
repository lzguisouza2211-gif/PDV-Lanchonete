import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        // Atualiza o estado para mostrar a mensagem de fallback
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Você pode registrar o erro em um serviço de log aqui
        // logging intentionally omitted to avoid console usage in production build
    }

    render() {
        if (this.state.hasError) {
            return <h1>Algo deu errado. Por favor, tente novamente.</h1>;
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
