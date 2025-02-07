// CalculatorApp.js
import { Calculator } from "./Calculator.js";
import { CONFIG } from "../data/config.js";
import { State } from "../data/State.js";
import { UiRenderer } from "../ui/UiRenderer.js";
import RailwayExpeditionCalculator from "./RailwayExpeditionCalculator.js";
import KitDeliveryCalculator from "./KitDeliveryCalculator.js";
import { Currency } from "../api/Currency.js";
import { DataProvider } from "../data/DataProvider.js";
import { TnvedManager } from "../api/TnvedManager.js";
import PriceSelector from "./PriceSelector.js";
import RedeemManager from "../data/RedeemManager.js";
import FormValidation from "../calculations/FormValidation.js";

export class CalculatorApp {
  constructor(fields) {
    this.fields = fields;
    this.formValidation = new FormValidation(fields);
    this.calculator = new Calculator();
    this.uiRenderer = new UiRenderer();
    this.railwayCalculator = new RailwayExpeditionCalculator(CONFIG.railwayUrl);
    this.kitCalculator = new KitDeliveryCalculator(CONFIG.kitUrl);
    this.redeemManager = new RedeemManager({});
    this.init().catch((error) => console.error("Initialization error:", error));
  }

  async init() {
    // Инициализация кнопки расчета
    const calculateButton = document.querySelector(".js-calculate-result");
    if (calculateButton) {
      calculateButton.addEventListener("click", (e) => this.handleCalculate(e));
    } else {
      console.error(
        'Кнопка "Рассчитать" с селектором ".js-calculate-result" не найдена.'
      );
    }

    // Загрузка курсов валют
    try {
      const currency = new Currency(CONFIG.botToken, CONFIG.chatId);
      await currency.loadAndSaveRates();
      console.log("Курсы успешно сохранены");
    } catch (error) {
      console.error("Ошибка загрузки курсов валют:", error);
    }

    // Загрузка данных тарифов
    try {
      const dataProvider = new DataProvider();
      await dataProvider.loadAndSave();
      console.log("Тарифы успешно сохранены");
    } catch (error) {
      console.error("Ошибка загрузки тарифов:", error);
    }

    // Инициализация ТНВЭД
    this.initTnvedManager();

    // Инициализация PriceSelector
    this.initPriceSelector();
  }

  async handleCalculate(e) {
    e.preventDefault();

    const isValid = this.formValidation.validateAll();
    if (isValid) {
      this.calculator.runBaseLogic();
      this.calculator.runShippingLogic();

      this.showResult();
      this.uiRenderer.renderAll();

      this.railwayCalculator.setLoading(true);
      this.kitCalculator.setLoading(true);

      await this.railwayCalculator.calculate();
      await this.kitCalculator.calculate();

      if (this.redeemManager) {
        this.redeemManager.sendDataToTelegram();
      }

      /* console.log(State); */
    } else {
      console.log("Форма заполнена с ошибками");
      this.scrollToWrapper();
    }
  }

  initTnvedManager() {
    const tnvedConfig = {
      apiBase: CONFIG.tnvedApi,
      tnvedInput: document.querySelector(".tnved-input"),
      suggestionContainer: document.querySelector(".suggestion"),
      nameInput: document.querySelector(".tnved-name-input"),
      codeInput: document.querySelector(".tnved-code-input"),
      nameCodeContainer: document.querySelector(".name-code-container"),
      treeContainer: document.querySelector(".tnved-tree-container"),
      overlay: document.querySelector(".overlay"),
      closeButton: document.querySelector(".tnved-tree-close-button"),
      treeList: document.querySelector(".tnved-tree-list"),
    };

    if (tnvedConfig.tnvedInput) {
      this.tnvedManager = new TnvedManager(tnvedConfig);
      this.tnvedManager.init();
    } else {
      console.warn("Элементы ТНВЭД не найдены, инициализация пропущена");
    }
  }

  initPriceSelector() {
    const priceInput = 'input[name="all-price"]';
    const pdfButton = ".js-get-pdf";

    if (
      document.querySelector(priceInput) &&
      document.querySelector(pdfButton)
    ) {
      this.priceSelector = new PriceSelector(priceInput, pdfButton, State);
      this.priceSelector.init();
      /* console.log("PriceSelector инициализирован"); */
    } else {
      console.warn("Элементы PriceSelector не найдены");
    }
  }

  showResult() {
    const resultBlock = document.querySelector(".main-calc-result");
    if (resultBlock) {
      resultBlock.classList.add("active");
      resultBlock.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  scrollToWrapper() {
    const wrapperBlock = document.querySelector(".main-calc__wrapper");
    if (wrapperBlock) {
      wrapperBlock.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
}

export default CalculatorApp;
