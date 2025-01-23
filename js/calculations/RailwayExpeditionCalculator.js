// RailwayExpeditionCalculator.js
import { State } from "../data/State.js";

/**
 * Класс для расчета стоимости железнодорожной экспедиции.
 */
class RailwayExpeditionCalculator {
  /**
   * Создает экземпляр калькулятора доставки.
   * @param {string} apiUrl - URL внешнего API для расчета доставки.
   */
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
  }

  /**
   * Определяет координаты отправления на основе типа расчета.
   * @param {string} calcType - Тип расчета.
   * @returns {Object} Объект с lat и lon.
   */
  getCoordinates(calcType) {
    const calcTypeMap = {
      "calc-cargo": { lat: 55.621761, lon: 37.786385 },
      "calc-customs": { lat: 50.29287, lon: 127.54059 },
      // Добавьте новые типы расчета здесь
    };

    const defaultCoordinates = { lat: 55.621761, lon: 37.786385 };
    return calcTypeMap[calcType] || defaultCoordinates;
  }

  /**
   * Выполняет расчет доставки.
   */
  async calculate() {
    // Проверяем, что координаты адреса заполнены
    if (!State.address || !State.address.lat || !State.address.lon) {
/*       console.warn("Координаты адреса не заполнены.");
      this.showNotification("Пожалуйста, укажите адрес доставки."); */
      return;
    }

    const { lat: lat_from, lon: lon_from } = this.getCoordinates(
      State.clientData.calcType
    );

    // Формируем данные для запроса на основе состояния
    const requestData = {
      dollar_rate: State.calculatedData.dollar,
      from: "Москва", // всегда этот город
      to: "Москва", // всегда этот город
      lat_from,
      lon_from,
      lat_to: State.address.lat,
      lon_to: State.address.lon,
      total_volume: State.clientData.totalVolume,
      total_weight: State.clientData.totalWeight,
      count: State.clientData.quantity,
    };

    // Валидация данных
    const missingFields = Object.entries(requestData)
      .filter(
        ([key, value]) => value === undefined || value === null || value === ""
      )
      .map(([key]) => key);

    if (missingFields.length > 0) {
      console.warn(
        `Отсутствуют обязательные поля: ${missingFields.join(", ")}`
      );
      this.showNotification(
        `Пожалуйста, заполните поля: ${missingFields.join(", ")}.`
      );
      return;
    }

    // Показываем состояние загрузки
    this.setLoading(true);

    try {
      // Формируем строку запроса
      const queryString = new URLSearchParams(requestData).toString();

      // Отправляем GET-запрос на внешний API
      const response = await fetch(`${this.apiUrl}?${queryString}`, {
        method: "GET",
      });

      // Проверяем статус ответа
      if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status}`);
      }

      // Парсим JSON-ответ
      const result = await response.json();

      // Выводим полный результат запроса в консоль
      /* console.log("Полный результат API:", result); */

      // Проверка структуры ответа
      if (
        !result.cost_price?.auto_regular ||
        !result.sum_cost_price?.auto_regular
      ) {
        throw new Error("Неверный формат ответа от API.");
      }

      // Проверка, что полученные значения являются числами
      const costPrice = result.cost_price.auto_regular;
      const sumCostPrice = result.sum_cost_price.auto_regular;

      if (isNaN(Number(costPrice)) || isNaN(Number(sumCostPrice))) {
        throw new Error("Получены недопустимые значения от API.");
      }

      // Обновляем состояние с результатами
      const { dollar: dollarRate } = State.calculatedData;

      // Явное преобразование в числа
      const costPriceNum = Number(costPrice);
      const sumCostPriceNum = Number(sumCostPrice);

      // Проверка на валидность чисел
      State.jde.kg = {
        dollar: !isNaN(costPriceNum) ? Number(costPriceNum.toFixed(2)) : "",
        ruble: !isNaN(costPriceNum)
          ? Number((costPriceNum * dollarRate).toFixed(2))
          : "",
      };

      State.jde.all = {
        dollar: !isNaN(sumCostPriceNum)
          ? Number(sumCostPriceNum.toFixed(2))
          : "",
        ruble: !isNaN(sumCostPriceNum)
          ? Number((sumCostPriceNum * dollarRate).toFixed(2))
          : "",
      };

      // Обновляем дополнительные результаты по направлениям
      this.updateDirectionResults();

      /* console.log("Расчет выполнен успешно.", State.jde); */
    } catch (error) {
      console.error("Ошибка при расчете доставки:", error.message);
      this.showNotification(
        "Произошла ошибка при расчете доставки. Пожалуйста, попробуйте позже."
      );

      // Добавляем класс _off к элементам .jde при ошибке
      this.addOffClassToJdeElements();
    } finally {
      // Убираем состояние загрузки
      this.setLoading(false);
    }
  }

  /**
   * Обновляет результаты по направлениям (.result_auto, .result_train, .result_avia).
   */
  updateDirectionResults() {
    // Определяем направления и соответствующие классы
    const directions = [
      { name: "auto", className: "result_auto" },
      { name: "train", className: "result_train" },
      { name: "avia", className: "result_avia" },
    ];

    directions.forEach((direction) => {
      // Находим блок направления
      const directionBlock = document.querySelector(`.${direction.className}`);
      if (!directionBlock) {
        console.warn(`Блок с классом "${direction.className}" не найден.`);
        return;
      }

      // Находим вложенный блок .jde
      const jdeElement = directionBlock.querySelector(".jde");
      if (!jdeElement) {
        console.warn(
          `Внутри блока "${direction.className}" не найден элемент с классом ".jde".`
        );
        return;
      }

      // Находим элементы для отображения результатов
      const kgDollarElement = jdeElement.querySelector(".calculate-result__kg");
      const kgRubleElement = jdeElement.querySelector(
        ".calculate-result__kg_ruble"
      );
      const allDollarElement = jdeElement.querySelector(
        ".calculate-result__dollar"
      );
      const allRubleElement = jdeElement.querySelector(
        ".calculate-result__ruble"
      );
      /* Tooltip */
      const jdeDollar = jdeElement.querySelector("._jde_dollar");
      const jdeRuble = jdeElement.querySelector("._jde_ruble");
      const jdeAllDollar = jdeElement.querySelector("._jde_all_dollar");
      const jdeAllRuble = jdeElement.querySelector("._jde_all_ruble");
      const everythingDollar = jdeElement.querySelector(
        "._everything_price_dollar"
      );
      const everythingRuble = jdeElement.querySelector(
        "._everything_price_ruble"
      );

      if (
        !kgDollarElement ||
        !kgRubleElement ||
        !allDollarElement ||
        !allRubleElement
      ) {
        console.warn(
          `Внутри блока ".jde" не найдены элементы ".calculate-result__kg", ".calculate-result__kg_ruble", ".calculate-result__dollar", ".calculate-result__ruble"`
        );
        return;
      }

      // Получаем цену за кг для направления
      const pricePerKgDollar =
        State.calculatedData[direction.name]?.pricePerKg?.dollar;

      // Получаем цену за все для направления
      const allCargoDollar =
        State.calculatedData[direction.name]?.cargoCost?.dollar;
      const allCustomsDollar =
        State.calculatedData[direction.name]?.customsCost?.dollar;

      // Расчет значения в долларах
      const calculatedKgDollar =
        (State.jde.kg.dollar || 0) + (pricePerKgDollar || 0);
      const calculatedAllDollar =
        (State.jde.all.dollar || 0) +
        (allCargoDollar || 0) +
        (allCustomsDollar || 0);

      // Расчет значения в рублях
      const calculatedKgRuble =
        (calculatedKgDollar || 0) * (State.calculatedData.dollar || 0);
      const calculatedAllRuble =
        (calculatedAllDollar || 0) * (State.calculatedData.dollar || 0);

      // Сохраняем результаты в State
      if (!State.jde.calculated) {
        State.jde.calculated = {};
      }

      if (!State.jde.calculated.kg) {
        State.jde.calculated.kg = {};
      }

      if (!State.jde.calculated.all) {
        State.jde.calculated.all = {};
      }

      State.jde.calculated.kg[direction.name] = {
        dollar: Number(calculatedKgDollar.toFixed(2)),
        ruble: Number(calculatedKgRuble.toFixed(2)),
      };

      State.jde.calculated.all[direction.name] = {
        dollar: Number(calculatedAllDollar.toFixed(2)),
        ruble: Number(calculatedAllRuble.toFixed(2)),
      };

      // Обновляем DOM элементы
      kgDollarElement.textContent = State.jde.calculated.kg[direction.name]
        .dollar
        ? `${State.jde.calculated.kg[direction.name].dollar}$`
        : "0$";
      kgRubleElement.textContent = State.jde.calculated.kg[direction.name].ruble
        ? `${State.jde.calculated.kg[direction.name].ruble}₽`
        : "0₽";

      allDollarElement.textContent = State.jde.calculated.all[direction.name]
        .dollar
        ? `${State.jde.calculated.all[direction.name].dollar}$`
        : "0$";
      allRubleElement.textContent = State.jde.calculated.all[direction.name]
        .ruble
        ? `${State.jde.calculated.all[direction.name].ruble}₽`
        : "0₽";

      /* Tooltip */
      jdeDollar.textContent = State.jde.kg.dollar
        ? `${State.jde.kg.dollar}$`
        : "0$";
      jdeRuble.textContent = State.jde.kg.ruble
        ? `${State.jde.kg.ruble}₽`
        : "0₽";
      jdeAllDollar.textContent = State.jde.all.dollar
        ? `${State.jde.all.dollar}$`
        : "0$";
      jdeAllRuble.textContent = State.jde.all.ruble
        ? `${State.jde.all.ruble}₽`
        : "0₽";
      everythingDollar.textContent = State.jde.calculated.all[direction.name]
        .dollar
        ? `${State.jde.calculated.all[direction.name].dollar}$`
        : "0$";
      everythingRuble.textContent = State.jde.calculated.all[direction.name]
        .ruble
        ? `${State.jde.calculated.all[direction.name].ruble}₽`
        : "0₽";

      // **Добавляем класс _off для result_train и result_avia**
      if (direction.name === "train" || direction.name === "avia") {
        jdeElement.classList.add("_off");
      } else {
        jdeElement.classList.remove("_off");
      }
    });
  }

  /**
   * Устанавливает состояние загрузки для элементов .jde и .loader.
   * @param {boolean} isLoading - Состояние загрузки.
   */
  setLoading(isLoading) {
    const jdeElements = document.querySelectorAll(".jde");
    jdeElements.forEach((el) => {
      if (isLoading) {
        el.classList.add("_load");
        el.classList.remove("_off"); // Убираем _off при загрузке
      } else {
        el.classList.remove("_load");
      }

      const loader = el.querySelector(".loader");
      if (loader) {
        if (isLoading) {
          loader.classList.add("_load");
        } else {
          loader.classList.remove("_load");
        }
      }
    });
  }

  /**
   * Добавляет класс _off к элементам .jde.
   */
  addOffClassToJdeElements() {
    const jdeElements = document.querySelectorAll(".jde");
    jdeElements.forEach((el) => {
      el.classList.add("_off");
    });
  }

  /**
   * Показывает уведомление пользователю.
   * @param {string} message - Сообщение для отображения.
   */
  showNotification(message) {
    // Реализуйте отображение уведомления (например, с помощью библиотеки Toastr)
    console.log(message); // Пример простого уведомления
  }
}

export default RailwayExpeditionCalculator;
