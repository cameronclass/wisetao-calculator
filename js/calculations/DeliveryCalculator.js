// DeliveryCalculator.js
import { CONFIG } from "../config.js";
import { UIController } from "../ui/ui-controller.js";
import { State } from "../data/State.js";

export class DeliveryCalculator {
  constructor(
    jsonLoader,
    wisetaoRuble,
    wisetaoYuan,
    cbrRuble,
    cbrYuan,
    fields
  ) {
    this.jsonLoader = jsonLoader;
    this.fields = fields;

    // Курсы Wisetao (для calc-cargo)
    this.wisetaoRuble = wisetaoRuble;
    this.wisetaoYuan = wisetaoYuan;

    // Курсы ЦБ (для calc-customs)
    this.cbrRuble = cbrRuble;
    this.cbrYuan = cbrYuan;

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
      // Включили «Ввести объём напрямую»
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

    const calcVol = (length * width * height) / 1_000_000;
    totalVolumeCalculated.value = calcVol > 0 ? calcVol.toFixed(4) : "";
  }

  /**
   * Конвертирует введённую стоимость (totalCost) в доллары
   * на базе выбранной валюты (selectedCurrency)
   * и курсов currentRuble/currentYuan.
   */
  convertToDollar(totalCost, selectedCurrency, currentRuble, currentYuan) {
    if (selectedCurrency === "ruble") {
      return totalCost / currentRuble;
    } else if (selectedCurrency === "yuan") {
      return totalCost / currentYuan;
    }
    // Если 'dollar'
    return totalCost; // уже в долларах
  }

  calculateDensity(totalWeight, totalVolume) {
    if (totalVolume <= 0) {
      UIController.showError("Объём должен быть больше нуля");
      return null;
    }
    return totalWeight / totalVolume;
  }

  // Старая логика для calc-cargo: смотрим JSON, ищем тариф
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
   * Упрощённая логика для calc-customs (0.6$/кг) для всех направлений
   */
  calculateCustoms(totalWeight) {
    const directions = ["auto", "train", "avia"];
    return directions.map(() => {
      const shippingCost = totalWeight * 0.6;
      return {
        cost: shippingCost,
        pricePerKg: 0.6,
        calculationMode: "weight",
      };
    });
  }

  /**
   * Метод, который ищет в JSON нужный тариф (в $ за кг)
   * с учётом плотности (если cargo)
   */
  calculateShippingCostForDirection(
    direction,
    categoryKey,
    density,
    weight,
    volume
  ) {
    const directionData = this.jsonLoader.getDirectionData(direction);
    if (!directionData) {
      UIController.showError(`Нет данных для направления "${direction}".`);
      return { cost: 0, pricePerKg: 0, calculationMode: null };
    }

    // ищем «rangeData»
    let calculationMode = "";
    let rangeData = null;

    if (direction === "train") {
      // Тарифы лежат прямо в массиве directionData
      rangeData = directionData.find((rd) => {
        const [min, max] = rd.weight_range
          .split("-")
          .map((val) => (val === "" ? Infinity : parseFloat(val) || 0));
        return density >= min && density <= max;
      });
      calculationMode = density >= 200 ? "weight" : "volume";
    } else {
      // auto / avia => сначала ищем категорию
      let catData;
      if (direction === "avia") {
        catData =
          directionData.find((cat) => cat.category_key === categoryKey) ||
          directionData.find((cat) => cat.category_key === "others");
      } else {
        // auto
        catData = directionData.find((cat) => cat.category_key === categoryKey);
      }
      if (!catData) {
        UIController.showError(
          `Категория ${categoryKey} не найдена для ${direction}`
        );
        return { cost: 0, pricePerKg: 0, calculationMode: null };
      }

      // catData.data => массив весовых диапазонов
      rangeData = catData.data?.find((rd) => {
        const [min, max] = rd.weight_range
          .split("-")
          .map((val) => (val === "" ? Infinity : parseFloat(val) || 0));
        return density >= min && density <= max;
      });
      calculationMode = density >= 100 ? "weight" : "volume";
    }

    if (!rangeData) {
      UIController.showError(
        `Не найден подходящий тариф для ${direction}, плотность: ${density}`
      );
      return { cost: 0, pricePerKg: 0, calculationMode: null };
    }

    let pricePerKg = rangeData.price_kg;
    // Доплата за бренд (если включено):
    if (this.fields.brand?.checked) {
      // Если плотность >= 100 => +0.5$/кг, иначе +50$/куб
      pricePerKg += density >= 100 ? 0.5 : 50;
    }

    const cost =
      calculationMode === "weight" ? pricePerKg * weight : pricePerKg * volume;

    return { cost, pricePerKg, calculationMode };
  }

