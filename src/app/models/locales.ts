export interface SelectContents {
  slug: string;
  label: string;
}

export const Locales: SelectContents[] = [
  {
    slug: 'fr',
    label: 'tab3.more.fr',
  },
  {
    slug: 'en',
    label: 'tab3.more.en',
  },
];

export enum ELocales {
  FR = 'fr',
  EN = 'en',
}
