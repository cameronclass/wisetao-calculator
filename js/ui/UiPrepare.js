// UiPrepare.js
export default class UiPrepare {
  constructor() {
    this.root = document;
    /* this._init(); */
  }

  _init() {
    this._initAddClassButtons();
    this._initChangeClass();
    this._initIncrement();
    this._initSelectCategory();
    this._initCustomSelect();
    this._initAllPriceRadios();
    this._initCalcTypeRadios();
    this._initAddressCheckbox();
    this._initDeliveryOptionRadios();
  }

  _initDeliveryOptionRadios() {
    const radioButtons = document.querySelectorAll(
      'input[name="delivery-option"]'
    );

    const deliveryOptionHandler = () => {
      const targetElements = document.querySelectorAll(
        ".сlient-data, .client-redeem-data"
      );

      // Проверяем, какая радиокнопка активна
      const isDeliveryAndPickup = Array.from(radioButtons).some(
        (radio) => radio.value === "delivery-and-pickup" && radio.checked
      );

      targetElements.forEach((element) => {
        if (isDeliveryAndPickup) {
          element.classList.add("active");
        } else {
          element.classList.remove("active");
        }
      });
    };

    // Добавляем обработчик события для всех радиокнопок
    radioButtons.forEach((radio) => {
      radio.addEventListener("change", deliveryOptionHandler);
    });

    // Вызываем обработчик один раз при инициализации
    deliveryOptionHandler();
  }

  _initAddClassButtons() {
    document.querySelectorAll(".js-add-class-packing").forEach((button) => {
      button.addEventListener("click", function () {
        const className = "active";
        const targetElement = document.querySelector(
          ".main-calc-packing__content"
        );
        if (targetElement) {
          targetElement.classList.toggle(className);
          this.classList.toggle("clicked");
        }
      });
    });
  }

  _initChangeClass() {
    document.querySelectorAll("[data-changeclass-class]").forEach((input) => {
      const handleClassChange = () => {
        const className = input.getAttribute("data-changeclass-class");
        const targets = input
          .getAttribute("data-changeclass-targets")
          .split(",")
          .map((selector) => document.querySelector(selector.trim()))
          .filter((el) => el !== null);

        if (targets.length === 2) {
          const [first, second] = targets;
          if (input.checked) {
            first.classList.add(className);
            second.classList.remove(className);
          } else {
            first.classList.remove(className);
            second.classList.add(className);
          }
        }
      };

      input.addEventListener("change", handleClassChange);
      handleClassChange();
    });
  }

  _initSelectCategory() {
    this.root.querySelectorAll(".calc-select").forEach((selectBlock) => {
      const selectedOption = selectBlock.querySelector(
        ".calc-select__selected"
      );
      const optionsContainer = selectBlock.querySelector(
        ".calc-select__options"
      );
      const options = selectBlock.querySelectorAll(".calc-select__input");
      const overflowTooltip = selectBlock.querySelector(".overflow-tooltip");
      const overflowTitle = overflowTooltip.querySelector(
        ".calc-tooltip__title"
      );
      const overflowText = overflowTooltip.querySelector(".calc-tooltip__text");

      selectedOption.addEventListener("click", () => {
        optionsContainer.style.display =
          optionsContainer.style.display === "flex" ? "none" : "flex";
      });

      options.forEach((option) => {
        option.addEventListener("change", (e) => {
          const label = e.target.closest(".calc-select__label");
          const optionName =
            label.querySelector(".calc-select__name").textContent;
          const tooltipTitle = label.querySelector(
            ".calc-tooltip__title"
          ).textContent;
          const tooltipText = label.querySelector(
            ".calc-tooltip__text"
          ).textContent;

          selectedOption.innerHTML = `
            <span>${optionName}</span>
            <span class="tooltip selected-tooltip">
              <span class="tooltip-icon">?</span>
              <span class="calc-tooltip">
                <span class="calc-tooltip__title">${tooltipTitle}</span>
                <span class="calc-tooltip__text">${tooltipText}</span>
              </span>
            </span>
          `;

          optionsContainer.style.display = "none";
        });
      });

      selectBlock.querySelectorAll(".calc-select__label").forEach((label) => {
        label.addEventListener("mouseenter", () => {
          const tooltipTitle = label.querySelector(
            ".calc-tooltip__title"
          ).textContent;
          const tooltipText = label.querySelector(
            ".calc-tooltip__text"
          ).textContent;

          overflowTitle.textContent = tooltipTitle;
          overflowText.textContent = tooltipText;
          overflowTooltip.classList.add("active");
        });

        label.addEventListener("mouseleave", () => {
          overflowTooltip.classList.remove("active");
        });
      });

      this.root.addEventListener("click", (e) => {
        if (!selectBlock.contains(e.target)) {
          optionsContainer.style.display = "none";
        }
      });
    });
  }

