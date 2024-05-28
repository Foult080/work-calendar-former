import axios, { AxiosRequestConfig } from 'axios';
import dotenv from 'dotenv';
import { monthArray, prepareBeforeInsert } from './utils';
import { databaseRecord, dayObject, fetchQuery } from './types';
import sendQuery from './db';
dotenv.config();

const url: string = process.env.DAY_OFF_URL || '';
const databaseName = process.env.DB_TABLE_NAME || '';

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
 * @returns {object}
 */
const parseCalendarString = (year: number, month: number, calendarArray: Array<string>) => {
  // первое число месяца
  let dateCounter = 1;
  const days: dayObject = [];
  const workingDays: dayObject = [];
  calendarArray.forEach((day) => {
    // дата в формате YYYY-MM-DD
    const date = new Intl.DateTimeFormat('sv-SE').format(new Date(year, month, dateCounter));
    // номер дня недели
    const dayNumber = new Date(year, month, dateCounter).getDay();
    if (day === '1') days.push({ date, workingDay: false, dayNumber });
    if (day === '0') {
      workingDays.push({ date, workingDay: true, dayNumber });
      days.push({ date, workingDay: true, dayNumber });
    }
    dateCounter++;
  });
  return { days, workingDays };
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
  const { days, workingDays } = parseCalendarString(year, month, calendarArray);
  const dateInfo = { firstDate, firstDayNumber, lastDate, numberOfWeeks, daysInMonth };
  return { days, workingDays, dateInfo };
};

/**
 * Сохранить запись в базу
 * @param {databaseRecord} record
 */
const saveRecord = async (record: databaseRecord) => {
  const { fields, values, params }: any = prepareBeforeInsert(record);
  const sql = `insert into ${databaseName} (${fields}) values (${values})`;
  await sendQuery(sql, params);
};

/**
 * Сформировать производственный календарь за текущий месяц
 */
export const getCurrentDateWorkCalendar = async () => {
  const year = new Date().getFullYear();
  const month = new Date().getMonth();
  console.info(`Формирую производственный календарь за: ` + monthArray[month].name + ' ' + year);
  const calendarString = await fetchDayOf({ year: 2024, month: monthArray[month].monthNumber });
  const { days, workingDays, dateInfo } = formCalendarObject(calendarString, year, month);
  //TODO: проверка на наличие записей с этим периодом
  await saveRecord({
    date_year: year,
    date_month: month,
    date_info: JSON.stringify(dateInfo),
    working_days: JSON.stringify(workingDays),
    days: JSON.stringify(days)
  });
  console.info('Запись успешно добавлена');
};

export const getYearCalendar = async () => {
  const year = new Date().getFullYear();
  console.info('Формирую календарь за: ' + year);
  for await (const month of monthArray) {
    const { name, monthNumber } = month;
    const monthIndex = monthArray.findIndex((el) => el.name === name);
    console.log('Форминую запись за месяц:' + name);
    const calendarString = await fetchDayOf({ year: 2024, month: monthNumber });
    const { days, workingDays, dateInfo } = formCalendarObject(calendarString, year, monthIndex);
    //TODO: проверка на наличие записей с этим периодом
    await saveRecord({
      date_year: year,
      date_month: monthIndex,
      date_info: JSON.stringify(dateInfo),
      working_days: JSON.stringify(workingDays),
      days: JSON.stringify(days)
    });
    console.info('Запись успешно добавлена');
  }
};

/**
 * Точка входа в приложение
 */
const main = async () => {
  try {
    console.info('Начало работы');
    //! сформировать календарь за текущий период
    //await getCurrentDateWorkCalendar();
    //! сформировать производственный календарь за год
    await getYearCalendar();
    console.info('Завершение работы');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

main();