  /**
   * Считаем упаковку (packingType)
   */
  calculatePackagingCost(packingType, volume, quantity) {
    const packaging = this.jsonLoader.getPackagingData(packingType);
    if (!packaging) {
      UIController.showError("Не найдена упаковка " + packingType);
      return 0;
    }
    const standardPack = this.jsonLoader.getPackagingData("std_pack");
    if (!standardPack) {
      UIController.showError("Не найдена упаковка std_pack");
      return 0;
    }

    // Сколько стоит эта упаковка
    const mainCost =
      packaging.which === "place"
        ? packaging.price * quantity
        : packaging.price * volume;
    // И сколько стоит стандартная упаковка (она добавляется, если не «std_pack»)
    const stdCost =
      standardPack.which === "place"
        ? standardPack.price * quantity
        : standardPack.price * volume;

    // если выбрано «std_pack» => не надо прибавлять stdCost
    if (packingType === "std_pack") {
      return mainCost;
    }
    return mainCost + stdCost;
  }

  /**
   * Страховка
   */
  calculateInsuranceCost(shippingCost, goodsCostDollar) {
    // Пример: 3% от (доставка + стоимость товара)
    // или rate=0.03 => CONFIG.insuranceRate
    const rate = CONFIG.insuranceRate;
    return this.fields.insurance.checked
      ? (shippingCost + goodsCostDollar) * rate
      : 0;
  }

  /**
   * Cумма (доставка + упаковка + страховка)
   */
  calculateTotalCost(shippingCost, packagingCost, insuranceCost) {
    return shippingCost + packagingCost + insuranceCost;
  }

  /**
   * Дополнительный метод: считаем «таможенные расходы»
   * @param {number} costInDollar  — стоимость товара в $ (которую ввёл клиент) 
   * @param {number} dutyValuePct  — процент пошлины (например, 15%)
   * @param {number} cbrRateDollar — например, 100 руб/долл
   * @param {number} cbrRateYuan   — например, 15 руб/юань
   * @returns {object}
   */
  calculateCustomsCost(costInDollar, dutyValuePct, cbrRateDollar, cbrRateYuan) {
    // 1) Пошлина: dutyValuePct% от стоимости
    const dutyDollar = (dutyValuePct / 100) * costInDollar;

    // 2) Сумма с пошлиной
    const sumWithDutyDollar = costInDollar + dutyDollar;

    // 3) НДС = 20% от sumWithDutyDollar
    const ndsDollar = sumWithDutyDollar * 0.2; // или храните 0.2 в config

    // 4) Услуги декларации: 550 юаней => сколько это в долларах?
    //   если cbrRateYuan=15 руб/юань, cbrRateDollar=100 руб/долл
    //   тогда 1$=100 руб, 1¥=15 руб => 1$= (100/15)¥ => 1¥= (15/100)$=0.15$
    //   => 550¥ = 550*(15/100)$ = 82.5$
    // Упрощённо:
    const decDollar = (550 * cbrRateYuan) / cbrRateDollar;

    // 5) Итого всё (пошлина+ндс+декларация), но вычитаем «исходную сумму товара»
    //   чтобы получить чисто «таможенные затраты»
    //   либо можно оставить «всю сумму»: costInDollar + dutyDollar + ndsDollar + decDollar
    //   часто хотят показать, насколько дороже стало
    const totalCustomsDollar =
      costInDollar + dutyDollar + ndsDollar + decDollar - costInDollar;


    return {
      dutyDollar,
      ndsDollar,
      decDollar,
    };
  }

