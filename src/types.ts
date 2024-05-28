/**
 * Тип для объекта даты внутри массива
 */
export type dayObject = { date: string; workingDay: boolean; dayNumber: number; workDate: number | null }[];

/**
 * Тип для query параметров запроса
 */
export type fetchQuery = { year: number; month: string };

/**
 * Тип для записи при вставке в базу по схеме из миграции
 */
export type databaseRecord = { date_year: number; date_month: number; date_info: string; working_days: string; days: string };
