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
    name: "",
    phone: "",
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
    addressCheck: false,
    deliveryOption: null,
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
    russiaSelectedCargo: "",
    russiaSelectedCargoRus: "",
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

  address: null,
  addressError: null,
  jde_from_msk: {
    lat: 55.621761,
    lon: 37.786385,
  },
  jde_from_blv: {
    lat: 50.29287,
    lon: 127.54059,
  },
  jde: {},

  kit_from_msk: "770000000000",
  kit_from_blv: "280000100000",
  kit: {},
};
