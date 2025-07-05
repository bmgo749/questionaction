export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  bgColor: string;
  hoverBgColor: string;
  articleCount: number;
}

export const categories: CategoryData[] = [
  {
    id: 'world',
    name: 'World',
    slug: 'world',
    icon: 'globe',
    color: 'blue-600',
    bgColor: 'blue-100',
    hoverBgColor: 'blue-200',
    articleCount: 0,
  },
  {
    id: 'history',
    name: 'History',
    slug: 'history',
    icon: 'history',
    color: 'amber-600',
    bgColor: 'amber-100',
    hoverBgColor: 'amber-200',
    articleCount: 0,
  },
  {
    id: 'science',
    name: 'Science',
    slug: 'science',
    icon: 'flask',
    color: 'green-600',
    bgColor: 'green-100',
    hoverBgColor: 'green-200',
    articleCount: 0,
  },
  {
    id: 'geography',
    name: 'Geography',
    slug: 'geography',
    icon: 'map',
    color: 'purple-600',
    bgColor: 'purple-100',
    hoverBgColor: 'purple-200',
    articleCount: 0,
  },
  {
    id: 'sports',
    name: 'Sports',
    slug: 'sports',
    icon: 'running',
    color: 'red-600',
    bgColor: 'red-100',
    hoverBgColor: 'red-200',
    articleCount: 0,
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    slug: 'entertainment',
    icon: 'film',
    color: 'pink-600',
    bgColor: 'pink-100',
    hoverBgColor: 'pink-200',
    articleCount: 0,
  },
  {
    id: 'politics',
    name: 'Politics',
    slug: 'politics',
    icon: 'landmark',
    color: 'indigo-600',
    bgColor: 'indigo-100',
    hoverBgColor: 'indigo-200',
    articleCount: 0,
  },
  {
    id: 'technology',
    name: 'Technology',
    slug: 'technology',
    icon: 'microchip',
    color: 'cyan-600',
    bgColor: 'cyan-100',
    hoverBgColor: 'cyan-200',
    articleCount: 0,
  },
  {
    id: 'health',
    name: 'Health',
    slug: 'health',
    icon: 'heartbeat',
    color: 'emerald-600',
    bgColor: 'emerald-100',
    hoverBgColor: 'emerald-200',
    articleCount: 0,
  },
  {
    id: 'education',
    name: 'Education',
    slug: 'education',
    icon: 'graduation-cap',
    color: 'orange-600',
    bgColor: 'orange-100',
    hoverBgColor: 'orange-200',
    articleCount: 0,
  },
];

export const getCategoryBySlug = (slug: string): CategoryData | undefined => {
  return categories.find(cat => cat.slug === slug);
};
