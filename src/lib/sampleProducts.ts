import type { Product } from '../types/cart';

export const sampleProducts: Product[] = [
  {
    id: 'camiseta-oficial-2026',
    name: 'Camiseta Oficial 2026',
    description: 'A camisa que leva a identidade da Magnatas para jogos, eventos e campus.',
    longDescription:
      'A Camiseta Oficial 2026 foi pensada para representar a atletica em dias de jogo, recepcao de calouros e acoes da turma de Ciencias Economicas. E a peca central da colecao azul, vermelha e preta da temporada.',
    highlights: [
      'Modelagem confortavel para uso no campus e em dias de jogo',
      'Colecao oficial com identidade azul, vermelha e preta',
      'Peca principal para torcida, eventos e recepcao',
    ],
    price: 89.9,
    category: 'camisetas',
    imageUrl: 'https://picsum.photos/seed/magnatas-camiseta/900/700',
    galleryImages: [
      'https://picsum.photos/seed/magnatas-camiseta-galeria-1/900/700',
      'https://picsum.photos/seed/magnatas-camiseta-galeria-2/900/700',
    ],
    availableSizes: ['P', 'M', 'G', 'GG'],
    badge: 'Mais vendida',
    isActive: true,
    stock: 22,
    featured: true,
    displayOrder: 1,
  },
  {
    id: 'regata-treino',
    name: 'Regata de Treino',
    description: 'Uma peca leve para rotina esportiva, bateria e acoes ao ar livre.',
    longDescription:
      'A Regata de Treino combina leveza, mobilidade e a identidade da Magnatas para quem participa de treinos, eventos externos e concentracoes da atletica. E uma opcao versatil para quem quer vestir a marca com liberdade de movimento.',
    highlights: [
      'Caimento esportivo para treinos e deslocamentos',
      'Visual alinhado com a colecao oficial da atletica',
      'Boa opcao para dias quentes e eventos de rua',
    ],
    price: 74.9,
    category: 'camisetas',
    imageUrl: 'https://picsum.photos/seed/magnatas-regata/900/700',
    galleryImages: [
      'https://picsum.photos/seed/magnatas-regata-galeria-1/900/700',
      'https://picsum.photos/seed/magnatas-regata-galeria-2/900/700',
    ],
    availableSizes: ['P', 'M', 'G'],
    isActive: true,
    stock: 9,
    featured: false,
    displayOrder: 2,
  },
  {
    id: 'bone-preto',
    name: 'Bone Magnatas',
    description: 'Bone estruturado para completar o visual da torcida com assinatura da Magnatas.',
    longDescription:
      'O Bone Magnatas reforca a presenca da atletica no dia a dia. Ele funciona tanto em jogos quanto na rotina do campus, com acabamento firme, ajuste traseiro e um visual que conversa com a identidade preta, azul e vermelha da marca.',
    highlights: [
      'Ajuste traseiro para uso diario',
      'Visual discreto com assinatura oficial da atletica',
      'Ideal para jogos, viagens e rotina universitaria',
    ],
    price: 54.9,
    category: 'bones',
    imageUrl: 'https://picsum.photos/seed/magnatas-bone/900/700',
    galleryImages: [
      'https://picsum.photos/seed/magnatas-bone-galeria-1/900/700',
      'https://picsum.photos/seed/magnatas-bone-galeria-2/900/700',
    ],
    availableSizes: ['UN'],
    isActive: true,
    stock: 4,
    featured: false,
    displayOrder: 3,
  },
  {
    id: 'caneca-torcida',
    name: 'Caneca da Torcida',
    description: 'Caneca oficial para levar a Magnatas para sala, casa ou escritorio.',
    longDescription:
      'A Caneca da Torcida foi criada para manter a identidade da atletica presente na rotina. Ela funciona como item de uso diario e tambem como lembranca da comunidade de Economia que se reconhece dentro e fora do campus.',
    highlights: [
      'Arte oficial da colecao Magnatas',
      'Formato ideal para cafe, cha e rotina academica',
      'Boa opcao para presente ou kit institucional',
    ],
    price: 34.9,
    category: 'canecas',
    imageUrl: 'https://picsum.photos/seed/magnatas-caneca/900/700',
    galleryImages: [
      'https://picsum.photos/seed/magnatas-caneca-galeria-1/900/700',
      'https://picsum.photos/seed/magnatas-caneca-galeria-2/900/700',
    ],
    availableSizes: ['350ml'],
    badge: 'Edicao limitada',
    isActive: true,
    stock: 11,
    featured: true,
    displayOrder: 4,
  },
  {
    id: 'cordao-chaveiro',
    name: 'Cordao + Chaveiro',
    description: 'Acessorio util para chaves, cracha e rotina de eventos da atletica.',
    longDescription:
      'O kit Cordao + Chaveiro junta praticidade e identidade visual em um acessorio pensado para o campus, para eventos internos e para quem gosta de carregar a Magnatas em pequenos detalhes do cotidiano.',
    highlights: [
      'Uso pratico em crachas, chaves e eventos',
      'Item leve para completar o kit da atletica',
      'Presenca da marca em detalhes do dia a dia',
    ],
    price: 29.9,
    category: 'acessorios',
    imageUrl: 'https://picsum.photos/seed/magnatas-acessorio/900/700',
    galleryImages: [
      'https://picsum.photos/seed/magnatas-acessorio-galeria-1/900/700',
      'https://picsum.photos/seed/magnatas-acessorio-galeria-2/900/700',
    ],
    availableSizes: ['UN'],
    isActive: true,
    stock: 0,
    featured: false,
    displayOrder: 5,
  },
  {
    id: 'kit-calouro',
    name: 'Kit Calouro',
    description: 'Combo pensado para recepcao, pertencimento e primeiro contato com a Magnatas.',
    longDescription:
      'O Kit Calouro foi montado para receber quem esta chegando em Ciencias Economicas com a identidade da atletica desde o primeiro momento. E uma combinacao de itens oficiais que ajuda a aproximar a turma e fortalecer o sentimento de pertencimento.',
    highlights: [
      'Combo completo para recepcao de novos integrantes',
      'Mistura de itens de uso diario e memoria afetiva',
      'Boa opcao para campanhas e integracao do curso',
    ],
    price: 119.9,
    category: 'kits',
    imageUrl: 'https://picsum.photos/seed/magnatas-kit/900/700',
    galleryImages: [
      'https://picsum.photos/seed/magnatas-kit-galeria-1/900/700',
      'https://picsum.photos/seed/magnatas-kit-galeria-2/900/700',
    ],
    availableSizes: ['P', 'M', 'G'],
    badge: 'Combo',
    isActive: true,
    stock: 7,
    featured: true,
    displayOrder: 6,
  },
];

export function cloneProduct(product: Product): Product {
  return {
    ...product,
    highlights: [...product.highlights],
    galleryImages: [...product.galleryImages],
    availableSizes: [...product.availableSizes],
  };
}

export function cloneProductList(products: Product[]) {
  return products.map(cloneProduct);
}

export function getProductById(productId: string) {
  return sampleProducts.find((product) => product.id === productId) ?? null;
}
