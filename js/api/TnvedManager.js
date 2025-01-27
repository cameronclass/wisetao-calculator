// TnvedManager.js
import { State } from "../data/State.js";

export class TnvedManager {
  constructor(config) {
    this.apiBase = config.apiBase;

    // --- Поля для подсказок ---
    this.tnvedInput = config.tnvedInput;
    this.suggestionContainer = config.suggestionContainer;
    this.nameInput = config.nameInput;
    this.codeInput = config.codeInput;
    this.nameCodeContainer = config.nameCodeContainer;

    // --- Поля для дерева ---
    this.treeContainer = config.treeContainer;
    this.overlay = config.overlay;
    this.closeButton = config.closeButton;
    this.treeList = config.treeList;

    // --- Внутренние настройки ---
    this.debounceTimer = null;
    this.DEBOUNCE_DELAY = 500;
    this.isTreeOpen = false; // показываем, открыто ли дерево

    // --- Прочие вспомогательные ---
    this.loadingClass = "loading"; // CSS-класс при поиске
  }

  // ==========================
  // ИНИЦИАЛИЗАЦИЯ
  // ==========================
  init() {
    // 1) Ставим листенер на ввод TНВЭД
    this.tnvedInput.addEventListener("input", () => this.handleInput());

    // 2) Закрыть дерево
    this.closeButton.addEventListener("click", () => this.closeTree());
    this.overlay.addEventListener("click", () => this.closeTree());

    // 3) Листенер кликов внутри списка дерева
    this.treeList.addEventListener("click", (e) => this.handleTreeToggle(e));
  }

  // ==========================
  // Часть 1: ПОДСКАЗКИ (бывший SuggestionsService+UI)
  // ==========================
  async handleInput() {
    const query = this.tnvedInput.value.trim();

    // 1) Запоминаем введённое в State.tnvedSelection.inputValue
    State.tnvedSelection.inputValue = query;
    // 2) Сбрасываем выбранный элемент
    State.tnvedSelection.selectedItem = null;

    // Если пользователь начинает печатать заново,
    // убираем .active у блока name-code-container
    if (this.nameCodeContainer.classList.contains("active")) {
      this.nameCodeContainer.classList.remove("active");
      // Очистим поля отображения
      this.nameInput.textContent = "";
      this.codeInput.textContent = "";

      State.clientData.tnvedSelectedName = null;
      State.clientData.tnvedSelectedCode = null;
      State.clientData.tnvedSelectedImp = null;
    }

    // Если длина ввода <3 => не ищем
    if (query.length < 3) {
      this.hideSuggestions();
      return;
    }

    // Запускаем анимацию загрузки
    this.startLoadingAnimation();

    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(async () => {
      await this.loadSuggestions(query);
    }, this.DEBOUNCE_DELAY);
  }

  async loadSuggestions(query) {
    try {
      const data = await this.fetchSuggestions(query);
      this.stopLoadingAnimation();
      this.renderSuggestions(data);
    } catch (e) {
      console.error(e);
      this.stopLoadingAnimation();
      this.renderNoSuggestions();
    }
  }

