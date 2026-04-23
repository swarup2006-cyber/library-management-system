export const validateEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const validatePassword = (value) => value.trim().length >= 8;

export const required = (value) => value && value.trim().length > 0;
