// Функция для получения данных с сервера

async function fetchCurrencyRates() {
  try {
    // Укажите путь к PHP-скрипту
    const response = await fetch(
      "http://localhost:3000/Example/js/getExchangeRate.php"
    );

    const data = await response.json();

    if (data.error) {
      console.error("Ошибка:", data.error);
    } else {
      const { currencyYuan, currencyDollar } = data;

      console.log(`1$ = ${currencyYuan} юань`);
      console.log(`1$ = ${currencyDollar} рубль`);

      // Делаем значения доступными для использования
      window.currencyYuan = currencyYuan;
      window.currencyDollar = currencyDollar;
    }
  } catch (error) {
    console.error("Ошибка получения данных:", error);
  }
}

// Вызов функции
fetchCurrencyRates();

