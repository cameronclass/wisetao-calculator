document.addEventListener("DOMContentLoaded", () => {
  /* AddClass data attributes */
  document.querySelectorAll(".js-add-class-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const targetClass = this.getAttribute("data-addclass-target"); // Получаем класс целевых блоков
      const className = this.getAttribute("data-addclass-class"); // Получаем имя класса

      const targetElements = document.querySelectorAll(`.${targetClass}`); // Находим все элементы с указанным классом
      targetElements.forEach((targetElement) => {
        targetElement.classList.toggle(className); // Добавляем или удаляем класс
      });

      this.classList.toggle("clicked"); // Добавляем или удаляем класс clicked к самой кнопке
    });
  });
  /* Change Class */
  const changeClassInputs = document.querySelectorAll(
    "[data-changeclass-class]"
  );
  changeClassInputs.forEach((input) => {
    const handleClassChange = () => {
      const className = input.getAttribute("data-changeclass-class"); // Получаем класс
      const targets = input
        .getAttribute("data-changeclass-targets")
        .split(",") // Разделяем по запятой
        .map((selector) => document.querySelector(selector.trim())) // Ищем элементы
        .filter((el) => el !== null); // Исключаем несуществующие элементы

      if (targets.length === 2) {
        const [first, second] = targets;

        if (input.checked) {
          // Если чекбокс активен
          first.classList.add(className);
          second.classList.remove(className);
        } else {
          // Если чекбокс неактивен
          first.classList.remove(className);
          second.classList.add(className);
        }
      }
    };

    // Привязываем обработчик на событие change
    input.addEventListener("change", handleClassChange);

    // Инициализация для начального состояния
    handleClassChange();
  });
  /* Increment */
  document
    .querySelectorAll(".group-input-increment")
    .forEach(function (element) {
      const minusButton = element.querySelector(
        ".group-input-increment__minus"
      );
      const plusButton = element.querySelector(".group-input-increment__plus");
      const inputField = element.querySelector(".group-input-increment input");

      minusButton.addEventListener("click", function () {
        let currentValue = parseInt(inputField.value);
        if (currentValue > 1) {
          // Предотвращаем отрицательные значения
          inputField.value = currentValue - 1;
        }
      });

      plusButton.addEventListener("click", function () {
        let currentValue = parseInt(inputField.value);
        inputField.value = currentValue + 1;
      });
    });

  /* Select Category */
  document.querySelectorAll(".calc-select").forEach((selectBlock) => {
    const selectedOption = selectBlock.querySelector(".calc-select__selected");
    const optionsContainer = selectBlock.querySelector(".calc-select__options");
    const options = selectBlock.querySelectorAll(".calc-select__input");

    // Открытие/закрытие выпадающего списка
    selectedOption.addEventListener("click", () => {
      optionsContainer.style.display =
        optionsContainer.style.display === "flex" ? "none" : "flex";
    });

    // Выбор опции
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

        // Обновляем текст и tooltip в выбранной опции
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

        optionsContainer.style.display = "none"; // Закрыть список
      });
    });

    // Закрытие списка при клике вне селекта
    document.addEventListener("click", (e) => {
      if (!selectBlock.contains(e.target)) {
        optionsContainer.style.display = "none";
      }
    });
  });

  /* Custom select */
  document.querySelectorAll(".currency-select").forEach((selectBlock) => {
    const selectedNameElement = selectBlock.querySelector(
      ".currency-select__selected_name"
    );
    const optionsList = selectBlock.querySelector(".currency-select__list");
    const radioButtons = selectBlock.querySelectorAll(".custom-select__input");

    // Открытие/закрытие выпадающего списка
    selectedNameElement.parentElement.addEventListener("click", () => {
      optionsList.style.display =
        optionsList.style.display === "block" ? "none" : "block";
    });

    // Выбор опции
    radioButtons.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        const label = e.target.closest(".custom-select__label");
        const optionName = label.querySelector(
          ".custom-select__name"
        ).textContent;

        // Обновляем текст в выбранной опции
        selectedNameElement.textContent = optionName;

        optionsList.style.display = "none"; // Закрыть список
      });
    });

    // Закрытие списка при клике вне селекта
    document.addEventListener("click", (e) => {
      if (!selectBlock.contains(e.target)) {
        optionsList.style.display = "none";
      }
    });
  });
});