  async calculate() {
    try {
      // 1) Узнаём тип режима (calc-cargo | calc-customs)
      const calcTypeRadio = document.querySelector(
        'input[name="calc-type"]:checked'
      );
      const calcType = calcTypeRadio ? calcTypeRadio.value : "calc-cargo";

      // Для cargo берём wisetao-курсы, для customs — cbr-курсы
      let currentRuble, currentYuan;
      if (calcType === "calc-cargo") {
        currentRuble = this.wisetaoRuble;
        currentYuan = this.wisetaoYuan;
      } else {
        currentRuble = this.cbrRuble;
        currentYuan = this.cbrYuan;
      }

      // 2) Собираем данные, которые ввёл пользователь
      const totalCostUser = parseFloat(this.fields.totalCost.value) || 0; // то, что ввёл
      const totalWeight = parseFloat(this.fields.totalWeight.value) || 0;
      const totalVolume = this.fields.weightVolumeChange.checked
        ? parseFloat(this.fields.totalVolume.value) || 0
        : parseFloat(this.fields.totalVolumeCalculated.value) || 0;

      // Выбранная валюта (dollar/ruble/yuan)
      const selCurEl = document.querySelector(
        'input[name="total_currecy"]:checked'
      );
      const selectedCurrency = selCurEl ? selCurEl.value : "dollar";

      // Конвертируем totalCost в доллары (на основе курсов)
      const costInDollar = this.convertToDollar(
        totalCostUser,
        selectedCurrency,
        currentRuble,
        currentYuan
      );

      // Далее будем считать отдельно:
      let results; // [{cost, pricePerKg, calculationMode},...]
      let density = 0;
      let categoryKey = "";

      if (calcType === "calc-cargo") {
        // Карго
        // 1) узнаём категорию
        const catKeyEl = Array.from(this.fields.category).find(
          (c) => c.checked
        );
        if (!catKeyEl) {
          UIController.showError("Не выбрана категория для карго!");
          return;
        }
        categoryKey = catKeyEl.value;

        // 2) плотность
        density = this.calculateDensity(totalWeight, totalVolume);
        if (density === null) return; // ошибка уже показана

        // 3) Считаем доставку
        results = this.calculateCargo(
          categoryKey,
          density,
          totalWeight,
          totalVolume
        );
      } else {
        // Белая доставка (0.6$/кг)
        results = this.calculateCustoms(totalWeight);
      }

      // Упаковка
      const packingTypeEl = document.querySelector(
        'input[name="packing-type"]:checked'
      );
      if (!packingTypeEl) {
        UIController.showError("Упаковка не выбрана!");
        return;
      }
      const packingType = packingTypeEl.value;
      const packagingCost = this.calculatePackagingCost(
        packingType,
        totalVolume,
        parseInt(this.fields.quantity.value, 10)
      );

      // 3) Если calc-customs, то нужно посчитать тамож. расходы
      let customsObj = null; // результат calculateCustomsCost
      if (calcType === "calc-customs") {
        // Предположим, State.tnvedSelection.chosenCodeImp — % пошлины
        const dutyValuePct = State.tnvedSelection.chosenCodeImp || 10;

        // Считаем всё
        customsObj = this.calculateCustomsCost(
          costInDollar, // costInDollar
          dutyValuePct, // процент пошлины
          this.cbrRuble, // сколько руб / $
          this.cbrYuan // сколько руб / ¥
        );
      }

      // Логика вывода
      //  - Расходы на доставку cargo (results),
      //  - если calc-customs => складываем "стоимость доставки" + "тамож.расходы"
      //    или отдельный объект data для UI

      // 4) Подготовим данные для UIController
      //    Если calc-cargo: таможенные поля = null
      //    Если calc-customs: таможенные поля = customsObj
      const dataForUI = {
        calcType, // 'calc-cargo' | 'calc-customs'
        totalCost: totalCostUser,
        selectedCurrency, // dollar/ruble/yuan
        costInDollar, // totalCostUser, но в $
        totalVolume,
        totalWeight,
        quantity: parseInt(this.fields.quantity.value, 10),
        density,
        categoryKey,
        packagingCost, // (доллары)
        brandIncluded: this.fields.brand?.checked && calcType === "calc-cargo",
        packingTypeValue: packingType,

        // Курсы: Wisetao (cargo) и CBR (customs)
        currencyRuble: this.wisetaoRuble,
        currencyYuan: this.wisetaoYuan,
        cbrRuble: this.cbrRuble,
        cbrYuan: this.cbrYuan,

        calculateInsuranceCost: this.calculateInsuranceCost.bind(this),
        calculateTotalCost: this.calculateTotalCost.bind(this),
      };

      // Если есть таможенные данные, добавим их
      if (calcType === "calc-customs" && customsObj) {
        // Посчитаем «Итог перевозки»:
        //   results[0].cost = доставка auto
        //   results[1].cost = train
        //   results[2].cost = avia
        //   …но обычно выбирают одно из направлений (auto/train/avia).
        //   если нужно общую сумму, можно взять, напр., results[0].cost
        //   или показать для каждого
        //   А если пользователь будет дальше выбирать?
        // Для примера возьмём auto => results[0].cost
        //   (или можно для каждого сложить: results[i].cost + customsObj.totalCustomsDollar)
        // «Перевозка + таможка» = shippingCost + customsObj.totalCustomsDollar.
        // Но лучше всё это делать в UI на каждый direction.
        // Для примера оставлю aggregated:
        const shippingDollarAuto = results[0].cost; // можно idx=0 (auto)
        // Переводим в рубли:
        const shippingRubAuto = shippingDollarAuto * this.cbrRuble;
        // Итого (доставка + таможня) в долларах + рублях:
        const totalAllDollar =
          shippingDollarAuto + customsObj.totalCustomsDollar;
        const totalAllRub = shippingRubAuto + customsObj.totalCustomsRub;

        // Дополнительные поля для UI
        dataForUI.dutyValue = State.tnvedSelection.chosenCodeImp || 10;
        dataForUI.dutyUsd = customsObj.dutyDollar;
        dataForUI.ndsUsd = customsObj.ndsDollar;
        dataForUI.decDollar = customsObj.decDollar;
        dataForUI.dutyRub = customsObj.dutyRub;
        dataForUI.ndsRub = customsObj.ndsRub;
        dataForUI.decRub = customsObj.decRub;
        dataForUI.totalCustomsDollar = customsObj.totalCustomsDollar;
        dataForUI.totalCustomsRub = customsObj.totalCustomsRub;

        dataForUI.totalAllDollar = totalAllDollar;
        dataForUI.totalAllRub = totalAllRub;
      }

      // Вызываем UI
      UIController.showResults(results, dataForUI);

      // В конец можно вывести полную отладочную таблицу в консоль:
      console.table({
        ТипРасчёта: calcType,
        totalCostUser,
        selectedCurrency,
        costInDollar: costInDollar.toFixed(2),
        totalVolume,
        totalWeight,
        packagingCost: packagingCost.toFixed(2),
        brandIncluded: !!this.fields.brand?.checked,
        packingTypeValue: packingType,
        wisetaoRuble: this.wisetaoRuble,
        wisetaoYuan: this.wisetaoYuan,
        cbrRuble: this.cbrRuble,
        cbrYuan: this.cbrYuan,
        categoryKey,
        density,
        // Если есть customsObj, тоже выведем:
        customsObj,
      });
    } catch (err) {
      UIController.showError("Ошибка в расчёте: " + err.message);
      console.error(err);
    }
  }
}
