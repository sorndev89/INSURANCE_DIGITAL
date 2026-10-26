export class PremiumCalculationService {
  private static readonly VAT_RATE = 0.07;
  private static readonly REGISTRATION_FEE = 20000; // LAK

  static calculate(basePremium: number, discountPercent: number = 0) {
    const netPremiumAfterDiscount = basePremium - (basePremium * discountPercent / 100);
    const vatAmount = netPremiumAfterDiscount * this.VAT_RATE;
    const totalPremium = netPremiumAfterDiscount + vatAmount + this.REGISTRATION_FEE;

    return {
      basePremium,
      discountPercent,
      netPremiumAfterDiscount,
      vatAmount,
      registrationFee: this.REGISTRATION_FEE,
      totalPremium,
      currency: 'LAK'
    };
  }

  static formatCurrency(amount: number) {
    return new Intl.NumberFormat('lo-LA', {
      style: 'currency',
      currency: 'LAK',
    }).format(amount);
  }
}
