// CalculatorApp.js
import { Calculator } from "./Calculator.js";
import { FormValidation } from "./FormValidation.js";
import { UiRenderer } from "../ui/UiRenderer.js";
import RailwayExpeditionCalculator from "./RailwayExpeditionCalculator.js";
import { CONFIG } from "../data/config.js";

export class CalculatorApp {
  constructor(fields) {
    this.fields = fields;
    this.formValidation = new FormValidation(fields);
    this.calculator = new Calculator();
    this.uiRenderer = new UiRenderer();
    this.railwayCalculator = new RailwayExpeditionCalculator(CONFIG.railwayUrl);
    this.init();
  }

  init() {
    const calculateButton = document.querySelector(".js-calculate-result");
    if (calculateButton) {
      calculateButton.addEventListener("click", (e) => this.handleCalculate(e));
    } else {
      console.error(
        'Кнопка "Рассчитать" с селектором ".js-calculate-result" не найдена.'
      );
    }
  }

  async handleCalculate(e) {
    e.preventDefault();

    const isValid = this.formValidation.validateAll();
    if (isValid) {
      this.calculator.runBaseLogic();
      this.calculator.runShippingLogic();

      this.showResult();
      this.uiRenderer.renderAll();

      await this.railwayCalculator.calculate();
    } else {
      console.log("Форма заполнена с ошибками");
      this.scrollToWrapper();
    }
  }

  showResult() {
    const resultBlock = document.querySelector(".main-calc-result");
    if (resultBlock) {
      resultBlock.classList.add("active");
      resultBlock.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  scrollToWrapper() {
    const wrapperBlock = document.querySelector(".main-calc__wrapper");
    if (wrapperBlock) {
      wrapperBlock.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
}

export default CalculatorApp;
