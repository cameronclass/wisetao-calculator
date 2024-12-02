const botToken = "7077778313:AAGQu7UV0XiNs0z8aGDyQiCwaqzOEgZLnbQ";
const chatId = "-413166690";

class CurrencyParser {
  constructor(multiplier = 7.3) {
    this.multiplier = multiplier;
    this.currencyYuan = null;
    this.currencyDollar = null;
  }

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

  calculateDollarRate() {
    if (this.currencyYuan !== null) {
      this.currencyDollar = (this.currencyYuan * this.multiplier).toFixed(2);
    } else {
      throw new Error("Сначала нужно извлечь курс юаня");
    }
  }

  parseAndCalculate(text) {
    this.extractYuanRate(text);
    this.calculateDollarRate();
  }

  static async getCurrencyRates(botToken, chatId) {
    const groupInfo = new TelegramGroupInfo(botToken, chatId);
    const groupName = await groupInfo.getGroupName();

    if (groupName) {
      const currencyParser = new CurrencyParser();
      currencyParser.parseAndCalculate(groupName);

      const currencyYuan = currencyParser.getYuanRate();
      const currencyDollar = currencyParser.getDollarRate();

      return { currencyYuan, currencyDollar };
    } else {
      throw new Error("Не удалось получить имя группы.");
    }
  }
}
