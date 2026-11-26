import { networkArticlesPart1, type NetworkArticle } from './network-articles-part1';
import { networkArticlesPart2 } from './network-articles-part2';

export type { NetworkArticle };

export const networkArticles: NetworkArticle[] = [
  ...networkArticlesPart1,
  ...networkArticlesPart2,
];

export function getNetworkArticleBySlug(slug: string): NetworkArticle | undefined {
  return networkArticles.find((a) => a.slug === slug);
}
