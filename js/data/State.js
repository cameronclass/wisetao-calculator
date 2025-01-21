export const State = {
  directionsData: {},

  insuranceRate: 0.02,
  nds: 20,
  whiteCargoRate: 0.6,

  currencyRates: {
    wisetao: {
      dollar: 100,
      yuan: 15,
    },
    cbr: {
      dollar: 100,
      yuan: 15,
    },
  },

  clientData: {
    calcType: "",
    totalCost: "",
    currency: "",
    totalWeight: "",
    totalVolume: "",
    volumeLength: "",
    volumeWidth: "",
    volumeHeight: "",
    quantity: "",
    categoryKey: "",
    packingType: "",
    insurance: "",
    brand: "",
    tnvedInput: "",
    tnvedSelectedName: "",
    tnvedSelectedCode: "",
    tnvedSelectedImp: "",
  },

  tnvedSelection: {
    inputValue: "",
    selectedItem: "",
    chosenCodeImp: "",
  },

  calculatedData: {
    packingType: "",
    selectedDirection: "",
    selectedDirectionRus: "",
    clientCost: {
      dollar: "",
      ruble: "",
      yuan: "",
    },
    dollar: 100,
    yuan: 15,
    density: "",
    auto: {
      calculationMode: "",
      shippingCost: {
        dollar: "",
        ruble: "",
        yuan: "",
      },
      pricePerKg: {
        dollar: "",
        ruble: "",
        yuan: "",
      },
      packagingCost: {
        dollar: "",
        ruble: "",
        yuan: "",
      },

      insuranceCost: {
        dollar: "",
        ruble: "",
        yuan: "",
      },

      cargoCost: {
        dollar: 0,
        ruble: 0,
        yuan: 0,
      },

      declaration: {
        dollar: "",
        ruble: "",
        yuan: "",
      },
      duty: {
        dollar: "",
        ruble: "",
        yuan: "",
      },
      nds: {
        dollar: "",
        ruble: "",
        yuan: "",
      },
      customsCost: {
        dollar: 0,
        ruble: 0,
        yuan: 0,
      },

      totalCost: {
        dollar: 0,
        ruble: 0,
        yuan: 0,
      },
    },
    train: {
      calculationMode: "",
      shippingCost: {
        dollar: "",
        ruble: "",
        yuan: "",
      },
      pricePerKg: {
        dollar: "",
        ruble: "",
        yuan: "",
      },
      packagingCost: {
        dollar: "",
        ruble: "",
        yuan: "",
      },
      insuranceCost: {
        dollar: "",
        ruble: "",
        yuan: "",
      },

      cargoCost: {
        dollar: "",
        ruble: "",
        yuan: "",
      },

      declaration: {
        dollar: "",
        ruble: "",
        yuan: "",
      },
      duty: {
        dollar: "",
        ruble: "",
        yuan: "",
      },
      nds: {
        dollar: "",
        ruble: "",
        yuan: "",
      },
      customsCost: {
        dollar: "",
        ruble: "",
        yuan: "",
      },

      totalCost: {
        dollar: "",
        ruble: "",
        yuan: "",
      },
    },
    avia: {
      calculationMode: "",
      shippingCost: {
        dollar: "",
        ruble: "",
        yuan: "",
      },
      pricePerKg: {
        dollar: "",
        ruble: "",
        yuan: "",
      },
      packagingCost: {
        dollar: "",
        ruble: "",
        yuan: "",
      },
      insuranceCost: {
        dollar: "",
        ruble: "",
        yuan: "",
      },
      cargoCost: {
        dollar: "",
        ruble: "",
        yuan: "",
      },

      declaration: {
        dollar: "",
        ruble: "",
        yuan: "",
      },
      duty: {
        dollar: "",
        ruble: "",
        yuan: "",
      },
      nds: {
        dollar: "",
        ruble: "",
        yuan: "",
      },
      customsCost: {
        dollar: "",
        ruble: "",
        yuan: "",
      },

      totalCost: {
        dollar: "",
        ruble: "",
        yuan: "",
      },
    },
  },

  address: {
    city: "",
    region: "",
    country: "",
    lat: 0,
    lon: 0,
  },

  jde: {
    kg: {
      dollar: "",
      ruble: "",
    },
    all: {
      dollar: "",
      ruble: "",
    },
    calculated: {
      kg: {},
      all: {},
    },
  },
};
