

const API_ENDPOINTS = {
  getOffer: "https://api-calc.wisetao.com:4343/api/get-offer",
  getOfferWhite: "https://api-calc.wisetao.com:4343/api/get-offer-white",
};

function formatData(text, number, unit) {
  return `${text}${number} ${unit}`;
}

// Данные для запроса get-offer
const getOfferDataComponents = {
  DeliveryType: {
    text: "Тип доставки: ",
    value: "Air (до г. [город])",
    unit: "",
  },
  ExchangeRateYuan: { text: "Курс юаня SAIDE: ", value: "6.5", unit: "₽" },
  ExchangeRateDollar: { text: "Курс доллара SAIDE: ", value: "1.0", unit: "₽" },
  TOTAL: { text: "Стоимость до г. [город]: ", value: "1000", unit: "$; 950₽" },
  TOTALTK: {
    text: "Стоимость до г. [город] (Терм. ТК [тип]): ",
    value: "1000",
    unit: "$; 950₽",
  },
  GoodsCost: { text: "Стоимость товара: ", value: "500", unit: "₽" },
  Weight: { text: "Вес: ", value: "200", unit: "кг" },
  Volume: { text: "Объем: ", value: "1.5", unit: "м³" },
  Count: { text: "Количество: ", value: "10", unit: "" },
  RedeemCommissionFirst: { text: "Комиссия SAIDE ", value: "5", unit: "%" },
  RedeemCommission: {
    text: "от стоимости товара: ",
    value: "50.00",
    unit: "$; 10.00₽",
  },
  PackageType: { text: "Упаковка: ", value: "Box", unit: "" },
  PackageCost: { text: "За упаковку: ", value: "100", unit: "₽" },
  Insurance: { text: "Страховка: ", value: "50.00", unit: "$; 100.00₽" },
  Kg: { text: "За кг: ", value: "200.00", unit: "$; 200.00₽ (до г. [город])" },
  Sum: { text: "Стоимость до г. [город] ", value: "1000", unit: "$; 950₽" },
  tkType: { text: "", value: "[тип]", unit: "" },
  // Вложенные данные tkData
  tkData: {
    kgTk: {
      text: "За кг: ",
      value: "50.00",
      unit: "$; 50.00₽ (г. [город] - г. [город])",
    },
    sumTk: {
      text: "Стоимость: ",
      value: "100.00",
      unit: "$; 100.00₽ (г. [город] - г. [город])",
    },
    kgTotal: {
      text: "За кг до г. [город] (Терм. ТК [тип]): ",
      value: "50.00",
      unit: "$; 50.00₽",
    },
    sumTotal: {
      text: "Общая стоимость до г. [город] (Терм. ТК [тип]): ",
      value: "100.00",
      unit: "$; 100.00₽",
    },
    varyKg: { text: "", value: "", unit: "(стоимость может варьир.)" },
    varySum: { text: "", value: "", unit: "(стоимость может варьир.)" },
  },
  USD_RATE: { value: 75 },
  Items: [], // Пустой массив Items
};

// Данные для запроса get-offer-white
const getOfferWhiteDataComponents = {
  sumDuty: { text: "ПОШЛИНА: ", value: "200", unit: "$" },
  NDS: { text: "НДС: ", value: "20", unit: "%" },
  Saide: { text: "ПЕРЕВОЗКА SAIDE: ", value: "0.7", unit: "$/кг" },
  totalDuty: { text: "СУММ. ПОШЛИНА: ", value: "200", unit: "$" },
  totalNds: { text: "CУММ. НДС: ", value: "400", unit: "$" },
  totalCustoms: { text: "ТАМОЖНЯ: ", value: "600", unit: "$; 45000 ₽" },
  fees: { text: "Сборы: ", value: "50", unit: "$" },
  ExchangeRateYuan: { text: "Курс юаня SAIDE: ", value: "11", unit: " ₽" },
  ExchangeRateDollar: { text: "Курс доллара SAIDE: ", value: "75", unit: " ₽" },
  TOTAL: {
    text: "Стоимость до г. Благовещенск (Тамож.+Saide): ",
    value: "250",
    unit: "$; 56250 ₽",
  },
  TOTALTK: {
    text: "Стоимость до г. Благовещенск (Тамож.+Saide): ",
    value: "250",
    unit: "$; 56250 ₽",
  },
  GoodsCost: { text: "Стоимость товара: ", value: "2000", unit: "$; 150000 ₽" },
  Weight: { text: "Вес: ", value: "100", unit: "кг" },
  Volume: { text: "Объем: ", value: "1.5", unit: " м³" },
  RedeemCommissionFirst: { text: "", value: "", unit: "" },
  RedeemCommission: { text: "", value: "", unit: "" },
  SumSaide: {
    text: "Стоимость перевозки SAIDE (до г. Благовещенск 0.7$/кг): ",
    value: "70",
    unit: "$; 5250 ₽",
  },
  PackageType: { text: "Упаковка: ", value: "Картонная коробка", unit: "" },
  PackageCost: { text: "За упаковку: ", value: "50", unit: "₽" },
  Kg: {
    text: "За кг: ",
    value: "2.50",
    unit: "$; 187.50 ₽ (Тамож. + SAIDE до г. Благовещенск)",
  },
  Sum: {
    text: "Стоимость: ",
    value: "250",
    unit: "$; 56250 ₽ (Тамож. + SAIDE до г. Благовещенск)",
  },
  tkType: { text: "", value: "ТК Пример", unit: "" },
  tkData: null, // Пустое поле
  USD_RATE: { value: 105 },
  Items: [
    {
      TNVED_NAME: "[12345678] Наименование товара 1",
      IMP_PRINT: "IMP1",
      DUTY: 200,
      NDS_PRINT: "NDS1",
      NDS: 400,
      LICENSE: "",
      SAFETY_PR: "",
      SAFETY: "",
      LICIMP_PR: false,
    },
  ],
};

