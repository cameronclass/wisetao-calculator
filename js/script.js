// main.js
import { CONFIG } from "./config.js";
import { TelegramGroupInfo } from "./api/TelegramGroupInfo.js";
import { CurrencyParser } from "./calculations/CurrencyParser.js";
import { JsonDataLoader } from "./data/JsonDataLoader.js";
import { CalculatorValidation } from "./calculations/CalculatorValidation.js";
import { DeliveryCalculator } from "./calculations/DeliveryCalculator.js";
import { UIController } from "./ui/UIController.js";
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
      } else {
        UIController.showError("Валидация не пройдена.");
      }
    });
})();

function prepareOfferData(
  directionKey,
  {
    currencyYuan,
    currencyRuble,
    costInDollar,
    totalCostFinalDollar,
    totalCostFinalRuble,
    totalVolume,
    totalWeight,
    quantity,
    pricePerKgDollar,
    pricePerKgRuble,
    packingTypeValue,
    packagingCost,
    insuranceCostDollar,
  }
) {
  const directionRusMap = {
    price_auto: "Авто",
    price_train: "ЖД",
    price_avia: "Авиа",
  };

  // Карта для отображения понятных названий упаковки:
  const packingTypeMap = {
    std_pack: "Стандартная упаковка",
    pack_corner: "Упаковка с углами",
    wood_crate: "Деревянная обрешетка",
    tri_frame: "Треугольная деревянная рама",
    wood_pallet: "Деревянный поддон",
    pallet_water: "Поддон с водонепроницаемой упаковкой",
    wood_boxes: "Деревянные коробки",
  };

  const directionRus = directionRusMap[directionKey];
  if (!directionRus) {
    console.error("Не найден рус. перевод для", directionKey);
    return null;
  }

  const packingTypeDisplay =
    packingTypeMap[packingTypeValue] || "Неизвестная упаковка";
  const goodsCostRuble = costInDollar * currencyRuble;
  const commissionPriceRub = goodsCostRuble * 0.05;
  const commissionPriceDollar = commissionPriceRub / currencyRuble;
  const packageCostRub = (packagingCost * currencyRuble).toFixed(2);
  const insuranceCostRub = (insuranceCostDollar * currencyRuble).toFixed(2);

  let offerDataCargoRequest = {
    DeliveryType: "Тип доставки: " + directionRus,
    ExchangeRateYuan: "Курс юаня SAIDE: " + currencyYuan + "₽",
    ExchangeRateDollar: "Курс доллара SAIDE: " + currencyRuble + "₽",
    TOTAL:
      "Стоимость до г. Москва (ТК «Южные ворота»): " +
      totalCostFinalDollar.toFixed(2) +
      "$; " +
      totalCostFinalRuble.toFixed(2) +
      "₽",
    GoodsCost: "Стоимость товара: " + goodsCostRuble.toFixed(2) + "₽",
    Weight: "Вес: " + totalWeight + "кг",
    Volume: "Объем: " + totalVolume.toFixed(3) + "м³",
    Count: "Количество: " + quantity,
    RedeemCommissionFirst: "Комиссия SAIDE 5%",
    RedeemCommission:
      "от стоимости товара: " +
      commissionPriceDollar.toFixed(2) +
      "$; " +
      commissionPriceRub.toFixed(2) +
      "₽",
    PackageType: "Упаковка: " + packingTypeDisplay,
    PackageCost: "За упаковку: " + packageCostRub + "₽",
    Insurance:
      "Страховка: " +
      insuranceCostDollar.toFixed(2) +
      "$; " +
      insuranceCostRub +
      "₽",
    Kg: "За кг: " + pricePerKgDollar + "$; " + pricePerKgRuble + "₽",
    Sum:
      "Стоимость до г. Москва: " +
      totalCostFinalDollar.toFixed(2) +
      "$; " +
      totalCostFinalRuble.toFixed(2) +
      "₽",
  };

  return offerDataCargoRequest;
}

async function sendOfferData(offerDataCargoRequest) {
  // Отправка в формате application/x-www-form-urlencoded
  const params = new URLSearchParams();
  for (let key in offerDataCargoRequest) {
    params.append(key, offerDataCargoRequest[key]);
  }

  const response = await fetch(
    "https://api-calc.wisetao.com:4343/api/get-offer",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: params.toString(),
    }
  );

  if (!response.ok) {
    console.error("Ошибка сервера:", response.statusText);
    return;
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  // Открываем PDF в новой вкладке
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Если нужно скачать сразу:
  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = "Коммерческое предложение.pdf";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);

  URL.revokeObjectURL(url);
}

document.querySelector(".js-get-pdf").addEventListener("click", () => {
  const checkedRadio = document.querySelector(
    'input[name="all-price"]:checked'
  );
  if (!checkedRadio) {
    console.error("Не выбрано направление для генерации PDF");
    return;
  }

  const directionKey = checkedRadio.value; // например: "price_auto"
  const direction = directionKey.replace("price_", ""); // "auto", "train", "avia"

  const directionData = State.getDirectionData(direction);
  if (!directionData) {
    console.error("Нет данных для выбранного направления:", direction);
    return;
  }

  const offerData = prepareOfferData(directionKey, directionData);
  if (!offerData) return;

  sendOfferData(offerData);
});
