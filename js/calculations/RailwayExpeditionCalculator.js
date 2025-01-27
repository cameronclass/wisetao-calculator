import { State } from "../data/State.js";

const CALC_TYPE_COORDINATES = {
  "calc-cargo": {
    lat: State.jde_from_msk.lat,
    lon: State.jde_from_msk.lon,
  },
  "calc-customs": {
    lat: State.jde_from_blv.lat,
    lon: State.jde_from_blv.lon,
  },
};

const DIRECTIONS = [
  { name: "auto", className: "result_auto" },
  { name: "train", className: "result_train" },
  { name: "avia", className: "result_avia" },
];

const DEFAULT_COORDINATES = {
  lat: State.jde_from_msk.lat,
  lon: State.jde_from_msk.lon,
};

class RailwayExpeditionCalculator {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
  }

  getCoordinates(calcType) {
    return CALC_TYPE_COORDINATES[calcType] || DEFAULT_COORDINATES;
  }

  async calculate() {
    if (!this.validateAddressCoordinates()) return;

    try {
      this.setLoading(true);
      const response = await this.fetchCalculation();
      this.processApiResponse(response);
      this.updateDirectionResults();
    } catch (error) {
      this.handleError(error);
    } finally {
      this.setLoading(false);
    }
  }

  validateAddressCoordinates() {
    if (!State.address?.lat || !State.address?.lon) {
      this.showNotification("Пожалуйста, укажите адрес доставки.");
      return false;
    }
    return true;
  }

  buildRequestData() {
    const { lat: lat_from, lon: lon_from } = this.getCoordinates(
      State.clientData.calcType
    );

    return {
      dollar_rate: State.calculatedData.dollar,
      from: "Москва",
      to: "Москва",
      lat_from,
      lon_from,
      lat_to: State.address.lat,
      lon_to: State.address.lon,
      total_volume: State.clientData.totalVolume,
      total_weight: State.clientData.totalWeight,
      count: State.clientData.quantity,
    };
  }

  async fetchCalculation() {
    const requestData = this.buildRequestData();
    const missingFields = this.validateRequestData(requestData);

    if (missingFields.length > 0) {
      throw new Error(`Missing fields: ${missingFields.join(", ")}`);
    }

    const queryString = new URLSearchParams(requestData).toString();
    const response = await fetch(`${this.apiUrl}?${queryString}`);

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    return response.json();
  }

  validateRequestData(data) {
    return Object.entries(data)
      .filter(([_, value]) => !value)
      .map(([key]) => key);
  }

  processApiResponse(result) {
    if (
      !result.cost_price?.auto_regular ||
      !result.sum_cost_price?.auto_regular
    ) {
      throw new Error("Invalid API response format");
    }

    const dollarRate = State.calculatedData.dollar;
    const costPrice = Number(result.cost_price.auto_regular);
    const sumCostPrice = Number(result.sum_cost_price.auto_regular);

    State.jde = this.calculateStateValues(costPrice, sumCostPrice, dollarRate);
  }

  calculateStateValues(costPrice, sumCostPrice, dollarRate) {
    return {
      kg: this.calculateCurrencyValues(costPrice, dollarRate),
      all: this.calculateCurrencyValues(sumCostPrice, dollarRate),
      calculated: {},
    };
  }

  calculateCurrencyValues(value, rate) {
    return {
      dollar: Number(value.toFixed(2)),
      ruble: Number((value * rate).toFixed(2)),
    };
  }

  updateDirectionResults() {
    DIRECTIONS.forEach((direction) => {
      const jdeElement = document.querySelector(`.${direction.className} .jde`);
      if (!jdeElement) return;

      const elements = this.getDirectionElements(jdeElement);
      const calculatedValues = this.calculateDirectionValues(direction.name);

      this.updateStateWithCalculatedValues(direction.name, calculatedValues);
      this.updateDomElements(elements, calculatedValues);

      this.toggleDirectionVisibility(jdeElement, direction.name);
    });
  }

  getDirectionElements(container) {
    return {
      kgDollar: container.querySelector(".calculate-result__kg"),
      kgRuble: container.querySelector(".calculate-result__kg_ruble"),
      allDollar: container.querySelector(".calculate-result__dollar"),
      allRuble: container.querySelector(".calculate-result__ruble"),
      tooltipDollar: container.querySelector("._jde_dollar"),
      tooltipRuble: container.querySelector("._jde_ruble"),
      allDollarTooltip: container.querySelector("._jde_all_dollar"),
      allRubleTooltip: container.querySelector("._jde_all_ruble"),
      everythingDollar: container.querySelector("._everything_price_dollar"),
      everythingRuble: container.querySelector("._everything_price_ruble"),
    };
  }

  calculateDirectionValues(direction) {
    const pricePerKg = State.calculatedData[direction]?.pricePerKg?.dollar || 0;
    const allCargo = State.calculatedData[direction]?.cargoCost?.dollar || 0;
    const allCustoms =
      State.calculatedData[direction]?.customsCost?.dollar || 0;
    const dollarRate = State.calculatedData.dollar || 0;

    return {
      kgDollar: State.jde.kg.dollar + pricePerKg,
      kgRuble: (State.jde.kg.dollar + pricePerKg) * dollarRate,
      allDollar: State.jde.all.dollar + allCargo + allCustoms,
      allRuble: (State.jde.all.dollar + allCargo + allCustoms) * dollarRate,
    };
  }

  updateStateWithCalculatedValues(direction, values) {
    State.jde.calculated.kg = {
      ...State.jde.calculated.kg,
      [direction]: this.formatCalculatedValues(values.kgDollar, values.kgRuble),
    };

    State.jde.calculated.all = {
      ...State.jde.calculated.all,
      [direction]: this.formatCalculatedValues(
        values.allDollar,
        values.allRuble
      ),
    };
  }

  formatCalculatedValues(dollar, ruble) {
    return {
      dollar: Number(dollar.toFixed(2)),
      ruble: Number(ruble.toFixed(2)),
    };
  }

  updateDomElements(elements, values) {
    const format = (value, symbol) =>
      value ? `${value.toFixed(2)}${symbol}` : `0${symbol}`;

    elements.kgDollar.textContent = format(values.kgDollar, "$");
    elements.kgRuble.textContent = format(values.kgRuble, "₽");
    elements.allDollar.textContent = format(values.allDollar, "$");
    elements.allRuble.textContent = format(values.allRuble, "₽");

    elements.tooltipDollar.textContent = format(State.jde.kg.dollar, "$");
    elements.tooltipRuble.textContent = format(State.jde.kg.ruble, "₽");
    elements.allDollarTooltip.textContent = format(State.jde.all.dollar, "$");
    elements.allRubleTooltip.textContent = format(State.jde.all.ruble, "₽");
    elements.everythingDollar.textContent = format(values.allDollar, "$");
    elements.everythingRuble.textContent = format(values.allRuble, "₽");
  }

  toggleDirectionVisibility(element, direction) {
    const shouldBeOff = direction !== "auto";
    element.classList.toggle("_off", shouldBeOff);
  }

  setLoading(isLoading) {
    document.querySelectorAll(".jde").forEach((el) => {
      el.classList.toggle("_load", isLoading);
      el.querySelector(".loader")?.classList.toggle("_load", isLoading);
    });
  }

  handleError(error) {
    console.error("Calculation error:", error);
    this.showNotification("Ошибка при расчете доставки. Попробуйте позже.");
    document.querySelectorAll(".jde").forEach((el) => el.classList.add("_off"));
  }

  showNotification(message) {
    console.log(message);
  }
}

export default RailwayExpeditionCalculator;