  async fetchSuggestions(query) {
    const url = `${
      this.apiBase
    }/get-matching-names?good_name=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Ошибка загрузки подсказок");
    }
    return await response.json();
  }

  renderNoSuggestions() {
    this.suggestionContainer.innerHTML = "";
    const noItem = document.createElement("div");
    noItem.className = "suggestion-item";
    noItem.innerText = "Ничего не найдено";
    this.suggestionContainer.appendChild(noItem);
    this.showSuggestions();
  }

  renderSuggestions(data) {
    this.suggestionContainer.innerHTML = "";
    if (!Array.isArray(data) || data.length === 0) {
      this.renderNoSuggestions();
      return;
    }

    data.forEach((item, index) => {
      const suggestionItem = document.createElement("div");
      suggestionItem.className = "suggestion-item";

      // Имя (KR_NAIM) и код (CODE)
      const nameEl = document.createElement("div");
      nameEl.textContent = item.KR_NAIM;
      nameEl.style.fontWeight = "bold";

      const codeEl = document.createElement("div");
      codeEl.textContent = `Код: ${item.CODE}`;

      // Клик по всего блоку => выбор
      suggestionItem.addEventListener("click", () => {
        // 1) Сохраняем выбранный элемент в State
        State.tnvedSelection.selectedItem = item;
        State.tnvedSelection.inputValue = item.CODE;

        // 2) Заполняем поля визуально
        this.nameInput.textContent = item.KR_NAIM;
        this.codeInput.textContent = item.CODE;
        this.nameCodeContainer.classList.add("active");
        this.tnvedInput.value = item.CODE;

        // 3) Делаем запрос на parse-alta-duty
        this.fetchDataForChosenCode(item.CODE);

        // 4) Убираем ошибку, если была
        const tnvedField = document.querySelector('input[name="tnved_input"]');
        if (tnvedField) {
          tnvedField.classList.remove("error-input");
          const parent =
            tnvedField.closest(".form-group") || tnvedField.parentElement;
          const errorSpan = parent.querySelector(".error-message");
          if (errorSpan) errorSpan.textContent = "";
        }

        /* console.log("Выбран TНВЭД:", item); */
        this.hideSuggestions();
      });

      // Стрелка (справа), открывающая дерево
      const arrowEl = document.createElement("span");
      arrowEl.className = "open-tree-arrow";
      arrowEl.textContent = "➔";
      arrowEl.addEventListener("click", (e) => {
        e.stopPropagation();
        // Открываем дерево
        /* console.log("Открываем дерево для:", item); */
        this.openTree();
      });

      suggestionItem.appendChild(nameEl);
      suggestionItem.appendChild(codeEl);
      suggestionItem.appendChild(arrowEl);

      this.suggestionContainer.appendChild(suggestionItem);

      // Разделитель
      if (index < data.length - 1) {
        const divider = document.createElement("div");
        divider.className = "suggestion-divider";
        this.suggestionContainer.appendChild(divider);
      }
    });
    this.showSuggestions();
  }

  // Показать/Скрыть список подсказок
  showSuggestions() {
    this.suggestionContainer.style.display = "block";
  }
  hideSuggestions() {
    this.suggestionContainer.style.display = "none";
  }

  // Анимация загрузки
  startLoadingAnimation() {
    this.tnvedInput.classList.add(this.loadingClass);
  }
  stopLoadingAnimation() {
    this.tnvedInput.classList.remove(this.loadingClass);
  }

  /**
   * fetchDataForChosenCode: запрос на parse-alta-duty, чтобы получить % пошлины.
   */
  async fetchDataForChosenCode(code) {
    // .tnved-code-percent
    const tnvedPercentEl = document.querySelector(".tnved-code-percent");
    if (!tnvedPercentEl) {
      console.warn("Не найден .tnved-code-percent на странице");
      return;
    }

    tnvedPercentEl.textContent = "Ищем процент, подождите...";

    try {
      const response = await fetch(`${this.apiBase}/parse-alta-duty`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ code }),
      });
      if (!response.ok) {
        throw new Error("Ошибка при получении данных");
      }
      const data = await response.json();
      /* console.log("Доп. данные по коду:", data); */

      let percentValue = 10; // По умолчанию
      let infoText = "";

      if (data && typeof data.duty !== "undefined") {
        const dutyValue = Number(data.duty);
        if (!isNaN(dutyValue)) {
          percentValue = dutyValue;
          tnvedPercentEl.textContent = `${percentValue} %`;
        } else {
          tnvedPercentEl.textContent =
            "Нет информации по % пошлине, для наглядности будет использоваться 10%";
        }
        if (data.info && data.info.trim() !== "") {
          infoText = ` (${data.info})`;
        }
      } else {
        tnvedPercentEl.textContent = "Нет информации, используется 10%";
      }
      tnvedPercentEl.textContent += infoText;

      // Сохраняем в State
      State.tnvedSelection.chosenCodeImp = percentValue;

      // === Добавим сохранение в State.clientData ===
      // Предположим, нам нужно хранить:
      //   tnvedSelectedName
      //   tnvedSelectedCode
      //   tnvedSelectedImp
      /*       if (!State.clientData) {
        State.clientData = {};
      } */

      const selItem = State.tnvedSelection.selectedItem;
      // Если нет selectedItem, значит выбрали "вручную"?
      // Но обычно selectedItem уже должен быть
      const tnvedName = selItem ? selItem.KR_NAIM : "";
      const tnvedCode = selItem ? selItem.CODE : code;

      State.clientData.tnvedSelectedName = tnvedName;
      State.clientData.tnvedSelectedCode = tnvedCode;
      State.clientData.tnvedSelectedImp = percentValue;

      console.log("ТНВЭД Сохранено в State.clientData:", State.clientData);
    } catch (error) {
      console.error("Произошла ошибка:", error);
      tnvedPercentEl.textContent =
        "Нет информации по % пошлине (ошибка запроса), используется 10%";
      State.tnvedSelection.chosenCodeImp = 10;

      // При ошибке всё равно запишем в State.clientData?
      if (!State.clientData) {
        State.clientData = {};
      }
      // selItem?
      const selItem = State.tnvedSelection.selectedItem;
      const tnvedName = selItem ? selItem.KR_NAIM : "";
      const tnvedCode = selItem ? selItem.CODE : code;

      State.clientData.tnvedSelectedName = tnvedName;
      State.clientData.tnvedSelectedCode = tnvedCode;
      State.clientData.tnvedSelectedImp = 10;
    }
  }

  // ==========================
  // Часть 2: ДЕРЕВО ТНВЭД
  // ==========================
  async openTree() {
    if (this.isTreeOpen) return;
    // Загружаем корень дерева
    const items = await this.loadRoot();
    this.renderTreeItems(this.treeList, items);
    this.treeContainer.style.display = "block";
    this.overlay.style.display = "block";
    this.isTreeOpen = true;
  }

  closeTree() {
    this.treeContainer.style.display = "none";
    this.overlay.style.display = "none";
    this.treeList.innerHTML = "";
    this.isTreeOpen = false;
  }

  async handleTreeToggle(e) {
    if (!e.target.classList.contains("tnved-toggle-icon")) return;
    const parentItem = e.target.closest(".tnved-tree-item");
    if (!parentItem) return;

    const subTree = parentItem.querySelector(".tnved-sub-tree");
    if (subTree) {
      // Если уже было загружено
      subTree.classList.toggle("open");
      e.target.classList.toggle("expanded");
    } else {
      // Догрузить потомков
      const dataId = parentItem.getAttribute("data-id");
      const children = await this.loadChildren(dataId);
      const newSubTree = document.createElement("ul");
      newSubTree.className = "tnved-sub-tree";
      parentItem.appendChild(newSubTree);
      this.renderTreeItems(newSubTree, children);
      newSubTree.classList.add("open");
      e.target.classList.add("expanded");
    }
  }

  // ==========================
  // Сервис: загрузка дерева
  // ==========================
  async loadRoot() {
    const url = `${this.apiBase}/get-tree-elems?parentNode=`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Ошибка загрузки дерева (root)");
    const textData = await response.text();
    return this.parseTreeItems(textData);
  }

  async loadChildren(parentId) {
    const url = `${this.apiBase}/get-tree-elems?parentNode=${encodeURIComponent(
      parentId
    )}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Ошибка загрузки поддерева");
    const textData = await response.text();
    return this.parseTreeItems(textData);
  }

