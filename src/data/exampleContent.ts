import type { ContentItem } from '../types/contentItem';
import { format } from 'date-fns';

// Today's date in YYYY-MM-DD
const todayString = format(new Date(), 'yyyy-MM-dd');

export const exampleContentItems: ContentItem[] = [
  {
    id: 'example-4',
    title: 'Campaña Hoy: Día del Programador',
    description: '¡Feliz día a todos los desarrolladores! Código limpio y café fuerte.',
    fileUrl: 'https://picsum.photos/seed/hoy/400/300',
    category: 'campañas',
    suggestedDate: todayString,
    status: 'approved',
    comments: 'Publicar a las 9 AM.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'example-1',
    title: 'Lanzamiento Nueva Web',
    description: '¡Estamos emocionados de anunciar el lanzamiento de nuestra nueva página web! Visítala ahora.',
    fileUrl: 'https://picsum.photos/seed/lanzamiento/400/300',
    category: 'branding',
    suggestedDate: '2024-08-15',
    status: 'published',
    comments: 'Post principal de la campaña de lanzamiento.',
    createdAt: new Date('2024-07-10T10:00:00Z').toISOString(),
    updatedAt: new Date('2024-07-12T15:30:00Z').toISOString(),
  },
  {
    id: 'example-2',
    title: 'Promo Verano 20% OFF',
    description: 'Aprovecha nuestro descuento del 20% en todos los servicios durante el mes de agosto.',
    fileUrl: 'https://picsum.photos/seed/promo/400/300',
    category: 'promociones',
    suggestedDate: '2024-08-01',
    status: 'approved',
    comments: 'Revisar copy final antes de publicar.',
    createdAt: new Date('2024-07-20T09:00:00Z').toISOString(),
    updatedAt: new Date('2024-07-25T11:00:00Z').toISOString(),
  },
  {
    id: 'example-3',
    title: 'Tip: Optimiza tu SEO Local',
    description: 'Mejora tu visibilidad en búsquedas locales con estos 5 sencillos pasos.',
    fileUrl: 'https://picsum.photos/seed/tip/400/300',
    category: 'tips',
    suggestedDate: '2024-08-22',
    status: 'draft',
    createdAt: new Date('2024-07-28T14:00:00Z').toISOString(),
    updatedAt: new Date('2024-07-28T14:00:00Z').toISOString(),
  },
];

