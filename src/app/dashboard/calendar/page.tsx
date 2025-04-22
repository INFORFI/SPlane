import { Suspense } from 'react';
import CalendarClient from './CalendarClient';
import CalendarLoading from './CalendarLoading';
import { getTasks } from '@/action/tasks/getTasks';

export default async function CalendarPage() {
  const tasks = await getTasks();
  
  return (
    <Suspense fallback={<CalendarLoading />}>
      <CalendarClient tasks={tasks} />
    </Suspense>
  );
}