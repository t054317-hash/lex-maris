import { createRoot } from 'react-dom/client';
import { TrainingApp } from '@/components/training/TrainingApp';

/** Mount point for the standalone (static) build of the training module. */
const root = document.getElementById('root');
if (root) createRoot(root).render(<TrainingApp />);
