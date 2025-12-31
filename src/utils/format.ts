export const formatCurrency = (n: number) => {
  if (Number.isNaN(n)) return '0.00';
  return n.toFixed(2);
};

export default formatCurrency;
