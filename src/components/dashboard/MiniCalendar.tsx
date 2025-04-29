'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Loader2, XCircle, User } from 'lucide-react';
import { useState, useTransition } from 'react';
import { itemVariants } from '@/utils/ItemVariants';
import type { CalendarData, CalendarEvent } from '@/app/dashboard/CalendarEvents';
import { getMonthData } from '@/action/calendar/getMonthData';
import { getRelativeDay } from '@/utils/dateFormatter';

type MiniCalendarProps = {
  calendarData: CalendarData;
};

export default function MiniCalendar({ calendarData }: MiniCalendarProps) {
  const [calData, setCalData] = useState<CalendarData>(calendarData);
  const [activeMonth, setActiveMonth] = useState<number>(calendarData.currentMonthIndex);
  const [activeYear, setActiveYear] = useState<number>(calendarData.currentYear);
  const [isPending, startTransition] = useTransition();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isFilteredByUser, setIsFilteredByUser] = useState<boolean>(false);

  // Noms des jours de la semaine
  const weekdays = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

  // Changer de mois avec le filtre actuel
  const fetchMonthData = (month: number, year: number) => {
    startTransition(async () => {
      // Appeler l'action serveur pour récupérer les données du nouveau mois
      const newCalData = await getMonthData(month, year, isFilteredByUser);
      setCalData(newCalData);
      setActiveMonth(month);
      setActiveYear(year);
      setSelectedDay(null); // Réinitialiser le jour sélectionné lors du changement de mois
    });
  };

  // Changer de mois
  const goToPreviousMonth = () => {
    let newMonth = activeMonth;
    let newYear = activeYear;

    if (activeMonth === 0) {
      newMonth = 11;
      newYear = activeYear - 1;
    } else {
      newMonth = activeMonth - 1;
    }

    fetchMonthData(newMonth, newYear);
  };

  const goToNextMonth = () => {
    let newMonth = activeMonth;
    let newYear = activeYear;

    if (activeMonth === 11) {
      newMonth = 0;
      newYear = activeYear + 1;
    } else {
      newMonth = activeMonth + 1;
    }

    fetchMonthData(newMonth, newYear);
  };

  // Gérer la sélection d'un jour
  const handleDayClick = (day: number) => {
    if (selectedDay === day) {
      // Si le jour est déjà sélectionné, on le désélectionne
      setSelectedDay(null);
    } else {
      // Sinon on le sélectionne
      setSelectedDay(day);
    }
  };

  // Basculer le filtre utilisateur
  const toggleUserFilter = () => {
    startTransition(async () => {
      const newFilterState = !isFilteredByUser;
      setIsFilteredByUser(newFilterState);

      // Récupérer les données avec le nouveau filtre
      const newCalData = await getMonthData(activeMonth, activeYear, newFilterState);
      setCalData(newCalData);
      setSelectedDay(null); // Réinitialiser la sélection du jour
    });
  };

  // Filtrer les événements pour le jour sélectionné
  const filteredEvents = selectedDay
    ? calData.events.filter(event => new Date(event.date).getDate() === selectedDay)
    : calData.events.slice(0, 3); // Limiter à 3 événements dans la vue par défaut

  // Obtenir tous les événements pour l'affichage détaillé du jour
  const allEventsForSelectedDay = selectedDay
    ? calData.events.filter(event => new Date(event.date).getDate() === selectedDay)
    : [];

  // Create calendar days
  const days = [];

  // Add empty spaces for days before start of month
  for (let i = 0; i < calData.startDay; i++) {
    days.push(null);
  }

  // Add days of month
  for (let i = 1; i <= calData.daysInMonth; i++) {
    days.push(i);
  }

  // Formater la date du jour sélectionné
  const getSelectedDayLabel = () => {
    if (selectedDay === null) return 'Événements à venir';

    const selectedDate = new Date(activeYear, activeMonth, selectedDay);
    return `Événements du ${getRelativeDay(selectedDate)}`;
  };

  return (
    <motion.div
      variants={itemVariants}
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-white">
            {calData.currentMonth} {calData.currentYear}
          </h3>
          <button
            onClick={toggleUserFilter}
            disabled={isPending}
            className={`p-1.5 rounded-md text-xs flex items-center gap-1 transition-colors cursor-pointer ${
              isFilteredByUser
                ? 'bg-indigo-500 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
            }`}
            title={
              isFilteredByUser ? 'Afficher toutes les tâches' : 'Afficher uniquement mes tâches'
            }
          >
            <User className="h-3 w-3" />
            {isFilteredByUser ? 'Mes tâches' : 'Toutes'}
          </button>
        </div>
        <div className="flex gap-1">
          <button
            onClick={goToPreviousMonth}
            disabled={isPending}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-50 cursor-pointer"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
          </button>
          <button
            onClick={goToNextMonth}
            disabled={isPending}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-50 cursor-pointer"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-x-0 gap-y-1 mb-2">
        {weekdays.map((day, i) => (
          <div
            key={i}
            className="flex items-center justify-center h-8 text-xs font-medium text-zinc-400"
          >
            {day}
          </div>
        ))}
      </div>

      {isPending ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-5 w-5 text-zinc-400 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-x-0 gap-y-1">
            {days.map((day, index) =>
              day === null ? (
                <div
                  key={`empty-${index}`}
                  className="flex items-center justify-center h-8 w-full"
                ></div>
              ) : (
                <div
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`flex items-center justify-center h-8 w-full transition-colors cursor-pointer
                    ${
                      day === selectedDay
                        ? 'text-white font-medium'
                        : day === calData.today
                          ? 'text-white font-medium'
                          : calData.daysWithEvents.includes(day)
                            ? 'text-white relative hover:bg-zinc-800/50 rounded-md'
                            : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white rounded-md'
                    }`}
                >
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      day === selectedDay
                        ? 'bg-indigo-500'
                        : day === calData.today
                          ? 'bg-indigo-600'
                          : calData.daysWithEvents.includes(day)
                            ? 'after:absolute after:bottom-1 after:h-1 after:w-1 after:bg-indigo-500 after:rounded-full'
                            : ''
                    }`}
                  >
                    {day}
                  </div>
                </div>
              )
            )}
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium text-white">{getSelectedDayLabel()}</h4>
              {selectedDay && (
                <button
                  onClick={() => setSelectedDay(null)}
                  className="text-zinc-400 hover:text-zinc-300 cursor-pointer"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="space-y-2">
              {filteredEvents.length > 0 ? (
                (selectedDay ? allEventsForSelectedDay : filteredEvents).map(
                  (event: CalendarEvent) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
                    >
                      <div className={`h-2 w-2 rounded-full ${event.colorClass}`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{event.title}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-zinc-400">
                            {selectedDay
                              ? event.timeRange
                              : `${event.formattedDate}, ${event.timeRange}`}
                          </p>
                          {event.assignedUsers.length > 0 && (
                            <div className="flex -space-x-1">
                              {event.assignedUsers.slice(0, 3).map((user, i) => (
                                <div
                                  key={i}
                                  className="h-4 w-4 rounded-full bg-zinc-700 flex items-center justify-center text-[8px] text-white border border-zinc-900"
                                  title={user.name}
                                >
                                  {user.initials}
                                </div>
                              ))}
                              {event.assignedUsers.length > 3 && (
                                <div className="h-4 w-4 rounded-full bg-zinc-700 flex items-center justify-center text-[8px] text-white border border-zinc-900">
                                  +{event.assignedUsers.length - 3}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                )
              ) : (
                <p className="text-xs text-zinc-400">
                  {selectedDay
                    ? 'Aucun événement pour ce jour'
                    : isFilteredByUser
                      ? 'Aucune tâche ne vous est assignée'
                      : 'Aucun événement prévu'}
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
