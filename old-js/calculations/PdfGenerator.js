import { State } from "../data/State.js";

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
    Count: "Количество мест: " + quantity,
    RedeemCommissionFirst: "",
    /* RedeemCommissionFirst: "Комиссия SAIDE 5%", */
    RedeemCommission: "",
    /* RedeemCommission:
      "от стоимости товара: " +
      commissionPriceDollar.toFixed(2) +
      "$; " +
      commissionPriceRub.toFixed(2) +
      "₽", */
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

// Ссылки на элементы
const overlayCalc = document.querySelector(".main-calc__over");
const overlayMessageCalc = overlayCalc.querySelector(
  ".main-calc__over_pdf span:first-child"
);
const overlayCountdownCalc = overlayCalc.querySelector(
  ".main-calc__over_pdf_count"
);

let countdownTimer = null;

// Функция для запуска обратного отсчёта
function startCountdown(seconds = 10) {
  overlayCountdownCalc.textContent = seconds;
  countdownTimer = setInterval(() => {
    seconds--;
    if (seconds <= 0) {
      clearInterval(countdownTimer);
      countdownTimer = null;
      // Когда время истекло, но ответа нет, можно оставить так
      // либо добавить какой-то обработчик
    } else {
      overlayCountdownCalc.textContent = seconds;
    }
  }, 1000);
}

// Функция для остановки и сброса обратного отсчёта
function stopCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
}

// Обработчик при нажатии на оверлей для его скрытия после успеха
overlayCalc.addEventListener("click", (event) => {
  // Проверим, есть ли в тексте слово "Успешно" - чтобы не закрыть до ответа.
  if (overlayMessageCalc.textContent.includes("Успешно получено")) {
    overlayCalc.classList.remove("active");
  }
});

document.querySelector(".js-get-pdf").addEventListener("click", async () => {
  const checkedRadio = document.querySelector(
    'input[name="all-price"]:checked'
  );
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

  // Показать оверлей и запустить обратный отсчет
  overlayCalc.classList.add("active");
  overlayMessageCalc.innerHTML = `Идёт передача данных менеджеру <br> пожалуйста, подождите...`;
  startCountdown(20);

  // Отправить запрос
  try {
    await sendOfferData(offerData);
    // Если успешно - обновляем текст
    stopCountdown();
    overlayMessageCalc.textContent =
      "Успешно получено. Нажмите на экран чтобы закрыть окно";
    // Счётчик уберём, можно очистить текст или оставить в предыдущем состоянии
    overlayCountdownCalc.textContent = "";
  } catch (error) {
    console.error("Ошибка при получении PDF:", error);
    stopCountdown();
    overlayMessageCalc.textContent = "Произошла ошибка при получении PDF";
    overlayCountdownCalc.textContent = "";
  }
});
