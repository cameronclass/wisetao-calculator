import { State } from "./State.js";

/**
 * Класс, отвечающий за ввод данных клиента.
 * После создания экземпляра в конструкторе сразу:
 * - ищет поля по селекторам,
 * - навешивает обработчики (input / blur),
 * - делает "маску" для ограниченных кодов стран (7, 996, 86).
 */
export class ClientData {
  constructor() {
    // Селекторы — при необходимости подредактируйте под вашу вёрстку
    this._nameInputSelector = 'input[name="client-name"]';
    this._phoneInputSelector = 'input[name="client-phone"]';

    // Описание допустимых форматов
    this._phoneFormats = {
      /**
       * Россия / Казахстан
       * Пример полного номера: +7 (999) 123-45-67
       * => после "7" нужно 10 цифр
       */
      7: {
        code: "7",
        totalDigitsAfterCode: 10,
        formatFn: (digits) => {
          // digits — массив цифр без учёта самой "7"
          const len = digits.length;
          let result = "+7";
          // Ставим скобку после +7, если есть хотя бы 1 цифра
          if (len >= 1) result += ` (${digits[0]}`;
          if (len >= 2) result += digits[1];
          if (len >= 3) result += digits[2];
          if (len >= 3) result += `)`; // закрываем скобку после 3-й цифры
          if (len >= 4) result += ` ${digits[3]}`;
          if (len >= 5) result += digits[4];
          if (len >= 6) result += digits[5];
          if (len >= 6) result += `-`; // дефис после 6-й цифры
          if (len >= 7) result += digits[6];
          if (len >= 8) result += digits[7];
          if (len >= 8) result += `-`; // дефис после 8-й цифры
          if (len >= 9) result += digits[8];
          if (len >= 10) result += digits[9];
          return result;
        },
      },

      /**
       * Киргизия
       * Пример полного номера: +996 (555) 123-456
       * => после "996" нужно 9 цифр
       */
      9: {
        code: "996",
        totalDigitsAfterCode: 9,
        formatFn: (digits) => {
          const len = digits.length;
          let result = "+996";
          if (len >= 1) result += ` (${digits[0]}`;
          if (len >= 2) result += digits[1];
          if (len >= 3) result += digits[2];
          if (len >= 3) result += `)`;
          if (len >= 4) result += ` ${digits[3]}`;
          if (len >= 5) result += digits[4];
          if (len >= 6) result += digits[5];
          if (len >= 6) result += `-`;
          if (len >= 7) result += digits[6];
          if (len >= 8) result += digits[7];
          if (len >= 9) result += digits[8];
          return result;
        },
      },

      /**
       * Китай
       * Пример полного номера: +86 (123) 4567-8901
       * => после "86" нужно 11 цифр
       */
      8: {
        code: "86",
        totalDigitsAfterCode: 11,
        formatFn: (digits) => {
          const len = digits.length;
          let result = "+86";
          if (len >= 1) result += ` (${digits[0]}`;
          if (len >= 2) result += digits[1];
          if (len >= 3) result += digits[2];
          if (len >= 3) result += `)`;
          if (len >= 4) result += ` ${digits[3]}`;
          if (len >= 5) result += digits[4];
          if (len >= 6) result += digits[5];
          if (len >= 7) result += digits[6];
          if (len >= 7) result += `-`;
          if (len >= 8) result += digits[7];
          if (len >= 9) result += digits[8];
          if (len >= 10) result += digits[9];
          if (len >= 11) result += digits[10];
          return result;
        },
      },
    };

    this._phoneBuffer = {
      digits: [], // Для хранения цифр
      formatInfo: null, // Для хранения информации о текущем формате
    };

    // Автоматическая инициализация
    this._init();
  }

  /**
   * Основной метод инициализации.
   */
  _init() {
    this._cacheDOMElements();
    this._bindEvents();
  }

  /**
   * Находим DOM-элементы и кладём их в поля класса.
   */
  _cacheDOMElements() {
    this._nameInputElement = document.querySelector(this._nameInputSelector);
    this._phoneInputElement = document.querySelector(this._phoneInputSelector);

    if (!this._nameInputElement) {
      console.warn(`Не найдено поле ввода имени: ${this._nameInputSelector}`);
    }
    if (!this._phoneInputElement) {
      console.warn(
        `Не найдено поле ввода телефона: ${this._phoneInputSelector}`
      );
    }
  }