  _initIncrement() {
    this.root.querySelectorAll(".group-input-increment").forEach((element) => {
      const minusButton = element.querySelector(
        ".group-input-increment__minus"
      );
      const plusButton = element.querySelector(".group-input-increment__plus");
      const inputField = element.querySelector(".group-input-increment input");

      if (minusButton && !minusButton.dataset.incrementBound) {
        minusButton.addEventListener("click", () => {
          let currentValue = parseInt(inputField.value) || 1;
          if (currentValue > 1) {
            inputField.value = currentValue - 1;
            inputField.dispatchEvent(new Event("input"));
          }
        });
        minusButton.dataset.incrementBound = "true";
      }

      if (plusButton && !plusButton.dataset.incrementBound) {
        plusButton.addEventListener("click", () => {
          let currentValue = parseInt(inputField.value) || 1;
          inputField.value = currentValue + 1;
          inputField.dispatchEvent(new Event("input"));
        });
        plusButton.dataset.incrementBound = "true";
      }
    });
  }

  _initIncrementForElement(element) {
    const minusButton = element.querySelector(".group-input-increment__minus");
    const plusButton = element.querySelector(".group-input-increment__plus");
    const inputField = element.querySelector(".group-input-increment input");

    if (minusButton) {
      minusButton.addEventListener("click", () => {
        let currentValue = parseInt(inputField.value) || 1;
        if (currentValue > 1) {
          inputField.value = currentValue - 1;
          inputField.dispatchEvent(new Event("input"));
        }
      });
    }

    if (plusButton) {
      plusButton.addEventListener("click", () => {
        let currentValue = parseInt(inputField.value) || 1;
        inputField.value = currentValue + 1;
        inputField.dispatchEvent(new Event("input"));
      });
    }
  }

