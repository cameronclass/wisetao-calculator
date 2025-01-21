// main.js
import { State } from "./data/State.js";
import { CalculatorApp } from "./calculations/App.js";
import { PdfPrepared } from "./calculations/PdfPrepare.js";
import { PdfGenerate } from "./calculations/PdfGenerate.js";
import { AddressHandler } from "./api/Address.js";
import { RailwayExpeditionCalculator } from "./calculations/RailwayExpeditionCalculator.js";

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
  adress: document.querySelector('input[name="address"]'),
};

document.addEventListener("DOMContentLoaded", () => {
  /* Калькулятор */
  new CalculatorApp(fields);

  /* PDF */
  new PdfGenerate(PdfPrepared, State);

  /* Address */
  new AddressHandler('input[name="address"]');

  /* Railway */
  const apiUrl =
    "https://api-calc.wisetao.com:4343/api/calculate-railway-expedition-delivery";
  new RailwayExpeditionCalculator(".js-calculate-result", apiUrl);
});
