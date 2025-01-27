import { CONFIG } from "../data/config.js";
import { State } from "../data/State.js";

class Address {
  static KLADR_PRIORITY = [
    "area_kladr",
    "city_kladr",
    "settlement_kladr",
    "kladr",
    "house_kladr",
  ];

  constructor(inputSelector) {
    this.inputElement = document.querySelector(inputSelector);
    this.calculateButton = document.querySelector(".js-calculate-result"); // Новая ссылка на кнопку
    this.suggestView = null;
    this.WISETAO_API_URL =
      "https://api-calc.wisetao.com:4343/api/search-city-kit";
    this.loadingTimeout = null; // Таймер для отслеживания задержки

    this.init();
  }

  init() {
    if (!this.validateInput()) return;
    this.setupEventListeners();
    this.initYmapsSuggest();
  }

  validateInput() {
    if (!this.inputElement) {
      console.error(`Input element with selector "${inputSelector}" not found`);
      return false;
    }
    return true;
  }

  setupEventListeners() {
    this.inputElement.addEventListener("input", () => this.handleInput());
  }

  handleInput() {
    this.updateState("address", null);
    this.updateState("addressError", null);
    State.hideCalculationResult?.();
  }

  initYmapsSuggest() {
    ymaps.ready(() => {
      try {
        this.suggestView = new ymaps.SuggestView(this.inputElement, {
          results: 5,
          boundedBy: CONFIG.mapBounds,
          strictBounds: true,
        });
        this.suggestView.events.add("select", (e) =>
          this.handleAddressSelect(e)
        );
      } catch (error) {
        console.error("Ymaps SuggestView initialization failed:", error);
      }
    });
  }

  async handleAddressSelect(event) {
    try {
      // Блокируем кнопку и показываем статус загрузки
      if (this.calculateButton) {
        this.calculateButton.disabled = true;
        this.calculateButton.textContent = "Идет поиск складов...";
        this.loadingTimeout = setTimeout(() => {
          if (this.calculateButton) {
            this.calculateButton.disabled = false;
            this.calculateButton.textContent = "РАСЧИТАТЬ ОНЛАЙН";
          }
        }, 9000);
      }

      // Существующий код обработки адреса
      const address = event.get("item").value;
      const geoObject = await this.geocodeAddress(address);
      this.validateRussianAddress(geoObject);

      const baseData = this.parseGeoObject(geoObject);
      this.updateAddressState(baseData);

      await this.processDaData(baseData.coordinates);
      await this.findKitCode();
    } catch (error) {
      this.handleAddressError(error.message);
    } finally {
      // Восстанавливаем кнопку в любом случае
      if (this.calculateButton) {
        clearTimeout(this.loadingTimeout);
        this.calculateButton.disabled = false;
        this.calculateButton.textContent = "РАСЧИТАТЬ ОНЛАЙН";
      }
    }
  }

  async geocodeAddress(address) {
    const response = await ymaps.geocode(address, { results: 1 });
    const geoObject = response.geoObjects.get(0);
    if (!geoObject) throw new Error("Адрес не найден");
    return geoObject;
  }

  validateRussianAddress(geoObject) {
    if (geoObject.getCountry() !== "Россия") {
      throw new Error("Пожалуйста, выберите адрес в России");
    }
  }

  parseGeoObject(geoObject) {
    const coordinates = geoObject.geometry.getCoordinates();
    return {
      city: geoObject.getLocalities()[0] || "Неизвестный город",
      region: geoObject.getAdministrativeAreas()[0] || "Неизвестный регион",
      country: geoObject.getCountry(),
      lat: coordinates[0],
      lon: coordinates[1],
      coordinates,
    };
  }

  async processDaData(coordinates) {
    try {
      const response = await fetch(CONFIG.daDataUrl, {
        method: "POST",
        headers: this.getDaDataHeaders(),
        body: JSON.stringify({ lat: coordinates[0], lon: coordinates[1] }),
      });

      const data = await response.json();
      if (data.suggestions?.length) {
        this.updateAddressState(this.parseKladrData(data.suggestions[0].data));
      }
    } catch (error) {
      console.error("DaData API error:", error);
    }
  }

  getDaDataHeaders() {
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Token ${CONFIG.daDataToken}`,
    };
  }

  parseKladrData(data) {
    return {
      area_kladr: data.area_kladr_id?.slice(0, 13) || null,
      city_kladr: data.city_kladr_id?.slice(0, 13) || null,
      settlement_kladr: data.settlement_kladr_id?.slice(0, 13) || null,
      kladr: data.kladr_id?.slice(0, 13) || null,
      house_kladr: data.house_kladr_id?.slice(0, 13) || null,
    };
  }

  async findKitCode() {
    let foundCode = null;

    for (const field of Address.KLADR_PRIORITY) {
      const kladrCode = State.address[field];
      if (!kladrCode) continue;

      foundCode = await this.fetchKitCode(kladrCode);
      if (foundCode) break;
    }

    this.updateAddressState({ kit_to_code: foundCode });
  }

  async fetchKitCode(kladr) {
    try {
      const response = await fetch(this.WISETAO_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kladr }),
      });

      const data = await response.json();
      return data.code || null;
    } catch (error) {
      console.error("Wisetao API error:", error);
      return null;
    }
  }

  updateAddressState(data) {
    this.updateState("address", {
      ...State.address,
      ...data,
    });
  }

  handleAddressError(message) {
    this.inputElement.value = "";
    this.updateState("address", null);
    this.updateState("addressError", message);
  }

  updateState(prop, value) {
    State[prop] = value;
    document.dispatchEvent(
      new CustomEvent("stateChange", { detail: { prop, value } })
    );
  }
}

export default Address;
