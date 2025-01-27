import { State } from "../data/State.js";

/**
 * Маппинг направлений, чтобы знать,
 * какой класс/селектор связан с каким ключом в ответе
 */
const DIRECTIONS = [
  { name: "auto", className: "result_auto" },
  { name: "train", className: "result_train" }, // Всегда _off
  { name: "avia", className: "result_avia" },
];

class KitDeliveryCalculator {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
    this.baseClass = "kit";
  }

  async calculate() {
/*     if (!this.shouldCalculate()) {
      this.hideAllElements();
      return;
    }

    if (!this.validateRequiredFields()) {
      this.hideAllElements();
      return;
    } */

    this.setLoading(true);

    try {
      this.setLoading(true);
      const response = await this.fetchCalculation();
      this.processApiResponse(response);
      this.updateDirectionResults();
    } catch (error) {
      this.handleError(error);
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Проверяем, надо ли делать расчёт
   */
  shouldCalculate() {
    return !!State.address?.kit_to_code;
  }

  /**
   * Скрываем все элементы (все направления)
   */
  hideAllElements() {
    document.querySelectorAll(`.${this.baseClass}`).forEach((el) => {
      el.classList.remove("_load");
      el.querySelector(".loader")?.classList.remove("_load");
      el.classList.add("_off");
    });
  }

  /**
   * Делаем GET-запрос на API с нужными query-параметрами
   */
  async fetchCalculation() {
    const queryParams = this.prepareQueryParams();
    const response = await fetch(`${this.apiUrl}?${queryParams}`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    return response.json();
  }

  /**
   * Подготовка query-параметров на основании State
   */
  prepareQueryParams() {
    return new URLSearchParams({
      city_pickup_code: this.getPickupCityCode(),
      city_delivery_code: State.address.kit_to_code,
      price: State.calculatedData.clientCost.ruble,
      total_weight: State.clientData.totalWeight,
      total_volume: State.clientData.totalVolume,
      count: State.clientData.quantity,
      dollar: State.calculatedData.dollar,
    }).toString();
  }

  /**
   * Безопасный парсер значений из ответа (учитываем "н/д" или нечисло)
   */
  parseValue(val) {
    if (typeof val === "string" && val.toLowerCase() === "н/д") return 0;
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  }

  /**
   * Обрабатываем ответ от API, сохраняем в State.kit
   * и логгируем результат в консоль
   */
  processApiResponse(response) {
    /* console.log("API Response:", response); */

    const dollarRate = State.calculatedData.dollar;

    // Парсим auto (ранее назывался "regular")
    const autoKg = this.parseValue(response?.cost_price?.auto_regular);
    const autoAll = this.parseValue(response?.sum_cost_price?.auto_regular);

    // Парсим avia (ранее fast)
    const aviaKg = this.parseValue(response?.cost_price?.auto_fast);
    const aviaAll = this.parseValue(response?.sum_cost_price?.auto_fast);

    // Проверяем, есть ли данные для авто
    const isAutoAvailable = autoKg > 0 && autoAll > 0;
    // Проверяем, есть ли данные для авиа
    const isAviaAvailable = aviaKg > 0 && aviaAll > 0;

    // Формируем State.kit
    State.kit = {
      // auto
      auto: isAutoAvailable
        ? {
            kg: {
              dollar: Number(autoKg.toFixed(2)),
              ruble: Number((autoKg * dollarRate).toFixed(2)),
            },
            all: {
              dollar: Number(autoAll.toFixed(2)),
              ruble: Number((autoAll * dollarRate).toFixed(2)),
            },
          }
        : null,

      // avia
      avia: isAviaAvailable
        ? {
            kg: {
              dollar: Number(aviaKg.toFixed(2)),
              ruble: Number((aviaKg * dollarRate).toFixed(2)),
            },
            all: {
              dollar: Number(aviaAll.toFixed(2)),
              ruble: Number((aviaAll * dollarRate).toFixed(2)),
            },
          }
        : null,

      // Здесь будут наши рассчитанные с учётом дополнительных наценок
      calculated: {
        kg: {},
        all: {},
      },
    };

    /* console.log("Updated State.kit:", State.kit); */
  }

  /**
   * Для каждого направления (auto, train, avia) рассчитываем
   * конечные значения и обновляем UI
   */
  updateDirectionResults() {
    DIRECTIONS.forEach((direction) => {
      const element = document.querySelector(
        `.${direction.className} .${this.baseClass}`
      );
      if (!element) return;

      // Если это train, мы всегда прячем блок и выходим
      if (direction.name === "train") {
        element.classList.add("_off");
        return;
      }

      // Определяем, какие базовые цены использовать
      let baseValues = null;
      if (direction.name === "auto") {
        baseValues = State.kit.auto; // данные для auto
      } else if (direction.name === "avia") {
        baseValues = State.kit.avia; // данные для avia
      }

      // Если нет базовых значений (null), значит ответа нет или нулевые данные
      // — скрываем блок
      if (!baseValues) {
        element.classList.add("_off");
        return;
      }

      // Считаем с учётом дополнительных наценок (pricePerKg, cargoCost, customsCost и т.д.)
      const values = this.calculateDirectionValues(direction.name, baseValues);

      // Обновляем State.kit.calculated
      this.updateState(direction.name, values);

      // Обновляем UI
      this.updateUI(element, direction.name, values);
    });
  }

  /**
   * Собираем цифры для конкретного направления
   * (добавляя необходимые наценки при наличии)
   */
  calculateDirectionValues(direction, baseValues) {
    const { dollar: rate } = State.calculatedData;
    const { cargoCost, customsCost } = State.calculatedData[direction] || {};

    // Базовая цена за кг (без учёта наценок)
    const kgDollar = baseValues.kg.dollar || 0;
    const kgRuble = kgDollar * rate;

    // Сумма за всё (с учётом дополнительных наценок)
    const allDollar =
      (baseValues.all.dollar || 0) +
      (cargoCost?.dollar || 0) +
      (customsCost?.dollar || 0);
    const allRuble = allDollar * rate;

    return {
      kgDollar,
      kgRuble,
      allDollar,
      allRuble,
    };
  }

  /**
   * Записываем вычисленные значения в State.kit.calculated
   */
  updateState(direction, values) {
    // kg
    State.kit.calculated.kg[direction] = {
      dollar: Number(values.kgDollar.toFixed(2)),
      ruble: Number(values.kgRuble.toFixed(2)),
    };

    // all
    State.kit.calculated.all[direction] = {
      dollar: Number(values.allDollar.toFixed(2)),
      ruble: Number(values.allRuble.toFixed(2)),
    };
  }

  /**
   * Обновляем DOM элемент, проставляем нужные цены
   */
  updateUI(element, direction, values) {
    // Собираем ссылки на нужные дочерние элементы
    const elements = this.getUIElements(element);

    // Передаём direction, чтобы отличать auto/avia
    this.updateTextContent(elements, direction, values);

    // Показываем блок, раз данные есть
    element.classList.remove("_off");
  }

  /**
   * Получаем ссылки на нужные поля внутри контейнера
   */
  getUIElements(container) {
    return {
      kgDollar: container.querySelector(".calculate-result__kg"),
      kgRuble: container.querySelector(".calculate-result__kg_ruble"),
      allDollar: container.querySelector(".calculate-result__dollar"),
      allRuble: container.querySelector(".calculate-result__ruble"),

      // Тултипы
      tooltipDollar: container.querySelector("._kit_dollar"),
      tooltipRuble: container.querySelector("._kit_ruble"),
      allDollarTooltip: container.querySelector("._kit_all_dollar"),
      allRubleTooltip: container.querySelector("._kit_all_ruble"),

      // Итого
      everythingDollar: container.querySelector("._everything_price_dollar"),
      everythingRuble: container.querySelector("._everything_price_ruble"),
    };
  }

  /**
   * Расставляем значения по найденным элементам
   */
  updateTextContent(ui, direction, values) {
    // Форматируем числа
    const format = (val, symbol) =>
      val ? `${val.toFixed(2)}${symbol}` : `0${symbol}`;

    // Берём «базовые» значения (без надбавок) из State.kit[direction]
    const base = State.calculatedData[direction];
    const baseKit = State.kit[direction];

    // Если по каким-то причинам baseKit может быть null, подстрахуемся
    // (но обычно перед этим уже проверяется и блок скрывается)
    const kgDollarBase = baseKit?.kg?.dollar + base?.pricePerKg?.dollar || 0;
    const kgRubleBase = baseKit?.kg?.ruble + base?.pricePerKg?.ruble || 0;
    const allDollarBase = baseKit?.all?.dollar || 0;
    const allRubleBase = baseKit?.all?.ruble || 0;

    /**
     * 1) В этих четырёх элементах показываем ИМЕННО базовые данные из State.kit[direction]
     *    .calculate-result__kg       → baseKit.kg.dollar + base?.pricePerKg?.dollar
     *    .calculate-result__kg_ruble → baseKit.kg.ruble + base?.pricePerKg?.ruble
     *    ._kit_all_dollar            → baseKit.all.dollar
     *    ._kit_all_ruble             → baseKit.all.ruble
     */
    if (ui.kgDollar) {
      ui.kgDollar.textContent = format(kgDollarBase, "$");
    }
    if (ui.kgRuble) {
      ui.kgRuble.textContent = format(kgRubleBase, "₽");
    }
    if (ui.allDollarTooltip) {
      ui.allDollarTooltip.textContent = format(allDollarBase, "$");
    }
    if (ui.allRubleTooltip) {
      ui.allRubleTooltip.textContent = format(allRubleBase, "₽");
    }

    /**
     * 2) Во всех остальных блоках оставляем рассчитанные (с учётом наценок) данные,
     *    которые мы передали в аргумент "values"
     */
    if (ui.allDollar) {
      ui.allDollar.textContent = format(values.allDollar, "$");
    }
    if (ui.allRuble) {
      ui.allRuble.textContent = format(values.allRuble, "₽");
    }

    // Тултипы за кг
    if (ui.tooltipDollar) {
      ui.tooltipDollar.textContent = format(values.kgDollar, "$");
    }
    if (ui.tooltipRuble) {
      ui.tooltipRuble.textContent = format(values.kgRuble, "₽");
    }

    // "Всё вместе" (everything)
    if (ui.everythingDollar) {
      ui.everythingDollar.textContent = format(values.allDollar, "$");
    }
    if (ui.everythingRuble) {
      ui.everythingRuble.textContent = format(values.allRuble, "₽");
    }
  }

  /**
   * Устанавливаем/снимаем "признак загрузки" на всех блоках
   */
  setLoading(isLoading) {
    document.querySelectorAll(`.${this.baseClass}`).forEach((el) => {
      el.classList.toggle("_load", isLoading);
      el.querySelector(".loader")?.classList.toggle("_load", isLoading);
    });
  }

  /**
   * Возвращаем код города забора в зависимости от типа расчёта
   */
  getPickupCityCode() {
    const codeMap = {
      "calc-cargo": State.kit_from_msk,
      "calc-customs": State.kit_from_blv,
    };

    const code = codeMap[State.clientData.calcType];
    if (!code) throw new Error("Unknown calculation type");
    return code;
  }

  /**
   * Проверяем, заполнены ли все обязательные поля
   */
  validateRequiredFields() {
    const requiredFields = [
      !State.clientData.calcType && "Тип расчета",
      !State.address?.kit_to_code && "Код города доставки",
      !State.clientData.totalWeight && "Общий вес",
      !State.clientData.totalVolume && "Общий объем",
    ].filter(Boolean);

    if (requiredFields.length) {
      this.showNotification(`Не заполнены: ${requiredFields.join(", ")}`);
      return false;
    }
    return true;
  }

  /**
   * Обрабатываем ошибку
   */
  handleError(error) {
    console.error("KIT Error:", error);
    this.showNotification(error.message || "Ошибка расчета");
    this.hideAllElements();
    this.resetState();
  }

  resetState() {
    State.kit = {
      auto: null,
      avia: null,
      calculated: { kg: {}, all: {} },
    };
  }

  showNotification(message) {
    console.warn("Notification:", message);
  }
}

export default KitDeliveryCalculator;