  /**
   * Навешиваем слушатели на поля.
   */
  _bindEvents() {
    if (this._nameInputElement) {
      this._nameInputElement.addEventListener("input", (event) => {
        this._handleNameInput(event.target.value);
      });
    }

    if (this._phoneInputElement) {
      this._phoneInputElement.addEventListener("input", () => {
        this._handlePhoneInput();
      });

      this._phoneInputElement.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" || e.key === "Delete") {
          e.preventDefault();
          this._handlePhoneDelete();
        }
      });

      this._phoneInputElement.addEventListener("blur", () => {
        this._checkPhoneComplete();
      });
    }
  }

  _handlePhoneDelete() {
    if (!this._phoneInputElement) return;

    const start = this._phoneInputElement.selectionStart;
    const value = this._phoneInputElement.value;

    // Если курсор находится в конце строки, просто удаляем последний элемент из буфера
    if (start === value.length) {
      this._phoneBuffer.digits.pop();
    } else {
      // Если курсор не в конце, нужно удалить символ перед курсором
      const before = value.slice(0, start);
      const lastChar = before.slice(-1);

      // Если последний символ - это символ форматирования, просто удаляем его
      if (this._isFormatChar(lastChar)) {
        // Удаляем символ форматирования
        this._phoneBuffer.digits.pop();
      } else {
        // Если это цифра, удаляем её из буфера
        this._phoneBuffer.digits.pop();
      }
    }

    const formattedValue = this._applyFormat();
    this._phoneInputElement.value = formattedValue;
  }

  /**
   * Обработка имени: сохраняем в State и выводим в консоль (для наглядности).
   */
  _handleNameInput(name) {
    State.clientData.name = name;
    /* console.log("State.clientData при вводе имени:", State.clientData.name); */
  }

  /**
   * Обработка телефона:
   * 1) извлекаем цифры
   * 2) ищем подходящий формат (по коду)
   * 3) форматируем «по месту»
   * 4) сохраняем в State
   */
  _handlePhoneInput() {
    if (!this._phoneInputElement) return;

    const rawValue = this._phoneInputElement.value;
    this._formatPhone(rawValue);
    State.clientData.phone = this._phoneInputElement.value;
    /* console.log("State.clientData при вводе имени:", State.clientData.phone); */
  }

  /**
   * Проверяем, введён ли полностью корректный номер (по количеству цифр)
   * при потере фокуса. Если нет — очищаем поле.
   */
  _checkPhoneComplete() {
    if (!this._phoneInputElement) return;
    const currentValue = this._phoneInputElement.value;
    // Извлекаем только цифры
    const digits = currentValue.replace(/\D+/g, "");

    // Меньше 2 цифр — точно не подходит ни под один код
    if (digits.length < 2) {
      this._clearPhone();
      return;
    }

    // Ищем, какой формат подходит
    const format = this._findFormatByDigits(digits);
    if (!format) {
      // Код неправильный
      this._clearPhone();
      return;
    }

    // Сколько цифр нужно после кода
    const needed = format.totalDigitsAfterCode;
    const actual = digits.length - format.code.length;

    // Если пользователь не добрал нужное количество
    if (actual < needed) {
      this._clearPhone();
    }
  }

  /**
   * Форматируем строку телефона в «живую маску»:
   * - Если код страны не совпал, возвращаем пустую строку
   * - Иначе применяем функции форматирования
   */
  _formatPhone(rawValue) {
    const digits = rawValue.replace(/\D/g, "");
    const format = this._findFormatByDigits(digits);

    if (!format) {
      this._clearPhone();
      return;
    }

    this._phoneBuffer.formatInfo = format;
    this._updateBuffer(digits);
    const formattedValue = this._applyFormat();
    this._phoneInputElement.value = formattedValue;
  }

  _updateBuffer(digits) {
    const maxDigits =
      this._phoneBuffer.formatInfo.code.length +
      this._phoneBuffer.formatInfo.totalDigitsAfterCode;
    const newDigits = digits.slice(0, maxDigits);

    if (newDigits.length > this._phoneBuffer.digits.length) {
      const additionalDigits = newDigits.slice(this._phoneBuffer.digits.length);
      this._phoneBuffer.digits.push(...additionalDigits);
    } else if (newDigits.length < this._phoneBuffer.digits.length) {
      this._phoneBuffer.digits = newDigits.slice();
    }
  }

  _applyFormat() {
    const { code, formatFn } = this._phoneBuffer.formatInfo;
    const localDigits = this._phoneBuffer.digits.slice(code.length);
    return formatFn(localDigits);
  }

  _isFormatChar(char) {
    return ["(", ")", "-"].includes(char);
  }

  /**
   * Пытаемся найти формат (из _phoneFormats), которому соответствуют введённые цифры.
   * Проверяем, начинается ли введённая строка (digits) с "7", "996" или "86".
   */
  _findFormatByDigits(digits) {
    for (let key of Object.keys(this._phoneFormats)) {
      // key — это "7", "996" или "86"
      if (digits.startsWith(key)) {
        return this._phoneFormats[key];
      }
    }
    return null; // ничего не подошло
  }

  /**
   * Очищаем поле телефона и сбрасываем в State
   */
  _clearPhone() {
    if (this._phoneInputElement) {
      this._phoneInputElement.value = "";
    }
    this._phoneBuffer = {
      digits: [],
      formatInfo: null,
    };
    State.clientData.phone = "";
    console.log("Телефон очищен (неполный или неверный код)");
  }
}