function buildString(component) {
  if (component.text || component.unit) {
    return `${component.text}${component.value}${component.unit}`;
  }
  return component.value;
}

function generateParams(dataComponents) {
  const params = new URLSearchParams();

  for (const key in dataComponents) {
    if (key === "Items") {
      // Обработка массива Items
      dataComponents.Items.forEach((item, index) => {
        for (const itemKey in item) {
          const composedKey = `Items[${index}][${itemKey}]`;
          let value = item[itemKey];
          if (typeof value === "boolean") {
            value = value.toString();
          }
          params.append(composedKey, value);
        }
      });
    } else if (key === "tkData") {
      if (dataComponents.tkData === null) {
        // Отправляем tkData как пустую строку
        params.append("tkData", "");
      } else {
        // Обработка вложенного объекта tkData
        for (const tkKey in dataComponents.tkData) {
          const composedKey = `tkData[${tkKey}]`;
          params.append(composedKey, buildString(dataComponents.tkData[tkKey]));
        }
      }
    } else if (key === "USD_RATE" || key === "YUAN_RATE") {
      // Обработка числовых значений без текста
      params.append(key, dataComponents[key].value.toString());
    } else if (
      typeof dataComponents[key] === "object" &&
      !Array.isArray(dataComponents[key])
    ) {
      // Для других вложенных объектов, если такие есть
      params.append(key, buildString(dataComponents[key]));
    } else {
      // Обычные поля
      params.append(key, dataComponents[key]);
    }
  }

  return params;
}

async function handleResponse(response) {
  if (!response.ok) {
    console.error("Ошибка сервера:", response.statusText);
    alert(`Ошибка сервера: ${response.statusText}`);
    return;
  }

  try {
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    // Открываем PDF в новой вкладке
    const openLink = document.createElement("a");
    openLink.href = url;
    openLink.target = "_blank";
    document.body.appendChild(openLink);
    openLink.click();
    document.body.removeChild(openLink);

    // Скачивание PDF
    /* const downloadLink = document.createElement("a");
                downloadLink.href = url;
                downloadLink.download = "Коммерческое предложение.pdf";
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink); */

    // Освобождаем URL
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Ошибка при обработке ответа:", error);
    alert("Произошла ошибка при обработке ответа от сервера.");
  }
}

async function sendPostRequest(url, dataComponents) {
  const params = generateParams(dataComponents);
  console.log("Отправляемые параметры:", params.toString()); // Для отладки

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: params.toString(),
    });

    await handleResponse(response);
  } catch (error) {
    console.error("Ошибка при отправке запроса:", error);
    alert("Произошла ошибка при отправке запроса.");
  }
}

/* // Обработчик для кнопки "Получить предложение"
document.getElementById("getOfferBtn").addEventListener("click", () => {
  sendPostRequest(API_ENDPOINTS.getOffer, getOfferDataComponents);
});

// Обработчик для кнопки "Получить белое предложение"
document.getElementById("getOfferWhiteBtn").addEventListener("click", () => {
  sendPostRequest(API_ENDPOINTS.getOfferWhite, getOfferWhiteDataComponents);
}); */
