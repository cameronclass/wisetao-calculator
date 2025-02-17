// Currency.js
import { State } from "../data/State.js";

export class Currency {
  constructor(botToken, chatId, multiplier = 7.3) {
    this.botToken = botToken;
    this.chatId = chatId;
    this.multiplier = multiplier;

    this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
  }

  async loadAndSaveRates() {
    try {
      // 1) Парсим Wisetao (доллар, юань) из Telegram
      const { wisetaoDollar, wisetaoYuan } = await this.loadWisetaoRates();

      // 2) Парсим ЦБ (доллар, юань)
      const { cbrDollar, cbrYuan } = await this.loadCbrRates();

      // 3) Сохраняем в State
      State.currencyRates.wisetao = {
        dollar:
          parseFloat(wisetaoDollar) || State.currencyRates.wisetao?.dollar || 0,
        yuan: parseFloat(wisetaoYuan) || State.currencyRates.wisetao?.yuan || 0,
      };

      State.currencyRates.cbr = {
        dollar: parseFloat(cbrDollar) || State.currencyRates.cbr?.dollar || 0,
        yuan: parseFloat(cbrYuan) || State.currencyRates.cbr?.yuan || 0,
      };
    } catch (err) {
      console.error("Ошибка при загрузке курсов:", err);
    }
  }

  async loadWisetaoRates() {
    const groupName = await this.fetchTelegramGroupName();
    if (!groupName) {
      throw new Error("Не удалось получить название группы из Telegram");
    }

    // Ищем в groupName что-то вида "курс 12 / 13.5 / 14 ю"
    const match = groupName.match(
      /курс\s([\d.,]+)\s*\/\s*([\d.,]+)\s*\/\s*([\d.,]+)\s*ю/i
    );
    if (!match) {
      throw new Error("Не найден шаблон 'курс X / Y / Z ю' в названии группы");
    }

    // match[2] — обычно средний юань
    const yuanStr = match[2].replace(",", ".");
    const yuanValue = parseFloat(yuanStr);
    if (isNaN(yuanValue)) {
      throw new Error("Некорректное числовое значение юаня при парсинге");
    }

    // Ищем множитель в формате "×X.XXю"
    const multiplierMatch = groupName.match(/×([\d.,]+)ю/i);
    if (!multiplierMatch) {
      throw new Error("Не найден множитель в названии группы");
    }

    const multiplierStr = multiplierMatch[1].replace(",", ".");
    this.multiplier = parseFloat(multiplierStr);
    if (isNaN(this.multiplier)) {
      throw new Error("Некорректное числовое значение множителя при парсинге");
    }

    // Рассчитываем доллар = yuanValue * multiplier
    const dollarValue = parseFloat((yuanValue * this.multiplier).toFixed(2));

    return {
      wisetaoDollar: dollarValue, // 1$ = ... руб (по Wisetao)
      wisetaoYuan: yuanValue, // 1¥ = ... руб (по Wisetao)
    };
  }

  async loadCbrRates() {
    try {
      const response = await fetch(
        "https://www.cbr-xml-daily.ru/daily_json.js"
      );
      if (!response.ok) {
        throw new Error(`Ошибка запроса ЦБ: ${response.statusText}`);
      }
      const data = await response.json();

      const usdRate = parseFloat(data.Valute.USD.Value).toFixed(2);
      const cnyRate = parseFloat(data.Valute.CNY.Value).toFixed(2);

      return {
        cbrDollar: usdRate,
        cbrYuan: cnyRate,
      };
    } catch (error) {
      throw new Error("Ошибка при получении курсов ЦБ: " + error.message);
    }
  }

  async fetchTelegramGroupName() {
    try {
      const url = `${this.apiUrl}/getChat?chat_id=${this.chatId}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.ok) {
        return data.result?.title || null;
      } else {
        console.error("Ошибка API Telegram:", data.description);
        return null;
      }
    } catch (err) {
      console.error("Ошибка запроса к Telegram:", err);
      return null;
    }
  }
}
