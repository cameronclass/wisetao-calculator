export class UIHandler {
  constructor() {
    this.fields = {
      totalWeight: document.querySelector('[name="total_weight"]'),
      totalVolume: document.querySelector('[name="total_volume"]'),
      quantity: document.querySelector('[name="quantity"]'),
      totalCost: document.querySelector('[name="total_cost"]'),
      category: document.querySelectorAll('[name="category"]'),
      insurance: document.querySelector('[name="insurance"]'),
      brand: document.querySelector('[name="brand"]'),
      packingType: document.querySelector('[name="packing-type"]'),
    };

    this.resultFields = {
      delivery: document.querySelector(".calculate-result__ship"),
      packaging: document.querySelector(".calculate-result__package"),
      insurance: document.querySelector(".calculate-result__insurance"),
      totalUSD: document.querySelector(".calculate-result__dollar"),
      totalRUB: document.querySelector(".calculate-result__ruble"),
      totalCNY: document.querySelector(".calculate-result__cny"),
    };
  }

  validateInputs() {
    let isValid = true;

    Object.entries(this.fields).forEach(([name, field]) => {
      if (!field.value || (name === "totalWeight" && field.value < 5)) {
        field.parentElement.classList.add("js-not-filled");
        isValid = false;
      } else {
        field.parentElement.classList.remove("js-not-filled");
      }
    });

    return isValid;
  }

  updateResults(results) {
    this.resultFields.delivery.textContent = results.delivery.toFixed(2);
    this.resultFields.packaging.textContent = results.packaging.toFixed(2);
    this.resultFields.insurance.textContent = results.insurance.toFixed(2);
    this.resultFields.totalUSD.textContent = results.USD.toFixed(2);
    this.resultFields.totalRUB.textContent = results.RUB.toFixed(2);
    this.resultFields.totalCNY.textContent = results.CNY.toFixed(2);
  }
}
