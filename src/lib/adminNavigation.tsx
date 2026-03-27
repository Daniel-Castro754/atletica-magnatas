import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  CalendarDays,
  House,
  LayoutDashboard,
  Package,
  Palette,
  Settings,
  Shield,
  ShoppingCart,
  Users,
} from 'lucide-react';

export type AdminNavigationItem = {
  label: string;
  path: string;
  description: string;
  icon: LucideIcon;
};

export const adminNavigationItems: AdminNavigationItem[] = [
  {
    label: 'Dashboard',
    path: '/admin',
    description: 'Resumo da operacao e acessos rapidos da diretoria.',
    icon: LayoutDashboard,
  },
  {
    label: 'Home',
    path: '/admin/home',
    description: 'Edicao da pagina inicial, destaques, contatos e secoes da Home.',
    icon: House,
  },
  {
    label: 'Produtos',
    path: '/admin/produtos',
    description: 'CRUD completo, filtros, estoque, destaque, imagens e ordem de exibicao.',
    icon: Package,
  },
  {
    label: 'Eventos',
    path: '/admin/eventos',
    description: 'Calendario publico, CRUD manual, importacao por planilha e configuracao da pagina.',
    icon: CalendarDays,
  },
  {
    label: 'Institucional',
    path: '/admin/magnatas',
    description: 'Edicao da pagina institucional, historia, modalidades, parceiros e galeria.',
    icon: Shield,
  },
  {
    label: 'Diretoria',
    path: '/admin/diretoria',
    description: 'Gestao atual, cargos, mandato, documentos e canais institucionais.',
    icon: Users,
  },
  {
    label: 'Aparencia',
    path: '/admin/aparencia',
    description: 'Branding, logo, favicon, capa principal, paleta e tipografia global.',
    icon: Palette,
  },
  {
    label: 'Analytics',
    path: '/admin/analytics',
    description: 'Page views, produtos vistos, carrinho, pedidos enviados, tendencias e alertas.',
    icon: BarChart3,
  },
  {
    label: 'Pedidos',
    path: '/admin/pedidos',
    description: 'Pedidos realmente enviados pelo carrinho e persistidos no navegador.',
    icon: ShoppingCart,
  },
  {
    label: 'Configuracoes',
    path: '/admin/configuracoes',
    description: 'Sessao, restauracoes e configuracoes operacionais do painel.',
    icon: Settings,
  },
];
