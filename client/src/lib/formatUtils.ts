// Utility functions for number and currency formatting
// Prevents NaN display issues across the application

export const safeFormatNumber = (value: any, decimals: number = 18): string => {
  if (!value) return "0";
  
  // Check if value already contains currency symbols or is pre-formatted
  if (typeof value === 'string' && (value.includes('$') || value.includes(',') || value.includes('.'))) {
    return value; // Return as-is if already formatted
  }
  
  const num = parseFloat(value);
  if (isNaN(num)) return "0";
  
  // Only apply decimal conversion for raw wei values
  const converted = num / Math.pow(10, decimals);
  return converted.toLocaleString();
};

export const safeFormatCurrency = (value: any): string => {
  const num = parseFloat(value);
  if (isNaN(num)) return "$0.00";
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 8
  }).format(num);
};

export const safeFormatPercentage = (value: any, decimals: number = 1): string => {
  const num = parseFloat(value);
  if (isNaN(num)) return "0.0%";
  
  return `${num.toFixed(decimals)}%`;
};

export const safeFormatDecimal = (value: any, decimals: number = 3): string => {
  const num = parseFloat(value);
  if (isNaN(num)) return "0." + "0".repeat(decimals);
  
  return num.toFixed(decimals);
};

export const safeCalculate = (operation: () => number, fallback: number = 0): number => {
  try {
    const result = operation();
    return isNaN(result) ? fallback : result;
  } catch (error) {
    return fallback;
  }
};