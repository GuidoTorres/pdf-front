// Test simple para verificar la categorización con tipos de transacción
// Simulamos algunas transacciones del extracto estado_unlocked

const testTransactions = [
  { description: "Tran.Cel.Bm.", amount: 500, type: "credit", expected: "income" },
  { description: "Abon Plin-Hector O *", amount: 500, type: "credit", expected: "income" },
  { description: "Ret.Cajero Bcp", amount: -200, type: "debit", expected: "banking" },
  { description: "Compra Pos Supermercado", amount: -50, type: "debit", expected: "shopping" },
  { description: "Transferencia Nomina", amount: 3000, type: "credit", expected: "income" },
  { description: "Mcdonalds", amount: -25, type: "debit", expected: "food" },
  { description: "Uber", amount: -15, type: "debit", expected: "transport" },
  { description: "Netflix", amount: -30, type: "debit", expected: "entertainment" },
  // Test edge cases
  { description: "Deposito", amount: 1000, type: "credit", expected: "income" },
  { description: "Comision", amount: -5, type: "debit", expected: "banking" },
];

// Función de categorización simplificada para test que usa el tipo de transacción
function categorizeTransaction(description, amount, transactionType) {
  const desc = description.toLowerCase().trim();
  
  // Reglas para gastos (debit transactions)
  const expenseRules = [
    { keywords: ['ret.cajero', 'retiro cajero', 'retiro atm'], category: 'banking' },
    { keywords: ['compra pos', 'pos'], category: 'shopping' },
    { keywords: ['mcdonalds', 'burger', 'kfc', 'pizza'], category: 'food' },
    { keywords: ['uber', 'taxi'], category: 'transport' },
    { keywords: ['netflix', 'spotify'], category: 'entertainment' },
    { keywords: ['comision', 'mantenimiento'], category: 'banking' },
  ];
  
  // Reglas para ingresos (credit transactions)
  const incomeRules = [
    { keywords: ['tran.cel.bm', 'transferencia celular', 'bim'], category: 'income' },
    { keywords: ['plin', 'yape', 'tunki'], category: 'income' },
    { keywords: ['nomina', 'salario', 'sueldo', 'pago'], category: 'income' },
    { keywords: ['deposito', 'abono', 'ingreso'], category: 'income' },
  ];
  
  // Seleccionar reglas basadas en el tipo de transacción
  let rulesToUse;
  if (transactionType === 'credit') {
    rulesToUse = incomeRules;
  } else if (transactionType === 'debit') {
    rulesToUse = expenseRules;
  } else {
    // Fallback: usar monto para determinar
    rulesToUse = amount > 0 ? incomeRules : expenseRules;
  }
  
  // Buscar coincidencias
  for (const rule of rulesToUse) {
    if (rule.keywords.some(keyword => desc.includes(keyword))) {
      return rule.category;
    }
  }
  
  // Default basado en tipo de transacción
  if (transactionType === 'credit' || (transactionType === undefined && amount > 0)) {
    return 'income';
  }
  
  return 'other';
}

console.log('🧪 Test de Categorización de Transacciones\n');

testTransactions.forEach((transaction, index) => {
  const result = categorizeTransaction(transaction.description, transaction.amount, transaction.type);
  const isCorrect = result === transaction.expected;
  
  console.log(`${index + 1}. "${transaction.description}" (${transaction.amount}) [${transaction.type}]`);
  console.log(`   Esperado: ${transaction.expected}`);
  console.log(`   Resultado: ${result}`);
  console.log(`   ${isCorrect ? '✅ CORRECTO' : '❌ INCORRECTO'}\n`);
});

console.log('Test completado. Revisa los resultados arriba.');