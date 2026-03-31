import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    const role = session.user.role?.toLowerCase() || 'student';
    redirect(`/${role}`);
  } else {
    redirect('/login');
  }

  // Fallback (won't be reached)
  return null;
}
