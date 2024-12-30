import { State } from "../data/State.js";
import { CONFIG } from "../config.js";
import { UIController } from "../ui/ui-controller.js";

export class DeliveryCalculator {
  constructor(jsonLoader, currencyRuble, currencyYuan, fields) {
    this.jsonLoader = jsonLoader;
    this.currencyRuble = currencyRuble;
    this.currencyYuan = currencyYuan;
    this.fields = fields;
    this.initEventListeners();
    this.setupNumericInputRestrictions();
  }

  initEventListeners() {
    const { weightVolumeChange, volumeLength, volumeWidth, volumeHeight } =
      this.fields;

    weightVolumeChange.addEventListener("change", () => {
      this.toggleVolumeMode();
    });

    [volumeLength, volumeWidth, volumeHeight].forEach((field) => {
      field.addEventListener("input", () => {
        this.calculateVolume();
      });
    });
  }

  setupNumericInputRestrictions() {
    const numericFields = [
      this.fields.volumeLength,
      this.fields.volumeWidth,
      this.fields.volumeHeight,
    ];

    numericFields.forEach((field) => {
      field.addEventListener("input", () => {
        field.value = field.value.replace(/[^0-9.]/g, "");
        const parts = field.value.split(".");
        if (parts.length > 2) {
          field.value = parts[0] + "." + parts.slice(1).join("");
        }
        if (parts[1]?.length > 2) {
          field.value = `${parts[0]}.${parts[1].substring(0, 2)}`;
        }
      });
    });
  }

  toggleVolumeMode() {
    const {
      weightVolumeChange,
      totalVolume,
      volumeLength,
      volumeWidth,
      volumeHeight,
      totalVolumeCalculated,
    } = this.fields;

    if (weightVolumeChange.checked) {
      totalVolume.disabled = false;
      volumeLength.disabled = true;
      volumeWidth.disabled = true;
      volumeHeight.disabled = true;
      totalVolumeCalculated.value = "";
      totalVolumeCalculated.disabled = true;
    } else {
      totalVolume.disabled = true;
      volumeLength.disabled = false;
      volumeWidth.disabled = false;
      volumeHeight.disabled = false;
      totalVolumeCalculated.disabled = false;
    }
  }

  calculateVolume() {
    const { volumeLength, volumeWidth, volumeHeight, totalVolumeCalculated } =
      this.fields;

    const length = parseFloat(volumeLength.value) || 0;
    const width = parseFloat(volumeWidth.value) || 0;
    const height = parseFloat(volumeHeight.value) || 0;

    const calculatedVolume = ((length * width * height) / 1000000).toFixed(4);
    totalVolumeCalculated.value = calculatedVolume > 0 ? calculatedVolume : "";
  }

  convertToDollar(totalCost, selectedCurrency) {
    if (selectedCurrency === "ruble") {
      return (totalCost / this.currencyRuble).toFixed(2);
    } else if (selectedCurrency === "yuan") {
      return (totalCost / this.currencyYuan).toFixed(2);
    }
    return totalCost.toFixed(2); // если выбрали "dollar"
  }

  calculateDensity(totalWeight, totalVolume) {
    if (totalVolume > 0) {
      return (totalWeight / totalVolume).toFixed(2);
    }
    UIController.showError("Объем должен быть больше нуля");
    return null;
  }

  /**
   * Рассчёт для "calc-cargo" (старый)
   * @param {string} categoryKey
   * @param {number} density
   * @param {number} totalWeight
   * @param {number} totalVolume
   * @returns {Array} массив результатов для auto/train/avia
   */
  calculateCargo(categoryKey, density, totalWeight, totalVolume) {
    const directions = ["auto", "train", "avia"];
    return directions.map((direction) => {
      return this.calculateShippingCostForDirection(
        direction,
        categoryKey,
        density,
        totalWeight,
        totalVolume
      );
    });
  }

  /**
   * Рассчёт для "calc-customs"
   * @param {number} totalWeight
   * @returns {Array} массив с 3-мя направлениями, но одинаковым тарифом
   */
  calculateCustoms(totalWeight) {
    // ставка 0.6$/кг
    const directions = ["auto", "train", "avia"];
    return directions.map((direction) => {
      const shippingCost = totalWeight * 0.6; // по весу
      return {
        cost: shippingCost,
        pricePerKg: 0.6, // нет разницы в плотности
        calculationMode: "weight",
      };
    });
  }

