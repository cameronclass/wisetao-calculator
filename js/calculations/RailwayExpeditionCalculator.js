// RailwayExpeditionCalculator.js
import { State } from "../data/State.js";

/**
 * Класс для расчета стоимости железнодорожной экспедиции.
 */
class RailwayExpeditionCalculator {
  /**
   * Создает экземпляр калькулятора доставки.
   * @param {string} buttonSelector - CSS-селектор кнопки для расчета.
   * @param {string} apiUrl - URL внешнего API для расчета доставки.
   */
  constructor(buttonSelector, apiUrl) {
    this.button = document.querySelector(buttonSelector);
    this.apiUrl = apiUrl;

    if (!this.button) {
      console.error(`Кнопка с селектором "${buttonSelector}" не найдена.`);
      return;
    }

    // Привязываем обработчик события клика
    this.button.addEventListener("click", this.onCalculate.bind(this));
  }

  /**
   * Обработчик события клика на кнопку расчета.
   */
  async onCalculate() {
    // Проверяем, что координаты адреса заполнены
    if (!State.address.lat || !State.address.lon) {
      console.warn("Координаты адреса не заполнены.");
      // Здесь можно добавить уведомление для пользователя
      return;
    }

    // Определяем lat_from и lon_from на основе calcType
    let lat_from, lon_from;

    if (State.clientData.calcType === "calc-cargo") {
      lat_from = 55.621761;
      lon_from = 37.786385;
    } else if (State.clientData.calcType === "calc-customs") {
      lat_from = 50.29287;
      lon_from = 127.54059;
    } else {
      console.warn(
        "Неизвестный тип расчета (calcType). Используются значения по умолчанию."
      );
      // Можно задать значения по умолчанию или прервать выполнение
      lat_from = 55.621761;
      lon_from = 37.786385;
    }

    // Формируем данные для запроса на основе состояния
    const requestData = {
      dollar_rate: State.calculatedData.dollar,
      from: "Москва", // всегда этот город
      to: "Москва", // всегда этот город
      lat_from: lat_from, // значение в зависимости от calcType
      lon_from: lon_from, // значение в зависимости от calcType
      lat_to: State.address.lat, // координаты выбранного адреса
      lon_to: State.address.lon, // координаты выбранного адреса
      total_volume: State.clientData.totalVolume,
      total_weight: State.clientData.totalWeight,
      count: State.clientData.quantity,
    };

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

      // Обновляем состояние с результатами
      State.jde = {
        cost_price: result.cost_price.auto_regular || "",
        sum_cost_price: result.sum_cost_price.auto_regular || "",
      };

      console.log("Обновленное состояние после расчета (State):", State.jde);
    } catch (error) {
      console.error("Ошибка при расчете доставки:", error.message);
      // Здесь можно добавить уведомление для пользователя
    }
  }
}

export default RailwayExpeditionCalculator;
