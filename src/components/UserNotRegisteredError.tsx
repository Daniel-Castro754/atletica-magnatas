import { Link } from 'react-router-dom';

export default function UserNotRegisteredError() {
  return (
    <section className="page">
      <div className="container narrow">
        <div className="card empty-state">
          <p className="kicker">Acesso bloqueado</p>
          <h1 className="section-title">Seu usuario ainda nao foi liberado.</h1>
          <p className="lead">
            A rota protegida encontrou um perfil sem permissao administrativa. Esse fluxo
            agora mostra uma tela dedicada em vez de quebrar a navegacao.
          </p>
          <div className="button-row">
            <Link to="/admin/login" className="button">
              Ir para login
            </Link>
            <Link to="/" className="button button-secondary">
              Voltar ao inicio
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
