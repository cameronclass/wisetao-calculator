// Calculator.js
import { State } from "../data/State.js";

export class Calculator {
  runBaseLogic() {
    const cd = State.clientData;
    const calcType = cd.calcType || "calc-cargo";

    let usedDollarRate, usedYuanRate;
    if (calcType === "calc-cargo") {
      usedDollarRate = parseFloat(State.currencyRates.wisetao.dollar) || 0;
      usedYuanRate = parseFloat(State.currencyRates.wisetao.yuan) || 0;
    } else {
      usedDollarRate = parseFloat(State.currencyRates.cbr.dollar) || 0;
      usedYuanRate = parseFloat(State.currencyRates.cbr.yuan) || 0;
    }

    State.calculatedData.dollar = usedDollarRate;
    State.calculatedData.yuan = usedYuanRate;

    const costUser = parseFloat(cd.totalCost);
    const userCur = cd.currency;
    const costInDollar = this.convertToDollar(
      costUser,
      userCur,
      usedDollarRate,
      usedYuanRate
    );
    State.calculatedData.clientCost.dollar = Number(costInDollar.toFixed(2));
    State.calculatedData.clientCost.ruble = Number(
      (costInDollar.toFixed(2) * usedDollarRate.toFixed(2)).toFixed(2)
    );
    State.calculatedData.clientCost.yuan = Number(
      (
        State.calculatedData.clientCost.ruble.toFixed(2) /
        usedYuanRate.toFixed(2)
      ).toFixed(2)
    );

    const quantity = parseFloat(cd.quantity) || 1;
    let volume = parseFloat(cd.totalVolume) || 0;
    let weight = parseFloat(cd.totalWeight) || 0;

    if (cd.quantity_check) {
      volume *= quantity;
      weight *= quantity;
    }

    const dens = this.calculateDensity(weight, volume);
    State.calculatedData.density = dens !== null ? Number(dens.toFixed(2)) : 0;
  }

  runShippingLogic() {
    const cd = State.clientData;
    const calcType = cd.calcType || "calc-cargo";
    const weight = parseFloat(cd.totalWeight) || 0;
    const volume = parseFloat(cd.totalVolume) || 0;
    const density = State.calculatedData.density || 0;
    const categoryKey = cd.categoryKey || "";
    const isBrand = !!cd.brand;
    const directions = ["auto", "train", "avia"];

    directions.forEach((dir) => {
      // 1) Расчёт shipping
      if (calcType === "calc-customs") {
        this.calculateShippingCustoms(dir, weight);
      } else {
        this.calculateShippingCargo(
          dir,
          categoryKey,
          density,
          weight,
          volume,
          isBrand
        );
      }

      // 2) PackagingCost
      const packingType = cd.packingType;
      const packagingDollar = this.calculatePackagingDollar(
        packingType,
        volume,
        cd.quantity
      );
      this.updatePackagingInState(dir, packagingDollar);

      // 3) InsuranceCost
      const shippingDollar = State.calculatedData[dir].shippingCost.dollar || 0;
      const goodsDollar = State.calculatedData.clientCost.dollar || 0;
      const insuranceDollar = this.calculateInsuranceDollar(
        shippingDollar,
        goodsDollar,
        !!cd.insurance
      );
      this.updateInsuranceInState(dir, insuranceDollar);

      // 4) CargoCost = shipping + packaging + insurance
      const cargoDollar = shippingDollar + packagingDollar + insuranceDollar;
      this.updateCargoCostInState(dir, cargoDollar);
    });

    // Если customs — считаем таможенные расходы
    if (calcType === "calc-customs") {
      this.runCustomsLogic();
    }
  }

  runCustomsLogic() {
    const directions = ["auto", "train", "avia"];
    const costInDollar = State.calculatedData.clientCost.dollar;
    const dutyValuePct = parseFloat(State.clientData.tnvedSelectedImp);
    const cbrRateDollar = State.calculatedData.dollar;
    const cbrRateYuan = State.calculatedData.yuan;

    // Для каждого направления считаем таможенные расходы
    directions.forEach((dir) => {
      const cargoDollar = State.calculatedData[dir].cargoCost.dollar;
      const { dutyDollar, ndsDollar, decDollar, totalCustomsDollar } =
        this.calculateCustomsCost(
          costInDollar,
          dutyValuePct,
          cbrRateDollar,
          cbrRateYuan
        );

      // Запишем по отдельности
      this.updateCustomsInState(dir, {
        dutyDollar,
        ndsDollar,
        decDollar,
        customsDollar: totalCustomsDollar,
      });

      // totalCost = cargoCost + totalCustomsDollar
      const finalTotal = cargoDollar + totalCustomsDollar;
      this.updateTotalCostInState(dir, finalTotal);
    });
  }

