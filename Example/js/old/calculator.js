class Calculator {
  constructor(rates, currencyYuan, currencyDollar) {
    this.rates = rates;
    this.currencyYuan = currencyYuan || 0;
    this.currencyDollar = currencyDollar || 0;
  }

  calculateDensity(totalWeight, totalVolume) {
    return totalWeight / totalVolume;
  }

  getPricePerKg(density, categoryKey) {
    const category = this.rates.categories.find(
      (cat) => cat.category_key === categoryKey
    );
    if (!category) throw new Error("Категория не найдена");

    const range = category.data.find((range) => {
      const [min, max] = range.weight_range.split("-").map(Number);
      if (!max) return density >= min;
      return density >= min && density <= max;
    });

    return range ? range.price_kg : 0;
  }

  calculateDeliveryCost(totalWeight, totalVolume, density, pricePerKg) {
    return density >= 100 ? totalWeight * pricePerKg : totalVolume * pricePerKg;
  }

  calculatePackagingCost(type, quantity, totalVolume) {
    const packaging = this.rates.packaging_prices.find(
      (pack) => pack.type === type
    );
    if (!packaging) throw new Error("Тип упаковки не найден");

    return packaging.which === "place"
      ? packaging.price * quantity
      : packaging.price * totalVolume;
  }

  calculateInsurance(deliveryCost, totalCost, insuranceChecked) {
    return insuranceChecked ? (deliveryCost + totalCost) * 0.02 : 0;
  }

  applyBrandMarkup(pricePerKg, density, brandChecked) {
    if (!brandChecked) return 0;
    return density >= 100 ? pricePerKg + 0.5 : 50;
  }

  calculateTotalCost(
    totalWeight,
    totalVolume,
    categoryKey,
    totalCost,
    quantity,
    packingType,
    insuranceChecked,
    brandChecked
  ) {
    const density = this.calculateDensity(totalWeight, totalVolume);
    const pricePerKg = this.getPricePerKg(density, categoryKey);

    const deliveryCost = this.calculateDeliveryCost(
      totalWeight,
      totalVolume,
      density,
      pricePerKg
    );
    const packagingCost = this.calculatePackagingCost(
      packingType,
      quantity,
      totalVolume
    );
    const insuranceCost = this.calculateInsurance(
      deliveryCost,
      totalCost,
      insuranceChecked
    );
    const brandMarkup = this.applyBrandMarkup(
      pricePerKg,
      density,
      brandChecked
    );

    const totalCostUSD =
      deliveryCost + packagingCost + insuranceCost + brandMarkup;

    return {
      deliveryCost,
      packagingCost,
      insuranceCost,
      totalUSD: totalCostUSD,
      totalRUB: totalCostUSD * this.currencyDollar,
      totalCNY: totalCostUSD * this.currencyYuan,
    };
  }
}
