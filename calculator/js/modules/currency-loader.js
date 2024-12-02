const botToken = "7077778313:AAGQu7UV0XiNs0z8aGDyQiCwaqzOEgZLnbQ";
const chatId = "-413166690";
let currencyRates = {
  dollar: "-",
  ruble: "-",
  yuan: "-",
};

async function fetchCurrencyRates() {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/getUpdates`
    );
    const data = await response.json();
    const messages = data.result.map((item) => item.message.text).reverse();

    const relevantMessage = messages.find((text) => text.includes("курс"));
    if (relevantMessage) {
      const matches = relevantMessage.match(
        /курс\s([\d.,]+)\s*\/\s*([\d.,]+)\s*\/\s*([\d.,]+)\s*ю/i
      );
      if (matches) {
        currencyRates = {
          dollar: matches[1],
          ruble: matches[2],
          yuan: matches[3],
        };
      }
    }
  } catch (error) {
    console.error("Ошибка загрузки курсов валют:", error.message);
  }
}

function displayCurrencyRates() {
  document.getElementById("current-dollar-rate").textContent =
    currencyRates.dollar;
  document.getElementById("current-ruble-rate").textContent =
    currencyRates.ruble;
  document.getElementById("current-yuan-rate").textContent = currencyRates.yuan;
}

export { fetchCurrencyRates, displayCurrencyRates };
