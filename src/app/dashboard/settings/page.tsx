import { getUserLoggedIn } from '@/action/users/getUserLoggedIn';
import UserSettingsPage from './Settings';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const user = await getUserLoggedIn();

  if (!user) {
    redirect('/login');
  }

  return <UserSettingsPage user={user} />;
}
