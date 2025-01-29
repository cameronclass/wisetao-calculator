class UiPrepare {
  constructor(root = document) {
    this.root = document;
    this._init();
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
  }

  _initAddClassButtons() {
    this.root.querySelectorAll(".js-add-class-packing").forEach((button) => {
      button.addEventListener("click", function () {
        // Определим, какой класс добавлять/удалять
        const className = "active";
        // Определим, какой элемент нужно toggлить класс
        const targetElement = document.querySelector(
          ".main-calc-packing__content"
        );

        if (targetElement) {
          // Toggle класса у целевого элемента
          targetElement.classList.toggle(className);
          // Также можно добавить/удалить класс у кнопки
          this.classList.toggle("clicked");
        }
      });
    });
  }

  _initChangeClass() {
    this.root.querySelectorAll("[data-changeclass-class]").forEach((input) => {
      const handleClassChange = () => {
        const className = input.getAttribute("data-changeclass-class");
        const targets = input
          .getAttribute("data-changeclass-targets")
          .split(",")
          .map((selector) => this.root.querySelector(selector.trim()))
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

  _initIncrement() {
    this.root.querySelectorAll(".group-input-increment").forEach((element) => {
      const minusButton = element.querySelector(
        ".group-input-increment__minus"
      );
      const plusButton = element.querySelector(".group-input-increment__plus");
      const inputField = element.querySelector(".group-input-increment input");

      minusButton.addEventListener("click", () => {
        let currentValue = parseInt(inputField.value);
        if (currentValue > 1) {
          inputField.value = currentValue - 1;
        }
      });

      plusButton.addEventListener("click", () => {
        let currentValue = parseInt(inputField.value);
        inputField.value = currentValue + 1;
      });
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

  _initCustomSelect() {
    this.root.querySelectorAll(".currency-select").forEach((selectBlock) => {
      const selectedNameElement = selectBlock.querySelector(
        ".currency-select__selected_name"
      );
      const optionsList = selectBlock.querySelector(".currency-select__list");
      const radioButtons = selectBlock.querySelectorAll(
        ".custom-select__input"
      );

      selectedNameElement.parentElement.addEventListener("click", () => {
        optionsList.style.display =
          optionsList.style.display === "block" ? "none" : "block";
      });

      radioButtons.forEach((radio) => {
        radio.addEventListener("change", (e) => {
          const label = e.target.closest(".custom-select__label");
          const optionName = label.querySelector(
            ".custom-select__name"
          ).textContent;

          selectedNameElement.textContent = optionName;
          optionsList.style.display = "none";
        });
      });

      this.root.addEventListener("click", (e) => {
        if (!selectBlock.contains(e.target)) {
          optionsList.style.display = "none";
        }
      });
    });
  }

  _initAllPriceRadios() {
    const radioButtonsAllPrice = this.root.querySelectorAll(
      'input[name="all-price"]'
    );
    const pdfButtonAllPrice = this.root.querySelector(".js-get-pdf");

    const updateButtonState = () => {
      const isChecked = Array.from(radioButtonsAllPrice).some(
        (radio) => radio.checked
      );
      pdfButtonAllPrice.disabled = !isChecked;
    };

    radioButtonsAllPrice.forEach((radio) => {
      radio.addEventListener("change", updateButtonState);
    });

    updateButtonState();
  }

  _initCalcTypeRadios() {
    const calcTypeRadios = this.root.querySelectorAll(
      'input[name="calc-type"]'
    );
    const fromWhereInput = this.root.querySelector('input[name="from_where"]');
    const fromToInput = this.root.querySelector('input[name="from_to"]');
    const fromToContainer = this.root.querySelector(".main-calc__from-to_to");
    const tooltipTitle = fromToContainer.querySelector(".calc-tooltip__title");
    const tooltipText = fromToContainer.querySelector(".calc-tooltip__text");

    calcTypeRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        if (radio.value === "calc-customs" && radio.checked) {
          this.root.querySelector(".white-cargo").classList.add("active");
          this.root
            .querySelectorAll(".js-calc-category, .js-calc-brand")
            .forEach((elem) => {
              elem.classList.add("hidden");
            });
          fromWhereInput.placeholder = "Китай - Хейхе";
          fromToInput.placeholder = "Россия - Благовещенск";
          tooltipTitle.textContent = "Склад временного хранение";
          tooltipText.textContent =
            "Доставка осуществляется только до г.Благовещенск СВХ. Доставка до вашего города осуществляется с помощью российских транспортных компаний.";
        } else if (radio.value === "calc-cargo" && radio.checked) {
          this.root.querySelector(".white-cargo").classList.remove("active");
          this.root
            .querySelectorAll(".js-calc-category, .js-calc-brand")
            .forEach((elem) => {
              elem.classList.remove("hidden");
            });
          fromWhereInput.placeholder = "Китай - Фошань";
          fromToInput.placeholder = "Россия - Москва";
          tooltipTitle.textContent = "Южные ворота";
          tooltipText.textContent =
            "Доставка осуществляется только до г.Москва «Южные ворота». Доставка до вашего города осуществляется с помощью российских транспортных компаний.";
        } else {
          this.root.querySelector(".white-cargo").classList.remove("active");
          this.root
            .querySelectorAll(".js-calc-category, .js-calc-brand")
            .forEach((elem) => {
              elem.classList.remove("hidden");
            });
          fromWhereInput.placeholder = "";
          fromToInput.placeholder = "";
          tooltipTitle.textContent = "";
          tooltipText.textContent = "";
        }
      });
    });
  }

  _initAddressCheckbox() {
    const addressInput = this.root.querySelector('input[name="address"]');
    const addressCheckbox = this.root.querySelector(
      'input[name="address_checkbox"]'
    );
    const addressIcon = this.root.querySelector(
      ".main-calc__from-to_adress .group-input__input_svg"
    );

    const toggleAddressInput = () => {
      if (addressCheckbox.checked) {
        addressInput.disabled = false;
        addressIcon.style.display = "none";
      } else {
        addressInput.disabled = true;
        addressIcon.style.display = "block";
      }
    };

    addressCheckbox.addEventListener("change", toggleAddressInput);
  }
}

export default UiPrepare;
