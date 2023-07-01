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
    description: `I went for a 2 semesters interchange in Argentina whilst I developed my bachelor thesis. 
          There I studied adaptive signal processing, machine learning and computer graphics.`,
    schoolPlaceDate: 'UBA - Buneos Aires, AR. 2019',
    title: 'Electronic Engineering Interchange',
  },
];
const projects = [
  {
    title: 'Bachelor Thesis',
    description: `In my thesis I implemented adaptive filtering algorithms from papers with
            Matlab to analyze harmonics from the electrical energy network. In this work I
            had the opportunity to work with some advanced Linear Algebra to implement the
            computations. There is also an implementation of the basic algorithm in C with FreeRTOS 
            in my github for embedded ESP32. You can download it 
            [here](https://glmachado.herokuapp.com/files/TCC.pdf) (it is in my website).`,
    schoolPlaceDate: '2019',
  },
  {
    title: 'Personal Website',
    description: `I use my website mainly to upload demos experimenting with custom 2D renderers
    for signal based frameworks like solid and vue.`,
  },
  {
    title: 'Blogs And Small Articles',
    description: `When I'm learning something new, I like to write about it. So I have a
          [Medium](https://medium.com/@gabriel-delmachado) with some engineering, math and
          programming related articles. I also have some content on Linkedin about control theory, Rust and Webassembly.`,
  },
];
const experiences = [
  {
    title: 'Nelógica - Software Developer',
    description: `Nelógica is the biggest trading software company in Brazil, and has several trading platforms. 
          I work building cross-platform UIs for web, IOS, android and MAC OS. Our focus is on reliability and performance.
          We use mainly Typescript and VueJS (but also specific languages for each platform as SWIFT and Kotlin). My role
          now is more guided towards performance improvements, developer experience (analyzing new tools and technologies)
          and feature implementations, while instructing new members of the team.`,
    schoolPlaceDate: 'Porto Alegre - RS, BR. 2020-(Now)',
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
    { icon: Icons.Location, text: 'Porto Real, RJ, BR' },
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
