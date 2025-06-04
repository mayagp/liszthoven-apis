export const currencyFormat = (
  value: number,
  withCurrency: boolean = true,
): string => {
  let formatted = new Intl.NumberFormat('id-ID', {
    style: withCurrency ? 'currency' : 'decimal',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);

  // Remove the non-breaking space
  if (withCurrency) {
    formatted = formatted.replace(/\s/g, ''); // Remove spaces
  }

  return formatted;
};
