import { State } from "../data/State.js";

class PdfPrepare {
  constructor() {
    // Храним эндпоинты в свойстве класса
    this.API_ENDPOINTS = {
      getOffer: "https://api-calc.wisetao.com:4343/api/get-offer",
      getOfferWhite: "https://api-calc.wisetao.com:4343/api/get-offer-white",
    };

    this.getOfferDataComponents = {
      DeliveryType: {
        text: "Тип доставки: ",
        value: "",
        unit: "",
        value2: "",
        unit2: "",
      },
      ExchangeRateYuan: {
        text: "Курс юаня: ",
        value: "",
        unit: "₽ ",
        value2: "",
        unit2: "",
      },
      ExchangeRateDollar: {
        text: "Курс доллара: ",
        value: "",
        unit: "₽ ",
        value2: "",
        unit2: "",
      },
      TOTAL: {
        text: "Стоимость до: г. Москва (ТК «Южные ворота»): ",
        value: "",
        unit: "₽ ",
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
        unit: "₽ ",
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
        value: "",
        unit: "м³",
        value2: "",
        unit2: "",
      },
      Count: {
        text: "Количество: ",
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
      PackageType: {
        text: "Упаковка: ",
        value: "",
        unit: "",
        value2: "",
        unit2: "",
      },
      PackageCost: {
        text: "За упаковку: ",
        value: "",
        unit: "₽ ",
        value2: "",
        unit2: "$",
      },
      Insurance: {
        text: "Страховка: ",
        value: "",
        unit: "₽ ",
        value2: "",
        unit2: "$",
      },
      Kg: {
        text: "За кг: ",
        value: "",
        unit: "₽ ",
        value2: "",
        unit2: "$",
      },
      Sum: {
        text: "Стоимость до: г. Москва (ТК «Южные ворота»): ",
        value: "",
        unit: "₽ ",
        value2: "",
        unit2: "$",
      },
      tkType: {
        text: "",
        value: "",
        unit: "",
        value2: "",
        unit2: "",
      },
      tkData: {
        kgTk: {
          text: "",
          value: "",
          unit: "",
          value2: "",
          unit2: "",
        },
        sumTk: {
          text: "",
          value: "",
          unit: "",
          value2: "",
          unit2: "",
        },
        kgTotal: {
          text: "",
          value: "",
          unit: "",
          value2: "",
          unit2: "",
        },
        sumTotal: {
          text: "",
          value: "",
          unit: "",
          value2: "",
          unit2: "",
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
        unit: "₽ ",
        value2: "",
        unit2: "$",
      },
      totalNds: {
        text: "CУММ. НДС: ",
        value: "", // State.calculatedData.auto.nds.ruble
        unit: "₽ ",
        value2: "",
        unit2: "$",
      },
      fees: {
        text: "Сборы: ",
        value: "", // State.calculatedData.auto.declaration.ruble
        unit: "₽ ",
        value2: "",
        unit2: "$",
      },
      SumSaide: {
        text: "СУММ. ПЕРЕВОЗКА (до г. Благовещенск): ",
        value: "", // State.calculatedData.auto.cargoCost.ruble
        unit: "₽ ",
        value2: "",
        unit2: "$",
      },
      totalCustoms: {
        text: "СУММ. ТАМОЖНЯ: ",
        value: "", // State.calculatedData.auto.customsCost.ruble
        unit: "₽ ",
        value2: "",
        unit2: "$",
      },
      TOTAL: {
        text: "Стоимость до: г. Благовещенск (Тамож.+ Перевозка): ",
        value: "", // State.calculatedData.auto.totalCost.ruble
        unit: "₽ ",
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
        unit: "₽ ",
        value2: "",
        unit2: "$",
      },
      Kg: {
        text: "Страховка: ",
        value: "", // State.calculatedData.auto.insuranceCost.ruble
        unit: "₽ ",
        value2: "",
        unit2: "$",
      },
      Sum: {
        text: "Стоимость (Перевозка + Таможня): ",
        value: "", // State.calculatedData.auto.totalCost.ruble
        unit: "₽ ",
        value2: "",
        unit2: "$",
      },
      GoodsCost: {
        text: "Стоимость товара: ",
        value: "", // State.calculatedData.clientCostDollar
        unit: "₽ ",
        value2: "",
        unit2: "$",
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
      tkData: {
        kgTk: {
          text: "",
          value: "",
          unit: "",
          value2: "",
          unit2: "",
        },
        sumTk: {
          text: "",
          value: "",
          unit: "",
          value2: "",
          unit2: "",
        },
        kgTotal: {
          text: "",
          value: "",
          unit: "",
          value2: "",
          unit2: "",
        },
        sumTotal: {
          text: "",
          value: "",
          unit: "",
          value2: "",
          unit2: "",
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
      USD_RATE: { value: 105 }, // Это сохранено как в оригинале
    };
  }

  /**
   * Метод, который при необходимости можно вызвать,
   * чтобы «подтянуть» из внешнего state актуальные данные
   * для get-offer
   */
  /* Обычная Доставка */
  updateOfferDataComponentsFromState(state) {
    const direction = state.calculatedData.selectedDirection;
    const directionRussia = state.calculatedData.russiaSelectedCargo;

    this.getOfferDataComponents.ExchangeRateYuan.value =
      state.calculatedData.yuan;
    this.getOfferDataComponents.ExchangeRateDollar.value =
      state.calculatedData.dollar;

    this.getOfferDataComponents.GoodsCost.value = Math.round(
      state.calculatedData.clientCost.ruble
    );
    this.getOfferDataComponents.GoodsCost.value2 =
      state.calculatedData.clientCost.dollar;

    this.getOfferDataComponents.Weight.value = state.clientData.totalWeight;
    this.getOfferDataComponents.Volume.value = state.clientData.totalVolume;
    this.getOfferDataComponents.Count.value = state.clientData.quantity;
    this.getOfferDataComponents.PackageType.value =
      state.calculatedData.packingType;
    this.getOfferDataComponents.DeliveryType.value =
      state.calculatedData.selectedDirectionRus;

    this.getOfferDataComponents.TOTAL.value = Math.round(
      state.calculatedData[direction].cargoCost.ruble
    );
    this.getOfferDataComponents.TOTAL.value2 =
      state.calculatedData[direction].cargoCost.dollar;

    this.getOfferDataComponents.Sum.value = Math.round(
      state.calculatedData[direction].cargoCost.ruble
    );
    this.getOfferDataComponents.Sum.value2 =
      state.calculatedData[direction].cargoCost.dollar;

    this.getOfferDataComponents.Kg.value = Math.round(
      state.calculatedData[direction].pricePerKg.ruble
    );
    this.getOfferDataComponents.Kg.value2 =
      state.calculatedData[direction].pricePerKg.dollar;

    if (state.calculatedData[direction].insuranceCost.ruble === 0) {
      /* this.getOfferDataComponents.Insurance.text = "";
      this.getOfferDataComponents.Insurance.value = "";
      this.getOfferDataComponents.Insurance.unit = "";
      this.getOfferDataComponents.Insurance.value2 = "";
      this.getOfferDataComponents.Insurance.unit2 = ""; */
      this.getOfferDataComponents.Insurance.value = "0";
      this.getOfferDataComponents.Insurance.value2 = "0";
    } else {
      this.getOfferDataComponents.Insurance.value = Math.round(
        state.calculatedData[direction].insuranceCost.ruble
      );
      this.getOfferDataComponents.Insurance.value2 =
        state.calculatedData[direction].insuranceCost.dollar;
    }

    this.getOfferDataComponents.PackageCost.value = Math.round(
      state.calculatedData[direction].packagingCost.ruble
    );
    this.getOfferDataComponents.PackageCost.value2 =
      state.calculatedData[direction].packagingCost.dollar;

    // Обработка По России
    if (directionRussia !== null) {
      const city = State.address.city;
      const region = State.address.region;

      if (city) {
        this.getOfferDataComponents.TOTALTK.text = `Стоимость до: ${city}: `;
        this.getOfferDataComponents.tkData.sumTk.text = `Стоимость до: ${city}: `;
        this.getOfferDataComponents.tkData.sumTotal.text = `Общая стоимость до ${city}: `;
        this.getOfferDataComponents.tkData.kgTk.unit2 = `$ (до ${city})`;
      } else if (region) {
        this.getOfferDataComponents.TOTALTK.text = `Стоимость до: ${region}: `;
        this.getOfferDataComponents.tkData.sumTk.text = `Стоимость до: ${region}: `;
        this.getOfferDataComponents.tkData.sumTotal.text = `Общая стоимость до ${region}: `;
        this.getOfferDataComponents.tkData.kgTk.unit2 = `$ (до ${region})`;
      } else {
        this.getOfferDataComponents.TOTALTK.text = "";
        this.getOfferDataComponents.tkData.sumTk.text = "";
        this.getOfferDataComponents.tkData.sumTotal.text = "";
        this.getOfferDataComponents.tkData.kgTk.unit2 = "";
      }

      this.getOfferDataComponents.tkData.kgTk.text = `За кг: `;
      this.getOfferDataComponents.tkData.varyKg.text = `  (цена варьир.)`;
      this.getOfferDataComponents.tkData.varySum.text = `  (цена варьир.)`;

      this.getOfferDataComponents.TOTALTK.unit = "₽ ";
      this.getOfferDataComponents.TOTALTK.unit2 = "$";

      this.getOfferDataComponents.tkData.sumTk.unit = "₽ ";
      this.getOfferDataComponents.tkData.sumTk.unit2 = "$";

      this.getOfferDataComponents.tkData.sumTotal.unit = "₽ ";
      this.getOfferDataComponents.tkData.sumTotal.unit2 = "$";

      this.getOfferDataComponents.tkData.kgTk.unit = "₽ ";

      if (directionRussia === "jde") {
        this.getOfferDataComponents.TOTALTK.value = Math.round(
          state.jde.all.ruble
        );
        this.getOfferDataComponents.TOTALTK.value2 = state.jde.all.dollar;

        this.getOfferDataComponents.tkData.kgTk.value = Math.round(
          state.jde.kg.ruble
        );
        this.getOfferDataComponents.tkData.kgTk.value2 = state.jde.kg.dollar;

        this.getOfferDataComponents.tkData.sumTk.value = Math.round(
          state.jde.all.ruble
        );
        this.getOfferDataComponents.tkData.sumTk.value2 = state.jde.all.dollar;

        this.getOfferDataComponents.tkData.sumTotal.value = Math.round(
          state.jde.calculated.all[direction].ruble
        );
        this.getOfferDataComponents.tkData.sumTotal.value2 =
          state.jde.calculated.all[direction].dollar;

        this.getOfferDataComponents.DeliveryType.value =
          state.calculatedData.selectedDirectionRus +
          ` | ${state.calculatedData.russiaSelectedCargoRus}`;
      }

      if (directionRussia === "kit") {
        this.getOfferDataComponents.TOTALTK.value = Math.round(
          state.kit[direction].all.ruble
        );
        this.getOfferDataComponents.TOTALTK.value2 =
          state.kit[direction].all.dollar;

        this.getOfferDataComponents.tkData.kgTk.value = Math.round(
          state.kit[direction].kg.ruble
        );
        this.getOfferDataComponents.tkData.kgTk.value2 =
          state.kit[direction].kg.dollar;

        this.getOfferDataComponents.tkData.sumTk.value = Math.round(
          state.kit[direction].all.ruble
        );
        this.getOfferDataComponents.tkData.sumTk.value2 =
          state.kit[direction].all.dollar;

        this.getOfferDataComponents.tkData.sumTotal.value = Math.round(
          state.kit.calculated.all[direction].ruble
        );
        this.getOfferDataComponents.tkData.sumTotal.value2 =
          state.kit.calculated.all[direction].dollar;

        this.getOfferDataComponents.DeliveryType.value =
          state.calculatedData.selectedDirectionRus +
          ` | ${state.calculatedData.russiaSelectedCargoRus}`;
      }
    } else {
      // Полный сброс если нет грузового направления
      this.getOfferDataComponents.TOTALTK.text = "";
      this.getOfferDataComponents.TOTALTK.value = "";
      this.getOfferDataComponents.TOTALTK.unit = "";
      this.getOfferDataComponents.TOTALTK.value2 = "";
      this.getOfferDataComponents.TOTALTK.unit2 = "";

      this.getOfferDataComponents.tkData.sumTk.text = "";
      this.getOfferDataComponents.tkData.sumTk.value = "";
      this.getOfferDataComponents.tkData.sumTk.unit = "";
      this.getOfferDataComponents.tkData.sumTk.value2 = "";
      this.getOfferDataComponents.tkData.sumTk.unit2 = "";

      this.getOfferDataComponents.tkData.sumTotal.text = "";
      this.getOfferDataComponents.tkData.sumTotal.value = "";
      this.getOfferDataComponents.tkData.sumTotal.unit = "";
      this.getOfferDataComponents.tkData.sumTotal.value2 = "";
      this.getOfferDataComponents.tkData.sumTotal.unit2 = "";

      this.getOfferDataComponents.tkData.kgTk.text = "";
      this.getOfferDataComponents.tkData.kgTk.value = "";
      this.getOfferDataComponents.tkData.kgTk.unit = "";
      this.getOfferDataComponents.tkData.kgTk.value2 = "";
      this.getOfferDataComponents.tkData.kgTk.unit2 = "";

      this.getOfferDataComponents.tkData.varyKg.text = "";
      this.getOfferDataComponents.tkData.varySum.text = "";
    }
  }

  /**
   * Метод, который при необходимости можно вызвать,
   * чтобы «подтянуть» из внешнего state актуальные данные
   * для get-offer-white.
   */
  /* Белая доставка */
  updateOfferWhiteDataComponentsFromState(state) {
    const direction = state.calculatedData.selectedDirection;
    const directionRussia = state.calculatedData.russiaSelectedCargo;

    this.getOfferWhiteDataComponents.ExchangeRateYuan.value =
      state.calculatedData.yuan;
    this.getOfferWhiteDataComponents.ExchangeRateDollar.value =
      state.calculatedData.dollar;
    this.getOfferWhiteDataComponents.sumDuty.value =
      state.clientData.tnvedSelectedImp;
    this.getOfferWhiteDataComponents.NDS.value = state.nds;
    this.getOfferWhiteDataComponents.Saide.value = state.whiteCargoRate;

    this.getOfferWhiteDataComponents.totalDuty.value = Math.round(
      state.calculatedData.auto.duty.ruble
    );
    this.getOfferWhiteDataComponents.totalDuty.value2 =
      state.calculatedData.auto.duty.dollar;

    this.getOfferWhiteDataComponents.totalNds.value = Math.round(
      state.calculatedData.auto.nds.ruble
    );
    this.getOfferWhiteDataComponents.totalNds.value2 =
      state.calculatedData.auto.nds.dollar;

    this.getOfferWhiteDataComponents.fees.value = Math.round(
      state.calculatedData.auto.declaration.ruble
    );
    this.getOfferWhiteDataComponents.fees.value2 =
      state.calculatedData.auto.declaration.dollar;

    this.getOfferWhiteDataComponents.SumSaide.value = Math.round(
      state.calculatedData.auto.cargoCost.ruble
    );
    this.getOfferWhiteDataComponents.SumSaide.value2 =
      state.calculatedData.auto.cargoCost.dollar;

    this.getOfferWhiteDataComponents.totalCustoms.value = Math.round(
      state.calculatedData.auto.customsCost.ruble
    );
    this.getOfferWhiteDataComponents.totalCustoms.value2 =
      state.calculatedData.auto.customsCost.dollar;

    this.getOfferWhiteDataComponents.TOTAL.value = Math.round(
      state.calculatedData.auto.totalCost.ruble
    );
    this.getOfferWhiteDataComponents.TOTAL.value2 =
      state.calculatedData.auto.totalCost.dollar;

    this.getOfferWhiteDataComponents.PackageCost.value = Math.round(
      state.calculatedData.auto.packagingCost.ruble
    );
    this.getOfferWhiteDataComponents.PackageCost.value2 =
      state.calculatedData.auto.packagingCost.dollar;

    this.getOfferWhiteDataComponents.PackageType.value =
      state.calculatedData.packingType;

    if (state.calculatedData.auto.insuranceCost.ruble === 0) {
      /* this.getOfferWhiteDataComponents.Kg.text = "";
      this.getOfferWhiteDataComponents.Kg.value = "";
      this.getOfferWhiteDataComponents.Kg.unit = "";
      this.getOfferWhiteDataComponents.Kg.value2 = "";
      this.getOfferWhiteDataComponents.Kg.unit2 = ""; */
      this.getOfferWhiteDataComponents.Kg.value = "0";
      this.getOfferWhiteDataComponents.Kg.value2 = "0";
    } else {
      this.getOfferWhiteDataComponents.Kg.value = Math.round(
        state.calculatedData.auto.insuranceCost.ruble
      );
      this.getOfferWhiteDataComponents.Kg.value2 =
        state.calculatedData.auto.insuranceCost.dollar;
    }

    this.getOfferWhiteDataComponents.Sum.value = Math.round(
      state.calculatedData.auto.totalCost.ruble
    );
    this.getOfferWhiteDataComponents.Sum.value2 =
      state.calculatedData.auto.totalCost.dollar;

    this.getOfferWhiteDataComponents.GoodsCost.value = Math.round(
      state.calculatedData.clientCost.ruble
    );
    this.getOfferWhiteDataComponents.GoodsCost.value2 =
      state.calculatedData.clientCost.dollar;

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

    // Обработка По России
    // Обработка По России
    if (directionRussia !== null) {
      const city = State.address.city;
      const region = State.address.region;

      if (city) {
        this.getOfferWhiteDataComponents.TOTALTK.text = `Стоимость до: ${city} | ${State.calculatedData.selectedDirectionRus} | ${State.calculatedData.russiaSelectedCargoRus}: `;
        this.getOfferWhiteDataComponents.tkData.sumTk.text = `Стоимость до: ${city}: `;
        this.getOfferWhiteDataComponents.tkData.sumTotal.text = `Общая стоимость до ${city}: `;
        this.getOfferWhiteDataComponents.tkData.kgTk.unit2 = `$ (до ${city})`;
      } else if (region) {
        this.getOfferWhiteDataComponents.TOTALTK.text = `Стоимость до: ${region} | ${State.calculatedData.selectedDirectionRus} | ${State.calculatedData.russiaSelectedCargoRus}: `;
        this.getOfferWhiteDataComponents.tkData.sumTk.text = `Стоимость до: ${region}: `;
        this.getOfferWhiteDataComponents.tkData.sumTotal.text = `Общая стоимость до ${region}: `;
        this.getOfferWhiteDataComponents.tkData.kgTk.unit2 = `$ (до ${region})`;
      } else {
        this.getOfferWhiteDataComponents.TOTALTK.text = "";
        this.getOfferWhiteDataComponents.tkData.sumTk.text = "";
        this.getOfferWhiteDataComponents.tkData.sumTotal.text = "";
        this.getOfferWhiteDataComponents.tkData.kgTk.unit2 = "";
      }

      this.getOfferWhiteDataComponents.tkData.kgTk.text = `За кг: `;
      this.getOfferWhiteDataComponents.tkData.varyKg.text = `  (цена варьир.)`;
      this.getOfferWhiteDataComponents.tkData.varySum.text = `  (цена варьир.)`;

      this.getOfferWhiteDataComponents.TOTALTK.unit = "₽ ";
      this.getOfferWhiteDataComponents.TOTALTK.unit2 = "$";

      this.getOfferWhiteDataComponents.tkData.sumTk.unit = "₽ ";
      this.getOfferWhiteDataComponents.tkData.sumTk.unit2 = "$";

      this.getOfferWhiteDataComponents.tkData.sumTotal.unit = "₽ ";
      this.getOfferWhiteDataComponents.tkData.sumTotal.unit2 = "$";

      this.getOfferWhiteDataComponents.tkData.kgTk.unit = "₽ ";

      if (directionRussia === "jde") {
        this.getOfferWhiteDataComponents.TOTALTK.value = Math.round(
          state.jde.all.ruble
        );
        this.getOfferWhiteDataComponents.TOTALTK.value2 = state.jde.all.dollar;

        this.getOfferWhiteDataComponents.tkData.kgTk.value = Math.round(
          state.jde.kg.ruble
        );
        this.getOfferWhiteDataComponents.tkData.kgTk.value2 =
          state.jde.kg.dollar;

        this.getOfferWhiteDataComponents.tkData.sumTk.value = Math.round(
          state.jde.all.ruble
        );
        this.getOfferWhiteDataComponents.tkData.sumTk.value2 =
          state.jde.all.dollar;

        this.getOfferWhiteDataComponents.tkData.sumTotal.value = Math.round(
          state.jde.calculated.all[direction].ruble
        );
        this.getOfferWhiteDataComponents.tkData.sumTotal.value2 =
          state.jde.calculated.all[direction].dollar;
      }

      if (directionRussia === "kit") {
        this.getOfferWhiteDataComponents.TOTALTK.value = Math.round(
          state.kit[direction].all.ruble
        );
        this.getOfferWhiteDataComponents.TOTALTK.value2 =
          state.kit[direction].all.dollar;

        this.getOfferWhiteDataComponents.tkData.kgTk.value = Math.round(
          state.kit[direction].kg.ruble
        );
        this.getOfferWhiteDataComponents.tkData.kgTk.value2 =
          state.kit[direction].kg.dollar;

        this.getOfferWhiteDataComponents.tkData.sumTk.value = Math.round(
          state.kit[direction].all.ruble
        );
        this.getOfferWhiteDataComponents.tkData.sumTk.value2 =
          state.kit[direction].all.dollar;

        this.getOfferWhiteDataComponents.tkData.sumTotal.value = Math.round(
          state.kit.calculated.all[direction].ruble
        );
        this.getOfferWhiteDataComponents.tkData.sumTotal.value2 =
          state.kit.calculated.all[direction].dollar;
      }
    } else {
      // Полный сброс если нет грузового направления
      this.getOfferWhiteDataComponents.TOTALTK.text = "";
      this.getOfferWhiteDataComponents.TOTALTK.value = "";
      this.getOfferWhiteDataComponents.TOTALTK.unit = "";
      this.getOfferWhiteDataComponents.TOTALTK.value2 = "";
      this.getOfferWhiteDataComponents.TOTALTK.unit2 = "";

      this.getOfferWhiteDataComponents.tkData.sumTk.text = "";
      this.getOfferWhiteDataComponents.tkData.sumTk.value = "";
      this.getOfferWhiteDataComponents.tkData.sumTk.unit = "";
      this.getOfferWhiteDataComponents.tkData.sumTk.value2 = "";
      this.getOfferWhiteDataComponents.tkData.sumTk.unit2 = "";

      this.getOfferWhiteDataComponents.tkData.sumTotal.text = "";
      this.getOfferWhiteDataComponents.tkData.sumTotal.value = "";
      this.getOfferWhiteDataComponents.tkData.sumTotal.unit = "";
      this.getOfferWhiteDataComponents.tkData.sumTotal.value2 = "";
      this.getOfferWhiteDataComponents.tkData.sumTotal.unit2 = "";

      this.getOfferWhiteDataComponents.tkData.kgTk.text = "";
      this.getOfferWhiteDataComponents.tkData.kgTk.value = "";
      this.getOfferWhiteDataComponents.tkData.kgTk.unit = "";
      this.getOfferWhiteDataComponents.tkData.kgTk.value2 = "";
      this.getOfferWhiteDataComponents.tkData.kgTk.unit2 = "";

      this.getOfferWhiteDataComponents.tkData.varyKg.text = "";
      this.getOfferWhiteDataComponents.tkData.varySum.text = "";
    }
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

      // Если нужно скачать сразу:
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = "Коммерческое предложение.pdf";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

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

export const PdfPrepared = new PdfPrepare();
