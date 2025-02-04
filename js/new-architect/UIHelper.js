// UIHelper.js
class UIHelper {
  static addError(field, message) {
    if (!field) return;
    const parent = field.closest(".form-group") || field.parentElement;
    let errorSpan = parent.querySelector(".error-message");
    if (!errorSpan) {
      errorSpan = document.createElement("span");
      errorSpan.classList.add("error-message");
      parent.appendChild(errorSpan);
    }
    errorSpan.textContent = message;
    errorSpan.style.display = "block";
    field.classList.add("error-input");
  }

  static removeError(field) {
    if (!field) return;
    field.classList.remove("error-input");
    const parent = field.closest(".form-group") || field.parentElement;
    const errorSpan = parent.querySelector(".error-message");
    if (errorSpan) {
      errorSpan.textContent = "";
      errorSpan.style.display = "none";
    }
  }

  static clearErrors() {
    document
      .querySelectorAll(".error-input")
      .forEach((el) => el.classList.remove("error-input"));
    document.querySelectorAll(".error-message").forEach((el) => {
      el.textContent = "";
      el.style.display = "none";
    });
  }

  static hideCalculationResult() {
    const resultBlock = document.querySelector(".main-calc-result");
    if (resultBlock) {
      resultBlock.classList.remove("active");
    }
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
}

export default UIHelper;
