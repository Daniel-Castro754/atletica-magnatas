import { useMemo, useState } from 'react';
import {
  BarChart3,
  CalendarDays,
  Eye,
  MousePointerClick,
  PackageSearch,
  Receipt,
  TrendingUp,
} from 'lucide-react';
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useAnalytics } from '../../lib/AnalyticsContext';
import {
  ANALYTICS_EVENT_LABELS,
  buildAnalyticsDashboardSnapshot,
  formatAnalyticsDateLabel,
} from '../../lib/analytics';
import { useOrders } from '../../lib/OrdersContext';
import { useProductCatalog } from '../../lib/ProductCatalogContext';
import type { AnalyticsPeriodDays } from '../../types/analytics';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PERIOD_OPTIONS: AnalyticsPeriodDays[] = [7, 30, 90];

const ALERT_TONE_LABELS = {
  info: 'Insight',
  warning: 'Atencao',
  success: 'Confirmado',
} as const;

export default function AdminAnalyticsPage() {
  const [periodDays, setPeriodDays] = useState<AnalyticsPeriodDays>(30);
  const { events } = useAnalytics();
  const { orders } = useOrders();
  const { products } = useProductCatalog();

  const snapshot = useMemo(
    () =>
      buildAnalyticsDashboardSnapshot({
        events,
        orders,
        products,
        periodDays,
      }),
    [events, orders, periodDays, products]
  );

  const hasRealActivity = snapshot.totalEvents > 0 || snapshot.ordersSentCount > 0;

  const chartData = useMemo(() => {
    const labels = snapshot.trends.map((t) => formatAnalyticsDateLabel(t.date));
    return {
      labels,
      datasets: [
        {
          label: 'Total de eventos',
          data: snapshot.trends.map((t) => t.total),
          fill: true,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          pointBackgroundColor: '#2563eb',
          pointRadius: snapshot.trends.length > 30 ? 0 : 3,
          tension: 0.4,
        },
        ...(snapshot.activeEventNames.includes('page_view')
          ? [
              {
                label: ANALYTICS_EVENT_LABELS['page_view'],
                data: snapshot.trends.map((t) => t.byEvent['page_view'] ?? 0),
                fill: false,
                borderColor: '#1a3a5c',
                backgroundColor: 'transparent',
                pointRadius: 0,
                borderDash: [4, 3],
                tension: 0.4,
              },
            ]
          : []),
      ],
    };
  }, [snapshot]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' as const, labels: { boxWidth: 12, font: { size: 12 } } },
        tooltip: { mode: 'index' as const, intersect: false },
      },
      scales: {
        x: { grid: { display: false }, ticks: { maxTicksLimit: 10, font: { size: 11 } } },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: { precision: 0, font: { size: 11 } },
        },
      },
    }),
    []
  );

  const summaryCards = [
    {
      key: 'page_view',
      label: 'Page views',
      value: snapshot.eventTotals.page_view,
      icon: Eye,
    },
    {
      key: 'product_view',
      label: 'Produtos vistos',
      value: snapshot.eventTotals.product_view,
      icon: PackageSearch,
    },
    {
      key: 'add_to_cart',
      label: 'Adds ao carrinho',
      value: snapshot.eventTotals.add_to_cart,
      icon: MousePointerClick,
    },
    {
      key: 'begin_checkout',
      label: 'Checkouts iniciados',
      value: snapshot.eventTotals.begin_checkout,
      icon: TrendingUp,
    },
    {
      key: 'pedido_enviado',
      label: 'Pedidos enviados',
      value: snapshot.ordersSentCount || undefined,
      icon: Receipt,
    },
    {
      key: 'event_link_click',
      label: 'Cliques em eventos',
      value: snapshot.eventTotals.event_link_click,
      icon: CalendarDays,
    },
  ].filter((card) => typeof card.value === 'number' && card.value > 0);

  return (
    <section className="admin-page-grid">
      <article className="card admin-page-intro">
        <p className="kicker">Analytics</p>
        <h2 className="section-title">Leituras reais de navegacao, loja e pedidos enviados.</h2>
        <p className="lead">
          Este painel so mostra eventos e pedidos que realmente foram persistidos no projeto.
          Nada aqui simula venda ou fechamento sem envio real de pedido.
        </p>
      </article>

      <div className="analytics-filter-row">
        <div className="analytics-period-group" role="group" aria-label="Filtrar por periodo">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={
                periodDays === option
                  ? 'analytics-period-btn analytics-period-btn-active'
                  : 'analytics-period-btn'
              }
              onClick={() => setPeriodDays(option)}
            >
              {option}d
            </button>
          ))}
        </div>
        <span className="pill analytics-period-pill">
          {snapshot.totalEvents} evento(s) · ultimos {periodDays} dias
        </span>
      </div>

      {!hasRealActivity && (
        <article className="card empty-state admin-empty-state analytics-empty-state">
          <BarChart3 size={32} className="analytics-empty-icon" />
          <h3 className="section-title">Nenhuma atividade real neste periodo.</h3>
          <p className="muted">
            Quando alguem navegar nas paginas publicas, abrir produtos, adicionar ao carrinho
            e enviar pedidos, os dados vao aparecer aqui automaticamente.
          </p>
        </article>
      )}

      {summaryCards.length > 0 && (
        <div className="stat-grid analytics-stat-grid">
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <article key={card.key} className="card metric-card">
                <Icon size={18} />
                <span className="metric-value">{card.value}</span>
                <span>{card.label}</span>
              </article>
            );
          })}
        </div>
      )}

      <div className="admin-card-grid">
        <article className="card admin-subcard">
          <div className="admin-subcard-head">
            <Eye size={18} />
            <strong>Paginas mais visitadas</strong>
          </div>

          {!snapshot.pageViews.length ? (
            <p className="muted">
              Ainda nao ha page views reais o suficiente para montar esse ranking.
            </p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Pagina</th>
                    <th>Caminho</th>
                    <th>Views</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.pageViews.map((item) => (
                    <tr key={item.key}>
                      <td>{item.label}</td>
                      <td>{item.secondaryLabel}</td>
                      <td>{item.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article className="card admin-subcard">
          <div className="admin-subcard-head">
            <PackageSearch size={18} />
            <strong>Produtos mais vistos</strong>
          </div>

          {!snapshot.productViews.length ? (
            <p className="muted">
              Nenhum produto recebeu visualizacao detalhada neste periodo.
            </p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Categoria</th>
                    <th>Views</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.productViews.map((item) => (
                    <tr key={item.key}>
                      <td>{item.label}</td>
                      <td>{item.secondaryLabel}</td>
                      <td>{item.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article className="card admin-subcard">
          <div className="admin-subcard-head">
            <MousePointerClick size={18} />
            <strong>Produtos mais adicionados ao carrinho</strong>
          </div>

          {!snapshot.cartAdds.length ? (
            <p className="muted">
              Ainda nao houve add to cart real o bastante para formar um ranking.
            </p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Adicoes</th>
                    <th>Quantidade</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.cartAdds.map((item) => (
                    <tr key={item.key}>
                      <td>{item.label}</td>
                      <td>{item.count}</td>
                      <td>{item.quantity || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article className="card admin-subcard">
          <div className="admin-subcard-head">
            <Receipt size={18} />
            <strong>Pedidos enviados</strong>
          </div>

          {snapshot.ordersSentCount > 0 ? (
            <>
              <span className="metric-value">{snapshot.ordersSentCount}</span>
              <p className="muted">
                Quantidade de pedidos realmente enviados e persistidos nos ultimos {periodDays} dias.
              </p>
            </>
          ) : (
            <p className="muted">
              Nenhum pedido enviado e persistido foi encontrado neste periodo.
            </p>
          )}
        </article>
      </div>

      <article className="card admin-subcard analytics-chart-card">
        <div className="admin-subcard-head">
          <TrendingUp size={18} />
          <strong>Tendencias por periodo</strong>
          {snapshot.activeEventNames.length > 0 && (
            <span className="muted analytics-chart-subtitle">
              {snapshot.trends.length} ponto(s) de dados
            </span>
          )}
        </div>

        {!snapshot.activeEventNames.length ? (
          <div className="admin-empty-state analytics-empty-state">
            <TrendingUp size={28} className="analytics-empty-icon" />
            <p className="muted">
              Sem eventos registrados no periodo selecionado, ainda nao ha tendencia para comparar.
            </p>
          </div>
        ) : (
          <div className="analytics-chart-wrap">
            <Line data={chartData} options={chartOptions} />
          </div>
        )}
      </article>

      <article className="card admin-subcard">
        <div className="admin-subcard-head">
          <BarChart3 size={18} />
          <strong>Alertas uteis para gestao</strong>
        </div>

        {!snapshot.alerts.length ? (
          <p className="muted">
            Ainda nao ha alerta acionado para este periodo. Conforme os eventos crescerem, o
            painel destaca oportunidades e gargalos automaticamente.
          </p>
        ) : (
          <div className="analytics-alert-list">
            {snapshot.alerts.map((alert) => (
              <article
                key={alert.id}
                className={`analytics-alert analytics-alert-${alert.tone}`}
              >
                <span className="pill">{ALERT_TONE_LABELS[alert.tone]}</span>
                <strong>{alert.title}</strong>
                <p className="muted">{alert.description}</p>
              </article>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
