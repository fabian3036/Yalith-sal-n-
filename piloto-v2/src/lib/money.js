// src/lib/money.js
export const money = (n) =>
  `$${(n || 0).toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