  updateTotalCostInState(dir, finalDollar) {
    const dRate = State.calculatedData.dollar;
    const yRate = State.calculatedData.yuan;

    const totalRub = finalDollar * dRate;
    const totalYuan = finalDollar * yRate;

    State.calculatedData[dir].totalCost.dollar = Number(finalDollar.toFixed(2));
    State.calculatedData[dir].totalCost.ruble = Math.round(totalRub.toFixed(2));
    State.calculatedData[dir].totalCost.yuan = Number(totalYuan.toFixed(2));
  }

  // ------------------ SHIPPING ------------------
  calculateShippingCustoms(direction, weight) {
    let pricePerKgDollar;

    // Проверяем вес и устанавливаем цену за кг
    if (weight >= 2500) {
      pricePerKgDollar = 0.25;
    } else {
      pricePerKgDollar = 0.6;
    }

    const costDollar = weight * pricePerKgDollar;
    const calcMode = "weight";

    this.updateShippingInState(direction, {
      calculationMode: calcMode,
      shippingDollar: costDollar,
      pricePerKgDollar,
    });
  }

  calculateShippingCargo(
    direction,
    categoryKey,
    density,
    weight,
    volume,
    isBrand
  ) {
    try {
      const { cost, pricePerKg, calculationMode } =
        this.calculateShippingCostForDirection(
          direction,
          categoryKey,
          density,
          weight,
          volume,
          isBrand
        );
      this.updateShippingInState(direction, {
        calculationMode,
        shippingDollar: cost,
        pricePerKgDollar: pricePerKg,
      });
    } catch (err) {
      console.error("Ошибка при расчёте карго:", err.message);
      this.updateShippingInState(direction, {
        calculationMode: "",
        shippingDollar: 0,
        pricePerKgDollar: 0,
      });
    }
  }

  calculateShippingCostForDirection(
    direction,
    categoryKey,
    density,
    weight,
    volume,
    isBrand
  ) {
    const dirData = this.getDirectionData(direction);
    if (!dirData) {
      throw new Error(`Нет данных для направления "${direction}"`);
    }

    let rangeData, calcMode;
    if (direction === "train") {
      rangeData = dirData.find((rd) => {
        const [min, max] = rd.weight_range
          .split("-")
          .map((v) => (v === "" ? Infinity : parseFloat(v)));
        return density >= min && density <= max;
      });
      calcMode = density > 200 ? "weight" : "volume";
    } else {
      let catData;
      if (direction === "avia") {
        catData =
          dirData.find((cat) => cat.category_key === categoryKey) ||
          dirData.find((cat) => cat.category_key === "others");
      } else {
        catData = dirData.find((cat) => cat.category_key === categoryKey);
      }
      if (!catData) {
        throw new Error(
          `Категория "${categoryKey}" не найдена для "${direction}"`
        );
      }
      rangeData = catData.data.find((rd) => {
        const [min, max] = rd.weight_range
          .split("-")
          .map((v) => (v === "" ? Infinity : parseFloat(v)));
        return density >= min && density <= max;
      });
      calcMode = density > 100 ? "weight" : "volume";
    }

    if (!rangeData) {
      throw new Error(
        `Не найден подходящий тариф для "${direction}", плотность: ${density}`
      );
    }

    let basePrice = parseFloat(rangeData.price_kg) || 0;
    if (isBrand) {
      if (direction === "train") {
        basePrice += density > 200 ? 0.5 : 50;
      } else {
        basePrice += density > 100 ? 0.5 : 50;
      }
    }

    let costDollar, pricePerKgDollar;
    if (calcMode === "weight") {
      costDollar = basePrice * weight;
      pricePerKgDollar = costDollar / (weight || 1);
    } else {
      costDollar = basePrice * volume;
      pricePerKgDollar = costDollar / (weight || 1);
    }

    return {
      cost: costDollar,
      pricePerKg: pricePerKgDollar,
      calculationMode: calcMode,
    };
  }

