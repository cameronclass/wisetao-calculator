// UiRenderer.js
import { State } from "../data/State.js";

export class UiRenderer {
  constructor() {
    this.packingMap = {
      std_pack: "Стандартная упаковка",
      pack_corner: "Упаковка с углами",
      wood_crate: "Деревянная обрешетка",
      tri_frame: "Треугольная деревянная рама",
      wood_pallet: "Деревянный поддон",
      pallet_water: "Поддон с водонепроницаемой упаковкой",
      wood_boxes: "Деревянные коробки",
    };
  }

  renderAll() {
    this.renderCurrency();
    this.renderDirection("auto", ".result_auto");
    this.renderDirection("train", ".result_train");
    this.renderDirection("avia", ".result_avia");
  }

  renderCurrency() {
    const dollarInput = document.querySelector(".js-currency-dollar");
    const yuanInput = document.querySelector(".js-currency-yuan");
    if (dollarInput) {
      dollarInput.value = State.calculatedData.dollar;
    }
    if (yuanInput) {
      yuanInput.value = State.calculatedData.yuan;
    }
  }

  renderDirection(directionKey, containerSelector) {
    const calcType = State.clientData.calcType || "calc-cargo";
    const dirData = State.calculatedData[directionKey];
    if (!dirData) return;

    const containerEl = document.querySelector(containerSelector);
    if (!containerEl) return;

    const priceCells = containerEl.querySelectorAll(".price-cell");
    if (!priceCells.length) return;

    priceCells.forEach((priceCell) => {
      const priceBlock = priceCell.querySelector(
        ".main-calc-result__price_block"
      );
      const tooltipEl = priceCell.querySelector(
        ".overflow-info .main-calc-result-tooltip"
      );
      if (!priceBlock || !tooltipEl) return;

      // 1) Заполняем «За КГ» (.calculate-result__kg, .calculate-result__kg_ruble)
      const kgDollarEl = priceBlock.querySelector(".calculate-result__kg");
      const kgRubleEl = priceBlock.querySelector(".calculate-result__kg_ruble");
      if (kgDollarEl) kgDollarEl.textContent = dirData.pricePerKg.dollar;
      if (kgRubleEl) kgRubleEl.textContent = dirData.pricePerKg.ruble;

      // 2) Определяем, что показывать в «Сумма:»
      let finalDollar, finalRuble;
      if (calcType === "calc-cargo") {
        finalDollar = dirData.cargoCost.dollar;
        finalRuble = dirData.cargoCost.ruble;
      } else {
        finalDollar = dirData.totalCost.dollar;
        finalRuble = dirData.totalCost.ruble;
      }
      const dollarEl = priceBlock.querySelector(".calculate-result__dollar");
      const rubleEl = priceBlock.querySelector(".calculate-result__ruble");
      if (dollarEl) dollarEl.textContent = finalDollar;
      if (rubleEl) rubleEl.textContent = finalRuble;

      // --- Tooltip ---
      // main-calc-result-tooltip__title
      const tooltipTitleEl = tooltipEl.querySelector(
        ".main-calc-result-tooltip__title"
      );
      if (tooltipTitleEl) {
        tooltipTitleEl.textContent =
          calcType === "calc-cargo"
            ? "Перевозка из Китая в г. Москва “Южные ворота”"
            : "Перевозка из Китая в г.Благовещенск СВХ";
      }

      // ._number._ruble -> State.calculatedData.dollar, ._number._yuan -> State.calculatedData.yuan
      const rubleSpan = tooltipEl.querySelector("._number._ruble");
      const yuanSpan = tooltipEl.querySelector("._number._yuan");
      if (rubleSpan) rubleSpan.textContent = State.calculatedData.dollar + "₽";
      if (yuanSpan) yuanSpan.textContent = State.calculatedData.yuan + "₽";

      // ._packing -> State.clientData.packingType => this.packingMap
      const packingEl = tooltipEl.querySelector("._packing");
      if (packingEl) {
        const pt = State.clientData.packingType;
        packingEl.textContent = this.packingMap[pt] || "Без упаковки";
      }

      // ._pack-dollar, ._pack-ruble => dirData.packagingCost
      const packDollarEl = tooltipEl.querySelector("._pack-dollar");
      const packRubleEl = tooltipEl.querySelector("._pack-ruble");
      if (packDollarEl)
        packDollarEl.textContent = dirData.packagingCost.dollar + "$";
      if (packRubleEl)
        packRubleEl.textContent = dirData.packagingCost.ruble + "₽";

      // ._insurance-dollar, ._insurance-ruble => dirData.insuranceCost
      const insDollarEl = tooltipEl.querySelector("._insurance-dollar");
      const insRubleEl = tooltipEl.querySelector("._insurance-ruble");
      const insFromEl = tooltipEl.querySelector("._insurance-from");
      if (insDollarEl)
        insDollarEl.textContent = dirData.insuranceCost.dollar + "$";
      if (insRubleEl)
        insRubleEl.textContent = dirData.insuranceCost.ruble + "₽";
      if (insFromEl) {
        const totalCost = Math.round(State.clientData.totalCost);
        const currency = State.clientData.currency;
        let currencySymbol;

        // Определяем символ валюты
        switch (currency) {
          case "dollar":
            currencySymbol = "$";
            break;
          case "yuan":
            currencySymbol = "¥";
            break;
          case "ruble":
            currencySymbol = "₽";
            break;
          default:
            currencySymbol = ""; // Если валюта не распознана, оставляем пустым
        }

        insFromEl.textContent = `(от ${totalCost}${currencySymbol})`;
      }

      // ._kg-dollar, ._kg-ruble => dirData.pricePerKg
      const kgDollarTipEl = tooltipEl.querySelector("._kg-dollar");
      const kgRubleTipEl = tooltipEl.querySelector("._kg-ruble");
      if (kgDollarTipEl)
        kgDollarTipEl.textContent = dirData.pricePerKg.dollar + "$";
      if (kgRubleTipEl)
        kgRubleTipEl.textContent = dirData.pricePerKg.ruble + "₽";

      // ._all-cargo-dollar, ._all-cargo-ruble => dirData.cargoCost
      const cargoDollarEl = tooltipEl.querySelector("._all-cargo-dollar");
      const cargoRubleEl = tooltipEl.querySelector("._all-cargo-ruble");
      if (cargoDollarEl)
        cargoDollarEl.textContent = dirData.cargoCost.dollar + "$";
      if (cargoRubleEl)
        cargoRubleEl.textContent = dirData.cargoCost.ruble + "₽";

      // Если calc-customs => активируем .main-calc-result-tooltip__white
      const whiteBlock = tooltipEl.querySelector(
        ".main-calc-result-tooltip__white"
      );
      if (whiteBlock) {
        if (calcType === "calc-customs") {
          whiteBlock.classList.add("active");
        } else {
          whiteBlock.classList.remove("active");
        }
      }

      if (calcType === "calc-customs") {
        // Пошлина, НДС, декларация, etc.
        const chosenImpEl = tooltipEl.querySelector("._chosen-imp");
        const chosenImpDollarEl = tooltipEl.querySelector(
          "._chosen-imp-dollar"
        );
        const chosenImpRubleEl = tooltipEl.querySelector("._chosen-imp-ruble");
        if (chosenImpEl)
          chosenImpEl.textContent = State.clientData.tnvedSelectedImp + "%";
        if (chosenImpDollarEl)
          chosenImpDollarEl.textContent = dirData.duty.dollar + "$";
        if (chosenImpRubleEl)
          chosenImpRubleEl.textContent = dirData.duty.ruble + "₽";

        const ndsEl = tooltipEl.querySelector("._nds");
        const ndsDollarEl = tooltipEl.querySelector("._nds-dollar");
        const ndsRubleEl = tooltipEl.querySelector("._nds-ruble");
        if (ndsEl) {
          if (State.nds >= 0 && State.nds <= 1) {
            ndsEl.textContent = (State.nds * 100).toFixed(0) + "%"; // Умножаем на 100 и округляем до
          }
        }
        if (ndsDollarEl) ndsDollarEl.textContent = dirData.nds.dollar + "$";
        if (ndsRubleEl) ndsRubleEl.textContent = dirData.nds.ruble + "₽";

        /* const declDollarEl = tooltipEl.querySelector("._decloration-dollar");
        const declRubleEl = tooltipEl.querySelector("._decloration-ruble");
        if (declDollarEl)
          declDollarEl.textContent = dirData.declaration.dollar + "$";
        if (declRubleEl)
          declRubleEl.textContent = dirData.declaration.ruble + "₽"; */

        const allWhiteDollarEl = tooltipEl.querySelector("._all-white-dollar");
        const allWhiteRubleEl = tooltipEl.querySelector("._all-white-ruble");
        if (allWhiteDollarEl)
          allWhiteDollarEl.textContent = dirData.customsCost.dollar + "$";
        if (allWhiteRubleEl)
          allWhiteRubleEl.textContent = dirData.customsCost.ruble + "₽";

        const allCalculatedDollarEl = tooltipEl.querySelector(
          "._all-calculated-price-dollar"
        );
        const allCalculatedRubleEl = tooltipEl.querySelector(
          "._all-calculated-price-ruble"
        );
        if (allCalculatedDollarEl)
          allCalculatedDollarEl.textContent = dirData.totalCost.dollar + "$";
        if (allCalculatedRubleEl)
          allCalculatedRubleEl.textContent = dirData.totalCost.ruble + "₽";
      }
    });
  }
}
