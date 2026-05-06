export function getEstimatedMonthlyInterest(balance: number, annualInterestRate: number) {
  return Math.round((balance * (annualInterestRate / 100)) / 12);
}