  _initCustomSelectForElement(element) {
    const selectBlock = element.querySelector(".currency-select");
    if (!selectBlock) return;

    const selectedNameElement = selectBlock.querySelector(
      ".currency-select__selected_name"
    );
    const optionsList = selectBlock.querySelector(".currency-select__list");
    const radioButtons = selectBlock.querySelectorAll(".custom-select__input");

    const toggleList = () => {
      optionsList.style.display =
        optionsList.style.display === "block" ? "none" : "block";
    };

    if (selectedNameElement) {
      selectedNameElement.parentElement.addEventListener("click", toggleList);
    }

    radioButtons.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        const label = e.target.closest(".custom-select__label");
        const optionName = label.querySelector(
          ".custom-select__name"
        ).textContent;
        const selectedName = selectBlock.querySelector(
          ".currency-select__selected_name"
        );
        if (selectedName) {
          selectedName.textContent = optionName;
        }
        optionsList.style.display = "none";
      });
    });
  }

  _initCustomSelect() {
    document.querySelectorAll(".currency-select").forEach((selectBlock) => {
      const selectedNameElement = selectBlock.querySelector(
        ".currency-select__selected_name"
      );
      const optionsList = selectBlock.querySelector(".currency-select__list");
      const radioButtons = selectBlock.querySelectorAll(
        ".custom-select__input"
      );

      const toggleList = () => {
        optionsList.style.display =
          optionsList.style.display === "block" ? "none" : "block";
      };

      // Проверяем, не повешен ли уже:
      if (selectedNameElement && !selectedNameElement.dataset.selectBound) {
        selectedNameElement.parentElement.addEventListener("click", toggleList);
        selectedNameElement.dataset.selectBound = "true";
      }

      radioButtons.forEach((radio) => {
        if (!radio.dataset.selectBound) {
          radio.addEventListener("change", (e) => {
            const label = e.target.closest(".custom-select__label");
            const optionName = label.querySelector(
              ".custom-select__name"
            ).textContent;
            selectedNameElement.textContent = optionName;
            optionsList.style.display = "none";
          });
          radio.dataset.selectBound = "true";
        }
      });

      document.addEventListener("click", (e) => {
        if (!selectBlock.contains(e.target)) {
          optionsList.style.display = "none";
        }
      });
    });
  }

  _initAllPriceRadios() {
    const radioButtonsAllPrice = document.querySelectorAll(
      'input[name="all-price"]'
    );
    const pdfButtonAllPrice = document.querySelector(".js-get-pdf");

    const updateButtonState = () => {
      const isChecked = Array.from(radioButtonsAllPrice).some(
        (radio) => radio.checked
      );
      if (pdfButtonAllPrice) {
        pdfButtonAllPrice.disabled = !isChecked;
      }
    };
    radioButtonsAllPrice.forEach((radio) => {
      radio.addEventListener("change", updateButtonState);
    });
    updateButtonState();
  }

  _initCalcTypeRadios() {
    const calcTypeRadios = document.querySelectorAll('input[name="calc-type"]');
    const fromWhereInput = document.querySelector('input[name="from_where"]');
    const fromToInput = document.querySelector('input[name="from_to"]');
    const fromToContainer = document.querySelector(".main-calc__from-to_to");
    const tooltipTitle = fromToContainer.querySelector(".calc-tooltip__title");
    const tooltipText = fromToContainer.querySelector(".calc-tooltip__text");

    calcTypeRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        if (radio.value === "calc-customs" && radio.checked) {
          document.querySelector(".white-cargo").classList.add("active");
          document
            .querySelectorAll(".js-calc-category, .js-calc-brand")
            .forEach((elem) => elem.classList.add("hidden"));
          fromWhereInput.placeholder = "Китай - Хейхе";
          fromToInput.placeholder = "Россия - Благовещенск";
          tooltipTitle.textContent = "Склад временного хранение";
          tooltipText.textContent =
            "Доставка осуществляется только до г.Благовещенск СВХ...";
        } else if (radio.value === "calc-cargo" && radio.checked) {
          document.querySelector(".white-cargo").classList.remove("active");
          document
            .querySelectorAll(".js-calc-category, .js-calc-brand")
            .forEach((elem) => elem.classList.remove("hidden"));
          fromWhereInput.placeholder = "Китай - Фошань";
          fromToInput.placeholder = "Россия - Москва";
          tooltipTitle.textContent = "Южные ворота";
          tooltipText.textContent =
            "Доставка осуществляется только до г.Москва «Южные ворота»...";
        } else {
          document.querySelector(".white-cargo").classList.remove("active");
          document
            .querySelectorAll(".js-calc-category, .js-calc-brand")
            .forEach((elem) => elem.classList.remove("hidden"));
          fromWhereInput.placeholder = "";
          fromToInput.placeholder = "";
          tooltipTitle.textContent = "";
          tooltipText.textContent = "";
        }
      });
    });
  }

  _initAddressCheckbox() {
    const addressInput = document.querySelector('input[name="address"]');
    const addressCheckbox = document.querySelector(
      'input[name="address_checkbox"]'
    );
    const addressIcon = document.querySelector(
      ".main-calc__from-to_adress .group-input__input_svg"
    );

    if (addressCheckbox) {
      addressCheckbox.addEventListener("change", () => {
        if (addressCheckbox.checked) {
          addressInput.disabled = false;
          if (addressIcon) addressIcon.style.display = "none";
        } else {
          addressInput.disabled = true;
          if (addressIcon) addressIcon.style.display = "block";
        }
      });
    }
  }
}
