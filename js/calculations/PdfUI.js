/**
 * Класс UIManager отвечает за:
 *  - Отслеживание изменений radio-инпутов для выбора типа расчёта
 *  - Обработку клика по кнопке для отправки запроса
 *  - Вызов нужных методов у offerManager, чтобы подготовить данные
 *    и отправить PDF-репорт
 */
class UIManager {
  constructor(offerManager, state) {
    // Сохраняем ссылки на уже имеющиеся объекты/синглтоны/экземпляры
    this.offerManager = offerManager;
    this.state = state;

    // Можно сразу найти нужные элементы в конструкторе, если они статичны
    this.calcTypeInputs = document.querySelectorAll('input[name="calc-type"]');
    this.button = document.querySelector(".js-get-pdf");
  }

  /**
   * Инициализирующий метод: навешивает обработчики на инпуты и на кнопку.
   * Вызывайте этот метод один раз после загрузки DOM.
   */
  init() {
    this.handleCalcTypeChange();
    this.handleButtonClick();
  }

  /**
   * Функция для обработки выбора типа расчета:
   * при изменении radio-инпутов мы просто «разрешаем» нажимать кнопку.
   */
  handleCalcTypeChange() {
    this.calcTypeInputs.forEach((input) => {
      input.addEventListener("change", () => {
        // Активируем кнопку при выборе любого типа
        this.button.disabled = false;
      });
    });
  }

  /**
   * Функция для обработки нажатия кнопки:
   * определяем, какой тип выбран, и вызываем подготовку+отправку запроса.
   */
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

      // Вызываем метод подготовки и отправки (ниже)
      await this.prepareAndSendRequest(selectedType);
    });
  }

  /**
   * Асинхронная функция для подготовки данных и отправки запроса
   * в зависимости от выбранного типа (calc-cargo или calc-customs).
   */
  async prepareAndSendRequest(selectedType) {
    if (selectedType === "calc-cargo") {
      // 1) Подтягиваем актуальные данные из State:
      this.offerManager.updateOfferDataComponentsFromState(this.state);
      // 2) Отправляем запрос (get-offer)
      await this.offerManager.sendPostRequest(
        this.offerManager.API_ENDPOINTS.getOffer,
        this.offerManager.getOfferDataComponents
      );
    } else if (selectedType === "calc-customs") {
      // 1) Подтянуть актуальные данные из State:
      this.offerManager.updateOfferWhiteDataComponentsFromState(this.state);
      // 2) Отправить запрос (get-offer-white)
      await this.offerManager.sendPostRequest(
        this.offerManager.API_ENDPOINTS.getOfferWhite,
        this.offerManager.getOfferWhiteDataComponents
      );
    }
  }
}

// Экспортируем класс (или можно экспортнуть сразу экземпляр, если удобно)
export { UIManager };
