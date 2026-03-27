import { useEffect, useMemo, useState } from 'react';
import { Package2, Receipt, Wallet } from 'lucide-react';
import { formatAnalyticsDateTime } from '../../lib/analytics';
import { formatCurrency } from '../../lib/formatCurrency';
import {
  ORDER_PAYMENT_GATEWAY_LABELS,
  ORDER_PAYMENT_MODE_LABELS,
  ORDER_PAYMENT_STATUS_LABELS,
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
} from '../../lib/orders';
import { useOrders } from '../../lib/OrdersContext';
import type { OrderStatus } from '../../types/order';

type OrderStatusFilter = 'all' | OrderStatus;

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus } = useOrders();
  const [activeStatus, setActiveStatus] = useState<OrderStatusFilter>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(orders[0]?.id ?? null);
  const [statusDraft, setStatusDraft] = useState<OrderStatus>('pedido_enviado');
  const [statusNote, setStatusNote] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const visibleOrders = useMemo(
    () =>
      activeStatus === 'all'
        ? orders
        : orders.filter((order) => order.status === activeStatus),
    [activeStatus, orders]
  );

  useEffect(() => {
    if (!visibleOrders.length) {
      setSelectedOrderId(null);
      return;
    }

    if (!selectedOrderId || !visibleOrders.some((order) => order.id === selectedOrderId)) {
      setSelectedOrderId(visibleOrders[0].id);
    }
  }, [selectedOrderId, visibleOrders]);

  const selectedOrder = visibleOrders.find((order) => order.id === selectedOrderId) ?? null;

  useEffect(() => {
    if (!selectedOrder) {
      return;
    }

    setStatusDraft(selectedOrder.status);
    setStatusNote('');
  }, [selectedOrder?.id]);

  function handleSaveStatus() {
    if (!selectedOrder) {
      return;
    }

    updateOrderStatus(selectedOrder.id, statusDraft, statusNote);
    setStatusMessage(`Status do pedido ${selectedOrder.code} atualizado.`);
    setStatusNote('');
  }

  const totalItems = orders.reduce((sum, order) => sum + order.itemsCount, 0);
  const totalVolume = orders.reduce((sum, order) => sum + order.totals.total, 0);
  const pendingOrdersCount = orders.filter(
    (order) =>
      order.status === 'pedido_enviado' || order.status === 'pedido_recebido'
  ).length;

  return (
    <section className="admin-page-grid">
      <article className="card admin-page-intro">
        <p className="kicker">Pedidos</p>
        <h2 className="section-title">Base real de pedidos enviada pela loja.</h2>
        <p className="lead">
          Cada pedido salva cliente, itens, total, data, status e um bloco de pagamento
          preparado para integrar checkout em gateway no futuro.
        </p>
      </article>

      {!orders.length ? (
        <article className="card empty-state admin-empty-state">
          <Receipt size={24} />
          <h3 className="section-title">Nenhum pedido enviado ainda.</h3>
          <p className="muted">
            Quando alguem concluir o envio pelo carrinho, o pedido sera persistido aqui como
            "pedido enviado".
          </p>
        </article>
      ) : (
        <>
          <div className="stat-grid">
            <article className="card metric-card">
              <span className="metric-value">{orders.length}</span>
              <span>Pedidos registrados</span>
            </article>
            <article className="card metric-card">
              <span className="metric-value">{totalItems}</span>
              <span>Itens somados</span>
            </article>
            <article className="card metric-card">
              <span className="metric-value">{pendingOrdersCount}</span>
              <span>Pedidos em acompanhamento</span>
            </article>
            <article className="card metric-card">
              <span className="metric-value">{formatCurrency(totalVolume)}</span>
              <span>Volume total registrado</span>
            </article>
          </div>

          <div className="admin-products-header">
            <div>
              <p className="kicker">Fila de pedidos</p>
              <h3 className="section-title">Visualizacao operacional do que ja foi enviado.</h3>
            </div>

            <div className="filters" aria-label="Filtrar pedidos por status">
              <button
                type="button"
                className={activeStatus === 'all' ? 'chip chip-active' : 'chip'}
                onClick={() => setActiveStatus('all')}
              >
                Todos
              </button>
              {ORDER_STATUSES.map((status) => (
                <button
                  key={status}
                  type="button"
                  className={activeStatus === status ? 'chip chip-active' : 'chip'}
                  onClick={() => setActiveStatus(status)}
                >
                  {ORDER_STATUS_LABELS[status]}
                </button>
              ))}
            </div>
          </div>

          <div className="admin-orders-layout">
            <div className="admin-orders-list">
              {visibleOrders.map((order) => (
                <article
                  key={order.id}
                  className={
                    selectedOrder?.id === order.id
                      ? 'card admin-order-item admin-order-item-active'
                      : 'card admin-order-item'
                  }
                >
                  <button
                    type="button"
                    className="admin-order-select"
                    onClick={() => {
                      setSelectedOrderId(order.id);
                      setStatusMessage('');
                    }}
                  >
                    <div className="admin-order-row">
                      <strong>{order.code}</strong>
                      <span className={`pill order-status-pill order-status-pill-${order.status}`}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </div>
                    <span>{order.customer.name}</span>
                    <span className="muted">{order.customer.contact}</span>
                    <div className="admin-order-row">
                      <span className="muted">{order.itemsCount} item(ns)</span>
                      <strong>{formatCurrency(order.totals.total)}</strong>
                    </div>
                    <span className="muted">{formatAnalyticsDateTime(order.createdAt)}</span>
                  </button>
                </article>
              ))}
            </div>

            {selectedOrder && (
              <div className="admin-orders-detail">
                <article className="card admin-subcard">
                  <div className="admin-section-header">
                    <div>
                      <p className="kicker">Pedido selecionado</p>
                      <h3 className="section-title">{selectedOrder.code}</h3>
                      <p className="muted">
                        Criado em {formatAnalyticsDateTime(selectedOrder.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`pill order-status-pill order-status-pill-${selectedOrder.status}`}
                    >
                      {ORDER_STATUS_LABELS[selectedOrder.status]}
                    </span>
                  </div>

                  {statusMessage && <div className="status-banner">{statusMessage}</div>}

                  <div className="admin-orders-meta-grid">
                    <article className="card admin-subcard">
                      <div className="admin-subcard-head">
                        <Receipt size={18} />
                        <strong>Cliente e pedido</strong>
                      </div>
                      <span>
                        <strong>Nome:</strong> {selectedOrder.customer.name}
                      </span>
                      <span>
                        <strong>Contato:</strong> {selectedOrder.customer.contact}
                      </span>
                      <span>
                        <strong>Origem:</strong> {selectedOrder.source}
                      </span>
                      <span>
                        <strong>Atualizado em:</strong>{' '}
                        {formatAnalyticsDateTime(selectedOrder.updatedAt)}
                      </span>
                      {selectedOrder.customer.notes && (
                        <p className="muted">
                          <strong>Observacoes:</strong> {selectedOrder.customer.notes}
                        </p>
                      )}
                    </article>

                    <article className="card admin-subcard">
                      <div className="admin-subcard-head">
                        <Package2 size={18} />
                        <strong>Totais</strong>
                      </div>
                      <span>
                        <strong>Linhas:</strong> {selectedOrder.lineItemsCount}
                      </span>
                      <span>
                        <strong>Itens:</strong> {selectedOrder.itemsCount}
                      </span>
                      <span>
                        <strong>Subtotal:</strong>{' '}
                        {formatCurrency(selectedOrder.totals.subtotal)}
                      </span>
                      <span>
                        <strong>Total:</strong> {formatCurrency(selectedOrder.totals.total)}
                      </span>
                    </article>

                    <article className="card admin-subcard">
                      <div className="admin-subcard-head">
                        <Wallet size={18} />
                        <strong>Pagamento preparado</strong>
                      </div>
                      <span>
                        <strong>Modo:</strong>{' '}
                        {ORDER_PAYMENT_MODE_LABELS[selectedOrder.payment.mode]}
                      </span>
                      <span>
                        <strong>Gateway:</strong>{' '}
                        {ORDER_PAYMENT_GATEWAY_LABELS[selectedOrder.payment.gateway]}
                      </span>
                      <span>
                        <strong>Status:</strong>{' '}
                        {ORDER_PAYMENT_STATUS_LABELS[selectedOrder.payment.status]}
                      </span>
                      <span>
                        <strong>Valor:</strong>{' '}
                        {formatCurrency(selectedOrder.payment.amount)}
                      </span>
                      <p className="muted">
                        Hoje o pedido opera em fluxo manual. Esses campos ja deixam a entidade
                        pronta para checkout externo, confirmacao e conciliacao futura.
                      </p>
                    </article>
                  </div>

                  <article className="card admin-subcard">
                    <div className="admin-section-header">
                      <div>
                        <p className="kicker">Itens do pedido</p>
                        <h4 className="section-title">Tudo o que foi enviado pelo carrinho.</h4>
                      </div>
                    </div>

                    <div className="admin-table-wrap">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Produto</th>
                            <th>Tamanho</th>
                            <th>Qtd.</th>
                            <th>Unitario</th>
                            <th>Total da linha</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrder.items.map((item) => (
                            <tr key={item.id}>
                              <td>
                                <div className="admin-product-cell">
                                  <img
                                    className="admin-product-thumb"
                                    src={item.imageUrl}
                                    alt={item.name}
                                  />
                                  <div>
                                    <strong>{item.name}</strong>
                                    <span>{item.productId}</span>
                                  </div>
                                </div>
                              </td>
                              <td>{item.size}</td>
                              <td>{item.quantity}</td>
                              <td>{formatCurrency(item.unitPrice)}</td>
                              <td>{formatCurrency(item.lineTotal)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </article>

                  <article className="card admin-subcard">
                    <div className="admin-section-header">
                      <div>
                        <p className="kicker">Status operacional</p>
                        <h4 className="section-title">
                          Acompanhamento do pedido sem gateway.
                        </h4>
                      </div>
                    </div>

                    <div className="branding-grid">
                      <label className="field">
                        <span className="field-label">Status</span>
                        <select
                          className="input"
                          value={statusDraft}
                          onChange={(event) =>
                            setStatusDraft(event.target.value as OrderStatus)
                          }
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {ORDER_STATUS_LABELS[status]}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="field field-full">
                        <span className="field-label">Nota da mudanca</span>
                        <textarea
                          className="input textarea"
                          value={statusNote}
                          onChange={(event) => setStatusNote(event.target.value)}
                          placeholder="Ex.: diretoria confirmou recebimento, pedido separado para retirada, entrega concluida."
                        />
                      </label>
                    </div>

                    <div className="button-row">
                      <button type="button" className="button" onClick={handleSaveStatus}>
                        Salvar status
                      </button>
                    </div>

                    <div className="admin-order-history">
                      {selectedOrder.statusHistory.map((entry, index) => (
                        <article
                          key={`${entry.changedAt}-${index}`}
                          className="card admin-subcard"
                        >
                          <div className="admin-order-row">
                            <strong>{ORDER_STATUS_LABELS[entry.status]}</strong>
                            <span className="muted">
                              {formatAnalyticsDateTime(entry.changedAt)}
                            </span>
                          </div>
                          {entry.note && <p className="muted">{entry.note}</p>}
                        </article>
                      ))}
                    </div>
                  </article>
                </article>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
