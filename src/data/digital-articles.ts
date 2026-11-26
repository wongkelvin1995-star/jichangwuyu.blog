import { digitalArticlesPart1, type DigitalArticle } from './digital-articles-part1';
import { digitalArticlesPart2 } from './digital-articles-part2';

export type { DigitalArticle };

export const digitalArticles: DigitalArticle[] = [
  ...digitalArticlesPart1,
  ...digitalArticlesPart2,
];

export function getDigitalArticleBySlug(slug: string): DigitalArticle | undefined {
  return digitalArticles.find((a) => a.slug === slug);
}
