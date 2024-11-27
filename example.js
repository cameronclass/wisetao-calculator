// Функция для загрузки JSON
async function loadJSON() {
  try {
    const response = await fetch("./data.json");
    return await response.json();
  } catch (error) {
    console.error("Ошибка загрузки JSON:", error);
  }
}

// Функция для получения курсов валют из ЦБ РФ
async function fetchExchangeRates() {
  const url = "https://www.cbr.ru/scripts/XML_daily.asp";
  try {
    const response = await fetch(url);
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");

    // Извлекаем нужные валюты
    const rates = {
      USD: parseFloat(
        xmlDoc
          .querySelector('Valute[ID="R01235"] Value')
          .textContent.replace(",", ".")
      ),
      CNY: parseFloat(
        xmlDoc
          .querySelector('Valute[ID="R01375"] Value')
          .textContent.replace(",", ".")
      ),
      RUB: 1, // Рубль по умолчанию равен 1
    };

    return rates;
  } catch (error) {
    console.error("Ошибка получения курсов валют:", error);
    return null;
  }
}

// Класс калькулятора
class ShippingCalculator {
  constructor(data, exchangeRates) {
    this.data = data;
    this.exchangeRates = exchangeRates; // Курс валют
    this.results = {}; // Результаты расчетов
    this.init();
  }

  // Инициализация обработчиков событий
  init() {
    this.setupEventListeners();
  }

  // Установка слушателей для ввода данных
  setupEventListeners() {
    const fields = [
      "weight",
      "volume",
      "cargo-value",
      "places",
      "packaging",
      "category",
    ];
    fields.forEach((id) => {
      document
        .getElementById(id)
        .addEventListener("input", () => this.calculate());
    });

    document
      .getElementById("toggle-volume")
      .addEventListener("change", this.toggleVolumeInput);
    ["length", "width", "height"].forEach((id) => {
      document
        .getElementById(id)
        .addEventListener("input", () => this.calculateVolume());
    });
  }

  // Переключение между объемом и размерами
  toggleVolumeInput() {
    const dimensions = document.getElementById("dimensions");
    const volumeInput = document.getElementById("volume");
    dimensions.style.display = this.checked ? "block" : "none";
    volumeInput.disabled = this.checked;
  }

  // Расчет объема
  calculateVolume() {
    const length = parseFloat(document.getElementById("length").value) || 0;
    const width = parseFloat(document.getElementById("width").value) || 0;
    const height = parseFloat(document.getElementById("height").value) || 0;
    const volume = length * width * height;
    document.getElementById("volume").value = volume.toFixed(2);
  }

  // Основной расчет
  calculate() {
    const weight = parseFloat(document.getElementById("weight").value) || 0;
    const volume = parseFloat(document.getElementById("volume").value) || 0;
    const cargoValue =
      parseFloat(document.getElementById("cargo-value").value) || 0;
    const places = parseInt(document.getElementById("places").value) || 1;
    const packagingType =
      parseFloat(document.getElementById("packaging").value) || 0;
    const categoryKey = parseInt(document.getElementById("category").value);

    if (!categoryKey || weight < 5 || volume <= 0) {
      console.warn("Необходимо корректно заполнить поля.");
      return;
    }

    const category = this.data.find((cat) => cat.category_key === categoryKey);
    if (!category) return;

    const density = weight / volume;
    const tariff = category.data.find((item) => {
      const [min, max] = item.weight_range
        .split("-")
        .map((v) => (v === "+" ? Infinity : parseFloat(v)));
      return density >= min && density <= max;
    });

    const pricePerKg = tariff ? tariff.price_kg : 0;

    this.results.deliveryCost = weight * pricePerKg;
    this.results.packagingCost =
      packagingType * (packagingType > 30 ? volume : places);
    this.results.totalCost =
      this.results.deliveryCost + this.results.packagingCost;

    this.updateResults();
  }

  // Обновление интерфейса
  updateResults() {
    const usdCost = this.results.totalCost.toFixed(2);
    const rubCost = (this.results.totalCost * this.exchangeRates.USD).toFixed(
      2
    );
    const cnyCost = (
      this.results.totalCost *
      (this.exchangeRates.USD / this.exchangeRates.CNY)
    ).toFixed(2);

    document.getElementById("delivery-cost-usd").textContent = `${usdCost} $`;
    document.getElementById("delivery-cost-rub").textContent = `${rubCost} ₽`;
    document.getElementById("delivery-cost-cny").textContent = `${cnyCost} ¥`;
  }
}

// Обновление курсов валют в интерфейсе
async function updateExchangeRates() {
  const rates = await fetchExchangeRates();
  if (rates) {
    document.getElementById("rate-usd").textContent = `${rates.USD.toFixed(
      2
    )} ₽`;
    document.getElementById("rate-cny").textContent = `${rates.CNY.toFixed(
      2
    )} ₽`;
  }
}

// Основной код
document.addEventListener("DOMContentLoaded", async () => {
  const data = await loadJSON();
  const exchangeRates = await fetchExchangeRates();

  if (!exchangeRates) {
    alert("Ошибка получения курсов валют.");
    return;
  }

  updateExchangeRates(); // Обновляем курсы на экране

  const calculator = new ShippingCalculator(data, exchangeRates);

  const categorySelect = document.getElementById("category");
  data.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.category_key;
    option.textContent = category.category_name;
    categorySelect.appendChild(option);
  });
});
