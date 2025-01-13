// Импортируйте State
import { State } from "../data/State.js";

const API_ENDPOINTS = {
  getOffer: "https://api-calc.wisetao.com:4343/api/get-offer",
  getOfferWhite: "https://api-calc.wisetao.com:4343/api/get-offer-white",
};

// Данные для запроса get-offer
const getOfferDataComponents = {
  DeliveryType: {
    text: "Тип доставки: ",
    value: "Авто",
    unit: "",
    value2: "",
    unit2: "",
  },
  ExchangeRateYuan: {
    text: "Курс юаня: ",
    value: "",
    unit: "₽",
    value2: "",
    unit2: "",
  },
  ExchangeRateDollar: {
    text: "Курс доллара: ",
    value: "",
    unit: "₽",
    value2: "",
    unit2: "",
  },
  TOTAL: {
    text: "Стоимость до г. Москва (ТК «Южные ворота»): ",
    value: "",
    unit: "₽",
    value2: "",
    unit2: "$",
  },
  TOTALTK: {
    text: "",
    value: "",
    unit: "",
    value2: "",
    unit2: "",
  },
  GoodsCost: {
    text: "Стоимость товара: ",
    value: "",
    unit: "₽",
    value2: "",
    unit2: "$",
  },
  Weight: {
    text: "Вес: ",
    value: "",
    unit: "кг",
    value2: "",
    unit2: "",
  },
  Volume: {
    text: "Объем: ",
    value: "1.5",
    unit: "м³",
    value2: "",
    unit2: "",
  },
  Count: {
    text: "Количество: ",
    value: "10",
    unit: "",
    value2: "",
    unit2: "",
  },
  RedeemCommissionFirst: {
    text: "",
    value: "",
    unit: "",
    value2: "",
    unit2: "",
  },
  RedeemCommission: {
    text: "",
    value: "",
    unit: "",
    value2: "",
    unit2: "",
  },
  PackageType: {
    text: "Упаковка: ",
    value: "",
    unit: "",
    value2: "",
    unit2: "",
  },
  PackageCost: {
    text: "За упаковку: ",
    value: "100",
    unit: "₽",
    value2: "",
    unit2: "$",
  },
  Insurance: {
    text: "Страховка: ",
    value: "50.00",
    unit: "₽",
    value2: "100.00",
    unit2: "$",
  },
  Kg: {
    text: "За кг: ",
    value: "200.00",
    unit: "₽",
    value2: "200.00",
    unit2: "$",
  },
  Sum: {
    text: "Стоимость до Москва (ТК «Южные ворота») ",
    value: "1000",
    unit: "₽",
    value2: "950",
    unit2: "$",
  },
  tkType: {
    text: "",
    value: "[тип]",
    unit: "",
    value2: "",
    unit2: "",
  },
  tkData: {
    kgTk: {
      text: "За кг: ",
      value: "50.00",
      unit: "₽",
      value2: "50.00",
      unit2: "$",
    },
    sumTk: {
      text: "Стоимость: ",
      value: "100.00",
      unit: "₽",
      value2: "100.00",
      unit2: "$",
    },
    kgTotal: {
      text: "За кг: ",
      value: "50.00",
      unit: "₽",
      value2: "50.00",
      unit2: "$",
    },
    sumTotal: {
      text: "Общая стоимость: ",
      value: "100.00",
      unit: "₽",
      value2: "100.00",
      unit2: "$",
    },
    varyKg: {
      text: "",
      value: "",
      unit: "",
      value2: "",
      unit2: "",
    },
    varySum: {
      text: "",
      value: "",
      unit: "",
      value2: "",
      unit2: "",
    },
  },
  USD_RATE: { value: 100 },
  Items: [],
};

