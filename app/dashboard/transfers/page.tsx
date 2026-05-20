import { redirect } from 'next/navigation';

export default function TransfersRedirect() {
  redirect('/dashboard/history');
}

