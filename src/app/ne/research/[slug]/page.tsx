'use client';
import { useParams } from 'next/navigation';
import PublicationDetail from '@/components/publication/PublicationDetail';

export default function NepaliPublicationPage() {
  const { slug } = useParams<{ slug: string }>();
  return <PublicationDetail slug={slug} forceLang="ne" />;
}
