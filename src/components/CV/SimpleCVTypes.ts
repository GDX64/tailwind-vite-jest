export enum Icons {
  Globe = 'Globe',
  Mobile = 'Mobile',
  GitHub = 'GitHub',
  Envelope = 'Envelope',
  Location = 'Location',
  Linkedin = 'Linkedin',
}

export interface CVData {
  name: string;
  title: string;
  arrUserInfo: { text: string; icon: Icons; link?: string }[];
  categories: Category[];
}

export interface Category {
  title: string;
  fields: Field[];
}

export interface Field {
  title: string;
  description?: string;
  schoolPlaceDate?: string;
}
