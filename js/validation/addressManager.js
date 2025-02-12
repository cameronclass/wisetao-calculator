// addressManager.js
import { State } from "../data/State.js";
import StateManager from "./stateManager.js";

export default class AddressManager {
  static setupAddressCheckboxListener(fields, formInstance) {
    const addressCheckbox = fields.addressCheck;
    if (!addressCheckbox) {
      console.warn(
        "Чекбокс адреса с селектором \"input[name='address_checkbox']\" не найден."
      );
      return;
    }

    // Изначальное состояние при загрузке
    AddressManager.toggleToAddressElements(State.clientData.addressCheck);
    AddressManager.handleAddressCheckboxChange(
      fields,
      State.clientData.addressCheck,
      formInstance
    );

    addressCheckbox.addEventListener("change", (event) => {
      const isChecked = event.target.checked;
      AddressManager.toggleToAddressElements(isChecked);
      AddressManager.handleAddressCheckboxChange(
        fields,
        isChecked,
        formInstance
      );
      formInstance.hideCalculationResult();

      if (isChecked && !State.address) {
        StateManager.updateState(
          "addressError",
          "Пожалуйста, выберите адрес из списка."
        );
      } else if (!isChecked) {
        StateManager.updateState("addressError", null);
      }
    });
  }

  static toggleToAddressElements(isVisible) {
    const toAddressElements = document.querySelectorAll(".to-address");
    toAddressElements.forEach((element) => {
      if (isVisible) {
        element.classList.remove("hidden");
      } else {
        element.classList.add("hidden");
      }
    });
  }

  static handleAddressCheckboxChange(fields, isChecked, formInstance) {
    if (!isChecked && State.address) {
      if (fields.address) {
        fields.address.value = "";
      }
      StateManager.updateState("address", null);
      StateManager.updateState("addressError", null);
      formInstance.removeError(fields.address);
    }
  }
}
