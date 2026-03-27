import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary capturou um erro:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="page">
          <section className="container narrow">
            <div className="card empty-state">
              <p className="kicker">Algo deu errado</p>
              <h1 className="section-title">Ocorreu um erro inesperado.</h1>
              <p className="lead">
                {this.state.error?.message ||
                  'Um erro interno impediu a renderizacao desta pagina.'}
              </p>
              <div className="button-row">
                <button type="button" className="button" onClick={this.handleReset}>
                  Tentar novamente
                </button>
                <a href="/" className="button button-outline">
                  Voltar para o inicio
                </a>
              </div>
            </div>
          </section>
        </div>
      );
    }

    return this.props.children;
  }
}