  getDirectionData(direction) {
    const categories = State.directionsData?.categories;
    if (!categories) {
      throw new Error("State.directionsData.categories не найдено");
    }
    return categories[direction] || null;
  }

  updateShippingInState(
    direction,
    { calculationMode, shippingDollar, pricePerKgDollar }
  ) {
    const dRate = State.calculatedData.dollar || 0;
    const yRate = State.calculatedData.yuan || 0;

    const shippingRub = shippingDollar * dRate;
    const shippingYuan = shippingDollar * yRate;
    const priceRub = pricePerKgDollar * dRate;
    const priceYuan = pricePerKgDollar * yRate;

    State.calculatedData[direction].calculationMode = calculationMode;

    State.calculatedData[direction].shippingCost.dollar = Number(
      shippingDollar.toFixed(2)
    );
    State.calculatedData[direction].shippingCost.ruble = Math.round(
      shippingRub.toFixed(2)
    );
    State.calculatedData[direction].shippingCost.yuan = Number(
      shippingYuan.toFixed(2)
    );

    State.calculatedData[direction].pricePerKg.dollar = Number(
      pricePerKgDollar.toFixed(2)
    );
    State.calculatedData[direction].pricePerKg.ruble = Math.round(
      priceRub.toFixed(2)
    );
    State.calculatedData[direction].pricePerKg.yuan = Number(
      priceYuan.toFixed(2)
    );
  }

  // ================== PACKAGING ==================
  calculatePackagingDollar(packingType, volume, quantity) {
    const packArr = State.directionsData?.packaging_prices;
    if (!Array.isArray(packArr)) {
      console.error("packaging_prices не найдены в State.directionsData");
      return 0;
    }

    // Проверка на null или undefined для packingType
    if (packingType === null || packingType === undefined) {
      State.calculatedData.packingType = "Без упаковки";
      return 0;
    }

    const packaging = packArr.find((p) => p.type === packingType);
    if (!packaging) {
      console.error("Не найдена упаковка:", packingType);
      return 0;
    }

    const stdPack = packArr.find((p) => p.type === "std_pack");
    if (!stdPack) {
      console.error("Не найдена упаковка std_pack");
      return 0;
    }

    const qty = parseInt(quantity || 1, 10);
    const vol = parseFloat(volume || 0);

    let mainCost;
    if (packaging.which === "place") {
      mainCost = packaging.price * qty;
    } else {
      mainCost = packaging.price * vol;
    }

    let stdCost;
    if (stdPack.which === "place") {
      stdCost = stdPack.price * qty;
    } else {
      stdCost = stdPack.price * vol;
    }

    // Присваиваем значение в State.calculatedData.packingType
    const packingTypeMap = {
      std_pack: "Стандартная упаковка (скотч и мешок)",
      pack_corner: "Упаковка с углами",
      wood_crate: "Деревянная обрешетка",
      tri_frame: "Треугольная деревянная рама",
      wood_pallet: "Деревянный поддон",
      pallet_water: "Поддон с водонепроницаемой упаковкой",
      wood_boxes: "Деревянные коробки",
    };

    State.calculatedData.packingType =
      packingTypeMap[packingType] || "Неизвестный тип упаковки";

    if (packingType === "std_pack") {
      return mainCost;
    }
    return mainCost + stdCost;
  }

  updatePackagingInState(direction, packagingDollar) {
    const dRate = State.calculatedData.dollar;
    const yRate = State.calculatedData.yuan;

    const packagingRub = packagingDollar * dRate;
    const packagingYuan = packagingDollar * yRate;

    State.calculatedData[direction].packagingCost.dollar = Number(
      packagingDollar.toFixed(2)
    );
    State.calculatedData[direction].packagingCost.ruble = Math.round(
      packagingRub.toFixed(2)
    );
    State.calculatedData[direction].packagingCost.yuan = Number(
      packagingYuan.toFixed(2)
    );
  }

  // ================== INSURANCE ==================
  calculateInsuranceDollar(shippingDollar, goodsDollar, insuranceChecked) {
    const rate = State.insuranceRate || 0.02;
    if (!insuranceChecked) return 0;
    return (shippingDollar + goodsDollar) * rate;
  }

