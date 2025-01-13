// main.js
import { State } from "./data/State.js";
import { CalculatorApp } from "./calculations/App.js";
import { offerManager } from "./calculations/PdfClass.js";
import { UIManager } from "./calculations/PdfUI.js";

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

document.addEventListener("DOMContentLoaded", () => {
  const calculatorApp = new CalculatorApp(fields);
  calculatorApp.init();

  /* PDF Генерация */
  const uiManager = new UIManager(offerManager, State);
  uiManager.init();
});
