// main.js
import { CONFIG } from "./config.js";
import { TelegramGroupInfo } from "./api/TelegramGroupInfo.js";
import { CurrencyParser } from "./calculations/CurrencyParser.js";
import { JsonDataLoader } from "./data/JsonDataLoader.js";
import { CalculatorValidation } from "./calculations/CalculatorValidation.js";
import { DeliveryCalculator } from "./calculations/DeliveryCalculator.js";
import { UIController } from "./ui/ui-controller.js";
import { State } from "./data/State.js";

async function getCbrRates() {
  const response = await fetch("https://www.cbr-xml-daily.ru/daily_json.js");
  const data = await response.json();
  const usdToRub = parseFloat(data.Valute.USD.Value).toFixed(2);
  const cnyToRub = parseFloat(data.Valute.CNY.Value).toFixed(2);

  return {
    currencyCbRuble: usdToRub,
    currencyCbYuan: cnyToRub,
  };
}

(async () => {
  const groupInfo = new TelegramGroupInfo(CONFIG.botToken, CONFIG.chatId);
  const groupName = await groupInfo.getGroupName();

  let wisetaoYuan; // было currencyYuan
  let wisetaoRuble; // было currencyRuble

  let cbrYuan; // было currencyCbYuan
  let cbrRuble; // было currencyCbRuble

  if (groupName) {
    const currencyParser = new CurrencyParser();
    try {
      currencyParser.parseAndCalculate(groupName);
      wisetaoYuan = currencyParser.getYuanRate(); // бывший currencyYuan
      wisetaoRuble = currencyParser.getDollarRate(); // бывший currencyRuble
      console.log(`Wisetao: 1¥ = ${wisetaoYuan} рубль`);
      console.log(`Wisetao: 1$ = ${wisetaoRuble} рубль`);
    } catch (error) {
      UIController.showError(
        "Не удалось получить курс валют: " + error.message
      );
    }
  } else {
    UIController.showError("Не удалось получить имя группы.");
  }

  // Получаем курсы валют от ЦБ РФ
  try {
    const cbrRates = await getCbrRates();
    cbrRuble = cbrRates.currencyCbRuble; // допустим "75.50"
    cbrYuan = cbrRates.currencyCbYuan; // допустим  "10.20"

    // Обновляем State с курсами от ЦБ
    State.updateRates(cbrRuble, cbrYuan);

    console.log(`Курс ЦБ: 1$ = ${State.cbrRates.dollar} рубль`);
    console.log(`Курс ЦБ: 1¥ = ${State.cbrRates.yuan} рубль`);
  } catch (error) {
    UIController.showError(
      "Не удалось получить курс валют от ЦБ: " + error.message
    );
  }

  if (!wisetaoYuan || !wisetaoRuble || !cbrYuan || !cbrRuble) {
    UIController.showError("Курсы валют не загружены, расчет невозможен.");
    return;
  }

  // Узнаём, какая радиокнопка сейчас выбрана
  const defaultCalcTypeRadio = document.querySelector(
    'input[name="calc-type"]:checked'
  );
  if (defaultCalcTypeRadio && defaultCalcTypeRadio.value === "calc-customs") {
    // Показываем cbr:
    document.querySelector('input[name="current_rate_ruble"]').value = cbrRuble;
    document.querySelector('input[name="current_rate_yuan"]').value = cbrYuan;
  } else {
    // Показываем wisetao:
    document.querySelector('input[name="current_rate_ruble"]').value =
      wisetaoRuble;
    document.querySelector('input[name="current_rate_yuan"]').value =
      wisetaoYuan;
  }

  const jsonLoader = new JsonDataLoader(CONFIG.jsonPath);
  await jsonLoader.load();

  const fields = {
    totalCost: document.querySelector('input[name="total_cost"]'),
    totalCurrency: document.querySelector('input[name="total_currency"]'),
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

  const calculator = new DeliveryCalculator(
    jsonLoader,

    wisetaoRuble,
    wisetaoYuan,

    cbrRuble,
    cbrYuan,
    fields
  );
  const validation = new CalculatorValidation(fields);

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

  // Собираем все поля, которые при изменении должны сбрасывать результат
  const allFieldsToReset = [
    fields.totalCost,
    fields.totalWeight,
    fields.totalVolume,
    fields.totalVolumeCalculated,
    fields.volumeLength,
    fields.volumeWidth,
    fields.volumeHeight,
    fields.tnvedInput,
    fields.brand,
  ];

  allFieldsToReset.forEach((fld) => {
    if (!fld) return;
    const eventName =
      fld.type === "radio" || fld.type === "checkbox" ? "change" : "input";
    fld.addEventListener(eventName, () => {
      validation.hideCalculationResult();
    });
  });

  // И ещё для переключателя calc-type
  const calcTypeRadios = document.querySelectorAll('input[name="calc-type"]');
  calcTypeRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      validation.hideCalculationResult();
      validation.clearErrors();
      const allFields = Object.values(allFieldsToReset);
      validation.clearFields(allFields);

      // --- НОВЫЙ КОД: заменяем курс в полях
      if (radio.value === "calc-cargo") {
        // Используем wisetaoRuble / wisetaoYuan
        document.querySelector('input[name="current_rate_ruble"]').value =
          wisetaoRuble;
        document.querySelector('input[name="current_rate_yuan"]').value =
          wisetaoYuan;
      } else {
        // Используем cbrRuble / cbrYuan
        document.querySelector('input[name="current_rate_ruble"]').value =
          cbrRuble;
        document.querySelector('input[name="current_rate_yuan"]').value =
          cbrYuan;
      }
    });
  });
})();
