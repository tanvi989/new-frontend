export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateName = (name: string) => {
  const nameRegex = /^[A-Za-z\s]+$/;
  return nameRegex.test(name);
};

export const validateNumber = (number: string | number) => {
  const numberRegex = /^\d*\.?\d*$/ ;
  return numberRegex.test(String(number))
};
