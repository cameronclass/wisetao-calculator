// main.js
import { CONFIG } from "./config.js";
import { TelegramGroupInfo } from "./api/TelegramGroupInfo.js";
import { CurrencyParser } from "./calculations/CurrencyParser.js";
import { JsonDataLoader } from "./data/JsonDataLoader.js";
import { CalculatorValidation } from "./calculations/CalculatorValidation.js";
import { DeliveryCalculator } from "./calculations/DeliveryCalculator.js";
import { UIController } from "./ui/ui-controller.js";
import { State } from "./data/State.js";

function hideCalculationResult() {
  // 1) Скрываем блок с результатом
  const resultBlock = document.querySelector(".main-calc-result");
  if (resultBlock) {
    resultBlock.classList.remove("active");
  }
  // 2) Очищаем State, если нужно
  State.directionsData = {};
}

(async () => {
  const groupInfo = new TelegramGroupInfo(CONFIG.botToken, CONFIG.chatId);
  const groupName = await groupInfo.getGroupName();

  let currencyYuan;
  let currencyRuble;

  if (groupName) {
    const currencyParser = new CurrencyParser();
    try {
      currencyParser.parseAndCalculate(groupName);
      currencyYuan = currencyParser.getYuanRate();
      currencyRuble = currencyParser.getDollarRate();
      console.log(`1$ = ${currencyYuan} юань`);
      console.log(`1$ = ${currencyRuble} рубль`);

      document.querySelector(
        'input[name="current_rate_ruble"]'
      ).value = `${currencyRuble}`;
      document.querySelector(
        'input[name="current_rate_yuan"]'
      ).value = `${currencyYuan}`;
    } catch (error) {
      UIController.showError(
        "Не удалось получить курс валют: " + error.message
      );
    }
  } else {
    UIController.showError("Не удалось получить имя группы.");
  }

  const jsonLoader = new JsonDataLoader(CONFIG.jsonPath);
  await jsonLoader.load();

  const fields = {
    totalCost: document.querySelector('input[name="total_cost"]'),
    totalCurrency: document.querySelector('input[name="total_currecy"]'),
    totalWeight: document.querySelector('input[name="total_weight"]'),
    totalVolume: document.querySelector('input[name="total_volume"]'),
    totalVolumeCalculated: document.querySelector(
      'input[name="total_volume_calculated"]'
    ),
    volumeLength: document.querySelector('input[name="volume_lenght"]'),
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

  const calculator = new DeliveryCalculator(
    jsonLoader,
    currencyRuble,
    currencyYuan,
    fields
  );
  const validation = new CalculatorValidation(fields);

  if (!currencyRuble || !currencyYuan) {
    UIController.showError("Курсы валют не загружены, расчет невозможен.");
    return;
  }

  fields.weightVolumeChange.addEventListener("change", () => {
    if (fields.weightVolumeChange.checked) {
      fields.totalVolume.disabled = false;
      fields.volumeLength.disabled = true;
      fields.volumeWidth.disabled = true;
      fields.volumeHeight.disabled = true;

      validation.clearErrors();
      validation.clearFields([
        fields.volumeLength,
        fields.volumeWidth,
        fields.volumeHeight,
      ]);
    } else {
      fields.totalVolume.disabled = true;
      fields.volumeLength.disabled = false;
      fields.volumeWidth.disabled = false;
      fields.volumeHeight.disabled = false;

      validation.clearErrors();
      validation.clearFields([fields.totalVolume]);
    }
  });

  document
    .querySelector(".js-calculate-result")
    .addEventListener("click", (e) => {
      e.preventDefault();
      UIController.clearError(); // Чистим старые ошибки
      if (validation.validateAll()) {
        calculator.calculate();
        // Скроллим до блока .main-calc-result
        const resultBlock = document.querySelector(".main-calc-result");
        if (resultBlock) {
          resultBlock.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } else {
        UIController.showError("Валидация не пройдена.");
        // Скроллим до блока .main-calc-result
        const wrapperBlock = document.querySelector(".main-calc__wrapper");
        if (wrapperBlock) {
          wrapperBlock.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });

  // Предположим, что validation и State уже созданы
  // Собираем все поля, которые при изменении должны сбрасывать результат
  const allFieldsToReset = [
    fields.totalCost,
    fields.totalWeight,
    fields.totalVolume,
    fields.totalVolumeCalculated,
    fields.volumeLength,
    fields.volumeWidth,
    fields.volumeHeight,
    fields.quantity,
    fields.tnvedInput,
    fields.brand,
    fields.insurance,
    // и т. д. ...
  ];

  // Вешаем 'input' на обычные поля, 'change' на radio/checkbox
  allFieldsToReset.forEach((fld) => {
    if (!fld) return; // вдруг чего-то нет
    // Определим подходящее событие
    const eventName =
      fld.type === "radio" || fld.type === "checkbox" ? "change" : "input";
    fld.addEventListener(eventName, () => {
      hideCalculationResult();
    });
  });

  // И ещё для переключателя calc-type
  const calcTypeRadios = document.querySelectorAll('input[name="calc-type"]');
  calcTypeRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      hideCalculationResult();
      // Плюс если нужно очистить поля:
      validation.clearErrors();
      const allFields = Object.values(fields);
      validation.clearFields(allFields);
    });
  });
})();
