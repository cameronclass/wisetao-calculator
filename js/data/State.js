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
    addressCheck: false,
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
  kit: {
    from_msk: "770000000000",
    from_blv: "280000100000",
    /*
    https://api-calc.wisetao.com:4343/api/calculate-kit-delivery?Content-Type=application/json&Accept=application/json
    {
    "city_pickup_code": "770000000000",
    "city_delivery_code": "250000100000",
    "price": 40000,
    "total_weight": 20,
    "total_volume": 1,
    "count": 1,
    "dollar": 100
}
    */
  },
};
