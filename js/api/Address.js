// Address.js
import { State } from "../data/State.js";

/**
 * Класс для обработки ввода адреса и взаимодействия с Яндекс.Картами.
 */
class AddressHandler {
  /**
   * Создает экземпляр обработчика адреса.
   * @param {string} inputSelector - CSS-селектор поля ввода адреса.
   */
  constructor(inputSelector) {
    this.input = document.querySelector(inputSelector);
    if (!this.input) {
      console.error(`Элемент ввода с селектором "${inputSelector}" не найден.`);
      return;
    }

    // Инициализируем подсказки Яндекс.Карт
    this.suggestView = new ymaps.SuggestView(this.input, { results: 5 });

    // Привязываем событие выбора подсказки
    this.suggestView.events.add("select", this.onSelect.bind(this));
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

            // Обновляем состояние
            State.address = {
              city,
              region,
              country,
              lat: coordinates[0],
              lon: coordinates[1],
            };

            console.log("Обновленное состояние (State):", State.address);
          } else {
            console.warn("Выбранный адрес не находится в России.");
            // Здесь можно добавить уведомление для пользователя
          }
        } else {
          console.warn("Геокодирование не дало результатов.");
          // Здесь можно добавить уведомление для пользователя
        }
      })
      .catch((error) => {
        console.error("Ошибка геокодирования:", error);
        // Здесь можно добавить уведомление для пользователя
      });
  }
}

export default AddressHandler;
