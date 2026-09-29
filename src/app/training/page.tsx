import type { Metadata } from 'next';
import { TrainingApp } from '@/components/training/TrainingApp';

export const metadata: Metadata = {
  title: 'منصة محاكاة التقاضي',
  description: 'قضايا افتراضية، تدقيق إجرائي فوري للصحف والمذكرات، ومحاكاة للمهل والجلسات مع تقرير تقييم.',
};

/**
 * Lawyer-training module. Public on purpose: it holds no client data, and a
 * trainee should be able to practise before creating an account. Progress is
 * kept in the browser under the user-scoped storage prefix.
 */
export default function TrainingPage() {
  return <TrainingApp />;
}
