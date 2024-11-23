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
});

document.addEventListener("DOMContentLoaded", () => {
  const selectedOption = document.getElementById("selected-option");
  const optionsContainer = document.getElementById("options-container");
  const options = document.querySelectorAll(".calc-select__input");

  // Открытие/закрытие выпадающего списка
  selectedOption.addEventListener("click", () => {
    optionsContainer.style.display =
      optionsContainer.style.display === "block" ? "none" : "block";
  });

  // Выбор опции
  options.forEach((option) => {
    option.addEventListener("change", (e) => {
      const label = e.target.closest(".calc-select__label");
      const optionName = label.querySelector(".calc-select__name").textContent;
      const tooltipTitle = label.querySelector(
        ".calc-tooltip__title"
      ).textContent;
      const tooltipText = label.querySelector(
        ".calc-tooltip__text"
      ).textContent;

      // Обновляем текст и tooltip в выбранной опции
      selectedOption.innerHTML = `
                ${optionName}
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
    if (!e.target.closest(".calc-select")) {
      optionsContainer.style.display = "none";
    }
  });
});

