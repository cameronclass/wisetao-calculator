// RedeemManager.js

import UiPrepare from "../ui/UiPrepare.js";
import { State } from "./State.js";
import TelegramSender from "./TelegramSender.js";

const telegramSender = new TelegramSender({
  token: "7773944407:AAEYhChPWpyvyDvDoBuYmKFaJShfDV30JIQ",
  chatId: -4638573770,
});

// Функция для конвертации Base64 в Blob
function base64ToBlob(base64Data, contentType = "", sliceSize = 512) {
  const byteCharacters = atob(base64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}

export default class RedeemManager {
  constructor(options = {}) {
    this.rootSelector = options.rootSelector || ".data-redeem";
    this.addButtonSelector = options.addButtonSelector || ".add-redeem";
    this.excelButtonSelector = options.excelButtonSelector || ".upload-excel";
    this.root = document.querySelector(this.rootSelector);
    this.addButton = document.querySelector(this.addButtonSelector);
    this.excelButton = document.querySelector(this.excelButtonSelector);
    this.counter = 2;

    if (!State.redeemData) State.redeemData = {};
    if (!State.excelData) State.excelData = {};

    this.uiPrepare = new UiPrepare(this.root);

    this.init();
  }

  init() {
    if (this.addButton) {
      this.addButton.addEventListener("click", () => this.addRedeemContainer());
    }
    if (this.excelButton) {
      this.excelButton.addEventListener("click", () =>
        this.handleExcelUpload()
      );
    }
    const firstContainer = this.root.querySelector('[data-redeem="1"]');
    if (firstContainer) {
      this.setupContainerLogic(firstContainer, 1);
      State.redeemData[1] = this.getEmptyItem();
    }

    // Не привязываем событие отправки данных здесь –
    // вызов sendDataToTelegram() должен происходить только после успешной валидации формы (например, из CalculatorApp).
  }

  addRedeemContainer() {
    const firstContainer = this.root.querySelector('[data-redeem="1"]');
    if (!firstContainer) return;
    const newContainer = firstContainer.cloneNode(true);
    newContainer.setAttribute("data-redeem", this.counter);
    this.clearContainerFields(newContainer);
    this.root.appendChild(newContainer);

    this.setupContainerLogic(newContainer, this.counter);
    State.redeemData[this.counter] = this.getEmptyItem();

    this.uiPrepare._initIncrementForElement(newContainer);
    this.uiPrepare._initCustomSelectForElement(newContainer);

    this.counter++;
  }

  clearContainerFields(container) {
    const inputs = container.querySelectorAll("input");
    inputs.forEach((inp) => {
      if (inp.type === "number" || inp.type === "text") {
        inp.value = inp.name === "data-quantity" ? "1" : "";
      }
      if (inp.type === "file") inp.value = "";
      if (inp.name === "data_currency") inp.checked = inp.value === "dollar";
    });
    const uploadItem = container.querySelector(".main-calc-upload__item");
    if (uploadItem) uploadItem.src = "";
    const plus = container.querySelector(".main-calc-upload__plus");
    const minus = container.querySelector(".main-calc-upload__minus");
    if (plus) plus.classList.add("active");
    if (minus) minus.classList.remove("active");
    const closeBtn = container.querySelector(".main-calc-buy__close");
    if (closeBtn) closeBtn.style.display = "block";
  }

  // Метод для очистки всех вручную введённых полей (input и изображений) во всех контейнерах
  clearAllManualFields() {
    const containers = this.root.querySelectorAll("[data-redeem]");
    containers.forEach((container) => {
      const inputs = container.querySelectorAll("input");
      inputs.forEach((inp) => {
        if (inp.name === "data-quantity") {
          inp.value = "1";
        } else {
          inp.value = "";
        }
      });
      const imgItem = container.querySelector(".main-calc-upload__item");
      if (imgItem) {
        imgItem.src = "";
        imgItem.classList.remove("active");
      }
      const plus = container.querySelector(".main-calc-upload__plus");
      const minus = container.querySelector(".main-calc-upload__minus");
      if (plus) plus.classList.add("active");
      if (minus) minus.classList.remove("active");
    });
  }

  // Метод для очистки данных в State.redeemData (все поля устанавливаются в "Нет данных")
  clearRedeemData() {
    Object.keys(State.redeemData).forEach((key) => {
      const item = State.redeemData[key];
      for (let field in item) {
        item[field] = "Нет данных";
      }
    });
  }

  setupContainerLogic(container, index) {
    if (index === 1) {
      const closeBtn = container.querySelector(".main-calc-buy__close");
      if (closeBtn) closeBtn.style.display = "none";
    }

    const closeBtn = container.querySelector(".main-calc-buy__close");
    if (closeBtn && index !== 1) {
      closeBtn.addEventListener("click", () => {
        this.removeRedeemContainer(index, container);
      });
    }

    const form = container.querySelector(".main-calc-buy-info__form");
    if (form) {
      form.addEventListener("input", (e) => this.onInputChange(e, index));
      const currencyRadios = form.querySelectorAll(
        'input[name="data_currency"]'
      );
      currencyRadios.forEach((radio) => {
        radio.addEventListener("change", (e) => this.onInputChange(e, index));
      });

      const incrementButtons = container.querySelectorAll(
        ".group-input-increment__plus, .group-input-increment__minus"
      );
      incrementButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const input = container.querySelector('input[name="data-quantity"]');
          if (input) {
            this.onInputChange({ target: input }, index);
          }
        });
      });
    }

    const uploadWrapper = container.querySelector(".main-calc-upload");
    if (uploadWrapper) {
      const fileInput = uploadWrapper.querySelector(".main-calc-upload__input");
      const plus = uploadWrapper.querySelector(".main-calc-upload__plus");
      const minus = uploadWrapper.querySelector(".main-calc-upload__minus");
      const imgItem = uploadWrapper.querySelector(".main-calc-upload__item");

      if (plus && fileInput && imgItem) {
        plus.addEventListener("click", () => {
          fileInput.accept = "image/*";
          fileInput.click();
        });
      }
      if (fileInput && plus && minus && imgItem) {
        fileInput.addEventListener("change", () => {
          const file = fileInput.files[0];
          if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = () => {
              imgItem.src = reader.result;
              imgItem.classList.add("active");
              plus.classList.remove("active");
              minus.classList.add("active");
              this.updateState(index, "image", reader.result);
            };
            reader.readAsDataURL(file);
          } else if (file) {
            console.log("Пожалуйста, выберите файл изображения!");
            fileInput.value = "";
          }
        });
      }
      if (minus && plus && imgItem) {
        minus.addEventListener("click", () => {
          imgItem.src = "";
          imgItem.classList.remove("active");
          plus.classList.add("active");
          minus.classList.remove("active");
          fileInput.value = "";
          this.updateState(index, "image", "");
        });
      }
    }
  }

  removeRedeemContainer(index, container) {
    container.remove();
    delete State.redeemData[index];
  }

  onInputChange(e, index) {
    const name = e.target.name;
    const fieldEl = e.target;

    if (typeof window.formValidation !== "undefined") {
      window.formValidation.removeError(fieldEl);
    } else {
      fieldEl.classList.remove("error-input");
      const parent = fieldEl.closest(".form-group") || fieldEl.parentElement;
      const errorSpan = parent?.querySelector(".error-message");
      if (errorSpan) {
        errorSpan.textContent = "";
        errorSpan.style.display = "none";
      }
    }
    const value = e.target.value;
    switch (name) {
      case "data-name":
        this.updateState(index, "name", value);
        break;
      case "data_cost":
        this.updateState(index, "cost", value);
        break;
      case "data_currency":
        this.updateState(index, "currency", value);
        break;
      case "data-quantity":
        this.updateState(index, "quantity", value);
        break;
      case "data-size":
        this.updateState(index, "size", value);
        break;
      case "data-color":
        this.updateState(index, "color", value);
        break;
      case "data-url":
        this.updateState(index, "url", value);
        break;
      case "data-extra":
        this.updateState(index, "extra", value);
        break;
    }
  }

  updateState(index, field, value) {
    if (!State.redeemData[index]) {
      State.redeemData[index] = this.getEmptyItem();
    }
    State.redeemData[index][field] = value;
    console.log(`Обновление товара #${index}: поле ${field} ->`, value);
    console.log("Текущее State.redeemData:", State.redeemData);
  }

  handleExcelUpload() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".xls,.xlsx";
    fileInput.addEventListener("change", (e) =>
      this.processExcelFile(e.target.files[0])
    );
    fileInput.click();
  }

  processExcelFile(file) {
    if (!file) return;

    // Обновляем состояние с файлом и показываем предпросмотр
    this.updateStateExcel(file);
    this.displayExcelPreview();

    // Очищаем все вручную введённые данные (input и изображение)
    this.clearAllManualFields();

    // Обновляем данные в State.redeemData: все поля устанавливаем в "Нет данных"
    this.clearRedeemData();

    // Прикрепленный Excel файл означает, что ручной ввод не используется, поэтому деактивируем поля
    this.disableFormFields();
    this.toggleUploadInputs(true);
    this.toggleExcelButton(true);
    this.toggleRootContainerClass(true);
  }

  displayExcelPreview() {
    // Предпросмотр добавляется в контейнер root
    let previewContainer = this.root.querySelector(".excel-preview");
    if (!previewContainer) {
      previewContainer = document.createElement("div");
      previewContainer.className = "excel-preview";
      const html = `
        <span class="file-name"></span>
        <button class="remove-excel">×</button>
      `;
      previewContainer.innerHTML = html;
      this.root.appendChild(previewContainer);
    }

    // Обновляем имя файла из состояния
    const fileName = State.excelData?.fileName || "";
    previewContainer.querySelector(".file-name").textContent = fileName;
    previewContainer.classList.add("active");

    // Заменяем кнопку на клон, чтобы избежать дублирования обработчиков
    const closeBtn = previewContainer.querySelector(".remove-excel");
    const newCloseBtn = closeBtn.cloneNode(true);
    closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
    newCloseBtn.addEventListener("click", () =>
      this.removeExcelFile(previewContainer)
    );
  }

  removeExcelFile(previewContainer) {
    if (previewContainer) {
      previewContainer.remove();
      this.enableFormFields();
      this.toggleUploadInputs(false);
      this.toggleExcelButton(false);
      this.toggleRootContainerClass(false);
      this.updateStateExcel(null);
    }
  }

  disableFormFields() {
    const form = this.root.querySelector(".main-calc-buy-info__form");
    if (form) {
      const inputs = form.querySelectorAll("input, select");
      inputs.forEach((input) => (input.disabled = true));
    }
    if (this.addButton) this.addButton.disabled = true;
  }

  enableFormFields() {
    const form = this.root.querySelector(".main-calc-buy-info__form");
    if (form) {
      const inputs = form.querySelectorAll("input, select");
      inputs.forEach((input) => (input.disabled = false));
    }
    if (this.addButton) this.addButton.disabled = false;
  }

  toggleUploadInputs(disabled) {
    const uploadInputs = this.root.querySelectorAll(".main-calc-upload__input");
    uploadInputs.forEach((input) => (input.disabled = disabled));
  }

  toggleExcelButton(hidden) {
    if (this.excelButton) {
      this.excelButton.style.display = hidden ? "none" : "flex";
    }
  }

  toggleRootContainerClass(disable) {
    if (disable) {
      this.root.classList.add("disable");
    } else {
      this.root.classList.remove("disable");
    }
  }

  updateStateExcel(file) {
    State.excelData = file
      ? {
          file: file,
          fileName: file.name,
          fileType: file.type,
        }
      : {};
  }

  getEmptyItem() {
    return {
      name: "",
      cost: "",
      currency: "dollar",
      quantity: 1,
      size: "",
      color: "",
      url: "",
      extra: "",
      image: "",
    };
  }

  // Метод для отправки данных в Telegram
  sendDataToTelegram() {
    // Если Excel-файл прикреплён, формируем сообщение по упрощённому шаблону
    if (State.excelData && State.excelData.fileName) {
      const clientName = State.clientData?.name || "-";
      const clientPhone = State.clientData?.phone || "-";

      const message =
        `<b>Новые данные для выкупа:</b>\n` +
        `Имя: ${clientName}\n` +
        `Телефон: ${clientPhone}\n` +
        `<b>Excel-файл:</b> ${State.excelData.fileName}\n`;

      telegramSender
        .sendMessage(message)
        .then((res) => {
          console.log("Текстовое сообщение (с Excel) отправлено!");
          // Отправляем Excel-файл как документ
          const file = State.excelData.file;
          const caption = "Прикреплён Excel-файл с данными";
          telegramSender
            .sendDocument(file, caption)
            .then((docRes) => {
              console.log("Excel-файл отправлен!", docRes);
            })
            .catch((docErr) => {
              console.error("Ошибка отправки Excel-файла:", docErr);
            });
        })
        .catch((err) => {
          console.error(
            "Ошибка при отправке текстового сообщения (с Excel):",
            err
          );
        });
    } else {
      // Если Excel-файл не прикреплён, формируем подробное сообщение по товарам
      const clientName = State.clientData?.name || "-";
      const clientPhone = State.clientData?.phone || "-";

      const data = State.redeemData;
      let message =
        `<b>Новые данные для выкупа:</b>\n\n` +
        `Имя: ${clientName}\n` +
        `Телефон: ${clientPhone}\n\n`;

      Object.keys(data).forEach((key) => {
        const item = data[key];
        message += `<b>Товар #${key}:</b>\n`;
        message += `Наименование: ${item.name || "-"}\n`;
        message += `Цена: ${item.cost || "-"} ${item.currency || ""}\n`;
        message += `Количество: ${item.quantity || "-"}\n`;
        message += `Размер: ${item.size || "-"}\n`;
        message += `Цвет: ${item.color || "-"}\n`;
        message += `Ссылка: ${item.url || "-"}\n`;
        message += `Примечание: ${item.extra || "-"}\n`;
        message += `Изображение: ${
          item.image ? "Прикреплено" : "Не прикреплено"
        }\n\n`;
      });

      telegramSender
        .sendMessage(message)
        .then((res) => {
          console.log("Текстовое сообщение отправлено!");
          // Если у товара прикреплены изображения, отправляем их
          Object.keys(data).forEach((key) => {
            const item = data[key];
            if (item.image && item.image !== "Нет данных") {
              const parts = item.image.split(",");
              if (parts.length === 2) {
                const contentTypeMatch = parts[0].match(/data:(.*?);base64/);
                const contentType = contentTypeMatch
                  ? contentTypeMatch[1]
                  : "image/png";
                const base64Data = parts[1];
                const blob = base64ToBlob(base64Data, contentType);
                const caption = `Изображение для товара #${key}`;
                telegramSender
                  .sendPhoto(blob, caption)
                  .then((photoRes) => {
                    console.log(
                      `Фото для товара #${key} отправлено!`,
                      photoRes
                    );
                  })
                  .catch((photoErr) => {
                    console.error(
                      `Ошибка отправки фото для товара #${key}:`,
                      photoErr
                    );
                  });
              }
            }
          });
        })
        .catch((err) => {
          console.error("Ошибка при отправке текстового сообщения:", err);
        });
    }
  }
}
