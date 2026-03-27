import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../components/layout/AppLayout';
import { useAnalytics } from '../lib/AnalyticsContext';
import { formatCurrency } from '../lib/formatCurrency';
import { ORDER_STATUS_LABELS } from '../lib/orders';
import { useOrders } from '../lib/OrdersContext';
import type { SubmittedOrder } from '../types/order';

const initialCheckoutForm = {
  customerName: '',
  contact: '',
  notes: '',
};

export default function CartPage() {
  const { cart, cartTotal, clearCart, removeFromCart, updateQuantity } = useCart();
  const { trackBeginCheckout } = useAnalytics();
  const { submitOrder } = useOrders();
  const location = useLocation();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState(initialCheckoutForm);
  const [checkoutError, setCheckoutError] = useState('');
  const [lastSubmittedOrder, setLastSubmittedOrder] = useState<SubmittedOrder | null>(null);

  const cartItemsCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  function handleOpenCheckout() {
    setCheckoutOpen(true);
    setCheckoutError('');

    trackBeginCheckout({
      pathname: location.pathname,
      cartLineItems: cart.length,
      cartItemsCount,
      cartTotal,
    });
  }

  function handleSubmitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const customerName = checkoutForm.customerName.trim();
    const contact = checkoutForm.contact.trim();

    if (!customerName || !contact) {
      setCheckoutError('Preencha nome e contato para enviar o pedido.');
      return;
    }

    const nextOrder = submitOrder(
      {
        customerName,
        contact,
        notes: checkoutForm.notes.trim(),
      },
      cart,
      location.pathname
    );

    setLastSubmittedOrder(nextOrder);
    setCheckoutForm(initialCheckoutForm);
    setCheckoutOpen(false);
    setCheckoutError('');
    clearCart();
  }

  if (!cart.length && lastSubmittedOrder) {
    return (
      <div className="page">
        <section className="container narrow">
          <div className="card empty-state">
            <ShoppingBag size={28} />
            <p className="kicker">Pedido enviado</p>
            <h1 className="section-title">Seu pedido foi registrado com sucesso.</h1>
            <p className="lead">
              Pedido <strong>{lastSubmittedOrder.code}</strong> enviado em{' '}
              {lastSubmittedOrder.customer.contact}.
            </p>
            <p className="muted">
              Status atual: {ORDER_STATUS_LABELS[lastSubmittedOrder.status]}. A diretoria agora
              consegue acompanhar esse envio no painel e o analytics registra essa conversao
              como um pedido real persistido.
            </p>
            <div className="button-row">
              <Link to="/loja" className="button">
                Voltar para a loja
              </Link>
              <Link to="/magnatas" className="button button-outline">
                Ver institucional
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!cart.length) {
    return (
      <div className="page">
        <section className="container narrow">
          <div className="card empty-state">
            <ShoppingBag size={28} />
            <h1 className="section-title">Seu carrinho esta vazio.</h1>
            <p className="lead">
              Escolha os itens oficiais da Magnatas e monte seu carrinho para jogos, eventos e
              rotina no campus.
            </p>
            <Link to="/loja" className="button">
              Ir para a loja
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <section className="container">
        <div className="page-header">
          <div>
            <p className="kicker">Carrinho</p>
            <h1 className="section-title">Revise seus itens antes de enviar o pedido.</h1>
          </div>
          <button type="button" className="button button-outline" onClick={clearCart}>
            Limpar carrinho
          </button>
        </div>

        <div className="cart-layout">
          <div className="cart-items">
            {cart.map((item) => (
              <article key={`${item.productId}-${item.size}`} className="card cart-item">
                <img className="cart-thumb" src={item.imageUrl} alt={item.name} />

                <div className="cart-info">
                  <div>
                    <h2 className="cart-name">{item.name}</h2>
                    <p className="cart-size">Tamanho: {item.size}</p>
                  </div>
                  <strong className="price">{formatCurrency(item.price)}</strong>
                </div>

                <div className="cart-actions">
                  <div className="quantity-control" aria-label={`Quantidade de ${item.name}`}>
                    <button
                      type="button"
                      className="quantity-button"
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                    >
                      <Minus size={16} />
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      type="button"
                      className="quantity-button"
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => removeFromCart(item.productId, item.size)}
                  >
                    <Trash2 size={16} />
                    Remover
                  </button>
                </div>
              </article>
            ))}
          </div>

          <aside className="card summary-card">
            <p className="kicker">Resumo</p>
            <div className="summary-row">
              <span>Itens no pedido</span>
              <span>{cartItemsCount}</span>
            </div>
            <div className="summary-row">
              <span>Linhas do carrinho</span>
              <span>{cart.length}</span>
            </div>
            <div className="summary-row">
              <span>Entrega</span>
              <span>A combinar</span>
            </div>
            <div className="summary-row summary-total">
              <span>Total</span>
              <strong>{formatCurrency(cartTotal)}</strong>
            </div>
            <div className="button-row">
              {!checkoutOpen ? (
                <button type="button" className="button" onClick={handleOpenCheckout}>
                  Iniciar envio do pedido
                </button>
              ) : (
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => setCheckoutOpen(false)}
                >
                  Fechar formulario
                </button>
              )}
              <Link to="/loja" className="button button-outline">
                Continuar comprando
              </Link>
            </div>
          </aside>
        </div>

        {checkoutOpen && (
          <section className="card admin-form-section checkout-panel">
            <div className="admin-section-header">
              <div>
                <p className="kicker">Envio do pedido</p>
                <h2 className="section-title">Dados para a diretoria receber seu pedido.</h2>
                <p className="lead">
                  Esse envio fica persistido no projeto e entra no analytics como pedido real.
                </p>
              </div>
            </div>

            {checkoutError && <div className="status-banner">{checkoutError}</div>}

            <form className="branding-form" onSubmit={handleSubmitOrder}>
              <div className="branding-grid">
                <label className="field">
                  <span className="field-label">Nome</span>
                  <input
                    className="input"
                    type="text"
                    value={checkoutForm.customerName}
                    onChange={(event) =>
                      setCheckoutForm((current) => ({
                        ...current,
                        customerName: event.target.value,
                      }))
                    }
                  />
                </label>

                <label className="field">
                  <span className="field-label">WhatsApp ou email</span>
                  <input
                    className="input"
                    type="text"
                    value={checkoutForm.contact}
                    onChange={(event) =>
                      setCheckoutForm((current) => ({
                        ...current,
                        contact: event.target.value,
                      }))
                    }
                  />
                </label>

                <label className="field field-full">
                  <span className="field-label">Observacoes do pedido</span>
                  <textarea
                    className="input textarea"
                    value={checkoutForm.notes}
                    onChange={(event) =>
                      setCheckoutForm((current) => ({
                        ...current,
                        notes: event.target.value,
                      }))
                    }
                    placeholder="Ex.: retirada no campus, preferencia de contato, observacoes da turma."
                  />
                </label>
              </div>

              <div className="button-row">
                <button type="submit" className="button">
                  Enviar pedido
                </button>
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => setCheckoutOpen(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        )}
      </section>
    </div>
  );
}
