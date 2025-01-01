// project/src/data/State.js
export const State = {
  directionsData: {},

  tnvedSelection: {
    selectedItem: null,
    inputValue: "",
    chosenCodeImp: 10, // пусть по умолчанию 10
  },

  cbrRates: {
    dollar: 100,
    yuan: 14,
  },

  setDirectionData(direction, data) {
    this.directionsData[direction] = data;
  },

  getDirectionData(direction) {
    return this.directionsData[direction] || null;
  },

  updateRates(dollar, yuan) {
    this.cbrRates.dollar = dollar;
    this.cbrRates.yuan = yuan;
  },
};
