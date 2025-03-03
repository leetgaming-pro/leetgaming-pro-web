export const cleanNumericalString = (str = '') => (str ? str.replace(/\D/g, '') : str);

export const parseToUTC = (date?: string) => {
  if (!date) {
    return '';
  }
  if (date.length <= 9) {
    return date;
  }
  const dateParts = date.split('/');
  if (!date.length) {
    return date;
  }
  const [day, month, year] = dateParts;

  return `${year}-${month}-${day}`;
};
