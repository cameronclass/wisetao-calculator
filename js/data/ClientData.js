import { State } from "./State.js";

/**
 * Класс, отвечающий за взаимодействие с полями ввода данных клиента (имя и телефон).
 * Маска телефона поддерживает номера:
 * - Россия/Казахстан: +7 (XXX) XXX-XX-XX (10 цифр после 7)
 * - Киргизия: +996 (XXX) XXX-XXX (9 цифр после 996)
 * - Китай: +86 (XXX) XXXX-XXXX (11 цифр после 86)
 */
export class ClientData {
  constructor() {
    // Селекторы полей
    this._nameInputSelector = 'input[name="client-name"]';
    this._phoneInputSelector = 'input[name="client-phone"]';

    // Карта допустимых форматов.
    // Ключ — «код страны» без плюса,
    // totalDigits — сколько цифр после кода нужно в полной версии,
    // formatFn — функция, которая красиво подставляет скобки/пробелы/дефисы.
    this._phoneFormats = {
      7: {
        totalDigits: 10, // Россия/Казахстан: всего 10 цифр после «7»
        formatFn: (digits) => {
          // digits — массив цифр без ведущего кода (т.е. 10 цифр максимум)
          // Формат: +7 (XXX) XXX-XX-XX
          let [d1, d2, d3, d4, d5, d6, d7, d8, d9, d10] = digits;
          let result = "+7";
          if (digits.length > 0) result += " (" + d1;
          if (digits.length > 1) result += d2;
          if (digits.length > 2) result += d3 + ")";
          if (digits.length > 3) result += " " + d4 + d5 + d6;
          if (digits.length > 6) result += "-" + d7 + d8;
          if (digits.length > 8) result += "-" + d9 + d10;
          return result;
        },
      },
      996: {
        totalDigits: 9, // Киргизия: 9 цифр после «996»
        formatFn: (digits) => {
          // Формат: +996 (XXX) XXX-XXX (условный вариант)
          let [d1, d2, d3, d4, d5, d6, d7, d8, d9] = digits;
          let result = "+996";
          if (digits.length > 0) result += " (" + d1;
          if (digits.length > 1) result += d2;
          if (digits.length > 2) result += d3 + ")";
          if (digits.length > 3) result += " " + d4 + d5 + d6;
          if (digits.length > 6) result += "-" + d7 + d8 + d9;
          return result;
        },
      },
      86: {
        totalDigits: 11, // Китай: 11 цифр после «86»
        formatFn: (digits) => {
          // Формат: +86 (XXX) XXXX-XXXX (условный вариант)
          let [d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11] = digits;
          let result = "+86";
          if (digits.length > 0) result += " (" + d1;
          if (digits.length > 1) result += d2;
          if (digits.length > 2) result += d3 + ")";
          if (digits.length > 3) result += " " + d4 + d5 + d6 + d7;
          if (digits.length > 7) result += "-" + d8 + d9 + d10 + (d11 || "");
          return result;
        },
      },
    };

    // Запускаем всё автоматически
    this._init();
  }

  /**
   * Инициализация (кэширование DOM-элементов, навешивание слушателей).
   */
  _init() {
    this._cacheDOMElements();
    this._bindEvents();
  }

  /**
   * Поиск и кеширование DOM-элементов.
   */
  _cacheDOMElements() {
    this._nameInputElement = document.querySelector(this._nameInputSelector);
    this._phoneInputElement = document.querySelector(this._phoneInputSelector);

    if (!this._nameInputElement) {
      console.warn(`Поле ввода имени не найдено: ${this._nameInputSelector}`);
    }
    if (!this._phoneInputElement) {
      console.warn(
        `Поле ввода телефона не найдено: ${this._phoneInputSelector}`
      );
    }
  }

  /**
   * Навешиваем обработчики на поля ввода.
   */
  _bindEvents() {
    // Имя
    if (this._nameInputElement) {
      this._nameInputElement.addEventListener("input", (event) => {
        this._handleNameInput(event.target.value);
      });
    }

    // Телефон
    if (this._phoneInputElement) {
      // При вводе будем «маскировать» и записывать в State.
      this._phoneInputElement.addEventListener("input", () => {
        this._handlePhoneInput();
      });

      // При потере фокуса (blur) проверяем, введён ли полный номер.
      // Если нет — очищаем поле.
      this._phoneInputElement.addEventListener("blur", () => {
        this._checkPhoneCompleted();
      });
    }
  }

