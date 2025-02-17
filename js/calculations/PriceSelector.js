import { State } from "../data/State.js";

export class PriceSelector {
  constructor(radioSelector, buttonSelector, state) {
    this.radioButtons = document.querySelectorAll(radioSelector);
    this.pdfButton = document.querySelector(buttonSelector);
    this.state = state;

    // Маппинг для русских названий направлений
    this.directionRusMap = {
      auto: "Авто (15-20 дней)",
      train: "ЖД (35-50 дней)",
      avia: "Авиа (5-15 дней)",
    };

    // Маппинг для русских названий грузовых направлений
    this.cargoRusMap = {
      jde: "ЖэлДорЭспедиция",
      kit: "KIT",
      // Добавьте другие направления при необходимости
    };

    this.init();
  }

  init() {
    this.updateButtonState(); // Инициализация состояния кнопки
    this.addEventListeners(); // Добавление обработчиков событий
    this.addDocumentClickListener(); // Добавление обработчика клика по документу
  }

  addEventListeners() {
    this.radioButtons.forEach((radio) => {
      radio.addEventListener("change", () => this.handleRadioChange(radio));
    });
  }

  addDocumentClickListener() {
    document.addEventListener("click", (event) => {
      const isClickInside =
        Array.from(this.radioButtons).some((radio) =>
          radio.contains(event.target)
        ) || this.pdfButton.contains(event.target);
      if (!isClickInside) {
        this.clearSelection(); // Сброс выбора и отключение кнопки
      }
    });
  }

  handleRadioChange(radio) {
    const value = radio.value;
    let transportPart = value;
    let cargoPart = null;

    // Разбиваем значение на части по дефису
    if (value.includes("-")) {
      const parts = value.split("-");
      if (parts.length === 2) {
        [cargoPart, transportPart] = parts;
      }
    }

    // Обновление данных о транспорте
    this.state.calculatedData.selectedDirection = transportPart;
    this.state.calculatedData.selectedDirectionRus =
      this.directionRusMap[transportPart];

    // Обновление данных о грузовом направлении
    if (cargoPart && this.cargoRusMap[cargoPart]) {
      this.state.calculatedData.russiaSelectedCargo = cargoPart;
      this.state.calculatedData.russiaSelectedCargoRus =
        this.cargoRusMap[cargoPart];
    } else {
      this.state.calculatedData.russiaSelectedCargo = null;
      this.state.calculatedData.russiaSelectedCargoRus = null;
    }

    this.updateButtonState();
  }

  updateButtonState() {
    const isChecked = Array.from(this.radioButtons).some(
      (radio) => radio.checked
    );
    this.pdfButton.disabled = !isChecked; // Активируем кнопку, если выбрано одно из радио
  }

  clearSelection() {
    this.radioButtons.forEach((radio) => {
      radio.checked = false; // Снимаем выбор с радио-кнопок
    });
    this.updateButtonState(); // Обновляем состояние кнопки
  }
}

export default PriceSelector;
