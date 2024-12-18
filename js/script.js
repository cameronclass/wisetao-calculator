// main.js
import { CONFIG } from "./config.js";
import { TelegramGroupInfo } from "./api/TelegramGroupInfo.js";
import { CurrencyParser } from "./calculations/CurrencyParser.js";
import { JsonDataLoader } from "./data/JsonDataLoader.js";
import { CalculatorValidation } from "./calculations/CalculatorValidation.js";
import { DeliveryCalculator } from "./calculations/DeliveryCalculator.js";
import { UIController } from "./ui/ui-controller.js";
import { State } from "./data/State.js";

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
})();


// Карта для отображения понятных названий упаковки:
const packingTypeMap = {
  "std_pack": "Стандартная упаковка",
  "pack_corner": "Упаковка с углами",
  "wood_crate": "Деревянная обрешетка",
  "tri_frame": "Треугольная деревянная рама",
  "wood_pallet": "Деревянный поддон",
  "pallet_water": "Поддон с водонепроницаемой упаковкой",
  "wood_boxes": "Деревянные коробки"
};

// Функция для обновления данных в tooltip, принимаем сам элемент tooltip
function updateTooltipData(directionKey, tooltip) {
  const direction = directionKey.replace("price_", "");
  const directionData = State.getDirectionData(direction);
  if (!directionData) {
    console.error("Нет данных для выбранного направления:", direction);
    return;
  }

  const {
    currencyYuan,
    currencyRuble,
    totalCostFinalDollar,
    totalCostFinalRuble,
    packagingCost,
    insuranceCostDollar,
    pricePerKgDollar,
    pricePerKgRuble,
    packingTypeValue
  } = directionData;

  const packDollar = packagingCost.toFixed(2);
  const packRuble = (packagingCost * currencyRuble).toFixed(2);
  const insuranceRub = (insuranceCostDollar * currencyRuble).toFixed(2);
  const packingName = packingTypeMap[packingTypeValue] || "Неизвестная упаковка";

  // Заполняем поля тултипа
  tooltip.querySelector("._ruble").textContent = currencyRuble + " ₽";
  tooltip.querySelector("._yuan").textContent = currencyYuan + " ₽";
  tooltip.querySelector("._packing").textContent = packingName;

  tooltip.querySelector("._pack-dollar").textContent = packDollar + " $";
  tooltip.querySelector("._pack-ruble").textContent = packRuble + " ₽";

  tooltip.querySelector("._insurance-dollar").textContent = insuranceCostDollar.toFixed(2) + " $";
  tooltip.querySelector("._insurance-ruble").textContent = insuranceRub + " ₽";

  tooltip.querySelector("._kg-dollar").textContent = pricePerKgDollar + " $";
  tooltip.querySelector("._kg-ruble").textContent = pricePerKgRuble + " ₽";

  tooltip.querySelector("._all-dollar").textContent = totalCostFinalDollar.toFixed(2) + " $";
  tooltip.querySelector("._all-ruble").textContent = totalCostFinalRuble.toFixed(2) + " ₽";
}

// Теперь находим все price-label и для каждого навешиваем обработчики
const priceLabels = document.querySelectorAll(".main-calc-result__price");
priceLabels.forEach((label) => {
  // Ищем .overflow-info рядом (на том же уровне вложенности в .price-cell)
  const priceCell = label.closest(".price-cell");
  const overflowInfo = priceCell.querySelector(".overflow-info");
  if (!overflowInfo) return;

  const tooltip = overflowInfo.querySelector(".main-calc-result-tooltip");

  label.addEventListener("mouseenter", () => {
    // Определяем направление
    const priceBlock = label.querySelector(".price-auto, .price-train, .price-avia");
    if (!priceBlock) return;

    let directionKey = "";
    if (priceBlock.classList.contains("price-auto")) directionKey = "price_auto";
    if (priceBlock.classList.contains("price-train")) directionKey = "price_train";
    if (priceBlock.classList.contains("price-avia")) directionKey = "price_avia";

    // Обновить данные tooltip для конкретного overflowInfo
    updateTooltipData(directionKey, tooltip);

    // Показать tooltip
    overflowInfo.classList.add("active");
  });

  label.addEventListener("mouseleave", () => {
    // Когда увели мышь с label, скрываем tooltip
    overflowInfo.classList.remove("active");
  });

  // Если хотим, чтобы при наведении на tooltip он оставался видимым,
  // то можно убрать удаление класса здесь и контролировать отдельно.
  overflowInfo.addEventListener("mouseleave", () => {
    overflowInfo.classList.remove("active");
  });
});

// Дополнительный функционал для кнопки "ПОЛУЧИТЬ РАСЧЕТ В PDF" внутри tooltip, если нужно
document.querySelectorAll(".main-calc-result-tooltip__btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    // Действие по клику на получение PDF (уже реализовано выше)
    const checkedRadio = document.querySelector('input[name="all-price"]:checked');
    if (!checkedRadio) {
      console.error("Не выбрано направление для генерации PDF");
      return;
    }

    const directionKey = checkedRadio.value;
    const direction = directionKey.replace("price_", "");
    const directionData = State.getDirectionData(direction);
    if (!directionData) {
      console.error("Нет данных для выбранного направления:", direction);
      return;
    }

    const offerData = prepareOfferData(directionKey, directionData);
    if (!offerData) return;

    sendOfferData(offerData);
  });
});