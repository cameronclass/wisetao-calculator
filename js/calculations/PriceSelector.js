import { State } from "../data/State.js";

class PriceSelector {
  constructor(radioSelector, buttonSelector, state) {
    this.radioButtons = document.querySelectorAll(radioSelector);
    this.pdfButton = document.querySelector(buttonSelector);
    this.state = state;

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
    this.updateButtonState();
    this.state.calculatedData.selectedDirection = radio.value; // Обновление значения в состоянии

    // Обновление значения на русском языке
    const directionRusMap = {
      auto: "Авто",
      train: "ЖД",
      avia: "Авиа",
    };

    this.state.calculatedData.selectedDirectionRus =
      directionRusMap[radio.value] || "Неизвестное направление";
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

const priceSelector = new PriceSelector(
  'input[name="all-price"]',
  ".js-get-pdf",
  State
);

priceSelector.init();