  /**
   * Обработка изменения имени. Обновляем State и выводим в консоль для наглядности.
   */
  _handleNameInput(name) {
    State.clientData.name = name;
    console.log("State.clientData (имя обновлено):", State.clientData);
  }

  /**
   * Обработка изменения телефона.
   * 1) Форматируем введённое значение.
   * 2) Обновляем State.clientData.number.
   * 3) Выводим в консоль.
   */
  _handlePhoneInput() {
    if (!this._phoneInputElement) return;

    // Сырой ввод, например: "+7 (123) 45"
    const rawValue = this._phoneInputElement.value;

    // Отформатированное значение (или пустая строка, если код неверный).
    const formattedValue = this._formatPhone(rawValue);

    // Устанавливаем результат обратно в инпут.
    this._phoneInputElement.value = formattedValue;

    // Записываем в State только то, что сейчас в поле (может быть частично).
    State.clientData.number = formattedValue;
    console.log("State.clientData (телефон обновлён):", State.clientData);
  }

  /**
   * Проверка, введён ли полный номер при потере фокуса.
   * Если нет — очистка поля и сброс state.
   */
  _checkPhoneCompleted() {
    if (!this._phoneInputElement) return;
    const currentValue = this._phoneInputElement.value;

    // Проверяем, является ли текущее значение "полным":
    // 1) Удаляем всё, кроме цифр.
    // 2) Определяем код страны.
    // 3) Смотрим, достаточно ли цифр.
    const digits = currentValue.replace(/\D+/g, ""); // все цифры без "+"
    // Например, если пользователь ввёл "+7 (123) 456-78-90", digits будет "71234567890".

    // Если в строке меньше 2 цифр — точно некорректно, сразу очищаем.
    if (digits.length < 2) {
      this._clearPhone();
      return;
    }

    // Ищем подходящий формат
    const matchedFormat = this._matchFormat(digits);

    if (!matchedFormat) {
      // Код страны неправильный — очищаем
      this._clearPhone();
      return;
    }

    // Проверяем, хватает ли цифр после кода
    const { code, totalDigits } = matchedFormat;
    const codeLength = code.length; // например, "7" => length 1, "996" => length 3
    const localDigitsCount = digits.length - codeLength; // сколько цифр после кода

    // Если пользователь не ввёл все необходимые цифры, очищаем
    if (localDigitsCount < totalDigits) {
      this._clearPhone();
    }
  }

  /**
   * Форматирование строки телефона в соответствии с одним из допустимых кодов.
   * Если код не подходит (или введено не то), возвращается пустая строка.
   *
   * @param {string} rawValue - строка (может содержать +, скобки, пробелы и т.д.).
   * @returns {string} отформатированная строка или "" (если код не совпал).
   */
  _formatPhone(rawValue) {
    // Извлекаем все цифры (без '+', пробелов и т.д.).
    // Например, из "+7 (123) 45" получим "712345".
    const digits = rawValue.replace(/\D+/g, "");

    // Если пользователь вообще не ввёл цифр — возвращаем пустое значение
    if (!digits) {
      return "";
    }

    // Сопоставляем введённые цифры с одним из кодов
    const matchedFormat = this._matchFormat(digits);
    if (!matchedFormat) {
      // Код страны неверный => не даём вводить дальше
      return "";
    }

    const { code, totalDigits, formatFn } = matchedFormat;
    const codeLength = code.length;
    // Выделяем «локальные» цифры (после кода)
    const localDigits = digits.slice(codeLength).split("");

    // Обрезаем лишние, если пользователь ввёл больше, чем нужно
    if (localDigits.length > totalDigits) {
      localDigits.length = totalDigits;
    }

    // Формируем готовую маску
    return formatFn(localDigits);
  }

  /**
   * Функция, которая проверяет, начинается ли "digits" с одного из допустимых кодов
   * (7, 996, 86) и возвращает объект формата, если подходит.
   */
  _matchFormat(digits) {
    // Перебираем все доступные "коды"
    for (let code of Object.keys(this._phoneFormats)) {
      // Проверяем, начинается ли введённая строка с данного кода
      if (digits.startsWith(code)) {
        return { code, ...this._phoneFormats[code] };
      }
    }
    return null; // ни один код не подошёл
  }

  /**
   * Очистка поля телефона и сброс значения в State
   */
  _clearPhone() {
    if (this._phoneInputElement) {
      this._phoneInputElement.value = "";
    }
    State.clientData.number = "";
    console.log("Поле телефона очищено — введён неполный или неверный номер.");
  }
}
