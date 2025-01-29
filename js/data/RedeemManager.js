// RedeemManager.js
import UiPrepare from "../ui/UiPrepare.js";
import { State } from "./State.js";

export default class RedeemManager {
  constructor(options = {}) {
    this.rootSelector = options.rootSelector || ".data-redeem";
    this.addButtonSelector = options.addButtonSelector || ".add-redeem";
    this.root = document.querySelector(this.rootSelector);
    this.addButton = document.querySelector(this.addButtonSelector);
    this.counter = 2;

    if (!State.redeemData) State.redeemData = {};

    this.uiPrepare = new UiPrepare(this.root);

    this.init();
  }

  init() {
    if (this.addButton) {
      this.addButton.addEventListener("click", () => this.addRedeemContainer());
    }
    const firstContainer = this.root.querySelector('[data-redeem="1"]');
    if (firstContainer) {
      this.setupContainerLogic(firstContainer, 1);
      State.redeemData[1] = this.getEmptyItem();
    }
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

    // Инициализируем обработчики для новых элементов
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

    // Логику плюс/минус не дублируем, это делает UiPrepare._initIncrement().

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
            alert("Пожалуйста, выберите файл изображения!");
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

    // (1) Если вдруг где-то висит ошибка - убираем её
    // (заимствовав метод removeError из FormValidation или написав аналог)
    if (typeof window.formValidation !== "undefined") {
      // если FormValidation доступен глобально
      window.formValidation.removeError(fieldEl);
    } else {
      // Либо своя логика удаления класса 'error-input' и очистки .error-message
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
    /* console.log(`Обновление товара #${index}: поле ${field} ->`, value);
    console.log("Текущее State.redeemData:", State.redeemData); */
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
}
