'use client';

import { useState, useEffect } from 'react';
import { driver, Driver } from 'driver.js';
import 'driver.js/dist/driver.css';

// Define proper types for driver.js
type PopoverSide = 'top' | 'right' | 'bottom' | 'left';
type PopoverAlign = 'start' | 'center' | 'end';

type TourStep = {
  element: string;
  popover: {
    title: string;
    description: string;
    side: PopoverSide;
    align: PopoverAlign;
  };
};

export const useTour = () => {
  const [driverObj, setDriverObj] = useState<Driver | null>(null);
  const [hasSeenTour, setHasSeenTour] = useState<boolean>(false);

  useEffect(() => {
    // Check if user has already seen the tour
    const tourSeen = localStorage.getItem('dashboard_tour_seen');
    setHasSeenTour(!!tourSeen);

    // Initialize driver.js
    const driverInstance = driver({
      showProgress: true,
      smoothScroll: true,
      stagePadding: 10,
      animate: true,
      allowClose: true,
      nextBtnText: 'Suivant',
      prevBtnText: 'Précédent',
      onHighlightStarted: (element: Element | undefined) => {
        // Scroll to the element if needed
        element?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      },
      onDeselected: () => {
        // Mark tour as seen when user closes it
        localStorage.setItem('dashboard_tour_seen', 'true');
        setHasSeenTour(true);
      },
    });

    setDriverObj(driverInstance);

    return () => {
      // Cleanup
      driverInstance.destroy();
    };
  }, []);

  const startTour = () => {
    if (!driverObj) return;

    const steps: TourStep[] = [
      {
        element: '#dashboard-header',
        popover: {
          title: 'Tableau de bord',
          description:
            "Bienvenue sur votre tableau de bord Splane. Vous pouvez voir ici une vue d'ensemble de vos projets et tâches.",
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#dashboard-stats',
        popover: {
          title: 'Statistiques',
          description:
            "Consultez rapidement les statistiques clés de votre équipe: projets actifs, tâches terminées, tâches en attente et membres d'équipe.",
          side: 'bottom',
          align: 'center',
        },
      },
      {
        element: '#dashboard-projects',
        popover: {
          title: 'Projets en cours',
          description:
            'Visualisez vos projets actifs avec leur progression et les membres qui y travaillent.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#dashboard-tasks',
        popover: {
          title: 'Tâches à venir',
          description: 'Consultez les tâches à venir avec leur priorité, date limite et statut.',
          side: 'left',
          align: 'center',
        },
      },
      {
        element: '#dashboard-calendar',
        popover: {
          title: 'Calendrier',
          description: 'Visualisez vos événements et échéances sur ce calendrier.',
          side: 'left',
          align: 'start',
        },
      },
      {
        element: '#dashboard-activity',
        popover: {
          title: 'Activité récente',
          description: "Suivez l'activité récente de votre équipe.",
          side: 'left',
          align: 'start',
        },
      },
      {
        element: '#new-project-button',
        popover: {
          title: 'Créer un projet',
          description: 'Cliquez ici pour créer un nouveau projet.',
          side: 'bottom',
          align: 'end',
        },
      },
    ];

    driverObj.setSteps(steps);
    driverObj.drive();

    // Mark tour as seen
    localStorage.setItem('dashboard_tour_seen', 'true');
    setHasSeenTour(true);
  };

  const resetTour = () => {
    localStorage.removeItem('dashboard_tour_seen');
    setHasSeenTour(false);
  };

  return { startTour, resetTour, hasSeenTour };
};