  parseTreeItems(htmlString) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlString;
    const items = tempDiv.querySelectorAll("li[data-id]");
    const result = [];
    items.forEach((li) => {
      const dataId = li.getAttribute("data-id");
      const text = li.textContent.trim();
      const codeEl = li.querySelector(".tnved-tree__node-code");
      const code = codeEl ? codeEl.textContent.trim() : null;
      result.push({ dataId, text, code });
    });
    return result;
  }

  // Рендер узлов дерева
  renderTreeItems(container, items) {
    container.innerHTML = "";
    items.forEach((it) => {
      const li = document.createElement("li");
      li.className = "tnved-tree-item";
      li.setAttribute("data-id", it.dataId);

      const line = document.createElement("div");
      line.className = "tnved-tree-item-line";

      const toggleIcon = document.createElement("div");
      toggleIcon.className = "tnved-toggle-icon";

      // Если есть code => кликабельный
      if (it.code && it.code.length > 0) {
        const codeSpan = document.createElement("span");
        codeSpan.className = "tnved-code";
        codeSpan.textContent = it.code;
        codeSpan.addEventListener("click", () => {
          // Доп. логика при выборе кода из дерева
          console.log("Выбрали из дерева:", it);
          // Можно закрыть дерево
          this.closeTree();

          // Пример: подставим в поле?
          this.tnvedInput.value = it.code;
          // + если хотите дополнительно вызвать fetchDataForChosenCode?
          this.fetchDataForChosenCode(it.code);
        });

        li.appendChild(line);
        li.appendChild(toggleIcon);
        li.appendChild(codeSpan);
      } else {
        li.appendChild(line);
        li.appendChild(toggleIcon);
      }

      const textSpan = document.createElement("span");
      textSpan.className = "tnved-item-text";
      textSpan.textContent = it.text;
      li.appendChild(textSpan);

      container.appendChild(li);
    });

    // Для визуального оформления линии
    const emptyLi = document.createElement("li");
    emptyLi.className = "tnved-tree-item";
    emptyLi.style.height = "0";
    container.appendChild(emptyLi);
  }
}
