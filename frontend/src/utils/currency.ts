export const formatINR = (amount: number, showDecimals: boolean = false): string => {
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: showDecimals ? 2 : 0,
    minimumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);

  return `₹${formatted}`;
};
