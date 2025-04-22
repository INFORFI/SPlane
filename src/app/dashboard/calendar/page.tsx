import { Suspense } from 'react';
import CalendarClient from './CalendarClient';
import CalendarLoading from './CalendarLoading';
import { getTasks } from '@/action/tasks/getTasks';

export default function Page() {
  return (
    <Suspense fallback={<CalendarLoading />}>
      <CalendarPage />
    </Suspense>
  )
}

async function CalendarPage() {
  const tasks = await getTasks();
  
  return <CalendarClient tasks={tasks} />
}