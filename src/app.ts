import axios, { AxiosRequestConfig } from 'axios';
import dotenv from 'dotenv';
import { monthArray } from './utils';
import { dayObject, fetchQuery } from './types';
dotenv.config();

const url: string = process.env.DAY_OFF_URL || '';

/**
 * Метод для получения строки выходных дней календаря
 * @param {object} params - параметры для запроса
 * @returns {Promise<string>} строка с результатом
 */
const fetchDayOf = async (params: fetchQuery) => {
  // TODO: обернуть в try catch
  const { year, month } = params;
  const config: AxiosRequestConfig = { responseType: 'text', params: { year, month } };
  const response = await axios.get(url, config);
  return response.data;
};

/**
 * Метод для парсинга массива элементов календаря рабочих дней
 * @param {number} year - год из объекта даты
 * @param {number} month - месяц из объекта даты
 * @param {Array<string>} calendarArray - строка элементов из dayOff
 * @returns {Array<object>}
 */
const parseCalendarString = (year: number, month: number, calendarArray: Array<string>) => {
  // первое число месяца
  let dateCounter = 1;
  const result: dayObject = [];
  calendarArray.forEach((day) => {
    // дата в формате YYYY-MM-DD
    const date = new Intl.DateTimeFormat('sv-SE').format(new Date(year, month, dateCounter));
    // номер дня недели
    const dayNumber = new Date(year, month, dateCounter).getDay();
    if (day === '1') result.push({ date, workingDay: false, dayNumber });
    if (day === '0') result.push({ date, workingDay: true, dayNumber });
    dateCounter++;
  });
  return result;
};

/**
 * Софрмировать объект календаря
 * @param {string} calendarString - строка календаря из dayOff
 * @param {number} year - год из объекта даты
 * @param {number} month - месяц из объекта даты
 * @returns {object}
 */
const formCalendarObject = (calendarString: string, year: number, month: number) => {
  // формируем первый день месяца
  const firstDate = new Intl.DateTimeFormat('sv-SE').format(new Date(year, month, 1));
  // получаем последний день месяца
  const lastDate = new Intl.DateTimeFormat('sv-SE').format(new Date(year, month + 1, 0));
  // получаем первый номер первого дня недели
  const firstDay = new Date(year, month, 1).getDay();
  //! если первый день недели 0 (ВСК) то насильно пихаем ему 6(ВСК по русски)
  const firstDayNumber = firstDay === 0 ? 6 : firstDay - 1;
  //! если 1 день месяца это ВСК, то недель будет 6 на таблице, в противном случае 5
  const numberOfWeeks = firstDay === 0 ? 6 : 5;
  // день месяца
  const daysInMonth = 32 - new Date(year, month, 32).getDate();
  // массив рабочих и календарных дней
  const calendarArray = calendarString.split('');
  const days = parseCalendarString(year, month, calendarArray);
  return { firstDate, lastDate, firstDayNumber, numberOfWeeks, daysInMonth, days };
};

const main = async () => {
  const year = new Date().getFullYear();
  const month = new Date().getMonth();
  const calendarString = await fetchDayOf({ year: 2024, month: monthArray[month].monthNumber });
  const result = formCalendarObject(calendarString, year, month);
  console.log(result);
};

main();
