// stateManager.js
import { State } from "../data/State.js";

export default class StateManager {
  static updateState(prop, value) {
    State[prop] = value;
    const event = new CustomEvent("stateChange", {
      detail: { prop, value },
    });
    document.dispatchEvent(event);
  }

  static setupStateEventListener(formInstance) {
    document.addEventListener("stateChange", (event) => {
      const { prop, value } = event.detail;
      StateManager.handleStateChange(prop, value, formInstance);
    });
  }

  static handleStateChange(prop, value, formInstance) {
    if (prop === "address") {
      if (value) {
        formInstance.removeError(formInstance.fields.address);
      } else if (State.addressError) {
        formInstance.addError(formInstance.fields.address, State.addressError);
      }
      formInstance.hideCalculationResult();
    }

    if (prop === "addressError") {
      if (value) {
        formInstance.addError(formInstance.fields.address, value);
      } else {
        formInstance.removeError(formInstance.fields.address);
      }
      formInstance.hideCalculationResult();
    }
  }
}
