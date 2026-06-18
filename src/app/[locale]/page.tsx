import { setRequestLocale } from 'next-intl/server';
import Landing from '@/components/Landing';

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return <Landing />;
}
