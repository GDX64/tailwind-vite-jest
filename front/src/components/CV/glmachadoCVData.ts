import { CVData, Icons } from './SimpleCVTypes';

const education = [
  {
    title: 'Electro-Mechanical Technician',
    schoolPlaceDate: 'ETPC - Volta Redonda, RJ. 2011-2013',
  },
  {
    title: 'Electronic Engineering Bachelor',
    schoolPlaceDate: 'UFJF - Juiz de fora, MG. 2014-2019',
    description:
      'The course had more emphasis in Signal Processing and embedded software development, where I used Matlab, Python, and C with FreeRTOS.',
  },
  {
    schoolPlaceDate: 'UBA - Buenos Aires, AR. 2019',
    title: 'Electronic Engineering Interchange',
  },
];
const projects = [
  {
    title: 'Bachelor Thesis',
    description: `In my thesis I implemented adaptive filtering algorithms from papers with
            Matlab to analyze harmonics from the electrical energy network. In this work I
            had the opportunity to work with some advanced Linear Algebra to implement the
            computations. You can download it 
            [here](https://github.com/GDX64/personal-react-website/blob/master/public/files/TCC.pdf?raw=true).`,
    schoolPlaceDate: '2019',
  },
  {
    title: 'Personal Website',
    description: `I use my [website](https://glmachado.com) mainly to upload demos experimenting with custom 2D renderers
    for signal based frameworks like solid and vue.`,
  },
];
const experiences = [
  {
    title: 'Nelogica - Software Developer I',
    description: `Nelogica is the biggest trading software company in Brazil, and has several trading platforms. 
          During my first years in the company I worked as a web developer in the homebrokers, [profit web](https://profitweb.nelogica.com.br/) and [vector web](https://web.vectorcrypto.com) applications.`,
    schoolPlaceDate: '(Remote) 2020-2021',
  },
  {
    title: 'Nelogica - Software Developer II',
    description: `In 2021 I started to work focusing on performance improvements and I integrated typescript and build improvements in to the web projects.`,
    schoolPlaceDate: '(Remote) 2021-2022',
  },
  {
    title: 'Nelogica - Software Developer III',
    description: `In 2022 I led the technical direction and implementation of the product into the [MacOS](https://www.nelogica.com.br/download) using electron,
    bringing the company to the MacOS users.`,
    schoolPlaceDate: '(Remote) 2022-2023',
  },
  {
    title: 'Nelogica - Software Developer IV',
    description: `In 2023 I was invited to work in the company's headquarters in Porto Alegre to be closer to the mobile team, and again
    led technically the development of native mobile apps using the core web code. Now we target web, [Android](https://play.google.com/store/apps/details?id=profitchartandroid.nelogica.com.profitchartandroid&pcampaignid=web_share),
    [iOS](https://apps.apple.com/br/app/profit-mobile/id1163760725) and MacOS with
    the same main codebase and some native adjusts.`,
    schoolPlaceDate: 'Porto Alegre - RS, BR. 2023-(Now)',
  },
];

const glmachadoCVData: CVData = {
  name: 'Gabriel Eduardo de Lima Machado',
  title: 'Software Developer',
  arrUserInfo: [
    {
      icon: Icons.Globe,
      text: 'glmachado.com',
      link: 'https://glmachado.com',
    },
    { icon: Icons.Mobile, text: '+55 32 98493-5474' },
    { icon: Icons.Envelope, text: 'gabriel.delmachado@gmail.com' },
    { icon: Icons.GitHub, text: 'GDX64', link: 'https://github.com/GDX64' },
    { icon: Icons.Location, text: 'Porto Alegre, RS, BR' },
    {
      icon: Icons.Linkedin,
      text: 'gabriel-e-l-machado',
      link: 'https://www.linkedin.com/in/gabriel-e-l-machado/',
    },
  ],
  categories: [
    { title: 'Education', fields: education },
    { title: 'Experiences', fields: experiences },
    { title: 'Relevant Projects', fields: projects },
  ],
};

export default glmachadoCVData;
