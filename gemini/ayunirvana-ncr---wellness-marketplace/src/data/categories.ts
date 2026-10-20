import { ServiceCategory } from '../types';

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'cat-ayurveda',
    name: 'Ayurvedic Therapy & Panchakarma',
    slug: 'ayurvedic-therapy',
    description: 'Traditional herbal oil Abhyanga, Shirodhara, Potli massage, and dosha balance consultations by certified BAMS practitioners.',
    iconName: 'Sparkles',
    imageUrl: '/src/assets/images/therapist_ayurveda_expert_1790407820535.jpg',
  },
  {
    id: 'cat-physio',
    name: 'Clinical Physiotherapy & Rehab',
    slug: 'clinical-physiotherapy',
    description: 'Evidence-based musculoskeletal rehabilitation, spinal alignment, post-operative mobility, and sports injury recovery.',
    iconName: 'Activity',
    imageUrl: '/src/assets/images/therapist_physio_rehab_1790407833003.jpg',
  },
  {
    id: 'cat-therapeutic-massage',
    name: 'Therapeutic & Deep Tissue',
    slug: 'therapeutic-massage',
    description: 'Targeted myofascial release, Swedish relaxation, deep muscular tension relief, and certified holistic bodywork.',
    iconName: 'HeartHandshake',
    imageUrl: '/src/assets/images/spa_massage_suite_1790407847845.jpg',
  },
  {
    id: 'cat-yoga',
    name: 'Holistic Yoga & Breathwork',
    slug: 'yoga-breathwork',
    description: 'Personalized Hatha, Iyengar, Ashtanga, pranayama breathing, and stress reduction guided by certified RYT instructors.',
    iconName: 'Sun',
    imageUrl: '/src/assets/images/wellness_yoga_holistic_1790407860919.jpg',
  },
  {
    id: 'cat-naturopathy',
    name: 'Naturopathy & Acupressure',
    slug: 'naturopathy-acupressure',
    description: 'Holistic trigger-point therapy, reflexology, cupping, and non-invasive lifestyle rejuvenation.',
    iconName: 'Compass',
    imageUrl: '/src/assets/images/hero_wellness_sanctuary_1790407805847.jpg',
  },
];
