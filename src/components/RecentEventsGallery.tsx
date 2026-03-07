import { Gallery4, type Gallery4Item } from '@/components/blocks/gallery4';

const imageVersion = '20260307-gallery4';

const presentingImages: Gallery4Item[] = [
  {
    id: 'workshop-1',
    title: 'Opening the session',
    description: 'Kick-off moment from a live workshop evening.',
    image: `/images/presenting/workshop-1.jpg?v=${imageVersion}`,
    width: 900,
    height: 506,
  },
  {
    id: 'workshop-5',
    title: 'Live crowd walkthrough',
    description: 'Real-time prompting and code discussion with the audience.',
    image: `/images/presenting/workshop-5.jpg?v=${imageVersion}`,
    width: 720,
    height: 960,
  },
  {
    id: 'workshop-3',
    title: 'Deep-dive talk',
    description: 'A more focused segment inside the meetup flow.',
    image: `/images/presenting/workshop-3.jpg?v=${imageVersion}`,
    width: 960,
    height: 720,
  },
  {
    id: 'workshop-4',
    title: 'CreateNew stage',
    description: 'Panel-style setup with a looser conversation format.',
    image: `/images/presenting/workshop-4.jpg?v=${imageVersion}`,
    width: 900,
    height: 556,
  },
  {
    id: 'workshop-6',
    title: 'Smaller room setup',
    description: 'Compact session with close-up Q&A and demos.',
    image: `/images/presenting/workshop-6.jpg?v=${imageVersion}`,
    width: 720,
    height: 960,
  },
  {
    id: 'workshop-7',
    title: 'Evening presentation',
    description: 'A wider view of the room during the talk.',
    image: `/images/presenting/workshop-7.jpg?v=${imageVersion}`,
    width: 900,
    height: 675,
  },
  {
    id: 'workshop-8',
    title: 'Panel conversation',
    description: 'Fireside-style exchange with founders and guests.',
    image: `/images/presenting/workshop-8.jpg?v=${imageVersion}`,
    width: 4032,
    height: 3024,
  },
  {
    id: 'workshop-9',
    title: 'Guest presentation',
    description: 'Community night with practical walkthroughs on stage.',
    image: `/images/presenting/workshop-9.jpg?v=${imageVersion}`,
    width: 4032,
    height: 3024,
  },
  {
    id: 'workshop-10',
    title: 'After-hours session',
    description: 'Late part of the meetup with the room still fully engaged.',
    image: `/images/presenting/workshop-10.jpg?v=${imageVersion}`,
    width: 4032,
    height: 3024,
  },
];

export function RecentEventsGallery() {
  return <Gallery4 items={presentingImages} />;
}