// Данные для запроса get-offer-white
const getOfferWhiteDataComponents = {
  ExchangeRateYuan: {
    text: "Курс юаня: ",
    value: State.calculatedData.yuan,
    unit: "₽ ",
    value2: "",
    unit2: "",
  },
  ExchangeRateDollar: {
    text: "Курс доллара: ",
    value: State.calculatedData.dollar,
    unit: "₽ ",
    value2: "",
    unit2: "",
  },
  sumDuty: {
    text: "ПОШЛИНА: ",
    value: State.clientData.tnvedSelectedImp,
    unit: "%",
    value2: "",
    unit2: "",
  },
  NDS: {
    text: "НДС: ",
    value: State.nds,
    unit: "%",
    value2: "",
    unit2: "",
  },
  Saide: {
    text: "ПЕРЕВОЗКА: ",
    value: State.whiteCargoRate,
    unit: "$/кг",
    value2: "",
    unit2: "",
  },
  totalDuty: {
    text: "СУММ. ПОШЛИНА: ",
    value: State.calculatedData.auto.duty.ruble,
    unit: "₽",
    value2: State.calculatedData.auto.duty.dollar,
    unit2: "$",
  },
  totalNds: {
    text: "CУММ. НДС: ",
    value: State.calculatedData.auto.nds.ruble,
    unit: "₽",
    value2: State.calculatedData.auto.nds.dollar,
    unit2: "$",
  },

  fees: {
    text: "Сборы: ",
    value: State.calculatedData.auto.declaration.ruble,
    unit: "₽",
    value2: State.calculatedData.auto.declaration.dollar,
    unit2: "$",
  },
  SumSaide: {
    text: "СУММ. ПЕРЕВОЗКА (до г. Благовещенск): ",
    value: State.calculatedData.auto.cargoCost.ruble,
    unit: "₽",
    value2: State.calculatedData.auto.cargoCost.dollar,
    unit2: "$",
  },

  totalCustoms: {
    text: "СУММ. ТАМОЖНЯ: ",
    value: State.calculatedData.auto.customsCost.ruble,
    unit: "₽",
    value2: State.calculatedData.auto.customsCost.dollar,
    unit2: "$",
  },

  TOTAL: {
    text: "Стоимость до г. Благовещенск (Тамож.+ Перевозка): ",
    value: State.calculatedData.auto.totalCost.ruble,
    unit: "₽",
    value2: State.calculatedData.auto.totalCost.dollar,
    unit2: "$",
  },

  PackageType: {
    text: "Упаковка: ",
    value: State.clientData.packingType,
    unit: "",
    value2: "",
    unit2: "",
  },
  PackageCost: {
    text: "За упаковку: ",
    value: State.calculatedData.auto.packagingCost.ruble,
    unit: "₽",
    value2: State.calculatedData.auto.packagingCost.dollar,
    unit2: "$",
  },
  Kg: {
    text: "Страховка: ",
    value: State.calculatedData.auto.insuranceCost.ruble,
    unit: "₽",
    value2: State.calculatedData.auto.insuranceCost.dollar,
    unit2: "$",
  },
  Sum: {
    text: "Общая стоимость (Перевозка + Таможня): ",
    value: State.calculatedData.auto.totalCost.ruble,
    unit: "₽",
    value2: State.calculatedData.auto.totalCost.dollar,
    unit2: "$",
  },

  GoodsCost: {
    text: "Стоимость товара: ",
    value: State.calculatedData.clientCostDollar,
    unit: "$",
    value2: "",
    unit2: "",
  },

  Weight: {
    text: "Вес: ",
    value: State.clientData.totalWeight,
    unit: "кг",
    value2: "",
    unit2: "",
  },

  Volume: {
    text: "Объем: ",
    value: State.clientData.totalVolume,
    unit: "м³",
    value2: "",
    unit2: "",
  },

  Items: [
    {
      TNVED_NAME: `[${State.clientData.tnvedSelectedCode}] ${State.clientData.tnvedSelectedName}`,
      IMP_PRINT: "",
      DUTY: State.calculatedData.auto.duty.ruble,
      NDS_PRINT: "",
      NDS: State.calculatedData.auto.duty.ruble,
      LICENSE: "",
      SAFETY_PR: "",
      SAFETY: "",
      LICIMP_PR: false,
    },
  ],

  tkType: {
    text: "",
    value: "",
    unit: "",
    value2: "",
    unit2: "",
  },

  TOTALTK: {
    text: "",
    value: "",
    unit: "",
    value2: "",
    unit2: "",
  },

  RedeemCommissionFirst: {
    text: "",
    value: "",
    unit: "",
    value2: "",
    unit2: "",
  },

  RedeemCommission: {
    text: "",
    value: "",
    unit: "",
    value2: "",
    unit2: "",
  },

  tkData: null,

  USD_RATE: { value: 105 },
};

function formatData(text, number1, unit1, number2 = "", unit2 = "") {
  return `${text}${number1} ${unit1} ${number2} ${unit2}`.trim();
}

function buildString(component) {
  const number1 = component.value || "";
  const unit1 = component.unit || "";
  const number2 = component.value2 || "";
  const unit2 = component.unit2 || "";

  return formatData(component.text || "", number1, unit1, number2, unit2);
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

// Функция для подготовки данных и отправки запроса
async function prepareAndSendRequest(selectedType) {
  if (selectedType === "calc-cargo") {
    // Аналогично для getOfferDataComponents
    offerManager.updateOfferDataComponentsFromState(State);
    offerManager.sendPostRequest(
      offerManager.API_ENDPOINTS.getOffer,
      offerManager.getOfferDataComponents
    );
  } else if (selectedType === "calc-customs") {
    // 1) Подтянуть актуальные данные из State:
    offerManager.updateOfferWhiteDataComponentsFromState(State);
    // 2) Отправить запрос:
    offerManager.sendPostRequest(
      offerManager.API_ENDPOINTS.getOfferWhite,
      offerManager.getOfferWhiteDataComponents
    );
  }
}

// Функция для обработки выбора типа расчета
function handleCalcTypeChange() {
  const calcTypeInputs = document.querySelectorAll('input[name="calc-type"]');
  const button = document.querySelector(".js-get-pdf");

  calcTypeInputs.forEach((input) => {
    input.addEventListener("change", () => {
      // Активируем кнопку при выборе любого типа
      button.disabled = false;
    });
  });
}

// Функция для обработки нажатия кнопки
function handleButtonClick() {
  const button = document.querySelector(".js-get-pdf");

  button.addEventListener("click", async () => {
    const selectedInput = document.querySelector(
      'input[name="calc-type"]:checked'
    );

    if (!selectedInput) {
      alert("Пожалуйста, выберите тип расчета.");
      return;
    }

    const selectedType = selectedInput.value;
    console.log(State);
    // Вызываем функцию подготовки и отправки запроса
    await prepareAndSendRequest(selectedType);
  });
}

// Инициализация обработчиков событий после загрузки DOM
document.addEventListener("DOMContentLoaded", () => {
  handleCalcTypeChange();
  handleButtonClick();
});
