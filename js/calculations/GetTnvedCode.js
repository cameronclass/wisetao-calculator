import { State } from "../data/State.js";

class SuggestionsService {
  constructor(apiBase) {
    this.apiBase = apiBase;
  }

  async fetchSuggestions(query) {
    const url = `${
      this.apiBase
    }/get-matching-names?good_name=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Ошибка загрузки подсказок");
    return await response.json();
  }
}

class SuggestionsUI {
  constructor({
    inputField, // tnved-input
    suggestionContainer, // блок с выпадающим списком
    nameInput, // tnved-name-input
    codeInput, // tnved-code-input
    nameCodeContainer, // сам блок .name-code-container
  }) {
    this.inputField = inputField;
    this.suggestionContainer = suggestionContainer;
    this.nameInput = nameInput;
    this.codeInput = codeInput;
    this.nameCodeContainer = nameCodeContainer;

    this.debounceTimer = null;
    this.DEBOUNCE_DELAY = 2000;
    this.suggestionsService = null; // будет установлено извне
    this.onItemSelect = null; // колбэк при выборе элемента (если нужно)
    this.onTreeOpen = null; // колбэк при открытии дерева (клик по стрелке)
  }

  init() {
    this.inputField.addEventListener("input", () => this.handleInput());
  }

  handleInput() {
    const query = this.inputField.value.trim();

    // 1) Запоминаем введённое в State
    State.tnvedSelection.inputValue = this.inputField.value;
    // 2) Сбрасываем выбранный элемент
    State.tnvedSelection.selectedItem = null;

    // Если пользователь начинает печатать заново,
    // убираем .active у блока name-code-container
    if (this.nameCodeContainer.classList.contains("active")) {
      this.nameCodeContainer.classList.remove("active");
      // Очистим поля
      this.nameInput.textContent = "";
      this.codeInput.textContent = "";
    }

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
      const data = await this.suggestionsService.fetchSuggestions(query);
      this.stopLoadingAnimation();
      this.renderSuggestions(data);
    } catch (e) {
      console.error(e);
      this.stopLoadingAnimation();
      this.renderNoSuggestions();
    }
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

      // Имя и код
      const nameEl = document.createElement("div");
      nameEl.textContent = item.KR_NAIM;
      nameEl.style.fontWeight = "bold";

      const codeEl = document.createElement("div");
      codeEl.textContent = `Код: ${item.CODE}`;

      // Клик по suggestionItem = выбор
      suggestionItem.addEventListener("click", () => {
        // Устанавливаем выбранный элемент в State
        State.tnvedSelection.selectedItem = item;
        // А также обновим inputValue, если нужно
        State.tnvedSelection.inputValue = item.CODE;

        // Устанавливаем значения в поля (визуально)
        this.nameInput.textContent = item.KR_NAIM;
        this.codeInput.textContent = item.CODE;

        // Показываем блок
        this.nameCodeContainer.classList.add("active");
        // Записываем код в поле, если нужно
        this.inputField.value = item.CODE;

        // Если нужно убрать ошибку:
        const field = document.querySelector('input[name="tnved_input"]');
        if (field) {
          // Убираем класс "error-input"
          field.classList.remove("error-input");
          // Очищаем текст ошибки (если есть .error-message в родителе)
          const parent = field.closest(".form-group") || field.parentElement;
          const errorSpan = parent.querySelector(".error-message");
          if (errorSpan) {
            errorSpan.textContent = "";
          }
        }

        console.table(item);

        if (typeof this.onItemSelect === "function") {
          this.onItemSelect(item);
        }

        this.hideSuggestions();
      });

      // Стрелка/ссылка (справа), открывающая дерево
      const arrowEl = document.createElement("span");
      arrowEl.className = "open-tree-arrow";
      arrowEl.textContent = "➔";
      // Остановим всплытие, чтобы клик именно по стрелке не выбирал подсказку
      arrowEl.addEventListener("click", (e) => {
        e.stopPropagation();
        // Вызываем колбэк открытия дерева
        if (typeof this.onTreeOpen === "function") {
          this.onTreeOpen(item);
        }
      });

      suggestionItem.appendChild(nameEl);
      suggestionItem.appendChild(codeEl);
      suggestionItem.appendChild(arrowEl);

      this.suggestionContainer.appendChild(suggestionItem);

      if (index < data.length - 1) {
        const divider = document.createElement("div");
        divider.className = "suggestion-divider";
        this.suggestionContainer.appendChild(divider);
      }
    });
    this.showSuggestions();
  }

  showSuggestions() {
    this.suggestionContainer.style.display = "block";
  }

  hideSuggestions() {
    this.suggestionContainer.style.display = "none";
  }

  // Запустить анимацию загрузки на поле ввода
  startLoadingAnimation() {
    this.inputField.classList.add("loading");
  }

  // Остановить анимацию загрузки
  stopLoadingAnimation() {
    this.inputField.classList.remove("loading");
  }
}

class TnvedTreeService {
  constructor(apiBase) {
    this.apiBase = apiBase;
  }

  async loadRoot() {
    const url = `${this.apiBase}/get-tree-elems?parentNode=`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Ошибка загрузки дерева");
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
}

class TnvedTreeUI {
  constructor({ treeContainer, overlay, closeButton, treeList }) {
    this.treeContainer = treeContainer;
    this.overlay = overlay;
    this.closeButton = closeButton;
    this.treeList = treeList;
    this.treeService = null; // будет установлен извне
    this.isOpen = false;
  }

  init() {
    this.closeButton.addEventListener("click", () => this.close());
    this.overlay.addEventListener("click", () => this.close());
    this.treeList.addEventListener("click", (e) => this.handleToggle(e));
  }

  async open() {
    if (!this.isOpen) {
      // Загружаем корневые элементы
      const items = await this.treeService.loadRoot();
      this.renderItems(this.treeList, items);
      this.treeContainer.style.display = "block";
      this.overlay.style.display = "block";
      this.isOpen = true;
    }
  }

  close() {
    this.treeContainer.style.display = "none";
    this.overlay.style.display = "none";
    this.treeList.innerHTML = "";
    this.isOpen = false;
  }

  async handleToggle(e) {
    if (!e.target.classList.contains("tnved-toggle-icon")) return;
    const parentItem = e.target.closest(".tnved-tree-item");
    if (!parentItem) return;

    const subTree = parentItem.querySelector(".tnved-sub-tree");
    if (subTree) {
      // Если поддерево уже загружено
      subTree.classList.toggle("open");
      e.target.classList.toggle("expanded");
      this.correctLineHeights(subTree);
    } else {
      // Догружаем поддерево
      const dataId = parentItem.getAttribute("data-id");
      const children = await this.treeService.loadChildren(dataId);
      if (children.length > 0) {
        const newSubTree = document.createElement("ul");
        newSubTree.className = "tnved-sub-tree";
        parentItem.appendChild(newSubTree);
        this.renderItems(newSubTree, children);
        newSubTree.classList.add("open");
        e.target.classList.add("expanded");
        this.correctLineHeights(newSubTree);
      }
    }
  }

  renderItems(container, items) {
    container.innerHTML = "";
    items.forEach((it) => {
      const li = document.createElement("li");
      li.className = "tnved-tree-item";
      li.setAttribute("data-id", it.dataId);

      const line = document.createElement("div");
      line.className = "tnved-tree-item-line";

      const toggleIcon = document.createElement("div");
      toggleIcon.className = "tnved-toggle-icon";

      // Если есть код, отображаем его как кликабельный
      if (it.code && it.code.length > 0) {
        const codeSpan = document.createElement("span");
        codeSpan.className = "tnved-code";
        codeSpan.textContent = it.code;
        codeSpan.addEventListener("click", () => {
          console.table(it);
          // Дополнительная логика при выборе кода (если нужно)
          this.close();
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
    // Добавляем пустой элемент для визуального оформления линии
    const emptyLi = document.createElement("li");
    emptyLi.className = "tnved-tree-item";
    emptyLi.style.height = "0";
    container.appendChild(emptyLi);

    this.correctLineHeights(container);
  }

  correctLineHeights(container) {
    const items = container.querySelectorAll(".tnved-tree-item");
    const arr = Array.from(items);
    arr.forEach((item, index) => {
      if (index < arr.length - 1) {
        const next = arr[index + 1];
        const line = item.querySelector(".tnved-tree-item-line");
        if (!line) return;
        const currentHeight = item.clientHeight;
        const nextHeight = next.clientHeight;
        const lineHeight = (currentHeight + nextHeight) / 2 + 10;
        line.style.height = lineHeight + "px";
        line.style.top = currentHeight / 2 + "px";
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const apiBase = "https://api-calc.wisetao.com:4343/api";

  const nameInput = document.querySelector(".tnved-name-input");
  const codeInput = document.querySelector(".tnved-code-input");
  const tnvedInput = document.querySelector(".tnved-input");
  const suggestionContainer = document.querySelector(".suggestion");
  const nameCodeContainer = document.querySelector(".name-code-container");

  // Дерево
  const treeContainer = document.querySelector(".tnved-tree-container");
  const overlay = document.querySelector(".overlay");
  const closeButton = document.querySelector(".tnved-tree-close-button");
  const treeList = document.querySelector(".tnved-tree-list");

  // Инициализация сервисов
  const suggestionsService = new SuggestionsService(apiBase);
  const tnvedTreeService = new TnvedTreeService(apiBase);

  // Инициализация UI
  const suggestionsUI = new SuggestionsUI({
    inputField: tnvedInput,
    suggestionContainer: suggestionContainer,
    nameInput: nameInput,
    codeInput: codeInput,
    nameCodeContainer: nameCodeContainer,
  });
  suggestionsUI.suggestionsService = suggestionsService;

  // Колбэк открытия дерева при клике на стрелку в подсказке
  suggestionsUI.onTreeOpen = async (item) => {
    // item — это выбранный объект с KR_NAIM, CODE и т.д.
    // Можно при открытии дерева что-то делать с item,
    // например, вывести в консоль
    console.log("Открыть дерево для:", item);
    await tnvedTreeUI.open();
  };

  // Инициализация дерева
  const tnvedTreeUI = new TnvedTreeUI({
    treeContainer: treeContainer,
    overlay: overlay,
    closeButton: closeButton,
    treeList: treeList,
  });
  tnvedTreeUI.treeService = tnvedTreeService;

  // Запуск
  suggestionsUI.init();
  tnvedTreeUI.init();
});
