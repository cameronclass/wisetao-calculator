class PdfGenerate {
  constructor(PdfPrepare, state) {
    this.PdfPrepare = PdfPrepare;
    this.state = state;

    this.calcTypeInputs = document.querySelectorAll('input[name="calc-type"]');
    this.button = document.querySelector(".js-get-pdf");

    // Ссылки на элементы оверлея
    this.overlayCalc = document.querySelector(".main-calc__over");
    this.overlayMessageCalc = this.overlayCalc.querySelector(
      ".main-calc__over_pdf span:first-child"
    );
    this.overlayCountdownCalc = this.overlayCalc.querySelector(
      ".main-calc__over_pdf_count"
    );

    this.countdownTimer = null;

    this.init();
  }

  init() {
    this.handleCalcTypeChange();
    this.handleButtonClick();
    this.handleOverlayClick();
  }

  handleCalcTypeChange() {
    this.calcTypeInputs.forEach((input) => {
      input.addEventListener("change", () => {
        this.button.disabled = false;
      });
    });
  }

  handleButtonClick() {
    this.button.addEventListener("click", async () => {
      const selectedInput = document.querySelector(
        'input[name="calc-type"]:checked'
      );

      if (!selectedInput) {
        alert("Пожалуйста, выберите тип расчета.");
        return;
      }

      const selectedType = selectedInput.value;

      // Показать оверлей и запустить обратный отсчет
      this.showOverlay(
        "Идёт передача данных менеджеру <br> пожалуйста, подождите..."
      );
      this.startCountdown(20);

      // Вызываем метод подготовки и отправки
      try {
        await this.prepareAndSendRequest(selectedType);
        this.overlayMessageCalc.textContent =
          "Успешно получено. Нажмите на экран чтобы закрыть окно";
        this.stopCountdown();
      } catch (error) {
        console.error("Ошибка при получении PDF:", error);
        this.stopCountdown();
        this.overlayMessageCalc.textContent =
          "Произошла ошибка при получении PDF";
      }
    });
  }

  async prepareAndSendRequest(selectedType) {
    if (selectedType === "calc-cargo") {
      this.PdfPrepare.updateOfferDataComponentsFromState(this.state);
      await this.PdfPrepare.sendPostRequest(
        this.PdfPrepare.API_ENDPOINTS.getOffer,
        this.PdfPrepare.getOfferDataComponents
      );
    } else if (selectedType === "calc-customs") {
      this.PdfPrepare.updateOfferWhiteDataComponentsFromState(this.state);
      await this.PdfPrepare.sendPostRequest(
        this.PdfPrepare.API_ENDPOINTS.getOfferWhite,
        this.PdfPrepare.getOfferWhiteDataComponents
      );
    }
  }

  showOverlay(message) {
    this.overlayCalc.classList.add("active");
    this.overlayMessageCalc.innerHTML = message;
  }

  startCountdown(seconds = 10) {
    this.overlayCountdownCalc.textContent = seconds;
    this.countdownTimer = setInterval(() => {
      seconds--;
      if (seconds <= 0) {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
      } else {
        this.overlayCountdownCalc.textContent = seconds;
      }
    }, 1000);
  }

  stopCountdown() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    this.overlayCountdownCalc.textContent = "";
  }

  handleOverlayClick() {
    this.overlayCalc.addEventListener("click", (event) => {
      if (this.overlayMessageCalc.textContent.includes("Успешно получено")) {
        this.overlayCalc.classList.remove("active");
      }
    });
  }
}

// Экспортируем класс
export { PdfGenerate };
