// константа с месяцами
export const monthArray = [
  { name: 'Январь', monthNumber: '01' },
  { name: 'Февраль', monthNumber: '02' },
  { name: 'Март', monthNumber: '03' },
  { name: 'Апрель', monthNumber: '04' },
  { name: 'Май', monthNumber: '05' },
  { name: 'Июнь', monthNumber: '06' },
  { name: 'Июль', monthNumber: '07' },
  { name: 'Август', monthNumber: '08' },
  { name: 'Сентябрь', monthNumber: '09' },
  { name: 'Октябрь', monthNumber: '10' },
  { name: 'Ноябрь', monthNumber: '11' },
  { name: 'Декабрь', monthNumber: '12' }
];

/**
 * Тип для результата выполнения функции подготовки объекта для вставки
 */
export type preparedObject = { fields: string; values: string[]; params: any[] };

/**
 * Метод для формирования строки вставки в базу
 * @param {object} data - запись для вставки
 * @returns {preparedObject}
 */
export const prepareBeforeInsert = (data: any): object => {
  const fields = Object.keys(data).join(', ');
  const params = Object.values(data) as any[];
  const values: string[] = [];
  params.forEach(() => values.push('?'));
  return { fields, values, params } as preparedObject;
};
