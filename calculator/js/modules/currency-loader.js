// Глобальные переменные для хранения значений
let currencyYuan; // Курс юаня
let currencyRuble; // Курс доллара в рублях

// Класс для работы с Telegram API
class TelegramGroupInfo {
  constructor(botToken, chatId) {
    this.botToken = botToken; // Токен Telegram-бота
    this.chatId = chatId; // ID группы Telegram
    this.apiUrl = `https://api.telegram.org/bot${botToken}`;
  }

  // Метод для выполнения запроса к Telegram API
  async fetchChatData() {
    try {
      const response = await fetch(
        `${this.apiUrl}/getChat?chat_id=${this.chatId}`
      );
      const data = await response.json();
      if (data.ok) {
        return data.result; // Возвращает объект с данными чата
      } else {
        console.error("Ошибка API:", data.description);
        return null;
      }
    } catch (error) {
      console.error("Ошибка запроса:", error);
      return null;
    }
  }

  // Метод для получения имени группы
  async getGroupName() {
    const chatData = await this.fetchChatData();
    return chatData ? chatData.title : null; // Возвращает имя группы
  }
}

// Класс для парсинга курсов валют
class CurrencyParser {
  constructor(multiplier = 7.3) {
    this.multiplier = multiplier; // Множитель (по умолчанию 7.3)
    this.currencyYuan = null; // Средняя цена юаня
    this.currencyRuble = null; // Курс доллара в рублях
  }

  // Метод для извлечения средней цены юаня из текста
  extractYuanRate(text) {
    const match = text.match(
      /курс\s([\d.,]+)\s*\/\s*([\d.,]+)\s*\/\s*([\d.,]+)\s*ю/i
    );
    if (match) {
      this.currencyYuan = parseFloat(match[2].replace(",", ".")).toFixed(2);
    } else {
      throw new Error("Не удалось извлечь курс юаня из текста");
    }
  }

  // Метод для вычисления курса доллара в рублях
  calculateDollarRate() {
    if (this.currencyYuan !== null) {
      this.currencyRuble = (this.currencyYuan * this.multiplier).toFixed(2);
    } else {
      throw new Error("Сначала нужно извлечь курс юаня");
    }
  }

  // Главный метод: парсинг и вычисления
  parseAndCalculate(text) {
    this.extractYuanRate(text);
    this.calculateDollarRate();
  }

  // Геттеры для получения результата
  getYuanRate() {
    return this.currencyYuan;
  }

  getDollarRate() {
    return this.currencyRuble;
  }

  // Метод для обновления множителя
  updateMultiplier(newMultiplier) {
    this.multiplier = newMultiplier;
    this.calculateDollarRate();
  }
}

// Использование
const botToken = "7077778313:AAGQu7UV0XiNs0z8aGDyQiCwaqzOEgZLnbQ"; // Ваш токен
const chatId = "-413166690"; // ID группы

(async () => {
  // 1. Получаем имя группы через Telegram API
  const groupInfo = new TelegramGroupInfo(botToken, chatId);
  const groupName = await groupInfo.getGroupName();

  if (groupName) {
    const currencyParser = new CurrencyParser(); // Создаём объект парсера
    currencyParser.parseAndCalculate(groupName); // Парсим имя группы

    // Получаем результаты
    currencyYuan = currencyParser.getYuanRate(); // Средняя цена юаня
    currencyRuble = currencyParser.getDollarRate(); // Курс доллара в рублях

    console.log(`1$ = ${currencyYuan} юань`);
    console.log(`1$ = ${currencyRuble} рубль`);

    // Обновляем поля в HTML
    document.querySelector(
      'input[name="current_rate_ruble"]'
    ).value = `${currencyRuble} руб.`;
    document.querySelector(
      'input[name="current_rate_yuan"]'
    ).value = `${currencyYuan} юань`;
  } else {
    console.error("Не удалось получить имя группы.");
  }
})();
