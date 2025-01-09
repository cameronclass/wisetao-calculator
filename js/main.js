// main.js
import { Calculator } from "./calculations/Calculator.js";
import { FormValidation } from "./calculations/FormValidation.js";
import { State } from "./data/State.js";

const fields = {
  totalCost: document.querySelector('input[name="total_cost"]'),
  currency: document.querySelector('input[name="total_currency"]'),
  totalWeight: document.querySelector('input[name="total_weight"]'),
  totalVolume: document.querySelector('input[name="total_volume"]'),
  totalVolumeCalculated: document.querySelector(
    'input[name="total_volume_calculated"]'
  ),
  volumeLength: document.querySelector('input[name="volume_length"]'),
  volumeWidth: document.querySelector('input[name="volume_width"]'),
  volumeHeight: document.querySelector('input[name="volume_height"]'),
  weightVolumeChange: document.querySelector(
    'input[name="weight_volume_change"]'
  ),
  quantity: document.querySelector('input[name="quantity"]'),
  category: document.querySelectorAll('input[name="category"]'),
  packingType: document.querySelectorAll('input[name="packing-type"]'),
  insurance: document.querySelector('input[name="insurance"]'),
  brand: document.querySelector('input[name="brand"]'),
  tnvedInput: document.querySelector('input[name="tnved_input"]'),
};

const formValidation = new FormValidation(fields);

// при клике на кнопку «Рассчитать»
document
  .querySelector(".js-calculate-result")
  .addEventListener("click", (e) => {
    e.preventDefault();

    const valid = formValidation.validateAll();
    if (valid) {
      console.log("State.clientData:", State.clientData);

      const calculator = new Calculator();
      calculator.runBaseLogic();
      calculator.runShippingLogic();

      console.log("State.calculatedData:", State.calculatedData);

      const resultBlock = document.querySelector(".main-calc-result");

      if (resultBlock) {
        resultBlock.classList.add("active");
        resultBlock.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      console.log("Форма заполнена с ошибками");

      const wrapperBlock = document.querySelector(".main-calc__wrapper");
      if (wrapperBlock) {
        wrapperBlock.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  });
