export class UiHandler {
  constructor(config) {
    this.config = config;
    this.init();
  }

  init() {
    this.handleAddClass();
    this.handleChangeClass();
    this.initIncrement();
    this.initSelectCategory();
    this.initCustomSelect();
    this.initPDFButton();
    this.initCalcType();
    this.initAddressToggle();
  }

  // AddClass компонент
  handleAddClass() {
    document
      .querySelectorAll(this.config.addClass.selector)
      .forEach((button) => {
        button.addEventListener("click", () => {
          const target = button.dataset.addclassTarget;
          const cls = button.dataset.addclassClass;

          document
            .querySelectorAll(`.${target}`)
            .forEach((el) => el.classList.toggle(cls));
          button.classList.toggle("clicked");
        });
      });
  }

  // ChangeClass компонент
  handleChangeClass() {
    document
      .querySelectorAll(this.config.changeClass.selector)
      .forEach((input) => {
        const handler = () => {
          const cls = input.dataset.changeclassClass;
          const targets = input.dataset.changeclassTargets
            .split(",")
            .map((s) => document.querySelector(s.trim()))
            .filter((e) => e);

          if (targets.length === 2) {
            const [first, second] = targets;
            input.checked
              ? first.classList.add(cls) || second.classList.remove(cls)
              : first.classList.remove(cls) || second.classList.add(cls);
          }
        };
        input.addEventListener("change", handler);
        handler();
      });
  }

  // Инкрементер
  initIncrement() {
    document
      .querySelectorAll(this.config.increment.selector)
      .forEach((group) => {
        const minus = group.querySelector(this.config.increment.minus);
        const plus = group.querySelector(this.config.increment.plus);
        const input = group.querySelector(this.config.increment.input);

        minus.addEventListener("click", () => input.value > 1 && input.value--);
        plus.addEventListener("click", () => input.value++);
      });
  }

  // Выбор категории с тултипами
  initSelectCategory() {
    document
      .querySelectorAll(this.config.selectCategory.selector)
      .forEach((select) => {
        const elements = {
          selected: select.querySelector(
            this.config.selectCategory.elements.selected
          ),
          options: select.querySelector(
            this.config.selectCategory.elements.options
          ),
          inputs: select.querySelectorAll(
            this.config.selectCategory.elements.inputs
          ),
          tooltip: {
            container: select.querySelector(
              this.config.selectCategory.elements.tooltip.container
            ),
            title: select.querySelector(
              this.config.selectCategory.elements.tooltip.title
            ),
            text: select.querySelector(
              this.config.selectCategory.elements.tooltip.text
            ),
          },
        };

        // Открытие/закрытие
        elements.selected.addEventListener("click", () => {
          elements.options.style.display =
            elements.options.style.display === "flex" ? "none" : "flex";
        });

        // Выбор опции
        elements.inputs.forEach((input) => {
          input.addEventListener("change", (e) => {
            const label = e.target.closest(
              this.config.selectCategory.labelSelector
            );
            elements.selected.innerHTML =
              this.config.selectCategory.template.selected(label);
            elements.options.style.display = "none";
          });
        });

        // Обработчики тултипов
        select
          .querySelectorAll(this.config.selectCategory.labelSelector)
          .forEach((label) => {
            label.addEventListener("mouseenter", () => {
              elements.tooltip.title.textContent = label.querySelector(
                this.config.selectCategory.elements.tooltip.title
              ).textContent;
              elements.tooltip.text.textContent = label.querySelector(
                this.config.selectCategory.elements.tooltip.text
              ).textContent;
              elements.tooltip.container.classList.add("active");
            });

            label.addEventListener("mouseleave", () => {
              elements.tooltip.container.classList.remove("active");
            });
          });

        // Закрытие при клике вне
        document.addEventListener("click", (e) => {
          if (!select.contains(e.target)) {
            elements.options.style.display = "none";
          }
        });
      });
  }

  // Кастомный селект валют
  initCustomSelect() {
    document
      .querySelectorAll(this.config.customSelect.selector)
      .forEach((select) => {
        const elements = {
          selected: select.querySelector(
            this.config.customSelect.elements.selected
          ),
          list: select.querySelector(this.config.customSelect.elements.list),
          inputs: select.querySelectorAll(
            this.config.customSelect.elements.inputs
          ),
        };

        elements.selected.parentElement.addEventListener("click", () => {
          elements.list.style.display =
            elements.list.style.display === "block" ? "none" : "block";
        });

        elements.inputs.forEach((input) => {
          input.addEventListener("change", (e) => {
            elements.selected.textContent = e.target
              .closest(this.config.customSelect.labelSelector)
              .querySelector(
                this.config.customSelect.elements.name
              ).textContent;
            elements.list.style.display = "none";
          });
        });

        document.addEventListener("click", (e) => {
          if (!select.contains(e.target)) {
            elements.list.style.display = "none";
          }
        });
      });
  }

  // PDF кнопка
  initPDFButton() {
    const updateButton = () => {
      this.config.pdfButton.element.disabled = !Array.from(
        this.config.pdfButton.radios
      ).some((r) => r.checked);
    };

    this.config.pdfButton.radios.forEach((radio) =>
      radio.addEventListener("change", updateButton)
    );
    updateButton();
  }

  // Тип калькулятора
  initCalcType() {
    this.config.calcType.radios.forEach((radio) => {
      radio.addEventListener("change", () => {
        const config = this.config.calcType[radio.value] || {};

        // Обновление классов
        config.classActions?.forEach(([selector, action, cls]) =>
          document
            .querySelectorAll(selector)
            .forEach((el) => el.classList[action](cls))
        );

        // Обновление текстов
        Object.entries(config.texts || {}).forEach(
          ([key, value]) =>
            (document.querySelector(
              this.config.calcType.selectors[key]
            ).textContent = value)
        );

        // Обновление плейсхолдеров
        Object.entries(config.placeholders || {}).forEach(
          ([name, value]) =>
            (document.querySelector(`input[name="${name}"]`).placeholder =
              value)
        );
      });
    });
  }

  // Переключение адреса
  initAddressToggle() {
    const { input, checkbox, icon } = this.config.addressToggle;
    const handler = () => {
      input.disabled = !checkbox.checked;
      icon.style.display = checkbox.checked ? "none" : "block";
    };
    checkbox.addEventListener("change", handler);
    handler();
  }
}
