// Пример: OfferManager.js

// Обратите внимание: прямой импорт State убран, чтобы не "подтягивать" значения из State при загрузке
// import { State } from "../data/State.js";

class OfferManager {
  constructor() {
    // Храним эндпоинты в свойстве класса
    this.API_ENDPOINTS = {
      getOffer: "https://api-calc.wisetao.com:4343/api/get-offer",
      getOfferWhite: "https://api-calc.wisetao.com:4343/api/get-offer-white",
    };

    /**
     * Объект с данными для запроса get-offer.
     * Изначально заданы «жёсткие» значения, так как в оригинальном коде
     * они не берутся ниоткуда, кроме как из этого объекта (нет ссылок на State).
     * Если когда-нибудь понадобится получать их из State, можно воспользоваться
     * методом updateOfferDataComponentsFromState(...).
     */
    this.getOfferDataComponents = {
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

    /**
     * Объект с данными для запроса get-offer-white.
     * В оригинале здесь было много ссылок на State. Теперь они заменены
     * на пустые/нулевые значения, которые будут установлены методом updateOfferWhiteDataComponentsFromState(...)
     */
    this.getOfferWhiteDataComponents = {
      ExchangeRateYuan: {
        text: "Курс юаня: ",
        value: "", // Раньше: State.calculatedData.yuan
        unit: "₽ ",
        value2: "",
        unit2: "",
      },
      ExchangeRateDollar: {
        text: "Курс доллара: ",
        value: "", // State.calculatedData.dollar
        unit: "₽ ",
        value2: "",
        unit2: "",
      },
      sumDuty: {
        text: "ПОШЛИНА: ",
        value: "", // State.clientData.tnvedSelectedImp
        unit: "%",
        value2: "",
        unit2: "",
      },
      NDS: {
        text: "НДС: ",
        value: "", // State.nds
        unit: "%",
        value2: "",
        unit2: "",
      },
      Saide: {
        text: "ПЕРЕВОЗКА: ",
        value: "", // State.whiteCargoRate
        unit: "$/кг",
        value2: "",
        unit2: "",
      },
      totalDuty: {
        text: "СУММ. ПОШЛИНА: ",
        value: "", // State.calculatedData.auto.duty.ruble
        unit: "₽",
        value2: "",
        unit2: "$",
      },
      totalNds: {
        text: "CУММ. НДС: ",
        value: "", // State.calculatedData.auto.nds.ruble
        unit: "₽",
        value2: "",
        unit2: "$",
      },
      fees: {
        text: "Сборы: ",
        value: "", // State.calculatedData.auto.declaration.ruble
        unit: "₽",
        value2: "",
        unit2: "$",
      },
      SumSaide: {
        text: "СУММ. ПЕРЕВОЗКА (до г. Благовещенск): ",
        value: "", // State.calculatedData.auto.cargoCost.ruble
        unit: "₽",
        value2: "",
        unit2: "$",
      },
      totalCustoms: {
        text: "СУММ. ТАМОЖНЯ: ",
        value: "", // State.calculatedData.auto.customsCost.ruble
        unit: "₽",
        value2: "",
        unit2: "$",
      },
      TOTAL: {
        text: "Стоимость до г. Благовещенск (Тамож.+ Перевозка): ",
        value: "", // State.calculatedData.auto.totalCost.ruble
        unit: "₽",
        value2: "",
        unit2: "$",
      },
      PackageType: {
        text: "Упаковка: ",
        value: "", // State.clientData.packingType
        unit: "",
        value2: "",
        unit2: "",
      },
      PackageCost: {
        text: "За упаковку: ",
        value: "", // State.calculatedData.auto.packagingCost.ruble
        unit: "₽",
        value2: "",
        unit2: "$",
      },
      Kg: {
        text: "Страховка: ",
        value: "", // State.calculatedData.auto.insuranceCost.ruble
        unit: "₽",
        value2: "",
        unit2: "$",
      },
      Sum: {
        text: "Общая стоимость (Перевозка + Таможня): ",
        value: "", // State.calculatedData.auto.totalCost.ruble
        unit: "₽",
        value2: "",
        unit2: "$",
      },
      GoodsCost: {
        text: "Стоимость товара: ",
        value: "", // State.calculatedData.clientCostDollar
        unit: "$",
        value2: "",
        unit2: "",
      },
      Weight: {
        text: "Вес: ",
        value: "", // State.clientData.totalWeight
        unit: "кг",
        value2: "",
        unit2: "",
      },
      Volume: {
        text: "Объем: ",
        value: "", // State.clientData.totalVolume
        unit: "м³",
        value2: "",
        unit2: "",
      },
      Items: [
        {
          TNVED_NAME: "", // `[${State.clientData.tnvedSelectedCode}] ${State.clientData.tnvedSelectedName}`
          IMP_PRINT: "",
          DUTY: "",
          NDS_PRINT: "",
          NDS: "",
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
      USD_RATE: { value: 105 }, // Это сохранено как в оригинале
    };
  }

  /**
   * Метод, который при необходимости можно вызвать,
   * чтобы «подтянуть» из внешнего state актуальные данные
   * для обычного коммерческого предложения (если потребуется).
   */
  /* Обычная Доставка */
  updateOfferDataComponentsFromState(state) {
    // Пример (закомментировано, т.к. в исходном коде не было ссылок на State).
    // При желании раскомментируйте и подставьте нужные поля.
    //
    // this.getOfferDataComponents.ExchangeRateYuan.value = state.calculatedData.yuan;
    // this.getOfferDataComponents.ExchangeRateDollar.value = state.calculatedData.dollar;
    // ... и т.д.
  }

  /**
   * Метод, который при необходимости можно вызвать,
   * чтобы «подтянуть» из внешнего state актуальные данные
   * для get-offer-white.
   */
  /* Белая доставка */
  updateOfferWhiteDataComponentsFromState(state) {
    this.getOfferWhiteDataComponents.ExchangeRateYuan.value =
      state.calculatedData.yuan;
    this.getOfferWhiteDataComponents.ExchangeRateDollar.value =
      state.calculatedData.dollar;
    this.getOfferWhiteDataComponents.sumDuty.value =
      state.clientData.tnvedSelectedImp;
    this.getOfferWhiteDataComponents.NDS.value = state.nds;
    this.getOfferWhiteDataComponents.Saide.value = state.whiteCargoRate;

    this.getOfferWhiteDataComponents.totalDuty.value =
      state.calculatedData.auto.duty.ruble;
    this.getOfferWhiteDataComponents.totalDuty.value2 =
      state.calculatedData.auto.duty.dollar;

    this.getOfferWhiteDataComponents.totalNds.value =
      state.calculatedData.auto.nds.ruble;
    this.getOfferWhiteDataComponents.totalNds.value2 =
      state.calculatedData.auto.nds.dollar;

    this.getOfferWhiteDataComponents.fees.value =
      state.calculatedData.auto.declaration.ruble;
    this.getOfferWhiteDataComponents.fees.value2 =
      state.calculatedData.auto.declaration.dollar;

    this.getOfferWhiteDataComponents.SumSaide.value =
      state.calculatedData.auto.cargoCost.ruble;
    this.getOfferWhiteDataComponents.SumSaide.value2 =
      state.calculatedData.auto.cargoCost.dollar;

    this.getOfferWhiteDataComponents.totalCustoms.value =
      state.calculatedData.auto.customsCost.ruble;
    this.getOfferWhiteDataComponents.totalCustoms.value2 =
      state.calculatedData.auto.customsCost.dollar;

    this.getOfferWhiteDataComponents.TOTAL.value =
      state.calculatedData.auto.totalCost.ruble;
    this.getOfferWhiteDataComponents.TOTAL.value2 =
      state.calculatedData.auto.totalCost.dollar;

    this.getOfferWhiteDataComponents.PackageType.value =
      state.clientData.packingType;

    this.getOfferWhiteDataComponents.PackageCost.value =
      state.calculatedData.auto.packagingCost.ruble;
    this.getOfferWhiteDataComponents.PackageCost.value2 =
      state.calculatedData.auto.packagingCost.dollar;

    this.getOfferWhiteDataComponents.Kg.value =
      state.calculatedData.auto.insuranceCost.ruble;
    this.getOfferWhiteDataComponents.Kg.value2 =
      state.calculatedData.auto.insuranceCost.dollar;

    this.getOfferWhiteDataComponents.Sum.value =
      state.calculatedData.auto.totalCost.ruble;
    this.getOfferWhiteDataComponents.Sum.value2 =
      state.calculatedData.auto.totalCost.dollar;

    this.getOfferWhiteDataComponents.GoodsCost.value =
      state.calculatedData.clientCostDollar;

    this.getOfferWhiteDataComponents.Weight.value =
      state.clientData.totalWeight;
    this.getOfferWhiteDataComponents.Volume.value =
      state.clientData.totalVolume;

    // Обновляем Items
    this.getOfferWhiteDataComponents.Items = [
      {
        TNVED_NAME: `[${state.clientData.tnvedSelectedCode}] ${state.clientData.tnvedSelectedName}`,
        IMP_PRINT: "",
        DUTY: state.calculatedData.auto.duty.ruble,
        NDS_PRINT: "",
        NDS: state.calculatedData.auto.nds.ruble,
        LICENSE: "",
        SAFETY_PR: "",
        SAFETY: "",
        LICIMP_PR: false,
      },
    ];
  }

  /**
   * Функция форматирования данных (из оригинального кода).
   */
  formatData(text, number1, unit1, number2 = "", unit2 = "") {
    return `${text}${number1} ${unit1} ${number2} ${unit2}`.trim();
  }

  /**
   * Построение строки из структуры со значениями (из оригинального кода).
   */
  buildString(component) {
    const number1 = component.value || "";
    const unit1 = component.unit || "";
    const number2 = component.value2 || "";
    const unit2 = component.unit2 || "";

    return this.formatData(
      component.text || "",
      number1,
      unit1,
      number2,
      unit2
    );
  }

  /**
   * Генерация URLSearchParams на базе объекта dataComponents (из оригинального кода).
   */
  generateParams(dataComponents) {
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
            params.append(
              composedKey,
              this.buildString(dataComponents.tkData[tkKey])
            );
          }
        }
      } else if (key === "USD_RATE" || key === "YUAN_RATE") {
        // Обработка числовых значений без текста
        params.append(key, dataComponents[key].value.toString());
      } else if (
        typeof dataComponents[key] === "object" &&
        !Array.isArray(dataComponents[key]) &&
        dataComponents[key] !== null
      ) {
        // Для вложенных объектов
        params.append(key, this.buildString(dataComponents[key]));
      } else {
        // Обычные поля (string и пр.)
        params.append(key, dataComponents[key]);
      }
    }

    return params;
  }

  /**
   * Обработка ответа сервера (из оригинального кода).
   * Открываем PDF в новой вкладке, можем скачать и т.д.
   */
  async handleResponse(response) {
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

      // Освобождаем URL
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Ошибка при обработке ответа:", error);
      alert("Произошла ошибка при обработке ответа от сервера.");
    }
  }

  /**
   * Общая функция для отправки запроса (из оригинального кода).
   */
  async sendPostRequest(url, dataComponents) {
    const params = this.generateParams(dataComponents);
    console.log("Отправляемые параметры:", params.toString()); // Для отладки

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: params.toString(),
      });

      await this.handleResponse(response);
    } catch (error) {
      console.error("Ошибка при отправке запроса:", error);
      alert("Произошла ошибка при отправке запроса.");
    }
  }
}

// По необходимости можно экспортировать либо класс, либо сразу экземпляр.
// export default OfferManager;
export const offerManager = new OfferManager();