  calculateShippingCostForDirection(
    direction,
    categoryKey,
    density,
    weight,
    volume
  ) {
    // Старый код выбора тарифов из JSON
    const directionData = this.jsonLoader.getDirectionData(direction);
    if (!directionData) {
      UIController.showError(
        `Данные для направления "${direction}" не найдены.`
      );
      return { cost: 0, pricePerKg: 0, calculationMode: null };
    }

    let calculationMode = null;
    let rangeData = null;

    if (direction === "train") {
      rangeData = directionData.find((range) => {
        const [min, max] = range.weight_range
          .split("-")
          .map((val) => (val === "" ? Infinity : parseFloat(val) || 0));
        return density >= min && density <= max;
      });
      calculationMode = density >= 200 ? "weight" : "volume";
    } else if (direction === "avia") {
      const categoryData =
        directionData.find((cat) => cat.category_key === categoryKey) ||
        directionData.find((cat) => cat.category_key === "others");

      rangeData = categoryData?.data?.find((range) => {
        const [min, max] = range.weight_range
          .split("-")
          .map((val) => (val === "" ? Infinity : parseFloat(val) || 0));
        return density >= min && density <= max;
      });
      calculationMode = density >= 100 ? "weight" : "volume";
    } else {
      const categoryData = directionData.find(
        (cat) => cat.category_key === categoryKey
      );
      rangeData = categoryData?.data?.find((range) => {
        const [min, max] = range.weight_range
          .split("-")
          .map((val) => (val === "" ? Infinity : parseFloat(val) || 0));
        return density >= min && density <= max;
      });
      calculationMode = density >= 100 ? "weight" : "volume";
    }

    if (!rangeData) {
      UIController.showError(
        `Не удалось найти подходящий тариф для направления ${direction} и плотности ${density}.`
      );
      return { cost: 0, pricePerKg: 0, calculationMode: null };
    }

    let pricePerKg = rangeData.price_kg;
    if (this.fields.brand && this.fields.brand.checked) {
      // "brand" добавляет 0.5$ или 50$ в зависимости от weight/volume
      pricePerKg += density >= 100 ? 0.5 : 50;
    }

    const cost =
      calculationMode === "weight" ? weight * pricePerKg : volume * pricePerKg;
    return { cost, pricePerKg, calculationMode };
  }

  calculatePackagingCost(packingType, volume, quantity) {
    const packaging = this.jsonLoader.getPackagingData(packingType);
    if (!packaging) {
      UIController.showError("Упаковка не найдена");
      return 0;
    }

    const standardPackaging = this.jsonLoader.getPackagingData("std_pack");
    if (!standardPackaging) {
      UIController.showError("Стандартная упаковка не найдена");
      return 0;
    }

    const packagingCost =
      packaging.which === "place"
        ? quantity * packaging.price
        : volume * packaging.price;
    const standardPackagingCost =
      standardPackaging.which === "place"
        ? quantity * standardPackaging.price
        : volume * standardPackaging.price;

    return (
      packagingCost + (packingType === "std_pack" ? 0 : standardPackagingCost)
    );
  }

  calculateInsuranceCost(shippingCost, totalCost) {
    return this.fields.insurance.checked
      ? (shippingCost + totalCost) * CONFIG.insuranceRate
      : 0;
  }

  calculateTotalCost(shippingCost, packagingCost, insuranceCost) {
    return shippingCost + packagingCost + insuranceCost;
  }

  async calculate() {
    try {
      // 1) Определить, какой режим выбран:
      const calcTypeRadio = document.querySelector(
        'input[name="calc-type"]:checked'
      );
      const calcType = calcTypeRadio ? calcTypeRadio.value : "calc-cargo";

      // 2) Собираем общие данные
      const totalCost = parseFloat(this.fields.totalCost.value) || 0;
      const totalWeight = parseFloat(this.fields.totalWeight.value) || 0;
      const totalVolume = this.fields.weightVolumeChange.checked
        ? parseFloat(this.fields.totalVolume.value) || 0
        : parseFloat(this.fields.totalVolumeCalculated.value) || 0;

      const selectedCurrencyElement = document.querySelector(
        'input[name="total_currecy"]:checked'
      );
      const selectedCurrency = selectedCurrencyElement
        ? selectedCurrencyElement.value
        : "dollar";

      const costInDollar = parseFloat(
        this.convertToDollar(totalCost, selectedCurrency)
      );

      // 3) Если calc-cargo — используем старый расчёт
      //    Если calc-customs — упрощённый
      let results;
      let density = 0;
      let categoryKey = "";

      if (calcType === "calc-cargo") {
        // Взять categoryKey, brand
        const categoryKeyElement = Array.from(this.fields.category).find(
          (field) => field.checked
        );
        if (!categoryKeyElement) {
          UIController.showError("Категория не выбрана!");
          return;
        }
        categoryKey = categoryKeyElement.value;

        density = this.calculateDensity(totalWeight, totalVolume);
        if (!density) {
          return; // Ошибка уже показана
        }

        results = this.calculateCargo(
          categoryKey,
          density,
          totalWeight,
          totalVolume
        );
      } else {
        // calc-customs — игнорируем category/brand
        // Плотность неважна, тариф = 0.6$/кг
        results = this.calculateCustoms(totalWeight);
      }

      // 4) Packaging
      const packingType = document.querySelector(
        'input[name="packing-type"]:checked'
      )?.value;
      if (!packingType) {
        UIController.showError("Упаковка не выбрана!");
        return;
      }

      const packagingCost = this.calculatePackagingCost(
        packingType,
        totalVolume,
        parseInt(this.fields.quantity.value, 10)
      );

      // 5) Передаём результаты в UIController
      UIController.showResults(results, {
        totalCost,
        selectedCurrency,
        costInDollar,
        totalVolume,
        totalWeight,
        quantity: parseInt(this.fields.quantity.value, 10),
        density, // при calc-customs может быть 0
        categoryKey,
        packagingCost,
        currencyYuan: this.currencyYuan,
        currencyRuble: this.currencyRuble,
        brandIncluded: this.fields.brand?.checked && calcType === "calc-cargo",
        packingTypeValue: packingType,
        calculateInsuranceCost: this.calculateInsuranceCost.bind(this),
        calculateTotalCost: this.calculateTotalCost.bind(this),
      });
    } catch (error) {
      UIController.showError(
        "Произошла непредвиденная ошибка при расчёте: " + error.message
      );
      console.error(error);
    }
  }
}

