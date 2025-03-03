import { cleanNumericalString } from '@/lib/normalize';

export const cpfMask = (value: string, callback?: any): string => {
  const maskedValue = value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');

  if (callback) {
    return callback(maskedValue);
  }
  return maskedValue;
};

export const cnpjMask = (value: string, callback?: any) => {
  const maskedValue = value
    .replace(/\D+/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');

  if (!callback) {
    return maskedValue;
  }
  return callback(maskedValue);
};
export const cpfAndCnpjMask = (value: string, callback?: any) => {
  const parsedValue = cleanNumericalString(value);
  if (parsedValue.length > 11) {
    return cnpjMask(value, callback);
  }

  return cpfMask(value, callback);
};

export const dateMask = (value: string, callback?: any) => {
  const maskedValue = value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1');

  if (callback) {
    return callback(maskedValue);
  }
  return maskedValue;
};

export const phoneMask = (value: string, callback?: any) => {
  const cleanedValue = value.replace(/\D/g, '');
  let maskedValue = cleanedValue;

  maskedValue = cleanedValue
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/g, '($1) $2')
    .replace(/(\d)(\d{4})(\d{4})$/, '$1$2-$3');

  if (callback) {
    return callback(maskedValue);
  }

  return maskedValue;
};

export const residentialPhoneMask = (value: string, callback?: any): string => {
  const numberClean = value.replace(/\D/g, '').slice(0, 10);

  const maskedValue = numberClean
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/g, '($1) $2')
    .replace(/(\d{4})(\d{4})/, '$1-$2');

  if (callback) {
    return callback(maskedValue);
  }

  return maskedValue;
};

export const cepMask = (value: string, callback?: any) => {
  const cleanedValue = value.replace(/\D/g, '');
  let maskedValue = cleanedValue;

  maskedValue = maskedValue.slice(0, 16);

  maskedValue = cleanedValue.replace(/^(\d{5})(\d{3})$/, '$1-$2');

  if (callback) {
    callback(maskedValue);
  }

  return maskedValue;
};

export const creditCardMask = (value: string, callback?: any): string => {
  const cleanedValue = value.replace(/\D/g, '');
  let maskedValue = cleanedValue;

  maskedValue = cleanedValue.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4');

  if (callback) {
    callback(maskedValue);
  }

  return maskedValue;
};

export const expirationMask = (value: string, callback?: any) => {
  const cleanedValue = value.replace(/\D/g, '');
  let maskedValue = cleanedValue;

  maskedValue = cleanedValue
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1');

  if (callback) {
    callback(maskedValue);
  }

  return maskedValue;
};

export const cardMask = (value: string, callback?: any) => {
  const maskedValue = value
    .replace(/\D/g, '')
    .replace(/(\d{4})(\d)/, '$1 $2')
    .replace(/(\d{4})(\d)/, '$1 $2')
    .replace(/(\d{4})(\d)/, '$1 $2')
    .replace(/(\d{4})(\d)/, '$1')
    .trim();

  callback(maskedValue.substring(0, 19));
};
