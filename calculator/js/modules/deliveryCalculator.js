class DeliveryCalculator {
  constructor(jsonLoader, currencyRuble, currencyYuan, fields) {
    this.jsonLoader = jsonLoader; // Экземпляр JsonDataLoader
    this.currencyRuble = currencyRuble; // Курс рубля
    this.currencyYuan = currencyYuan; // Курс юаня
    this.fields = fields; // Поля ввода
  }

  // Расчет плотности
  calculateDensity(weight, volume) {
    if (volume > 0) {
      return (weight / volume).toFixed(2);
    }
    console.error("Объем должен быть больше 0");
    return null;
  }

  // Расчет стоимости доставки
  calculateShippingCost(categoryKey, density, weight, volume) {
    const categoryData = this.jsonLoader.getCategoryData(categoryKey);
    if (!categoryData) {
      console.error("Категория не найдена");
      return 0;
    }

    let pricePerKg = null;
    categoryData.data.forEach((range) => {
      const [min, max] = range.weight_range
        .split("-")
        .map((val) => (val.includes("+") ? Infinity : parseFloat(val)));
      if (density >= min && density <= max) {
        pricePerKg = range.price_kg;
      }
    });

    if (pricePerKg === null) {
      console.error("Не найден подходящий тариф для указанной плотности");
      return 0;
    }

    // Учет бренда
    const isBrandChecked = this.fields.brand.checked;
    if (isBrandChecked) {
      if (density >= 100) {
        pricePerKg += 0.5;
      } else {
        pricePerKg += 50;
      }
    }

    return density >= 100 ? weight * pricePerKg : volume * pricePerKg;
  }

  // Расчет стоимости упаковки
  calculatePackagingCost(packingType, volume, quantity) {
    const packaging = this.jsonLoader.getPackagingData(packingType);
    if (!packaging) {
      console.error("Упаковка не найдена");
      return 0;
    }

    return packaging.which === "place"
      ? quantity * packaging.price
      : volume * packaging.price;
  }

  // Расчет страховки
  calculateInsuranceCost(shippingCost, totalCost) {
    return this.fields.insurance.checked
      ? (shippingCost + totalCost) * 0.02
      : 0; // 2%
  }

  // Итоговая стоимость
  calculateTotalCost(shippingCost, packagingCost, insuranceCost) {
    return shippingCost + packagingCost + insuranceCost;
  }

  // Обновление интерфейса с результатами
  updateResults(shippingCost, packagingCost, insuranceCost, totalCost) {
    document.querySelector(".calculate-result__ship").textContent =
      shippingCost.toFixed(2);
    document.querySelector(".calculate-result__package").textContent =
      packagingCost.toFixed(2);
    document.querySelector(".calculate-result__insurance").textContent =
      insuranceCost.toFixed(2);
    document.querySelector(".calculate-result__dollar").textContent =
      totalCost.toFixed(2);
    document.querySelector(".calculate-result__ruble").textContent = (
      totalCost * this.currencyRuble
    ).toFixed(2);
    document.querySelector(".calculate-result__cny").textContent = (
      totalCost * this.currencyYuan
    ).toFixed(2);
  }

  // Основной метод расчета
  calculate() {
    const totalWeight = parseFloat(this.fields.totalWeight.value);
    const totalVolume = this.fields.weightVolumeChange.checked
      ? parseFloat(this.fields.totalVolume.value)
      : parseFloat(this.fields.totalVolumeCalculated.value);
    const totalCost = parseFloat(this.fields.totalCost.value);
    const categoryKey = document.querySelector(
      'input[name="category"]:checked'
    )?.value;
    const packingType = document.querySelector(
      'input[name="packing-type"]:checked'
    )?.value;

    if (!categoryKey || !packingType) {
      console.error("Категория или упаковка не выбраны");
      return;
    }

    const density = this.calculateDensity(totalWeight, totalVolume);
    if (!density) return;

    const shippingCost = this.calculateShippingCost(
      categoryKey,
      density,
      totalWeight,
      totalVolume
    );
    const packagingCost = this.calculatePackagingCost(
      packingType,
      totalVolume,
      parseInt(this.fields.quantity.value, 10)
    );
    const insuranceCost = this.calculateInsuranceCost(shippingCost, totalCost);

    const totalCostFinal = this.calculateTotalCost(
      shippingCost,
      packagingCost,
      insuranceCost
    );
    this.updateResults(
      shippingCost,
      packagingCost,
      insuranceCost,
      totalCostFinal
    );
  }
}

window.DeliveryCalculator = DeliveryCalculator;
