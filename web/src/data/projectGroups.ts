import type { ProjectGroup } from "@mpa/shared";

export interface ProjectGroupInfo {
  id: ProjectGroup;
  slug: string; // URL segment
  label: string;
  description: string;
}

export const PROJECT_GROUPS: ProjectGroupInfo[] = [
  {
    id: "bajaj",
    slug: "bajaj",
    label: "Bajaj Projects",
    description: "Financial services and Bajaj ecosystem media planning workstreams.",
  },
  {
    id: "non_bajaj",
    slug: "non-bajaj",
    label: "Non-Bajaj Projects",
    description:
      "Cross-category client projects across healthcare, education, industrial, consumer, and technology sectors.",
  },
];

export const groupBySlug = (slug?: string): ProjectGroupInfo | undefined =>
  PROJECT_GROUPS.find((g) => g.slug === slug);

export const groupById = (id: ProjectGroup): ProjectGroupInfo =>
  PROJECT_GROUPS.find((g) => g.id === id) ?? PROJECT_GROUPS[1];
