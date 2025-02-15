// ndsManager.js
import { State } from "../data/State.js";
import StateManager from "./stateManager.js";

export default class NdsManager {
  static setupNdsListeners(fields, formInstance) {
    const ndsInput = fields.nds;
    const customNdsCheckbox = fields.custom_nds;
    const ndsLock = document.querySelector(
      ".nds-block > .group-input__input_svg"
    );
    if (!ndsInput || !customNdsCheckbox) {
      console.warn("nds input или custom_nds чекбокс не найдены.");
      return;
    }

    // Начальная настройка: если чекбокс не выбран, поле отключено и выставлено значение "20"
    if (!customNdsCheckbox.checked) {
      ndsInput.disabled = true;
      ndsInput.value = "20";
      StateManager.updateState("nds", 0.2);
    } else {
      ndsInput.disabled = false;
    }

    // При изменении чекбокса custom_nds
    customNdsCheckbox.addEventListener("change", (e) => {
      if (e.target.checked) {
        ndsInput.disabled = false;
        ndsLock.classList.add("hidden");
      } else {
        ndsLock.classList.remove("hidden");
        ndsInput.disabled = true;
        ndsInput.value = "20";
        formInstance.removeError(ndsInput);
        StateManager.updateState("nds", 0.2);
      }
      formInstance.hideCalculationResult();
    });

    // При вводе в поле nds
    ndsInput.addEventListener("input", () => {
      // Разрешаем только цифры
      ndsInput.value = ndsInput.value.replace(/[^0-9]/g, "");

      let value = parseFloat(ndsInput.value);
      if (isNaN(value)) {
        value = 0;
        ndsInput.value = "";
      }

      // Ограничиваем значение от 0 до 100
      if (value < 0) {
        value = 0;
        ndsInput.value = "0";
      } else if (value > 100) {
        value = 100;
        ndsInput.value = "100";
      }

      // Конвертируем в десятичную форму (делим на 100)
      const decimalValue = value / 100;
      StateManager.updateState("nds", decimalValue);
      formInstance.removeError(ndsInput);
      formInstance.hideCalculationResult();
      console.log(State.nds);
    });

    ndsInput.addEventListener("blur", () => {
      // Если поле пустое, подставляем "0"
      if (ndsInput.value.trim() === "") {
        ndsInput.value = 0;
        StateManager.updateState("nds", 0); // Обновляем состояние
      }
    });
  }
}
