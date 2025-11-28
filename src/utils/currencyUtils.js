export const formatCurrency = (amount, currency = "USD") => {
  if (amount == null || isNaN(amount)) return "$0.00";
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount));
};

export const parseCurrency = (value) => {
  if (!value) return 0;
  
  // Remove currency symbols and spaces
  const cleanValue = value.toString().replace(/[$,\s]/g, "");
  const parsed = parseFloat(cleanValue);
  
  return isNaN(parsed) ? 0 : parsed;
};

export const calculateTotal = (expenses) => {
  if (!Array.isArray(expenses)) return 0;
  
  return expenses.reduce((total, expense) => {
    return total + (parseFloat(expense.amount) || 0);
  }, 0);
};

export const formatNumber = (number, decimals = 0) => {
  if (number == null || isNaN(number)) return "0";
  
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Number(number));
};