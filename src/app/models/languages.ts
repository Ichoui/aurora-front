export interface SelectContents {
  slug: string;
  label: string;
}

export const Languages: SelectContents[] = [
  {
    slug: 'fr',
    label: 'tab3.settings.fr',
  },
  {
    slug: 'en',
    label: 'tab3.settings.en',
  },
];

export enum listLanguages {
  FR = 'fr',
  EN = 'en',
}