  updateInsuranceInState(direction, insuranceDollar) {
    const dRate = State.calculatedData.dollar;
    const yRate = State.calculatedData.yuan;

    const insRub = insuranceDollar * dRate;
    const insYuan = insuranceDollar * yRate;

    State.calculatedData[direction].insuranceCost.dollar = Number(
      insuranceDollar.toFixed(2)
    );
    State.calculatedData[direction].insuranceCost.ruble = Math.round(
      insRub.toFixed(2)
    );
    State.calculatedData[direction].insuranceCost.yuan = Number(
      insYuan.toFixed(2)
    );
  }

  // ================== CARGO COST ==================
  updateCargoCostInState(direction, cargoDollar) {
    const dRate = State.calculatedData.dollar;
    const yRate = State.calculatedData.yuan;

    const cargoRub = cargoDollar * dRate;
    const cargoYuan = cargoDollar * yRate;

    State.calculatedData[direction].cargoCost.dollar = Number(
      cargoDollar.toFixed(2)
    );
    State.calculatedData[direction].cargoCost.ruble = Math.round(
      cargoRub.toFixed(2)
    );
    State.calculatedData[direction].cargoCost.yuan = Number(
      cargoYuan.toFixed(2)
    );
  }

  // ================== CUSTOMS COST ==================
  calculateCustomsCost(costInDollar, dutyValuePct, cbrRateDollar, cbrRateYuan) {
    // 1) Пошлина
    const dutyDollar = (dutyValuePct / 100) * costInDollar;

    // 2) НДС
    const sumWithDuty = costInDollar + dutyDollar;
    const ndsDollar = sumWithDuty * State.nds;

    // 3) Декларация (550 юаней => доллары)
    // decDollar = (550 * cbrRateYuan) / cbrRateDollar
    const decDollar = (550 * cbrRateYuan) / cbrRateDollar;

    // 4) Всего таможня ( duty + nds + dec ) минус «исходная сумма»?
    // Но классически: totalCustomsDollar = (costInDollar + duty + nds + dec) - costInDollar
    const totalCustomsDollar =
      costInDollar + dutyDollar + ndsDollar /* + decDollar */ - costInDollar;

    return {
      dutyDollar,
      ndsDollar,
      decDollar,
      totalCustomsDollar,
    };
  }

  updateCustomsInState(
    dir,
    { dutyDollar, ndsDollar, decDollar, customsDollar }
  ) {
    const dRate = State.calculatedData.dollar || 100;
    const yRate = State.calculatedData.yuan || 15;

    const dutyRub = dutyDollar * dRate;
    const dutyYuan = dutyDollar * yRate;

    const ndsRub = ndsDollar * dRate;
    const ndsYuan = ndsDollar * yRate;

    const decRub = decDollar * dRate;
    const decYuan = decDollar * yRate;

    const customsRub = customsDollar * dRate;
    const customsYuan = customsDollar * yRate;

    State.calculatedData[dir].duty.dollar = Number(dutyDollar.toFixed(2));
    State.calculatedData[dir].duty.ruble = Math.round(dutyRub.toFixed(2));
    State.calculatedData[dir].duty.yuan = Number(dutyYuan.toFixed(2));

    State.calculatedData[dir].nds.dollar = Number(ndsDollar.toFixed(2));
    State.calculatedData[dir].nds.ruble = Math.round(ndsRub.toFixed(2));
    State.calculatedData[dir].nds.yuan = Number(ndsYuan.toFixed(2));

    State.calculatedData[dir].declaration.dollar = Number(decDollar.toFixed(2));
    State.calculatedData[dir].declaration.ruble = Math.round(decRub.toFixed(2));
    State.calculatedData[dir].declaration.yuan = Number(decYuan.toFixed(2));

    State.calculatedData[dir].customsCost.dollar = Number(
      customsDollar.toFixed(2)
    );
    State.calculatedData[dir].customsCost.ruble = Math.round(
      customsRub.toFixed(2)
    );
    State.calculatedData[dir].customsCost.yuan = Number(customsYuan.toFixed(2));
  }

  // ================== UTILS ==================
  convertToDollar(amount, cur, dollarRate, yuanRate) {
    if (!dollarRate || dollarRate <= 0) dollarRate = 100;
    if (!yuanRate || yuanRate <= 0) yuanRate = 15;
    if (cur === "ruble") return amount / dollarRate;
    if (cur === "yuan") return (amount * yuanRate) / dollarRate;
    return amount;
  }

  calculateDensity(weight, volume) {
    if (volume <= 0) {
      console.error("Объём должен быть больше нуля");
      return null;
    }
    return weight / volume;
  }
}
