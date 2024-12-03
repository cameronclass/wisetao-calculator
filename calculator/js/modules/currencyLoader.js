class CurrencyRatesManager {
  constructor(botToken, chatId, localStorageKey = "currencyRates") {
    this.botToken = botToken;
    this.chatId = chatId;
    this.apiUrl = `https://api.telegram.org/bot${botToken}`;
    this.localStorageKey = localStorageKey;
    this.currencyYuan = null;
    this.currencyRuble = null;
  }

  getCachedRates() {
    const stored = localStorage.getItem(this.localStorageKey);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.currencyYuan = data.currencyYuan;
        this.currencyRuble = data.currencyRuble;
        return data;
      } catch (error) {
        console.error("Ошибка при чтении кэша:", error);
      }
    }
    return null;
  }

  saveRatesToCache() {
    const data = {
      currencyYuan: this.currencyYuan,
      currencyRuble: this.currencyRuble,
    };
    localStorage.setItem(this.localStorageKey, JSON.stringify(data));
  }

  async fetchAndUpdateRates() {
    try {
      const response = await fetch(
        `${this.apiUrl}/getChat?chat_id=${this.chatId}`
      );
      const data = await response.json();
      if (data.ok) {
        this.parseRates(data.result.title);
        this.saveRatesToCache();
      }
    } catch (error) {
      console.error("Ошибка обновления курсов:", error);
    }
  }

  parseRates(groupName) {
    const match = groupName.match(
      /курс\s([\d.,]+)\s*\/\s*([\d.,]+)\s*\/\s*([\d.,]+)\s*ю/i
    );
    if (match) {
      this.currencyYuan = parseFloat(match[2].replace(",", ".")).toFixed(2);
      this.currencyRuble = (this.currencyYuan * 7.3).toFixed(2);
    }
  }

  async initializeRates() {
    this.getCachedRates();
    await this.fetchAndUpdateRates();
  }

  updateRatesInUI() {
    document.querySelector(
      'input[name="current_rate_ruble"]'
    ).value = `${this.currencyRuble} руб.`;
    document.querySelector(
      'input[name="current_rate_yuan"]'
    ).value = `${this.currencyYuan} юань`;
  }
}

window.CurrencyRatesManager = CurrencyRatesManager;
