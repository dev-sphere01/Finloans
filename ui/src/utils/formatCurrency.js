// src/utils/formatCurrency.js

/**
 * Format a number into Indian currency format.
 * Example: 123456.78 → ₹1,23,456.78 or 1,23,456.78
 *
 * @param {number} value - The numeric value to format
 * @param {boolean} showSymbol - If true, includes ₹; otherwise returns just the number
 * @returns {string} - Formatted currency string
 */
export default function formatCurrency(value, showSymbol = true) {
  if (isNaN(value)) return showSymbol ? "₹0.00" : "0.00";

  const options = {
    style: showSymbol ? "currency" : "decimal",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  };

  return new Intl.NumberFormat("en-IN", options).format(value);
}
