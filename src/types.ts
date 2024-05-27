/**
 * Тип для объекта даты внутри массива
 */
export type dayObject = { date: string; workingDay: boolean; dayNumber: number }[];

/**
 * Тип для query параметров запроса
 */
export type fetchQuery = { year: number; month: string };
