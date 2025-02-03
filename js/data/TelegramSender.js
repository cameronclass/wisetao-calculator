// TelegramSender.js

export default class TelegramSender {
  /**
   * @param {Object} config - Конфигурация для Telegram
   * @param {string} config.token - Токен бота, полученный от BotFather
   * @param {string|number} config.chatId - ID чата (группы), куда отправлять сообщения
   */
  constructor({ token, chatId }) {
    if (!token || !chatId) {
      throw new Error(
        "Token и chatId обязательны для инициализации TelegramSender"
      );
    }
    this.token = token;
    this.chatId = chatId;
    this.baseUrl = `https://api.telegram.org/bot${this.token}`;
  }

  /**
   * Отправка текстового сообщения
   * @param {string} message - Сообщение для отправки
   * @returns {Promise<Object>}
   */
  async sendMessage(message) {
    if (!message) {
      throw new Error("Сообщение не может быть пустым");
    }

    const url = `${this.baseUrl}/sendMessage`;
    const params = {
      chat_id: this.chatId,
      text: message,
      parse_mode: "HTML", // Для HTML-разметки
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const data = await response.json();
      if (!data.ok) {
        throw new Error(`Ошибка Telegram API: ${data.description}`);
      }
      return data;
    } catch (error) {
      console.error("Ошибка отправки текстового сообщения в Telegram:", error);
      throw error;
    }
  }

  /**
   * Отправка фотографии (изображения) с подписью.
   * @param {Blob|File} photo - Объект изображения (Blob или File)
   * @param {string} caption - Подпись к изображению
   * @returns {Promise<Object>}
   */
  async sendPhoto(photo, caption = "") {
    const url = `${this.baseUrl}/sendPhoto`;
    const formData = new FormData();
    formData.append("chat_id", this.chatId);
    formData.append("caption", caption);
    formData.append("photo", photo);

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!data.ok) {
        throw new Error(`Ошибка Telegram API (sendPhoto): ${data.description}`);
      }
      return data;
    } catch (error) {
      console.error("Ошибка отправки фото в Telegram:", error);
      throw error;
    }
  }

  /**
   * Отправка документа (файла) с подписью.
   * @param {File} document - Файл для отправки
   * @param {string} caption - Подпись к документу
   * @returns {Promise<Object>}
   */
  async sendDocument(document, caption = "") {
    const url = `${this.baseUrl}/sendDocument`;
    const formData = new FormData();
    formData.append("chat_id", this.chatId);
    formData.append("caption", caption);
    formData.append("document", document);

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!data.ok) {
        throw new Error(
          `Ошибка Telegram API (sendDocument): ${data.description}`
        );
      }
      return data;
    } catch (error) {
      console.error("Ошибка отправки документа в Telegram:", error);
      throw error;
    }
  }
}
