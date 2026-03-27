import { PRODUCT_CATEGORIES } from '../lib/productConstants';
import { useBranding } from '../lib/BrandingContext';
import { useEvents } from '../lib/EventsContext';
import { useGovernance } from '../lib/GovernanceContext';
import { useProductCatalog } from '../lib/ProductCatalogContext';
import { useSiteContent } from '../lib/SiteContentContext';

export default function AdminPage() {
  const { resolvedBranding } = useBranding();
  const {
    content: { home, magnatas },
  } = useSiteContent();
  const { products } = useProductCatalog();
  const { events } = useEvents();
  const { content: governance } = useGovernance();
  const activeProductsCount = products.filter((product) => product.isActive).length;

  const metrics = [
    {
      value: activeProductsCount,
      label: 'Produtos ativos na loja',
    },
    {
      value: PRODUCT_CATEGORIES.length - 1,
      label: 'Categorias ativas',
    },
    {
      value: products.filter((product) => product.stock <= 0).length,
      label: 'Produtos sem estoque',
    },
    {
      value: events.filter((event) => event.visible).length,
      label: 'Eventos publicos visiveis',
    },
    {
      value: home.highlights.length,
      label: 'Blocos editaveis na Home',
    },
    {
      value:
        magnatas.historyItems.length +
        magnatas.modalities.length +
        magnatas.events.length +
        magnatas.partners.length +
        magnatas.images.length,
      label: 'Blocos editaveis na area Institucional',
    },
    {
      value:
        governance.members.filter((item) => item.visible).length +
        governance.roles.filter((item) => item.visible).length +
        governance.documents.filter((item) => item.visible).length,
      label: 'Itens ativos em Diretoria e Transparencia',
    },
  ];

  return (
    <section className="admin-page-grid">
      <article className="card admin-page-intro">
        <p className="kicker">Dashboard</p>
        <h2 className="section-title">Visao geral da operacao digital da diretoria.</h2>
        <p className="lead">
          O painel da {resolvedBranding.siteName} agora tem entrada protegida, layout proprio
          e modulos separados para gerir conteudo, aparencia e operacao futura.
        </p>
      </article>

      <div className="stat-grid">
        {metrics.map((metric) => (
          <article key={metric.label} className="card metric-card">
            <span className="metric-value">{metric.value}</span>
            <span>{metric.label}</span>
          </article>
        ))}
      </div>

    </section>
  );
}
