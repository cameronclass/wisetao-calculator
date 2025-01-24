import { State } from "../data/State.js";

class Address {
  constructor(inputSelector) {
    this.input = document.querySelector(inputSelector);
    this.suggestView = null;
    this.WISETAO_API_URL =
      "https://api-calc.wisetao.com:4343/api/search-city-kit";
    this.KLADR_PRIORITY = [
      "area_kladr",
      "city_kladr",
      "settlement_kladr",
      "kladr",
      "house_kladr",
    ];

    if (!this.input) {
      console.error(`Элемент ввода с селектором "${inputSelector}" не найден.`);
      return;
    }

    this.input.addEventListener("input", this.onInput.bind(this));
  }

  updateState(prop, value) {
    State[prop] = value;
    const event = new CustomEvent("stateChange", { detail: { prop, value } });
    document.dispatchEvent(event);
  }

  async onSelect(event) {
    console.log("Этап: Выбор адреса из Яндекс.Подсказок");
    const selectedAddress = event.get("item").value;

    try {
      const response = await ymaps.geocode(selectedAddress, { results: 1 });
      const geoObject = response.geoObjects.get(0);

      if (!geoObject) {
        this.clearAddressWithError("Не удалось найти указанный адрес.");
        return;
      }

      const country = geoObject.getCountry();
      if (country !== "Россия") {
        this.clearAddressWithError(
          "Пожалуйста, выберите адрес, находящийся в России."
        );
        return;
      }

      const city = geoObject.getLocalities()[0] || "Неизвестный город";
      const region =
        geoObject.getAdministrativeAreas()[0] || "Неизвестный регион";
      const coordinates = geoObject.geometry.getCoordinates();

      // Сохраняем базовые данные
      const addressData = {
        city,
        region,
        country,
        lat: coordinates[0],
        lon: coordinates[1],
      };

      this.updateState("address", addressData);
      console.log("Этап: Данные из Яндекс сохранены в State:", State.address);

      // Запускаем запрос к DaData
      console.log("Этап: Запуск запроса к DaData...");
      await this.fetchAdditionalData(coordinates[0], coordinates[1]);

      // Запускаем поиск кодов Kit
      console.log("Этап: Начинаем поиск kit_to_code");
      await this.findKitCode();

      console.log("Финальный State.address:", State.address);
    } catch (error) {
      console.error("Ошибка геокодирования:", error);
      this.clearAddressWithError("Произошла ошибка при геокодировании адреса.");
    }
  }

  async fetchAdditionalData(lat, lon) {
    const url =
      "https://suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/address";
    const token = "9faf0df4e5f608e5e0f42f750b27009d5b4847ae";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ lat, lon }),
      });

      const result = await response.json();

      if (result.suggestions?.length > 0) {
        const data = result.suggestions[0].data;
        console.log("Этап: Получены данные от DaData:", data);

        // Формируем KLADR-данные без "id" в названиях полей
        const kladrFields = {
          area_kladr: data.area_kladr_id?.slice(0, 13) || null,
          city_kladr: data.city_kladr_id?.slice(0, 13) || null,
          settlement_kladr: data.settlement_kladr_id?.slice(0, 13) || null,
          kladr: data.kladr_id?.slice(0, 13) || null,
          house_kladr: data.house_kladr_id?.slice(0, 13) || null,
        };

        // Обновляем State.address
        this.updateState("address", {
          ...State.address,
          ...kladrFields,
        });

        console.log(
          "Этап: Обновленный State.address после DaData:",
          State.address
        );
      } else {
        console.warn("Этап: Нет данных от DaData");
        this.updateState(
          "addressError",
          "Дополнительные данные не найдены в DaData."
        );
      }
    } catch (error) {
      console.error("Ошибка запроса к DaData:", error);
      this.updateState(
        "addressError",
        "Произошла ошибка при запросе к DaData API."
      );
    }
  }

  async findKitCode() {
    const address = State.address;
    let foundCode = null;

    for (const kladrField of this.KLADR_PRIORITY) {
      const kladrCode = address[kladrField];

      if (!kladrCode) {
        console.log(`Этап: Пропускаем ${kladrField} - значение отсутствует`);
        continue;
      }

      console.log(`Этап: Проверяем ${kladrField} (${kladrCode})`);

      try {
        const code = await this.fetchKitCode(kladrCode);
        if (code) {
          foundCode = code;
          console.log(`Этап: Найден код ${code} в ${kladrField}`);
          break;
        }
      } catch (error) {
        console.error(`Ошибка при проверке ${kladrField}:`, error);
      }
    }

    // Обновляем State
    this.updateState("address", {
      ...address,
      kit_to_code: foundCode,
    });
  }

  async fetchKitCode(kladr) {
    try {
      console.log(`Отправка запроса для kladr: ${kladr}`);

      const response = await fetch(this.WISETAO_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ kladr }),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      console.log("Ответ от API Wisetao:", data);

      if (data.code) {
        return data.code;
      }
      return null;
    } catch (error) {
      console.error("Ошибка запроса к Wisetao API:", error);
      return null;
    }
  }

  clearAddressWithError(errorMessage) {
    this.input.value = "";
    this.updateState("address", null);
    this.updateState("addressError", errorMessage);
  }

  onInput() {
    this.updateState("address", null);
    this.updateState("addressError", null);
    if (typeof State.hideCalculationResult === "function") {
      State.hideCalculationResult();
    }
  }

  initSuggestView() {
    ymaps.ready(() => {
      if (typeof ymaps.SuggestView !== "function") {
        console.error(
          "ymaps.SuggestView не доступен. Проверьте подключение API Яндекс.Карт."
        );
        return;
      }

      try {
        this.suggestView = new ymaps.SuggestView(this.input, {
          results: 5,
          boundedBy: [
            [41.185, 19.638],
            [81.25, 169.154],
          ],
          strictBounds: true,
        });

        this.suggestView.events.add("select", (e) => this.onSelect(e));
      } catch (error) {
        console.error("Ошибка при инициализации SuggestView:", error);
      }
    });
  }

  destroySuggestView() {
    if (this.suggestView) {
      this.suggestView.events.remove("select", this.onSelect.bind(this));
      this.suggestView.destroy();
      this.suggestView = null;
    }
  }
}

export default Address;
