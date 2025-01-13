// CalculatorApp.js
import { Calculator } from "./Calculator.js";
import { FormValidation } from "./FormValidation.js";
import { State } from "../data/State.js";
import { UiRenderer } from "../ui/UiRenderer.js";

export class CalculatorApp {
  constructor(fields) {
    this.fields = fields;
    this.formValidation = new FormValidation(fields);
    this.calculator = new Calculator();
    this.uiRenderer = new UiRenderer();
    this.init();
  }

  init() {
    document
      .querySelector(".js-calculate-result")
      .addEventListener("click", (e) => this.handleCalculate(e));
  }

  handleCalculate(e) {
    e.preventDefault();

    const valid = this.formValidation.validateAll();
    if (valid) {
      this.calculator.runBaseLogic();
      this.calculator.runShippingLogic();

      console.log("State:", State);

      this.uiRenderer.renderAll();

      this.showResult();
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
