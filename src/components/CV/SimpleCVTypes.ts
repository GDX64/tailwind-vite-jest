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
  education: { schoolPlaceDate: string; title: string; description?: string }[];
  projects: { schoolPlaceDate?: string; title: string; description?: string }[];
  experiences: { schoolPlaceDate?: string; title: string; description?: string }[];
}
