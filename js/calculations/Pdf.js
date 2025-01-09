import { State } from "../data/State.js";

async function generateOffer(data) {
  const params = new URLSearchParams();

  // Добавляем данные, связанные с предложением
  params.append("ExchangeRateYuan", data.exchangeRateYuan);
  params.append("ExchangeRateDollar", data.exchangeRateDollar);
  params.append("TOTAL", data.total);
  if (data.tkData) {
    params.append("TOTALTK", data.totalTk);
    params.append("tkData[kgTk]", data.tkData.kgTk);
    params.append("tkData[varyKg]", data.tkData.varyKg);
    params.append("Sum", data.sum);
    params.append("tkData[sumTk]", data.tkData.sumTk);
    params.append("tkData[varySum]", data.tkData.varySum);
    params.append("tkData[kgTotal]", data.tkData.kgTotal);
    params.append("tkData[sumTotal]", data.tkData.sumTotal);
  }
  params.append("GoodsCost", data.goodsCost);
  params.append("Weight", data.weight);
  params.append("Volume", data.volume);
  params.append("Count", data.count);
  params.append("RedeemCommission", data.redeemCommission);
  params.append("DeliveryType", data.deliveryType);
  params.append("PackageType", data.packageType);
  params.append("PackageCost", data.packageCost);
  params.append("Insurance", data.insurance);
  params.append("Kg", data.kg);

  // Добавляем товары
  data.items.forEach((item, index) => {
    params.append(`Items[${index}][TNVED_NAME]`, item.TNVED_NAME);
    params.append(`Items[${index}][IMP_PRINT]`, item.IMP_PRINT);
    params.append(`Items[${index}][DUTY]`, item.DUTY);
    params.append(`Items[${index}][NDS]`, item.NDS);
    params.append(`Items[${index}][LICENSE]`, item.LICENSE);
    params.append(`Items[${index}][SAFETY]`, item.SAFETY);
    // Добавьте другие поля товара по мере необходимости
  });

  try {
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

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Offer.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      const errorText = await response.text();
      console.error("Ошибка при генерации предложения:", errorText);
    }
  } catch (error) {
    console.error("Сетевая ошибка:", error);
  }
}

// Пример использования:
const offerData = {
  exchangeRateYuan: "6.5",
  exchangeRateDollar: "1.0",
  total: "1000",
  tkData: {
    totalTk: "200",
    kgTk: "50",
    varyKg: "5",
    sumTk: "300",
    varySum: "30",
    kgTotal: "55",
    sumTotal: "330",
  },
  goodsCost: "500",
  weight: "100",
  volume: "200",
  count: "10",
  redeemCommission: "50.00 ₽",
  deliveryType: "Air",
  packageType: "Box",
  packageCost: "20",
  insurance: "Yes",
  kg: "150",
  items: [
    {
      TNVED_NAME: "[1234] Product A",
      IMP_PRINT: "Import",
      DUTY: "100",
      NDS: "20",
      LICENSE: true,
      SAFETY: false,
    },
    // Добавьте больше товаров по мере необходимости
  ],
};

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
  // Показать оверлей и запустить обратный отсчет
  overlayCalc.classList.add("active");
  overlayMessageCalc.innerHTML = `Идёт передача данных менеджеру <br> пожалуйста, подождите...`;
  startCountdown(10);

  // Отправить запрос
  try {
    await generateOffer(offerData);
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
