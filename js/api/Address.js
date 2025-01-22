// Address.js
import { State } from "../data/State.js";

/**
 * Класс для управления подсказками адресов с использованием Яндекс.Карт.
 */
class Address {
  /**
   * Создает экземпляр Address.
   * @param {string} inputSelector - CSS-селектор поля ввода адреса.
   */
  constructor(inputSelector) {
    this.input = document.querySelector(inputSelector);
    this.suggestView = null;

    if (!this.input) {
      console.error(`Элемент ввода с селектором "${inputSelector}" не найден.`);
      return;
    }

    // Добавляем обработчик очистки ошибок при вводе
    this.input.addEventListener("input", this.onInput.bind(this));
  }

  /**
   * Helper method to update state and dispatch event
   * @param {string} prop - Property name in State
   * @param {*} value - New value for the property
   */
  updateState(prop, value) {
    State[prop] = value;
    const event = new CustomEvent("stateChange", {
      detail: { prop, value },
    });
    document.dispatchEvent(event);
  }

  /**
   * Обработчик события выбора адреса из подсказок.
   * @param {Object} event - Объект события.
   */
  onSelect(event) {
    const selectedAddress = event.get("item").value;
    console.log("Выбранный адрес:", selectedAddress);

    // Выполняем геокодирование выбранного адреса
    ymaps
      .geocode(selectedAddress, { results: 1 })
      .then((response) => {
        const geoObject = response.geoObjects.get(0);

        if (geoObject) {
          const country = geoObject.getCountry();
          if (country === "Россия") {
            const city =
              geoObject.getLocalities().length > 0
                ? geoObject.getLocalities()[0]
                : "Неизвестный город";
            const region =
              geoObject.getAdministrativeAreas().length > 0
                ? geoObject.getAdministrativeAreas()[0]
                : "Неизвестный регион";
            const coordinates = geoObject.geometry.getCoordinates(); // [широта, долгота]

            // Обновляем состояние через helper
            this.updateState("address", {
              city,
              region,
              country,
              lat: coordinates[0],
              lon: coordinates[1],
            });

            // Убираем ошибку, если она была
            this.updateState("addressError", null);

            console.log("Обновленное состояние адреса:", State.address);
          } else {
            console.warn("Выбранный адрес не находится в России.");
            // Очистка поля ввода и состояния через helper
            this.input.value = "";
            this.updateState("address", null);
            this.updateState(
              "addressError",
              "Пожалуйста, выберите адрес, находящийся в России."
            );
          }
        } else {
          console.warn("Геокодирование не дало результатов.");
          // Добавляем в State информацию об ошибке через helper
          this.updateState("addressError", "Не удалось найти указанный адрес.");
        }
      })
      .catch((error) => {
        console.error("Ошибка геокодирования:", error);
        // Добавляем в State информацию об ошибке через helper
        this.updateState(
          "addressError",
          "Произошла ошибка при геокодировании адреса."
        );
      });
  }

  /**
   * Обработчик события ввода в поле адреса.
   */
  onInput() {
    // Очищаем адрес и ошибки через helper
    this.updateState("address", null);
    this.updateState("addressError", null);
    // Вызываем hideCalculationResult, если он определен
    if (typeof State.hideCalculationResult === "function") {
      State.hideCalculationResult();
    }
  }

  /**
   * Инициализирует SuggestView для поля ввода адреса с ограничением на Россию.
   */
  initSuggestView() {
    ymaps.ready(() => {
      // Проверяем, доступен ли SuggestView
      if (typeof ymaps.SuggestView !== "function") {
        console.error(
          "ymaps.SuggestView не доступен. Проверьте подключение API Яндекс.Карт."
        );
        return;
      }

      try {
        // Определяем границы России (примерные координаты)
        const russiaBounds = [
          [41.185, 19.638], // Нижняя левая точка
          [81.25, 169.154], // Верхняя правая точка
        ];

        // Инициализируем подсказки Яндекс.Карт с ограничением по границам
        this.suggestView = new ymaps.SuggestView(this.input, {
          results: 5,
          boundedBy: russiaBounds,
          strictBounds: true,
        });

        // Привязываем событие выбора подсказки
        this.suggestView.events.add("select", this.onSelect.bind(this));
      } catch (error) {
        console.error("Ошибка при инициализации SuggestView:", error);
      }
    });
  }

  /**
   * Уничтожает SuggestView, если он инициализирован.
   */
  destroySuggestView() {
    if (this.suggestView) {
      this.suggestView.events.remove("select", this.onSelect.bind(this));
      this.suggestView.destroy();
      this.suggestView = null;
    }
  }
}

export default Address;
