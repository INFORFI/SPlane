/**
 * Formate une date pour l'affichage
 * @param date La date à formater
 * @returns La date formatée selon les paramètres locaux (fr-FR)
 */
export function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  };
  return new Date(date).toLocaleDateString('fr-FR', options);
}

/**
 * Formate la date pour afficher uniquement le jour et le mois
 * @param date La date à formater
 * @returns Le jour et le mois formatés
 */
export function formatShortDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { 
    month: 'long', 
    day: 'numeric'
  };
  return new Date(date).toLocaleDateString('fr-FR', options);
}

/**
 * Détermine si deux dates sont le même jour
 * @param date1 Première date
 * @param date2 Deuxième date
 * @returns true si les deux dates sont le même jour, false sinon
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getDate() === date2.getDate() && 
         date1.getMonth() === date2.getMonth() && 
         date1.getFullYear() === date2.getFullYear();
}

/**
 * Renvoie un texte relatif pour une date (aujourd'hui, demain, etc.)
 * @param date La date à évaluer
 * @returns Un texte relatif à la date
 */
export function getRelativeDay(date: Date): string {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (isSameDay(date, today)) {
    return "Aujourd'hui";
  } else if (isSameDay(date, tomorrow)) {
    return "Demain";
  } else {
    return formatShortDate(date);
  }
} 