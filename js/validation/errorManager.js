// errorManager.js
export default class ErrorManager {
  static addError(field, message) {
    if (!field) return;
    const parent = field.closest(".group-input") || field.parentElement;
    const errorSpan = parent?.querySelector(".error-message");
    if (errorSpan) {
      errorSpan.textContent = message;
      errorSpan.style.display = "block";
    }
    field.classList.add("error-input");
  }

  static removeError(fieldEl) {
    if (!fieldEl) return;
    fieldEl.classList.remove("error-input");
    const parent = fieldEl.closest(".group-input") || fieldEl.parentElement;
    const errorSpan = parent?.querySelector(".error-message");
    if (errorSpan) {
      errorSpan.textContent = "";
      errorSpan.style.display = "none";
    }
  }

  static clearCategoryError() {
    const errorSpan = document.querySelector(".error-message-category");
    const errorBlock = document.querySelector(".js-error-category");
    if (errorSpan) {
      errorSpan.textContent = "";
      errorSpan.style.display = "none";
    }
    if (errorBlock) {
      errorBlock.classList.remove("active");
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
    this.clearCategoryError();
  }
}
