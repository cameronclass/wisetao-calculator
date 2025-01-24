/* Start:"a:4:{s:4:"full";s:42:"/calc-layout/js/builder.js?172934281412314";s:6:"source";s:26:"/calc-layout/js/builder.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
let calcTypeUrl;
let offerData = {};
let offerDataCargo = {};
let offerDataDL = {};
let offerDataPEK = {};
let offerDataJDE = {};
let offerDataKIT = {};
let whiteCompareContainer = null;
let deliveryItems = null;
let dollarGlobal;
let yuanGlobal;
let excelFile;
let generalGoodData = {};
let countdownTimer;
let countryGlobal;
let arrivalCityRusTK;
let buttons;

function loadBuilderData() {
  toggleButton(document.querySelector('.calc-type-button[data-type="cargo"]'));
  getCalcType();
  return Promise.all([
    fetch("/calc-layout/ext_html/from_to.php").then((response) =>
      response.text()
    ),
    fetch(calcTypeUrl).then((response) => response.text()), // Загружаем контент в зависимости от активной кнопки
    fetch("/calc-layout/ext_html/redeem_data.php").then((response) =>
      response.text()
    ),
    fetch("/calc-layout/ext_html/boxing_spoiler.php").then((response) =>
      response.text()
    ),
    fetch("/calc-layout/ext_html/delivery_list.php").then((response) =>
      response.text()
    ),
  ]).then(([fromTo, orderData, redeemData, boxingSpoiler, dropdown]) => {
    document.querySelector(".from-arrival-container").innerHTML = fromTo;
    document.querySelector(".calc-container:not(.redeem-data)").innerHTML =
      orderData;
    document.querySelector(".redeem-data").innerHTML = redeemData;
    document.querySelector(".boxing-spoiler").innerHTML = boxingSpoiler;
    document.querySelector("#delivery-types-dropdown-auto").innerHTML =
      dropdown;
    document.querySelector("#delivery-types-dropdown-fast-auto").innerHTML =
      dropdown;
    document.querySelector("#delivery-types-dropdown-railway").innerHTML =
      dropdown;
    document.querySelector("#delivery-types-dropdown-avia").innerHTML =
      dropdown;
    setPositionCounriesContainer();
    initializeGetRate();
    initializeGetOrderData();
    if (calcTypeUrl === "/calc-layout/ext_html/cargo_order_data.php") {
      removeComparison();
      initializeCheckbox();
      initializeAddGoods();
      // hideComparisonData();
      initializeCalcVolume();
    }
    initializeYandexSuggest();
    initializeAddRedeems();
    initializeSubmitRedeemData();
    initializeRedeemCheckbox();
    initializeImgBoxing();
    initializeCountGoods();
    initializeCurrency();
    initializeDeliveryChoice();
    initializeInputPhoto();
    initializeInputExcel();
    initializeTypeOfGoods();
    initializeSpoiler();
    if (calcTypeUrl === "/calc-layout/ext_html/cargo_white_order_data.php") {
      cloneAndAppend(".delivery-types");
    }
    initializeDeliveryList();
    if (
      calcTypeUrl === "/calc-layout/ext_html/white_order_data.php" ||
      calcTypeUrl === "/calc-layout/ext_html/cargo_white_order_data.php"
    ) {
      initializeWhiteCalcSpace();
      initializeAddTnvedCode();
      initializeSuggestion();

      if (calcTypeUrl === "/calc-layout/ext_html/cargo_white_order_data.php") {
        initializeAjaxRequestCargoWhite();
      }
      if (calcTypeUrl === "/calc-layout/ext_html/white_order_data.php") {
        initializeGetRate();
        removeComparison();
        // hideComparisonData();
      }
      initializeTnvedAjaxRequest();
      fetch("/calc-layout/ext_html/tnved_tree_handling.php")
        .then((response) => response.text())
        .then((tnvedTree) => {
          document.querySelector(".tnved-tree-container").innerHTML = tnvedTree;
          initializePopupTnvedTree();
          initializeTnvedTreeHandling();
        });
    }
    if (calcTypeUrl === "/calc-layout/ext_html/cargo_order_data.php") {
      initializeGeneralAjaxRequest();
    }
    if (
      calcTypeUrl === "/calc-layout/ext_html/white_order_data.php" ||
      calcTypeUrl === "/calc-layout/ext_html/cargo_white_order_data.php"
    ) {
      initializeReportWhiteData();
    }
    initializeHelp();
    initializeSelectDeliveryItem();
  });
}

function getCalcType() {
  switch (activeButton.getAttribute("data-type")) {
    case "cargo":
      calcTypeUrl = "/calc-layout/ext_html/cargo_order_data.php";
      break;
    case "white":
      calcTypeUrl = "/calc-layout/ext_html/white_order_data.php";
      break;
    case "comparison":
      calcTypeUrl = "/calc-layout/ext_html/cargo_white_order_data.php";
      break;
    default:
      calcTypeUrl = "/calc-layout/ext_html/cargo_order_data.php";
  }
}

function cloneAndAppend(container) {
  whiteCompareContainer = document.querySelector(container);
  if (
    !whiteCompareContainer
      .querySelector(".white-page-img.white")
      .classList.contains("active")
  ) {
    whiteCompareContainer
      .querySelector(".white-page-img.white")
      .classList.add("active");
    whiteCompareContainer
      .querySelector(".cargo-page-img")
      .classList.remove("active");

    whiteCompareContainer
      .querySelector(".delivery-name.cargo-page-delivery-name")
      .classList.remove("active");
    whiteCompareContainer
      .querySelector(".help.cargo-help.delivery-help.cargo-page-help")
      .classList.remove("active");

    whiteCompareContainer
      .querySelector(".delivery-name.white-page-delivery-name")
      .classList.add("active");
    whiteCompareContainer
      .querySelector(".help.white-help.delivery-help.white-page-help")
      .classList.add("active");
  } else {
    whiteCompareContainer
      .querySelector(".white-page-img.white")
      .classList.remove("active");
    whiteCompareContainer
      .querySelector(".cargo-page-img")
      .classList.add("active");

    whiteCompareContainer
      .querySelector(".delivery-name.cargo-page-delivery-name")
      .classList.add("active");
    whiteCompareContainer
      .querySelector(".help.cargo-help.delivery-help.cargo-page-help")
      .classList.add("active");

    whiteCompareContainer
      .querySelector(".delivery-name.white-page-delivery-name")
      .classList.remove("active");
    whiteCompareContainer
      .querySelector(".help.white-help.delivery-help.white-page-help")
      .classList.remove("active");
  }
  let deliveryItemsWhite = whiteCompareContainer.querySelectorAll(".list-help");
  deliveryItemsWhite.forEach((deliveryItem) => {
    deliveryItem.addEventListener("click", selectDeliveryItem);
  });
  document.querySelectorAll(".list-help").forEach((deliveryItem) => {
    deliveryItem.classList.remove("selected");
  });
  isCloned = true;
  showComparisonData();
}

function showComparisonData() {
  if (whiteCompareContainer !== null) {
    document.querySelector(".boxing-content-container").style.height = "1550px";
    whiteCompareContainer.style.display = "flex";
  }
}

function hideComparisonData() {
  if (whiteCompareContainer !== null) {
    whiteCompareContainer.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  initChooseCalcTypeButtons();
  loadBuilderData();
});

function initChooseCalcTypeButtons() {
  buttons = document.querySelectorAll(".calc-type-button");
  buttons.forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      toggleButton(button);
      changeCalc();
      event.preventDefault();
    });
  });
}

function showModal(message) {
  let modal = document.querySelector(".loading-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.classList.add("loading-modal");
    modal.innerHTML =
      '<div><div class="modal-message">' + message + "</div></div>";
    document.body.appendChild(modal);
  }
  modal.style.display = "flex";
  modal.children[0].children[0].innerText = message;
}

function showCargoMessage(message) {
  let modal = document.querySelector(".first-step");
  if (!modal) {
    modal = document.createElement("div");
    modal.classList.add("first-step");
    modal.innerHTML =
      `<img class="arrow-animation-calc" src="/bitrix/templates/main-wisetao/assets/images/icons/arrow-down-log.svg" alt="">
                            <div>
                                <div class="cargo-type-message">` +
      message +
      `</div>
                            </div>`;
    document.body.appendChild(modal);
  } else {
    modal.innerHTML =
      `<img class="arrow-animation-calc" src="/bitrix/templates/main-wisetao/assets/images/icons/arrow-down-log.svg" alt="">
                            <div>
                                <div class="cargo-type-message">` +
      message +
      `</div>
                            </div>`;
  }
  modal.style.background = "rgba(47, 55, 67, 0.5)";
}

function updateModalMessage(message) {
  let modal = document.querySelector(".loading-modal");
  if (modal) {
    modal.children[0].children[0].innerText = message;
  }
}

function hideModal() {
  let modal = document.querySelector(".loading-modal");
  if (modal) {
    updateModalMessage("Данные переданы.");
    setTimeout(() => {
      modal.style.display = "none";
      document.querySelector(".pop-up-ads").style.display = "flex";
    }, 2000); // 1000 миллисекунд = 1 секунда
  }
}

function activateDeliveryPicks() {
  $(".type-of-goods-dimensions").each(function () {
    this.classList.add("active");
  });
  document.querySelector(".delivery-types").style.height = "670px";
  $(".report-button-container").first().addClass("active");
  if (
    calcTypeUrl === "/calc-layout/ext_html/white_order_data.php" ||
    calcTypeUrl === "/calc-layout/ext_html/cargo_order_data.php"
  ) {
    $(".boxing-content-container").first().css("height", "950px");
  }
  if (calcTypeUrl === "/calc-layout/ext_html/cargo_white_order_data.php") {
    document.querySelector(".needed-space").classList.add("active");
    $(".boxing-content-container").first().css("height", "980px");
  }
}

function changeArrivalSaide() {
  let arrivals = document.querySelectorAll(".title-cargo.tk-type");
  arrivals.forEach((arrival) => {
    if (countryGlobal === "Кыргызстан") {
      arrival.innerHTML = "в г. Бишкек";
    }
    if (countryGlobal === "Казахстан") {
      arrival.innerHTML = "в г. Алматы";
    }
  });
}

function changeAvailableCountries() {
  if (calcTypeUrl !== "/calc-layout/ext_html/cargo_order_data.php") {
    document.querySelectorAll(".available-country").forEach(function (el) {
      const content = el.textContent.trim();

      if (content.includes("Кыргызстан") || content.includes("Казахстан")) {
        el.classList.add("unavailable-country");

        // Добавляем SVG-код через innerHTML
        el.innerHTML += `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="10" width="12" height="8" rx="2" fill="#91969b"/>
                <path d="M9 10V9C9 7.34315 10.3431 6 12 6C13.6569 6 15 7.34315 15 9V10" stroke="#91969b" stroke-width="2"/>
            </svg>`;
      }
    });
  } else {
    document.querySelectorAll(".available-country").forEach(function (el) {
      const content = el.textContent.trim();

      if (content.includes("Кыргызстан") || content.includes("Казахстан")) {
        el.classList.remove("unavailable-country");
        if (content.includes("Кыргызстан")) {
          el.innerHTML = `Кыргызстан`;
        }
        if (content.includes("Казахстан")) {
          el.innerHTML = `Казахстан`;
        }
      }
    });
  }
} /* Start:"a:4:{s:4:"full";s:51:"/calc-layout/js/get_exchange_rate.js?17293451611000";s:6:"source";s:36:"/calc-layout/js/get_exchange_rate.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
/* End */
function initializeGetRate() {
  $.ajax({
    type: "POST",
    url:
      calcTypeUrl === "/calc-layout/ext_html/cargo_order_data.php"
        ? "https://api-calc.wisetao.com:4343/api/get-exchange-rates"
        : "https://api-calc.wisetao.com:4343/api/get-exchange-rates/1",
    success: function (response) {
      $(".exchange-rate-container .exchange-rate-elem-dollar").html(
        response.dollar
      );
      dollarGlobal = response.dollar;
      $(".exchange-rate-container .exchange-rate-elem-yuan").html(
        response.yuan
      );
      yuanGlobal = response.yuan;
      if (calcTypeUrl === "/calc-layout/ext_html/cargo_order_data.php") {
        $(".yuan-link").removeClass("hidden");
        $(".rate-info").addClass("hidden");
      } else {
        $(".yuan-link").addClass("hidden");
        $(".rate-info").removeClass("hidden");
      }
    },
    error: function (error) {},
  });
} /* Start:"a:4:{s:4:"full";s:46:"/calc-layout/js/suggestView.js?172589011011799";s:6:"source";s:30:"/calc-layout/js/suggestView.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
/* End */
function initializeYandexSuggest() {
  var find = function (arr, find) {
    return arr.filter(function (value) {
      return (value + "").toLowerCase().indexOf(find.toLowerCase()) !== -1;
    });
  };

  var myProvider = {
    suggest: function (request, options) {
      var res = find(arr, request),
        arrayResult = [],
        results = Math.min(options.results, res.length);
      for (var i = 0; i < results; i++) {
        arrayResult.push({ displayName: res[i], value: res[i] });
      }
      return ymaps.vow.resolve(arrayResult);
    },
  };

  ymaps.ready(init);

  function init() {
    let countriesContainer = document.querySelector(".available-countries");
    var suggestView = new ymaps.SuggestView("arrival-input", { results: 3 });
    // Предполагая, что у вас есть контейнер с классом "from-arrival-container"
    var fromArrivalContainer = document.querySelector(
      ".from-arrival-container"
    );
    var arrivalInput = document.getElementById("arrival-input");
    var ymapsContainer = fromArrivalContainer.querySelector("ymaps");
    // Добавление обработчиков событий к контейнеру с использованием захватывающей фазы
    fromArrivalContainer.addEventListener(
      "mousemove",
      function (event) {
        // Проверяем, что текущая цель (target) или родительская цель (parentNode) содержат класс 'ymaps-2-1-79-suggest-item'
        if (
          event.target.classList.contains("ymaps-2-1-79-suggest-item") ||
          (event.target.parentNode &&
            event.target.parentNode.classList.contains(
              "ymaps-2-1-79-suggest-item"
            )) ||
          (event.target.parentNode.parentNode &&
            event.target.parentNode.parentNode.classList.contains(
              "ymaps-2-1-79-suggest-item"
            ))
        ) {
          event.stopPropagation();
          console.log(
            "Your custom mousemove event for ymaps-2-1-79-suggest-item"
          );
        }
      },
      true
    );

    fromArrivalContainer.addEventListener(
      "mouseover",
      function (event) {
        // Проверяем, что текущая цель (target) или родительская цель (parentNode) содержат класс 'ymaps-2-1-79-suggest-item'
        if (
          event.target.classList.contains("ymaps-2-1-79-suggest-item") ||
          (event.target.parentNode &&
            event.target.parentNode.classList.contains(
              "ymaps-2-1-79-suggest-item"
            )) ||
          (event.target.parentNode.parentNode &&
            event.target.parentNode.parentNode.classList.contains(
              "ymaps-2-1-79-suggest-item"
            ))
        ) {
          event.stopPropagation();
          console.log(
            "Your custom mouseover event for ymaps-2-1-79-suggest-item"
          );
        }
      },
      true
    );
    var preventDetailedSuggest = false;
    fromArrivalContainer.addEventListener(
      "click",
      function (event) {
        // Проверяем, что текущая цель (target) или родительская цель (parentNode) содержат класс 'ymaps-2-1-79-suggest-item'
        if (
          event.target.classList.contains("ymaps-2-1-79-suggest-item") ||
          (event.target.parentNode &&
            event.target.parentNode.classList.contains(
              "ymaps-2-1-79-suggest-item"
            )) ||
          (event.target.parentNode.parentNode &&
            event.target.parentNode.parentNode.classList.contains(
              "ymaps-2-1-79-suggest-item"
            ))
        ) {
          // Получаем название города и вносим его в поле (замените 'arrival-input' на ваш реальный ID поля)
          event.stopPropagation();
          preventDetailedSuggest = true;
          document.getElementById("arrival-input").value = extractCityName(
            event.target.innerText || event.target.textContent
          );
          if (
            event.target.classList.contains(
              "ymaps-2-1-79-search__suggest-highlight"
            )
          ) {
            document.getElementById("arrival-input").value = extractCityName(
              event.target.parentNode.parentNode.innerText ||
                event.target.parentNode.parentNode.textContent
            );
          }

          console.log("Your custom click event for ymaps-2-1-79-suggest-item");
        }
      },
      true
    );

    arrivalInput.addEventListener(
      "keydown",
      function (event) {
        // Находим ближайший элемент <ymaps> внутри fromArrivalContainer
        // Проверяем, отображен ли выпадающий список, и предотвращаем стандартное поведение стрелок вверх и вниз
        if (event.key === "Enter") {
          event.preventDefault();
        }
        countriesContainer.style.display = "none";
        if (
          ymapsContainer &&
          window.getComputedStyle(ymapsContainer).display === "block" &&
          (event.key === "ArrowDown" || event.key === "ArrowUp")
        ) {
          event.stopImmediatePropagation();
          console.log("Your custom keydown event for arrow up/down");

          // Добавьте ваш код для изменения стилей подсветки элементов при использовании стрелок
          // Например, вы можете добавить/удалить класс, изменить цвет фона и т.д.
          // Пример:
          var currentHighlightedItem = ymapsContainer.querySelector(
            ".ymaps-2-1-79-suggest-item.highlighted"
          );
          if (currentHighlightedItem) {
            currentHighlightedItem.classList.remove("highlighted");
          }

          if (event.key === "ArrowDown") {
            // Стрелка вниз
            // Ваш код для подсветки следующего элемента
            // Пример:
            var nextItem = currentHighlightedItem
              ? currentHighlightedItem.nextElementSibling
              : ymapsContainer.children[0].children[0].children[0]
                  .firstElementChild;
            if (nextItem) {
              nextItem.classList.add("highlighted");
              arrivalInput.value = extractCityName(
                nextItem.innerText || nextItem.textContent
              );
            }
          } else if (event.key === "ArrowUp") {
            // Стрелка вверх
            // Ваш код для подсветки предыдущего элемента
            // Пример:
            var prevItem = currentHighlightedItem
              ? currentHighlightedItem.previousElementSibling
              : ymapsContainer.children[0].children[0].children[0]
                  .lastElementChild;
            if (prevItem) {
              arrivalInput.value = extractCityName(
                prevItem.innerText || prevItem.textContent
              );
              prevItem.classList.add("highlighted");
            }
          }
        }
      },
      true
    );

    const config = {
      attributes: true,
      attributeFilter: ["style"],
      childList: true,
      subtree: true,
    };
    // Создаем экземпляр MutationObserver, который следит за изменениями внутри fromArrivalContainer
    var observer = new MutationObserver(function (mutationsList) {
      for (let mutation of mutationsList) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "style"
        ) {
          // Произошло изменение в атрибуте style
          let displayValue = window.getComputedStyle(mutation.target).display;
          // Теперь displayValue содержит текущее значение display
          // Вы можете добавить условия для применения стилей
          if (displayValue === "block" && preventDetailedSuggest) {
            // Скрыть suggest и сбросить флаг
            mutation.target.style.display = "none";
            preventDetailedSuggest = false;
          } else if (displayValue === "block") {
            arrivalInput.style.borderBottomLeftRadius = "0";
            arrivalInput.style.borderBottomRightRadius = "0";
          } else if (displayValue === "none") {
            arrivalInput.style.borderBottomLeftRadius = "10px";
            arrivalInput.style.borderBottomRightRadius = "10px";
          }
        }
        if (mutation.type === "childList") {
          let addedNodes = [...mutation.addedNodes];
          let match = false;
          let ymapsContainer = document.querySelector("ymaps");
          ymapsContainer.style.display = "none";
          // Фильтруем добавленные узлы по классам
          addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              let classList = Array.from(node.classList);
              match = classList.some((className) =>
                /^ymaps-2-1-79-suggest-item-\d+$/.test(className)
              );
              if (match) {
                updateLockIcons(node);
              }
            }
          });
          ymapsContainer.style.width = "344px";
          ymapsContainer.style.display = "block";
        }
      }
    });
    // Начинаем наблюдение за изменениями внутри fromArrivalContainer
    observer.observe(ymapsContainer, config);
    function updateLockIcons(item) {
      let toponym = extractToponymName(item);
      // Пример: используя API Yandex Maps для проверки страны
      ymaps.geocode(toponym, { results: 1 }).then((result) => {
        countryGlobal = result.geoObjects.get(0).getCountry();
        if (
          calcTypeUrl === "/calc-layout/ext_html/cargo_order_data.php" &&
          countryGlobal !== "Россия" &&
          countryGlobal !== "Кыргызстан" &&
          countryGlobal !== "Казахстан"
        ) {
          addLockIcon(item);
          item.style.pointerEvents = "none";
          item.style.background = "#d0a87c";
        } else if (
          calcTypeUrl !== "/calc-layout/ext_html/cargo_order_data.php" &&
          countryGlobal !== "Россия"
        ) {
          addLockIcon(item);
          item.style.pointerEvents = "none";
          item.style.background = "#d0a87c";
        }
      });
    }
  }
}

function extractToponymName(item) {
  // Получаем все элементы <ymaps> внутри item
  return item.querySelector("ymaps").textContent.trim();
}

function addLockIcon(item) {
  // Создаем элемент с иконкой замка
  const lockIcon = document.createElement("span");
  lockIcon.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="10" width="12" height="8" rx="2" fill="white"/><path d="M9 10V9C9 7.34315 10.3431 6 12 6C13.6569 6 15 7.34315 15 9V10" stroke="white" stroke-width="2"/></svg>`;

  // Добавляем иконку после текущего содержимого
  item.appendChild(lockIcon);
} /* Start:"a:4:{s:4:"full";s:43:"/calc-layout/js/checkbox.js?172732282711137";s:6:"source";s:27:"/calc-layout/js/checkbox.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/

/* End */
function initializeCheckbox() {
  const checkbox_input_type = document.getElementById("checkbox_input_type");
  const checkbox_input_type2 = document.getElementById("checkbox_input_type2");
  const dimensionsButton = document.querySelector(
    ".main-calc-button.submit-dimensions-button"
  );
  const commonButton = document.querySelector(
    ".main-calc-button.submit-general-button"
  );
  const text1 = document.querySelector("#text1.active");
  const text2 = document.querySelector("#text2.active");
  const text3 = document.querySelector("#text3.active");
  const text4 = document.querySelector("#text4.active");
  const mayDisableCheckboxContainer = document.querySelector(".may-disable");
  const copyLabelsContainer = document.querySelector(".copy-labels");
  const orderDataGeneral = document.querySelector(".order-data-general"); // Найти контейнер order-data
  const orderDataDimensions = document.querySelector(".order-data-dimensions"); // Найти контейнер order-data
  const addContainer = document.querySelector(
    ".add-container:not(.redeem-add)"
  ); // Найти контейнер order-data
  const container = document.querySelector(".calc-container:not(.redeem-data)"); // Найти контейнер .calc-container
  const dimBrand = document.getElementById("dim-brand");
  const pointCheckboxes = document.querySelectorAll(".point-checkbox");
  const boxingContainer = document.querySelector(".boxing-content-container");
  // Глобальные переменные для сохранения высоты контейнера
  window.containerHeightWhenChecked = "270px"; // Высота по умолчанию
  window.containerHeightWhenUnchecked = "323px"; // Высота по умолчанию
  container.classList.remove("comparison-calc-container");
  boxingContainer.classList.remove("comparison-boxing-container");
  // container.classList.add('comparison-calc-container');
  function hideOrderData() {
    const containers = document.querySelectorAll("[data-container]");
    orderDataGeneral.classList.remove("screen-size__display"); // Скрыть контейнер order-data
    // orderDataDimensions.style.display = 'flex';
    addContainer.style.display = "flex";
    containers.forEach(function (dim) {
      dim.style.display = "flex";
    });
  }

  function showOrderData() {
    const containers = document.querySelectorAll("[data-container]");
    orderDataGeneral.classList.add("screen-size__display"); // Показать контейнер order-data
    // orderDataDimensions.style.display = 'none';
    addContainer.style.display = "none";
    containers.forEach(function (dim) {
      dim.style.display = "none";
    });
  }

  function increaseContainerHeight() {
    container.style.height = window.containerHeightWhenUnchecked; // Увеличить высоту контейнера .calc-container
  }

  function decreaseContainerHeight() {
    container.style.height = window.containerHeightWhenChecked; // Установить высоту контейнера .calc-container на автоматический размер
  }

  let dimCheckbox = document.querySelector(".dim-checkbox");
  if (checkbox_input_type.checked) {
    dimCheckbox.style.display = "none";
    commonButton.parentElement.classList.remove("hidden");
    dimensionsButton.parentElement.classList.add("hidden");
    if (text1) {
      text1.style.color = "#f09123";
      text2.style.color = "white";
      text3.style.color = "#9d9d9d";
      text4.style.color = "#9d9d9d";
    }
    checkbox_input_type2.disabled = true;
    checkbox_input_type2.parentElement.classList.add("hidden");
    mayDisableCheckboxContainer.classList.add("disabled");
    showOrderData(); // Показать order-data при загрузке страницы
    decreaseContainerHeight(); // Установить высоту контейнера .calc-container на автоматический размер при загрузке страницы
  } else {
    commonButton.parentElement.classList.add("hidden");
    dimensionsButton.parentElement.classList.remove("hidden");
    dimCheckbox.style.display = "block";
    if (text1) {
      text1.style.color = "white";
      text2.style.color = "#f09123";
    }
    checkbox_input_type2.parentElement.classList.remove("hidden");
    checkbox_input_type2.disabled = false;
    setGoodsVars();
    mayDisableCheckboxContainer.classList.remove("disabled");
    hideOrderData(); // Скрыть order-data при загрузке страницы
    increaseContainerHeight(); // Увеличить высоту контейнера .calc-container при загрузке страницы
  }

  checkbox_input_type.addEventListener("change", function () {
    const text1 = document.querySelector("#text1.active");
    const text2 = document.querySelector("#text2.active");
    const text3 = document.querySelector("#text3.active");
    const text4 = document.querySelector("#text4.active");
    if (this.checked) {
      commonButton.parentElement.classList.remove("hidden");
      dimensionsButton.parentElement.classList.add("hidden");
      dimCheckbox.style.display = "none";
      if (text1) {
        text1.style.color = "#f09123";
        text2.style.color = "white";
        text3.style.color = "#9d9d9d";
        text4.style.color = "#9d9d9d";
      }
      checkbox_input_type2.disabled = true;
      checkbox_input_type2.parentElement.classList.add("hidden");
      mayDisableCheckboxContainer.classList.add("disabled");
      showOrderData(); // Показать order-data при изменении чекбокса
      decreaseContainerHeight(); // Установить высоту контейнера .calc-container на автоматический размер при изменении чекбокса
    } else {
      commonButton.parentElement.classList.add("hidden");
      dimensionsButton.parentElement.classList.remove("hidden");
      dimCheckbox.style.display = "block";
      if (text1) {
        text1.style.color = "white";
        text2.style.color = "#f09123";
      }
      checkbox_input_type2.disabled = false;
      checkbox_input_type2.parentElement.classList.remove("hidden");
      setGoodsVars();
      mayDisableCheckboxContainer.classList.remove("disabled");
      hideOrderData(); // Скрыть order-data при изменении чекбокса
      increaseContainerHeight(); // Увеличить высоту контейнера .calc-container при изменении чекбокса
    }
  });

  function setGoodsVars() {
    const text1 = document.querySelector("#text1.active");
    const text3 = document.querySelector("#text3.active");
    const text4 = document.querySelector("#text4.active");
    if (!checkbox_input_type.checked) {
      setLabels(checkbox_input_type2.checked);
      if (checkbox_input_type2.checked) {
        if (text1) {
          text3.style.color = "#f09123";
          text4.style.color = "white";
        }
        dimBrand.style.display = "flex";
        pointCheckboxes.forEach(function (pointCheckbox) {
          pointCheckbox.checked = false;
          pointCheckbox.style.display = "none";
        });
      } else {
        if (text1) {
          text3.style.color = "white";
          text4.style.color = "#f09123";
        }
        dimBrand.style.display = "none";
        dimBrand.checked = false;
        pointCheckboxes.forEach(function (pointCheckbox) {
          pointCheckbox.style.display = "flex";
        });
      }
    }
  }

  setGoodsVars();

  function setLabels(checked) {
    let labelPrices = document.querySelectorAll(
      ".dimensions-container .label-price"
    );
    let labelDimensions = document.querySelectorAll(
      ".dimensions-container .custom-input-label-dimensions"
    );
    let labelAdds = document.querySelector(
      ".add-container:not(.redeem-add) .add"
    );
    if (checked) {
      labelAdds.textContent = "Добавить место";
      labelPrices.forEach(function (labelPrice) {
        labelPrice.textContent = "Общая стоимость";
      });
      labelDimensions.forEach(function (labelDimension) {
        labelDimension.textContent = "Кол-во мест";
      });
    } else {
      labelAdds.textContent = "Добавить товар";
      labelPrices.forEach(function (labelPrice) {
        labelPrice.textContent = "Стоимость ед.";
      });
      labelDimensions.forEach(function (labelDimension) {
        labelDimension.textContent = "Кол-во ед.";
      });
    }
  }

  checkbox_input_type2.addEventListener("change", function () {
    const text1 = document.querySelector("#text1.active");
    const text3 = document.querySelector("#text3.active");
    const text4 = document.querySelector("#text4.active");
    let pointCheckboxes = document.querySelectorAll(".point-checkbox");
    let delSpans = document.querySelectorAll(
      ".order-data-dimensions .custom-span"
    );
    if (this.checked) {
      delSpans.forEach((delSpan) => {
        if (
          !delSpan.closest(".order-data-dimensions").classList.contains("first")
        ) {
          delSpan.classList.add("custom-span-display");
        }
        delSpan.classList.remove("center-del-span");
        delSpan.style.position = "relative";
      });
      if (text1) {
        text3.style.color = "#f09123";
        text4.style.color = "white";
      }
      dimBrand.style.display = "flex";
      pointCheckboxes.forEach(function (pointCheckbox) {
        pointCheckbox.checked = false;
        pointCheckbox.style.display = "none";
      });
    } else {
      delSpans.forEach((delSpan) => {
        delSpan.classList.add("center-del-span");
        delSpan.classList.remove("custom-span-display");
        delSpan.style.position = "absolute";
      });
      if (text1) {
        text3.style.color = "white";
        text4.style.color = "#f09123";
      }
      dimBrand.style.display = "none";
      dimBrand.checked = false;
      pointCheckboxes.forEach(function (pointCheckbox) {
        pointCheckbox.style.display = "flex";
      });
    }
    setLabels(this.checked);
  });
} /* Start:"a:4:{s:4:"full";s:43:"/calc-layout/js/currency.js?172782910212481";s:6:"source";s:27:"/calc-layout/js/currency.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
/* End */
function initializeCurrency() {
  const dropdowns = document.querySelectorAll(".dropdown");
  let arrow;
  // Функция для инициализации input-ов
  function initializeInputs() {
    const newInputs = document.querySelectorAll(
      ".js-validate-num:not(.initialized), .dimensions-input:not(.initialized), .select-by-name-input:not(.initialized), .tnved-input:not(.initialized), .to-arrival-input:not(.initialized), .redeem-input:not(.initialized), .redeem-params-input:not(.initialized), .redeem-note-input:not(.initialized), .client-requisites-input:not(.initialized)"
    );
    newInputs.forEach(function (input) {
      const notice = input.parentElement.querySelector(".input-notice");
      let label = input.parentElement.querySelector(
        ".group-input__title, label"
      ); // Поиск метки перед input
      if (!label) {
        const container = input.parentElement;
        if (container) {
          const grandContainer = container.parentElement;
          if (grandContainer) {
            label = grandContainer.querySelector(".group-input__title, label");
          }
        }
      }

      notice.style.display = "none"; // Скрыть надпись
      input.style.border = ""; // Убрать рамку

      input.addEventListener("invalid", function (event) {
        event.preventDefault();
      });

      input.addEventListener("input", function () {
        if (this.value !== "") {
          notice.style.display = "none"; // Скрыть надпись
          input.style.border = ""; // Убрать красную рамку поля
        }
        if (
          !input.classList.contains("select-by-name-input") &&
          !input.classList.contains("tnved-input") &&
          !input.classList.contains("to-arrival-input") &&
          !input.classList.contains("redeem-input") &&
          !input.classList.contains("redeem-params-input") &&
          !input.classList.contains("redeem-note-input") &&
          !input.classList.contains("client-requisites-input")
        ) {
          this.value = this.value.replace(
            /[^\d.,]|(?<=[.,]\d*)[.,]|^[.,]|(?<=^0)[^.,]/g,
            ""
          );
          // Проверить, если введено более трех цифр после точки
          const parts = this.value.split(/[.,]/);
          const separator = this.value.substring(
            this.value.search(/[,.]/),
            this.value.search(/[,.]/) + 1
          );
          if (parts[1] && parts[1].length > 3) {
            notice.textContent = "только 3 цифры после запятой";
            notice.style.display = "flex"; // Отобразить надпись
            parts[1] = parts[1].slice(0, 3); // Ограничить одним знаком после точки
            this.value = parts.join(separator);
          }
        }
        if (input.id.includes("client-phone")) {
          //     this.value = this.value
          //         .replace(/[^\d]/g, '')
          //         .replace(/(?!7)(\d{1,3})(\d{0,3})?(\d{0,2})?(\d{0,2})?/, function (match, p1, p2, p3, p4) {
          //             let formatted = '+7 (' + p1; // Добавляем код страны и открывающую скобку сразу
          //             if (p2) formatted += ') ' + p2; // Если есть 3 цифры, добавляем закрывающую скобку и пробел
          //             if (p3) formatted += '-' + p3; // Если есть 6 цифр, добавляем дефис
          //             if (p4) formatted += '-' + p4; // Если есть 8 цифр, добавляем ещё один дефис
          //             return formatted; // Возвращаем отформатированную строку
          //         })
          //         .replace(/^7/g, '');
          let noticeNumber = document.querySelector(
            ".input-notice-valid-number"
          );
          if (noticeNumber) {
            noticeNumber.style.display = "none";
            let inputPhone = notice.parentElement.querySelector(
              ".client-requisites-input.phone"
            );
            if (inputPhone) {
              inputPhone.style.color = "white";
            }
          }
        }
      });

      if (
        input.classList.contains("length") ||
        input.classList.contains("width") ||
        input.classList.contains("height")
      ) {
        let result = input.parentElement.querySelector(".result");
        let lengthInput = input.parentElement.querySelector(".length");
        let widthInput = input.parentElement.querySelector(".width");
        let heightInput = input.parentElement.querySelector(".height");
        input.addEventListener("input", function (event) {
          updateResult(lengthInput, widthInput, heightInput, result, event);
        });
      }

      if (
        !input.classList.contains("select-by-name-input") &&
        !input.classList.contains("not-required")
      ) {
        input.addEventListener("blur", function () {
          validateValue(input, notice, label);
        });
      }
      input.classList.add("initialized");
    });
  }

  // Функция для инициализации dropdown
  function initializeDropdown(dropdown) {
    const dropdownToggle = dropdown.querySelector(".dropdown-toggle");
    const dropdownList = dropdown.querySelector(".dropdown-list");
    const currencySigns = dropdown.querySelectorAll(".currency-sign");

    function updateCurrency(sign) {
      arrow = dropdownToggle.querySelector(".dropdown-list-currency-arrow");
      dropdownToggle.textContent = sign.textContent;
      dropdownToggle.dataset.currency = sign.dataset.currency;
      dropdownToggle.appendChild(arrow);
      dropdownList.classList.remove("active");
      dropdownToggle.style.borderBottomRightRadius = "10px";
      dropdown.style.borderBottomRightRadius = "10px";
    }

    dropdownToggle.addEventListener("click", function () {
      dropdownList.classList.toggle("active");
      if (dropdownList.classList.contains("active")) {
        dropdownToggle.style.borderBottomRightRadius = 0;
        dropdown.style.borderBottomRightRadius = 0;
      } else {
        dropdownToggle.style.borderBottomRightRadius = "10px";
        dropdown.style.borderBottomRightRadius = "10px";
      }
    });

    currencySigns.forEach(function (sign) {
      sign.addEventListener("click", function (event) {
        event.stopPropagation(); // Предотвращаем всплытие события, чтобы не закрыть список сразу
        updateCurrency(sign);
      });
    });

    const currencyItems = dropdown.querySelectorAll(".dropdown-list li");
    currencyItems.forEach(function (item) {
      item.addEventListener("click", function () {
        const sign = item.querySelector(".currency-sign");
        updateCurrency(sign);
      });
    });

    // Закрываем список при клике внутри списка
    dropdownList.addEventListener("click", function (event) {
      event.stopPropagation(); // Предотвращаем всплытие события, чтобы не закрыть список
      dropdownToggle.style.borderBottomRightRadius = "10px";
      dropdown.style.borderBottomRightRadius = "10px";
    });

    // Закрываем список при клике вне элемента или на другом элементе
    document.addEventListener("click", function (event) {
      if (
        !dropdown.contains(event.target) &&
        !dropdownToggle.contains(event.target)
      ) {
        dropdownList.classList.remove("active");
        dropdownToggle.style.borderBottomRightRadius = "10px";
        dropdown.style.borderBottomRightRadius = "10px";
      }
    });
  }

  function InitializePlusMinusButtons() {
    const newButtons = document.querySelectorAll(
      ".group-input-increment__minus:not(.initialized), .group-input-increment__plus:not(.initialized)"
    );
    if (newButtons) {
      newButtons.forEach((newButton) => {
        let newInput =
          newButton.parentElement.querySelector(".js-validate-num");
        validateInputValue(newInput);
        if (newButton.classList.contains("group-input-increment__minus")) {
          decreaseValue(newButton, newInput);
        }
        if (newButton.classList.contains("group-input-increment__plus")) {
          increaseValue(newButton, newInput);
        }
      });
    }
  }
  initializeInputs();

  const observer = new MutationObserver(function (mutationsList) {
    for (const mutation of mutationsList) {
      if (
        mutation.type === "childList" &&
        !mutation.target.classList.contains("suggestion")
      ) {
        InitializePlusMinusButtons();
        initializeInputs();
        // При добавлении новых элементов также инициализируем новые dropdown-ы
        const newDropdowns = document.querySelectorAll(
          ".dropdown:not(.initialized)"
        );
        newDropdowns.forEach(function (dropdown) {
          initializeDropdown(dropdown);
          dropdown.classList.add("initialized");
        });
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  dropdowns.forEach(function (dropdown) {
    initializeDropdown(dropdown);
    dropdown.classList.add("initialized");
  });

  // Обработчик события clone, генерируемого при клонировании
  document.addEventListener("clone", function (event) {
    const cloneInputs = event.detail.clone.querySelectorAll(
      ".js-validate-num, .dimensions-input, .select-by-name-input, .tnved-input, .to-arrival-input, .redeem-input, .redeem-params-input, .redeem-note-input"
    );
    cloneInputs.forEach(function (cloneInput) {
      cloneInput.classList.remove("initialized");
    });

    const cloneDropdowns = event.detail.clone.querySelectorAll(".dropdown");
    cloneDropdowns.forEach(function (cloneDropdown) {
      cloneDropdown.classList.remove("initialized");
    });

    const cloneButtons = event.detail.clone.querySelectorAll(
      ".group-input-increment__minus, .group-input-increment__plus"
    );
    cloneButtons.forEach(function (cloneButton) {
      cloneButton.classList.remove("initialized");
    });
  });
}

function validateValue(input, notice = null, label = null) {
  if (!notice && !label) {
    notice = input.parentElement.querySelector(".input-notice");
    label = input.parentElement.querySelector(".group-input__title"); // Поиск метки перед input
    if (!label) {
      const container = input.parentElement;
      if (container) {
        const grandContainer = container.parentElement;
        if (grandContainer) {
          label = grandContainer.querySelector(".group-input__title, label");
        }
      }
    }
  }
  if (input.value === "") {
    // if (input.classList.contains('dimensions-input')) {
    //     label = input.parentElement.parentElement.querySelector('.group-input__title, label');
    // }
    notice.textContent = "заполните " + '"' + label.textContent + '"';
    notice.style.display = "flex"; // Отобразить надпись
    input.style.border = "1px solid #a81d29"; // Сделать рамку поля красной
  } else {
    notice.style.display = "none"; // Скрыть надпись
    input.style.border = ""; // Убрать красную рамку поля
  }
} /* Start:"a:4:{s:4:"full";s:45:"/calc-layout/js/count_goods.js?17271202418881";s:6:"source";s:30:"/calc-layout/js/count_goods.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
/* End */
function initializeCountGoods() {
  // Функция для инициализации кнопок и input-ов
  function initializeButtonsAndInputs() {
    // Выбираем все кнопки с классами custom-input-left-addon, custom-input-left-addon-dimensions, custom-input-right-addon-dimensions, custom-input-right-addon
    // const buttons = document.querySelectorAll('.custom-input-left-addon:not(.initialized), .custom-input-left-addon-dimensions:not(.initialized), .custom-input-right-addon-dimensions:not(.initialized), .custom-input-right-addon:not(.initialized)');

    // buttons.forEach(function (button) {
    //     button.classList.add('initialized'); // Предотвращаем добавление дублей событий
    //     if (button.classList.contains('custom-input-left-addon') || button.classList.contains('custom-input-left-addon-dimensions')) {
    //         button.addEventListener('click', decreaseValue);
    //     } else if (button.classList.contains('custom-input-right-addon') || button.classList.contains('custom-input-right-addon-dimensions')) {
    //         button.addEventListener('click', increaseValue);
    //     }
    // });

    // Выбираем все input-ы с классами custom-input-field, custom-input-field-dimensions
    const inputs = document.querySelectorAll(
      ".custom-input-field:not(.initialized), .custom-input-field-dimensions:not(.initialized)"
    );

    inputs.forEach(function (input) {
      const notice = input.parentElement.querySelector(".input-notice");
      let label = input.parentElement.querySelector("label"); // Поиск метки перед input
      if (!label) {
        const container = input.parentElement;
        if (container) {
          const grandContainer = container.parentElement;
          if (grandContainer) {
            label = grandContainer.querySelector("label");
          }
        }
      }

      // notice.style.display = 'none'; // Скрыть надпись
      // input.style.border = ''; // Убрать рамку

      input.classList.add("initialized"); // Предотвращаем добавление дублей событий
      input.addEventListener("input", function () {
        this.value = this.value.replace(/[^0-9]/g, "");
        if (this.value !== "") {
          notice.style.display = "none"; // Скрыть надпись
          input.style.border = ""; // Убрать красную рамку поля
        }
      });
      input.addEventListener("blur", function () {
        if (this.value === "") {
          notice.textContent = "введите " + label.textContent;
          notice.style.display = "block"; // Отобразить надпись
          input.style.border = "1px solid #a81d29"; // Сделать рамку поля красной
        } else {
          notice.style.display = "none"; // Скрыть надпись
          input.style.border = ""; // Убрать красную рамку поля
        }
      });
    });
  }

  initializeButtonsAndInputs();

  const observer = new MutationObserver(function (mutationsList) {
    for (const mutation of mutationsList) {
      if (
        mutation.type === "childList" &&
        !mutation.target.classList.contains("suggestion")
      ) {
        // При добавлении новых элементов инициализируем только новые кнопки и input-ы
        initializeButtonsAndInputs();
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Обработчик события clone, генерируемого при клонировании
  document.addEventListener("clone", function (event) {
    const cloneButtons = event.detail.clone.querySelectorAll(
      ".custom-input-left-addon, .custom-input-left-addon-dimensions, .custom-input-right-addon-dimensions, .custom-input-right-addon"
    );
    cloneButtons.forEach(function (button) {
      button.classList.remove("initialized"); // Удаляем класс .initialized у новых кнопок после клонирования
    });

    const cloneInputs = event.detail.clone.querySelectorAll(
      ".custom-input-field, .custom-input-field-dimensions"
    );
    cloneInputs.forEach(function (input) {
      input.classList.remove("initialized"); // Удаляем класс .initialized у новых input-ов после клонирования
    });
  });

  // Функция для увеличения значения на 1
  // Функция для увеличения значения на 1
  // function increaseValue(event) {
  //     const container = event.target.closest('.order-data-dimensions, .order-data-general');
  //     if (container) {
  //         const quantityInput = container.querySelector('.custom-input-field, .custom-input-field-dimensions');
  //         if (quantityInput) {
  //             let value = parseInt(quantityInput.value);
  //             value = isNaN(value) ? 1 : value; // Если значение не число, то устанавливаем 1
  //             value++;
  //             quantityInput.value = value;
  //         }
  //     }
  // }

  // Функция для уменьшения значения на 1, но не меньше 1
  //     function decreaseValue(event) {
  //         const container = event.target.closest('.order-data-dimensions, .order-data-general');
  //         if (container) {
  //             const quantityInput = container.querySelector('.custom-input-field, .custom-input-field-dimensions');
  //             if (quantityInput) {
  //                 let value = parseInt(quantityInput.value);
  //                 value = isNaN(value) ? 1 : value; // Если значение не число, то устанавливаем 1
  //                 if (value > 1) {
  //                     value--;
  //                     quantityInput.value = value;
  //                 }
  //             }
  //         }
  //     }

  document.querySelectorAll(".js-validate-num").forEach((input) => {
    input.addEventListener("input", function () {
      this.value = this.value.replace(
        /[^\d.,]|(?<=[.,]\d*)[.,]|^[.,]|(?<=^0)[^.,]/g,
        ""
      );
      // Разбиваем значение на целую часть и дробную
      const parts = this.value.split(/[.,]/);
      const separator = this.value.substring(
        this.value.search(/[,.]/),
        this.value.search(/[,.]/) + 1
      );
      if (parts[1] && parts[1].length > 3) {
        parts[1] = parts[1].slice(0, 3); // Ограничиваем до 3 знаков после запятой
        this.value = parts.join(separator);
      }
    });
  });

  document
    .querySelectorAll(".group-input-increment")
    .forEach((incrementGroup) => {
      // Проверка и установка дефолтного значения 1 при некорректном вводе

      increaseValue(
        incrementGroup.querySelector(".group-input-increment__plus"),
        incrementGroup.querySelector("input")
      );
      decreaseValue(
        incrementGroup.querySelector(".group-input-increment__minus"),
        incrementGroup.querySelector("input")
      );

      // Проверка при потере фокуса поля ввода
      validateInputValue(incrementGroup.querySelector("input"));
    });
}

function validateInputValue(input) {
  if (input) {
    input.addEventListener("blur", () => {
      if (isNaN(parseInt(input.value)) || input.value.trim() === "") {
        input.value = 1; // Если не цифра или пустое значение, ставим 1
      }
    });
    input.value = 1;
    input.classList.add("initialized");
  }
}

function increaseValue(button, input) {
  if (input && button) {
    button.addEventListener("click", () => {
      input.value = parseInt(input.value) + 1;
    });
    button.classList.add("initialized");
  }
}

function decreaseValue(button, input) {
  if (input && button) {
    button.addEventListener("click", () => {
      validateInputValue();
      const currentValue = parseInt(input.value);
      if (currentValue > 1) {
        // Уменьшение только если значение больше 1
        input.value = currentValue - 1;
      }
    });
    button.classList.add("initialized");
  }
} /* Start:"a:4:{s:4:"full";s:47:"/calc-layout/js/type_of_goods.js?17214218576755";s:6:"source";s:32:"/calc-layout/js/type_of_goods.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/

/* End */
function initializeTypeOfGoods() {
  const dropdowns = document.querySelectorAll(
    ".type-of-goods-dropdown:not(.delivery-types-dropdown)"
  );
  let arrow;
  function initializeDropdown(dropdown) {
    dropdown.classList.add("initialized"); // Добавляем класс .initialized после инициализации

    const dropdownToggle = dropdown.querySelector(
      ".type-of-goods-dropdown-toggle"
    );
    if (dropdownToggle) {
      const helpContent = dropdownToggle.querySelector(".help");
      helpContent.addEventListener("mouseenter", updateBalloonPosition);
    }
    const dropdownList = dropdown.querySelector(".type-of-goods-dropdown-list");
    const typeOfGoodsValues = dropdown.querySelectorAll(
      ".type-of-goods-values"
    );

    function updateCurrency(sign, helpContent) {
      if (helpContent) {
        if (sign !== null) {
          arrow = dropdownToggle.querySelector(".dropdown-list-goods-arrow");
          dropdownToggle.textContent = sign.textContent;
        }
        // Добавляем helpContent в dropdownToggle
        helpContent.innerHTML.trim();
        dropdownToggle.appendChild(helpContent);
        dropdownToggle.appendChild(arrow);
      }
      dropdownList.classList.remove("active");
      dropdownToggle.style.borderBottomRightRadius = "10px";
      dropdownToggle.style.borderBottomLeftRadius = "10px";
      dropdown.style.borderBottomRightRadius = "10px";
      dropdown.style.borderBottomLeftRadius = "10px";
    }

    dropdownToggle.addEventListener("click", function () {
      dropdownList.classList.toggle("active");
      if (dropdownList.classList.contains("active")) {
        dropdownToggle.style.borderBottomRightRadius = 0;
        dropdownToggle.style.borderBottomLeftRadius = 0;
        dropdownList.style.borderTopRightRadius = 0;
        dropdownList.style.borderTopLeftRadius = 0;
        dropdown.style.borderBottomRightRadius = 0;
        dropdown.style.borderBottomLeftRadius = 0;
      } else {
        dropdownToggle.style.borderBottomRightRadius = "10px";
        dropdownToggle.style.borderBottomLeftRadius = "10px";
        dropdown.style.borderBottomRightRadius = "10px";
        dropdown.style.borderBottomLeftRadius = "10px";
      }
    });

    typeOfGoodsValues.forEach(function (value) {
      const helpContent = value.nextElementSibling;
      helpContent.addEventListener("mouseenter", updateBalloonPosition);
    });

    typeOfGoodsValues.forEach(function (value) {
      value.addEventListener("click", function (event) {
        event.stopPropagation();
        const helpContent = value.nextElementSibling.cloneNode(true);
        if (helpContent) {
          helpContent.addEventListener("mouseenter", updateBalloonPosition);
          helpContent.className =
            "help " +
            "type-of-goods-dropdown-toggle-" +
            helpContent.className.split(" ")[1];
        }
        updateCurrency(value, helpContent);
      });
    });

    const typeOfGoodsItems = dropdown.querySelectorAll(
      ".type-of-goods-dropdown-list li"
    );
    typeOfGoodsItems.forEach(function (item) {
      item.addEventListener("click", function () {
        let value;
        let helpContent;
        if (!item.closest("ul").classList.contains("delivery-types-list")) {
          value = item.querySelector(".type-of-goods-values");
          if (helpContent) {
            helpContent = item.querySelector(".help").cloneNode(true);
            helpContent.addEventListener("mouseenter", updateBalloonPosition);
            helpContent.className =
              "help " +
              "type-of-goods-dropdown-toggle-" +
              helpContent.className.split(" ")[1];
          }
        }
        updateCurrency(value, helpContent, ".delivery-types-list");
      });
    });

    // Закрываем список при клике внутри списка
    dropdownList.addEventListener("click", function (event) {
      event.stopPropagation(); // Предотвращаем всплытие события, чтобы не закрыть список
      dropdownToggle.style.borderBottomRightRadius = "10px";
      dropdownToggle.style.borderBottomLeftRadius = "10px";
      dropdown.style.borderBottomRightRadius = "10px";
      dropdown.style.borderBottomLeftRadius = "10px";
    });

    // Закрываем список при клике вне элемента или на другом элементе
    document.addEventListener("click", function (event) {
      if (
        !dropdown.contains(event.target) &&
        !dropdownToggle.contains(event.target)
      ) {
        dropdownList.classList.remove("active");
        dropdownToggle.style.borderBottomRightRadius = "10px";
        dropdownToggle.style.borderBottomLeftRadius = "10px";
        dropdown.style.borderBottomRightRadius = "10px";
        dropdown.style.borderBottomLeftRadius = "10px";
      }
    });
  }

  dropdowns.forEach(function (dropdown) {
    initializeDropdown(dropdown);
  });

  const observer = new MutationObserver(function (mutationsList) {
    for (const mutation of mutationsList) {
      if (
        mutation.type === "childList" &&
        !mutation.target.classList.contains("suggestion")
      ) {
        // При добавлении новых элементов инициализируем только новые списки
        const newDropdowns = document.querySelectorAll(
          ".type-of-goods-dropdown:not(.delivery-types-dropdown):not(.initialized)"
        );
        newDropdowns.forEach(function (dropdown) {
          initializeDropdown(dropdown);
        });
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Обработчик события clone, генерируемого при клонировании
  document.addEventListener("clone", function (event) {
    const cloneDropdowns = event.detail.clone.querySelectorAll(
      ".type-of-goods-dropdown:not(.delivery-types-dropdown)"
    );
    cloneDropdowns.forEach(function (dropdown) {
      dropdown.classList.remove("initialized"); // Удаляем класс .initialized у новых списков после клонирования
    });
  });
} /* Start:"a:4:{s:4:"full";s:43:"/calc-layout/js/add_goods.js?17214218393098";s:6:"source";s:28:"/calc-layout/js/add_goods.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/

/* End */
// Функция для клонирования и обновления контейнера
function initializeAddGoods() {
  function cloneContainer() {
    const containers = document.querySelectorAll("[data-container]");
    const lastContainer = containers[containers.length - 1];
    const newContainer = lastContainer.cloneNode(true);
    document.body.appendChild(newContainer);
    if (newContainer.querySelector(".brand-help")) {
      newContainer
        .querySelector(".brand-help")
        .addEventListener("mouseenter", updateBalloonBrandPosition);
    }
    const cloneEvent = new CustomEvent("clone", {
      detail: { clone: newContainer },
      bubbles: true,
      cancelable: true,
    });
    newContainer.dispatchEvent(cloneEvent);
    const container = document.querySelector(
      ".calc-container:not(.redeem-data)"
    );
    // Генерируем уникальные id для полей ввода
    const inputs = newContainer.querySelectorAll("input");
    inputs.forEach((input, index) => {
      input.id = `${input.id}_${containers.length + 1}`;
      input.value = ""; // Очищаем значения полей\
      if (input.classList.contains("custom-input-field-dimensions")) {
        input.value = "1";
      }
    });

    // Генерируем уникальный id для контейнера type-of-goods-dropdown
    const typeOfGoodsDropdown = newContainer.querySelector(
      ".type-of-goods-dropdown"
    );
    typeOfGoodsDropdown.id = `type-of-goods-dropdown_${containers.length + 1}`;

    // Вставляем новый контейнер перед кнопкой add-container
    const addContainer = document.querySelector(
      ".add-container:not(.redeem-add)"
    );
    addContainer.parentNode.insertBefore(newContainer, addContainer);

    // Увеличиваем его высоту на 320px
    container.style.height = parseInt(container.style.height) + 126 + "px";

    newContainer.style.marginTop = "20px";
    newContainer.style.zIndex =
      window.getComputedStyle(newContainer).zIndex - 1;
    newContainer.querySelector(".close-cross").style.display = "block";

    newContainer.classList.remove("first");
    newContainer.querySelector(".close-cross").addEventListener("click", () => {
      newContainer
        .querySelectorAll(".dimensions-calc-input")
        .forEach((input) => {
          input.classList.add("deleted-input");
        });
      newContainer.remove();
      container.style.height = parseInt(container.style.height) - 126 + "px";
      window.containerHeightWhenUnchecked = container.style.height;
    });

    window.containerHeightWhenUnchecked = container.style.height;
    // newContainer.setAttribute('data-container', parseInt(newContainer.getAttribute('data-container')) + 1);
  }

  const addButton = document.querySelector(
    ".add-container:not(.redeem-add) .add"
  );
  addButton.addEventListener("click", cloneContainer);
} /* Start:"a:4:{s:4:"full";s:41:"/calc-layout/js/spoiler.js?17301717732119";s:6:"source";s:26:"/calc-layout/js/spoiler.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/

/* End */
function initializeSpoiler() {
  let spoiler = document.querySelector(".boxing-spoiler");
  let spoilerHeader = document.querySelector(".boxing-spoiler-header");
  let spoilerContent = document.querySelector(".boxing-spoiler-content");
  if (spoiler && spoilerHeader && spoilerContent) {
    spoilerContent.style.display = "none";
    const computedStyles = window.getComputedStyle(
      document.querySelector(".boxing-content-container")
    );
    let currentHeight = parseInt(computedStyles.height, 10);
    let contentContainer = document.querySelector(".boxing-content-container");
    contentContainer.style.height = currentHeight + 190 + "px";
  }
  // Проверка на существование элементов
  if (spoiler && spoilerHeader && spoilerContent) {
    // Ваш код обработки спойлера
    console.log("All elements found");

    // Добавляем обработчик события для клика на заголовке спойлера
    spoilerHeader.addEventListener("click", function () {
      // Переключаем класс "opened" для спойлера
      spoiler.classList.toggle("opened");

      // Если спойлер открыт, показываем содержимое
      if (spoiler.classList.contains("opened")) {
        spoilerContent.style.display = "flex";
      } else {
        spoilerContent.style.display = "none";
      }
      const computedStyles = window.getComputedStyle(
        document.querySelector(".boxing-content-container")
      );
      let currentHeight = parseInt(computedStyles.height, 10);
      let contentContainer = document.querySelector(
        ".boxing-content-container"
      );
      if (spoiler.classList.contains("opened")) {
        contentContainer.style.height = currentHeight + 190 + "px";
      } else {
        contentContainer.style.height = currentHeight - 190 + "px";
      }
    });
  } else {
    console.log("Some elements are missing");
  }
} /* Start:"a:4:{s:4:"full";s:44:"/calc-layout/js/boxing_img.js?17271076972752";s:6:"source";s:29:"/calc-layout/js/boxing_img.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/

/* End */
function initializeImgBoxing() {
  // const imgItemsDelivery = document.querySelectorAll('.img-boxing-item-delivery-type');
  const imgItemsPackage = document.querySelectorAll(
    ".img-boxing-item-package-type:has(input)"
  );
  const imgItemPackageDefault = document.querySelector(
    ".img-boxing-item-package-type:not(:has(input))"
  );
  // markImg(imgItemsDelivery);
  markImg(imgItemsPackage, imgItemPackageDefault);
}

function markImg(imgItems, imgItemPackageDefault) {
  imgItems.forEach((item, index) => {
    const checkbox = item.querySelector('input[type="checkbox"]');
    item.addEventListener("click", () => {
      checkbox.checked = !checkbox.checked;
      imgItems.forEach((otherItem, otherIndex) => {
        if (otherIndex !== index) {
          otherItem.querySelector('input[type="checkbox"]').checked = false;
        }
      });
      if (!checkbox.checked) {
        imgItemPackageDefault
          .querySelector(".img-boxing-checkbox-container")
          .classList.add("active");
      } else {
        imgItemPackageDefault
          .querySelector(".img-boxing-checkbox-container")
          .classList.remove("active");
      }
      if (item.classList.contains("img-boxing-item-package-type")) {
        let event = new Event("change");
        checkbox.dispatchEvent(event);
      }
    });
  });
  imgItemPackageDefault.addEventListener("click", () => {
    imgItemPackageDefault
      .querySelector(".img-boxing-checkbox-container")
      .classList.add("active");
    const submitButton = document.querySelector(
      ".submit-general-button.active, .tnved-calc-button.active:not(.submit-excel-file):not(.blank-excel-file)"
    );
    if (
      imgItemPackageDefault
        .querySelector(".img-boxing-checkbox-container")
        .classList.contains("active")
    ) {
      imgItems.forEach((otherItem) => {
        otherItem.querySelector('input[type="checkbox"]').checked = false;
      });
      if (
        imgItemPackageDefault.classList.contains("img-boxing-item-package-type")
      ) {
        submitButton.click();
      }
    }
  });
}

function disableBoxingButtons() {
  const imgItemsPackage = document.querySelectorAll(
    ".img-boxing-item-package-type"
  );
  imgItemsPackage.forEach((item) => {
    item.style.pointerEvents = "none";
    item.querySelector(".img-boxing-checkmark").classList.remove("active");
  });
}

function enableBoxingButtons() {
  const imgItemsPackage = document.querySelectorAll(
    ".img-boxing-item-package-type"
  );
  imgItemsPackage.forEach((item) => {
    item.style.pointerEvents = "all";
    item.querySelector(".img-boxing-checkmark").classList.add("active");
  });
} /* Start:"a:4:{s:4:"full";s:45:"/calc-layout/js/input_photo.js?17214218493225";s:6:"source";s:30:"/calc-layout/js/input_photo.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
/* End */
function initializeInputPhoto() {
  // Функция для инициализации squareOuter и input file
  function initializeSquareOuter(container) {
    let squareOuter = container.querySelector(".redeem-square-outer");
    let squareOuterPlus = container.querySelector(".redeem-inner-square-plus");
    let squareOuterMinus = container.querySelector(
      ".redeem-inner-square-minus"
    );
    let photoInput = container.querySelector(".photo-input");

    let selectedPhoto = container.querySelector(".selected-photo");

    squareOuter.addEventListener("click", function () {
      photoInput.setAttribute("accept", "image/*");
      photoInput.click();
    });

    squareOuterMinus.addEventListener("click", (event) => {
      event.stopPropagation();
      deletePhoto(selectedPhoto, squareOuterPlus, squareOuterMinus);
    });

    photoInput.addEventListener("change", function () {
      let selectedFile = photoInput.files[0];
      if (selectedFile && photoInput.getAttribute("accept") === "image/*") {
        let reader = new FileReader();
        reader.onload = function (e) {
          selectedPhoto.src = e.target.result;
          selectedPhoto.style.display = "block";
          squareOuterMinus.style.display = "flex";
          squareOuterPlus.style.display = "none";
          squareOuter.style.border = "3px dashed #8c8f95";
        };
        reader.readAsDataURL(selectedFile);
      }
    });

    photoInput.classList.add("initialized");
    selectedPhoto.classList.add("initialized");
  }

  // Создаем MutationObserver
  let observer = new MutationObserver(function (mutationsList) {
    mutationsList.forEach(function (mutation) {
      if (
        mutation.type === "childList" &&
        mutation.addedNodes.length > 0 &&
        !mutation.target.classList.contains("suggestion")
      ) {
        mutation.addedNodes.forEach(function (node) {
          if (
            node.nodeType === 1 &&
            node.classList.contains("redeem-data-one")
          ) {
            // Инициализируем только новые контейнеры, у которых нет класса initialized
            if (!node.querySelector(".photo-input.initialized")) {
              initializeSquareOuter(node);
            }
          }
        });
      }
    });
  });

  // Начинаем наблюдение за изменениями в DOM
  observer.observe(document.body, { childList: true, subtree: true });

  // Вызываем инициализацию для существующих контейнеров при загрузке страницы
  let containers = document.querySelectorAll(".redeem-data-one");
  containers.forEach(function (container) {
    initializeSquareOuter(container);
  });
}

function deletePhoto(selectedPhoto, squareOuterPlus, squareOuterMinus) {
  selectedPhoto.src = "";
  selectedPhoto.style.display = "none";
  squareOuterMinus.style.display = "none";
  squareOuterPlus.style.display = "flex";
} /* Start:"a:4:{s:4:"full";s:45:"/calc-layout/js/add_redeems.js?17214218403683";s:6:"source";s:30:"/calc-layout/js/add_redeems.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
/* End */
// Функция для клонирования и обновления контейнера
function initializeAddRedeems() {
  function dispatchCloneEvent(newContainer) {
    const cloneEvent = new CustomEvent("clone", {
      detail: { clone: newContainer },
      bubbles: true,
      cancelable: true,
    });
    newContainer.dispatchEvent(cloneEvent);
  }

  function cloneContainer() {
    const containers = document.querySelectorAll("[data-container-redeem]");
    const lastContainer = containers[containers.length - 1];
    const newContainer = lastContainer.cloneNode(true);
    newContainer.querySelector("img").src = "";
    newContainer.querySelector("img").style.display = "none";
    var squareOuterPlus = newContainer.querySelector(
      ".redeem-inner-square-plus"
    );
    var squareOuterMinus = newContainer.querySelector(
      ".redeem-inner-square-minus"
    );
    squareOuterMinus.style.display = "none";
    squareOuterPlus.style.display = "flex";
    const container = document.querySelector(".calc-container.redeem-data");
    const computedStyles = window.getComputedStyle(container);
    const currentHeight = parseInt(computedStyles.height, 10);
    // Генерируем уникальные id для полей ввода
    const inputs = newContainer.querySelectorAll("input");
    inputs.forEach((input, index) => {
      const baseId = input.id.split("_")[0]; // Получаем базовый ID без номера
      const currentNumber = containers.length + 1; // Текущее количество контейнеров, начиная с 2
      input.id = `${baseId}_${currentNumber}`;
      input.value = ""; // Очищаем значения полей
      if (input.classList.contains("custom-input-field-dimensions")) {
        input.value = "1";
      }
    });

    // Удаляем класс initialized у клонированных контейнеров
    const clonedPhotoInput = newContainer.querySelector(".photo-input");
    const clonedSelectedPhoto = newContainer.querySelector(".selected-photo");
    if (clonedPhotoInput && clonedSelectedPhoto) {
      clonedPhotoInput.classList.remove("initialized");
      clonedSelectedPhoto.classList.remove("initialized");
    }

    const addButton = document.querySelector(".redeem-buttons");
    container.insertBefore(newContainer, addButton);

    // Увеличиваем высоту контейнера redeem-data на 335px
    container.style.height = currentHeight + 214 + "px";
    newContainer.style.zIndex =
      window.getComputedStyle(newContainer).zIndex - 1;
    newContainer.style.marginTop = "20px";
    newContainer.querySelector(".close-cross").style.display = "block";

    newContainer.querySelector(".close-cross").addEventListener("click", () => {
      newContainer.remove();
      const computedStyles = window.getComputedStyle(
        document.querySelector(".calc-container.redeem-data")
      );
      let currentHeight = parseInt(computedStyles.height, 10);
      container.style.height = currentHeight - 214 + "px";
    });
    dispatchCloneEvent(newContainer);
  }

  const addButtonRedeem = document.querySelector(".redeem-add");
  addButtonRedeem.addEventListener("click", cloneContainer);
} /* Start:"a:4:{s:4:"full";s:53:"/calc-layout/js/submit_redeem_data.js?172775066915642";s:6:"source";s:37:"/calc-layout/js/submit_redeem_data.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/

/* End */
function initializeSubmitRedeemData() {
  $("#submit-redeem-data:not(.submit-excel-file)").on(
    "click",
    submitRedeemData
  );
  $(".blank-excel-file").on("click", downloadRedeemBlank);
}

async function submitRedeemData(blobOffer = null) {
  let isAttached = !!document.querySelector(".selected-file-name")
    ?.childNodes[3];
  let isValid = false;
  if (!isAttached) {
    isValid = validateFields();
  }
  // Если все поля заполнены, выполняем AJAX-запрос
  let blobRedeem = false;
  if (isValid || isAttached || blobOffer) {
    blobRedeem = await sendRedeemData(isValid, isAttached, blobOffer);
  } else {
    console.log("Заполните все поля перед отправкой.");
  }
  return blobRedeem;
}

function disableFields() {
  let $redeemData = $(".redeem-data");
  let $inputs = $redeemData.find(
    ".redeem-input, .redeem-currency-input, .redeem-count, .redeem-size, .redeem-color, .photo-input"
  );
  $inputs.each(function () {
    $(this).attr("disabled", "");
    $(this).css("border", "none");
  });
  $(".redeem-square-outer").each(function () {
    $(this).css("cursor", "default");
    $(this).css("background", "gray");
    this.closest(".redeem-square-outer").style.border = "3px dashed #8c8f95";
  });

  $redeemData.each(function () {
    $(this)
      .find(".input-notice")
      .each(function () {
        $(this).css("display", "none");
      });
    $(this)
      .find(".dropdown.redeem-currency")
      .each(function () {
        $(this).css("background", "gray");
      });
    $(this)
      .find(".dropdown-toggle")
      .each(function () {
        $(this).css("background", "gray");
      });
    $(this)
      .find(".custom-input-addon")
      .each(function () {
        $(this).css("background", "gray");
      });
  });
  let buttonRedeemAdd = $(".add-container.redeem-add").first();
  let buttonRedeemAddElem = $(".add-container.redeem-add .add-button").first();
  buttonRedeemAdd.css("pointer-events", "none");
  buttonRedeemAddElem.css("pointer-events", "none");
  buttonRedeemAdd.addClass("disabled");
  buttonRedeemAddElem.addClass("disabled");
}

function enableFields() {
  let $redeemData = $(".redeem-data");
  let $inputs = $redeemData.find(
    ".redeem-input, .redeem-currency-input, .redeem-count, .redeem-size, .redeem-color, .photo-input"
  );
  $inputs.each(function () {
    $(this).removeAttr("disabled");
  });

  $(".redeem-square-outer").each(function () {
    $(this).css("cursor", "pointer");
    $(this).css("background", "#1a212d");
  });

  $redeemData.each(function () {
    $(this)
      .find(".dropdown.redeem-currency")
      .each(function () {
        $(this).css("background", "#5a667d");
      });
    $(this)
      .find(".dropdown-toggle")
      .each(function () {
        $(this).css("background", "#5a667d");
      });
    $(this)
      .find(".custom-input-addon")
      .each(function () {
        $(this).css("background", "#2f3743");
      });
  });
  let buttonRedeemAdd = $(".add-container.redeem-add").first();
  let buttonRedeemAddElem = $(".add-container.redeem-add .add-button").first();
  buttonRedeemAdd.css("pointer-events", "all");
  buttonRedeemAddElem.css("pointer-events", "all");
  buttonRedeemAdd.removeClass("disabled");
  buttonRedeemAddElem.removeClass("disabled");
}

function validateFields() {
  let isValid = true;
  let $redeemData = $(".redeem-data");
  let $inputs = $redeemData.find(".js-validate-num, .redeem-input");
  $inputs.each(function () {
    if ($(this).val() === "") {
      isValid = false;
      return false; // Прерываем цикл, если хотя бы одно поле не заполнено
    }
  });

  $(".selected-photo").each(function () {
    if (!$(this).attr("src")) {
      isValid = false;
      this.closest(".redeem-square-outer").style.border = "3px dashed red";
      return false; // Прерываем цикл, если хотя бы одна картинка не выбрана
    }
  });
  if (!isValid) {
    // Если есть хотя бы одно незаполненное поле, вызываем validateValue для всех
    $inputs.each(function () {
      validateValue(this);
    });
  }
  return isValid;
}

async function sendRedeemData(isValid, isAttached, blobOffer = null) {
  let redeemData = gatherRedeemData(isValid, isAttached);
  if (redeemData) {
    if (isAttached && redeemData instanceof FormData) {
      // Если это FormData, добавляем дополнительные параметры
      redeemData.append("SITE_ID", "s3");
      redeemData.append("sessid", BX.message("bitrix_sessid"));
    } else {
      // Если это обычные данные, добавляем их как свойства объекта
      Object.assign(redeemData, {
        SITE_ID: "s3",
        sessid: BX.message("bitrix_sessid"),
      });
    }
  }
  let query = {
    action: isValid
      ? "telegram:document.api.RedeemDataController.export_redeem_data"
      : "telegram:document.api.RedeemDataController.export_received_excel_redeem_data",
  };

  let options = {
    type: "POST",
    url: "/bitrix/services/main/ajax.php?" + $.param(query),
    data: redeemData,
    xhrFields: {
      responseType: "blob", // Устанавливаем ожидание бинарных данных
    },
  };

  if (isAttached) {
    Object.assign(options, {
      processData: false,
      contentType: false,
    });
  }
  let blobRedeemFile;
  let clientPhone = document.querySelector('input[name="client-phone"]')?.value;
  return new Promise((resolve, reject) => {
    $.ajax(options)
      .then(function (blobRedeem) {
        console.log("Данные успешно отправлены:");
        blobRedeemFile = blobRedeem;
        resolve(blobRedeem);
      })
      .catch(function (error) {
        blobRedeemFile = { error: error };
        reject({ error: error });
      })
      .always(function () {
        clearInterval(countdownTimer);
        hideModal();
        if (blobOffer) {
          sendFileToBitrix(blobRedeemFile, blobOffer)
            .then((links) => {
              setTimeout(() => {
                createClientActivity(
                  document.querySelector('input[name="client-phone"]').value
                );
              }, 2000);
            })
            .catch((error) => {
              console.error("Ошибка при отправке файлов:", error);
            });
          sendOfferToBitrix24(blobOffer, clientPhone);
        }
        return blobRedeemFile;
      });
  });
}

function sendOfferToBitrix24(offer, clientPhone) {
  if (offer) {
    let formData = new FormData();
    formData.append(
      "OFFER",
      new File([offer], "Коммерческое предложение.pdf", { type: offer.type })
    );
    formData.append("phone", clientPhone);
    formData.append("SITE_ID", "s3");
    formData.append("sessid", BX.message("bitrix_sessid"));

    let query = {
      action:
        "telegram:document.api.OrderDataController.send_offer_to_deal_bitrix24",
    };

    let options = {
      type: "POST",
      url: "/bitrix/services/main/ajax.php?" + $.param(query),
      data: formData,
      processData: false, // Не обрабатывать данные
      contentType: false, // Не устанавливать заголовок contentType
      dataType: "json", // Ожидаем ответ в формате JSON
    };

    $.ajax(options)
      .then(function (response) {
        console.log("Файл успешно отправлен:", response);
        return response;
      })
      .catch(function (error) {
        console.error("Ошибка при отправке файла:", error);
        return { error: error };
      })
      .always(function () {});
  }
}

function gatherRedeemData(isValid, isAttached) {
  if (isValid && !isAttached) {
    let redeemData = [];
    $(".redeem-data .redeem-data-one").each(function () {
      let photo = $(this).find(".selected-photo").attr("src");
      let name = $(this).find(".redeem-name-input").val();
      let cost = $(this).find(".redeem-currency-input").val();
      // let deliveryChina = $(this).find('.redeem-currency-china-input').val();
      let quantity = $(this).find(".redeem-count").val();
      let link = $(this).find(".redeem-url-input").val();
      let size = $(this).find(".redeem-size").val();
      let color = $(this).find(".redeem-color").val();
      let note = $(this).find(".redeem-note").val();
      let currency = $(this)
        .find(".dropdown.redeem-currency .dropdown-toggle")
        .contents()
        .first()
        .text();
      // let currencyChina = $(this).find('.dropdown.redeem-currency.redeem-currency-china .dropdown-toggle-china').contents().first().text();
      redeemData.push({
        photo: photo,
        name: name,
        cost: cost,
        // delivery_china: deliveryChina,
        quantity: quantity,
        link: link,
        size: size,
        color: color,
        note: note,
        currency: currency,
        // currency_china: currencyChina,
      });
    });
    return {
      data: redeemData,
    };
  } else if (isAttached && excelFile) {
    let formData = new FormData();
    formData.append("file", excelFile);
    return formData;
  }
}

async function sendFileToBitrix(blobRedeem, blobOffer) {
  let form = document.getElementById("SIMPLE_FORM_3");

  // Удаляем предыдущие input file, если они есть
  const inputFiles = form.querySelectorAll('input[type="file"]');
  inputFiles.forEach((input) => form.removeChild(input));

  // Создаем input file
  let inputFileRedeem = document.createElement("input");
  inputFileRedeem.type = "file";
  inputFileRedeem.name = "form_file_9";
  inputFileRedeem.style.display = "none";

  let inputFileOffer = document.createElement("input");
  inputFileOffer.type = "file";
  inputFileOffer.name = "form_file_10";
  inputFileOffer.style.display = "none";

  let inputName = document.createElement("input");
  inputName.type = "text";
  inputName.name = "form_text_12";
  inputName.style.display = "none";
  inputName.value = document.querySelector('input[name="client-name"]').value;

  let inputPhone = document.createElement("input");
  inputPhone.type = "text";
  inputPhone.name = "form_text_13";
  inputPhone.style.display = "none";
  inputPhone.value = document.querySelector('input[name="client-phone"]').value;

  // Создаем кнопку submit
  let submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.name = "web_form_submit";
  submitButton.value = "Отправить данные о выкупе";
  submitButton.style.display = "none"; // Скрываем кнопку

  // Добавляем элементы в форму
  form.appendChild(inputFileOffer);
  form.appendChild(inputFileRedeem);
  form.appendChild(inputName);
  form.appendChild(inputPhone);
  form.appendChild(submitButton);

  let dataTransferOffer = new DataTransfer();
  let dataTransferRedeem = new DataTransfer();
  // Создаем File объект из Blob и помещаем его в input file

  if (!blobRedeem?.error) {
    let fileRedeem = new File([blobRedeem], "Данные для выкупа заказа.xlsx", {
      type: blobRedeem.type,
    });
    dataTransferRedeem.items.add(fileRedeem);
    inputFileRedeem.files = dataTransferRedeem.files;
  }

  let fileOffer = new File([blobOffer], "КП.pdf", { type: blobOffer.type });
  dataTransferOffer.items.add(fileOffer);
  inputFileOffer.files = dataTransferOffer.files;

  submitButton.click();
}

function createClientActivity(phone) {
  if (phone) {
    let clientData = {
      PHONE: phone,
    };

    if (clientData) {
      // Добавляем дополнительные параметры
      clientData.SITE_ID = "s3";
      clientData.sessid = BX.message("bitrix_sessid");
    }

    // Формируем запрос
    let query = {
      action:
        "telegram:document.api.RedeemDataController.create_client_activity", // Один маршрут на create_clientAction
    };

    // Опции для AJAX
    let options = {
      type: "POST",
      url: "/bitrix/services/main/ajax.php?" + $.param(query),
      data: clientData,
      dataType: "json", // Ожидаем ответ в формате JSON
    };

    // Выполняем AJAX-запрос
    $.ajax(options)
      .then(function (response) {
        console.log("Данные успешно отправлены:", response);
        return response;
      })
      .catch(function (error) {
        console.error("Ошибка при отправке данных:", error);
        return { error: error };
      })
      .always(function () {
        // Действия, которые нужно выполнить всегда, например, скрытие модального окна
      });
  }
}

function downloadRedeemBlank() {
  let query = {
    action: "telegram:document.api.RedeemDataController.download_redeem_blank",
  };

  let options = {
    type: "POST", // Используем POST-запрос
    url: "/bitrix/services/main/ajax.php?" + $.param(query),
    data: {
      sessid: BX.message("bitrix_sessid"),
    },
    xhrFields: {
      responseType: "blob",
    },
  };

  $.ajax(options)
    .then(function (response, status, xhr) {
      let filename = getFilenameFromContentDisposition(
        xhr.getResponseHeader("Content-Disposition")
      );
      let blob = new Blob([response], {
        type: xhr.getResponseHeader("Content-Type"),
      });
      let link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename || "downloaded_file.xlsx"; // Имя файла или дефолтное имя
      link.click();
    })
    .catch(function (error) {
      console.error("Ошибка при скачивании файла:", error);
    })
    .always(function () {});
}

function getFilenameFromContentDisposition(header) {
  let filename = "";
  if (header && header.indexOf("attachment") !== -1) {
    let filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    let matches = filenameRegex.exec(header);
    if (matches != null && matches[1]) {
      filename = matches[1].replace(/['"]/g, ""); // Удаляем кавычки
    }
  }
  return filename;
} /* Start:"a:4:{s:4:"full";s:49:"/calc-layout/js/redeem_checkbox.js?17279345076151";s:6:"source";s:34:"/calc-layout/js/redeem_checkbox.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/

/* End */
function initializeRedeemCheckbox() {
  const checkboxes = document.querySelectorAll(
    '.custom-radio-redeem input[type="radio"]'
  );
  const redeemDataContainer = document.querySelector(".redeem-data");
  const fromToBlock = document.querySelector(".main-calc-first__from-to");
  checkboxes.forEach((checkbox) => {
    checkRedeem(checkbox, redeemDataContainer);
    checkbox.addEventListener("change", function () {
      checkRedeem(checkbox, redeemDataContainer);
      activateCalculator();

      fromToBlock.classList.add("active");
    });
  });
}

function checkRedeem(checkbox, redeemDataContainer) {
  if (checkbox.checked) {
    if (checkbox.getAttribute("value") === "delivery-only") {
      redeemDataContainer.style.display = "none";
    } else {
      redeemDataContainer.style.display = "flex";
    }
  }
}

function activateCalculator() {
  if ($('input[name="delivery-option"]:checked').length > 0) {
    document.querySelector(".first-step").style.display = "none";
    document.querySelectorAll(".disabled-shutter").forEach((shutter) => {
      shutter.classList.add("hidden");
    });
    let elems = [];
    elems.push(document.querySelectorAll(".rectangle"));
    elems.push(document.querySelectorAll(".group-input"));
    elems.push(document.querySelectorAll(".label-text"));
    elems.push(document.querySelectorAll(".from-to-container-other-elems"));
    elems.push(document.querySelectorAll(".switch-btn__block"));
    elems.push(document.querySelectorAll(".switch-btn__text"));
    elems.push(document.querySelectorAll(".may-disable"));
    elems.push(document.querySelectorAll(".input-label"));
    elems.push(document.querySelectorAll(".custom-input"));
    elems.push(document.querySelectorAll(".img-boxing-checkmark"));
    elems.push(document.querySelectorAll(".img-boxing-item-label"));
    elems.push(document.querySelectorAll(".input-addon"));
    elems.push(document.querySelectorAll(".addon-text"));
    elems.push(document.querySelectorAll(".custom-input-label"));
    elems.push(document.querySelectorAll(".custom-input-field"));
    elems.push(document.querySelectorAll(".custom-input-addon"));
    elems.push(document.querySelectorAll("button.submit-general-button"));
    elems.push(document.querySelectorAll(".main-calc-button"));
    elems.push(document.querySelectorAll("button.tnved-calc-button"));
    elems.push(document.querySelectorAll(".custom-checkbox"));
    elems.push(document.querySelectorAll(".brand"));
    elems.push(document.querySelectorAll(".dropdown"));
    elems.push(document.querySelectorAll(".dropdown-toggle"));
    elems.push(document.querySelectorAll(".label-price"));
    elems.push(document.querySelectorAll(".arrow"));
    elems.push(document.querySelectorAll(".shaft"));
    elems.push(document.querySelectorAll(".tip"));
    elems.push(document.querySelectorAll(".type-of-goods-label"));
    elems.push(document.querySelectorAll(".type-of-goods-dropdown-toggle"));
    elems.push(document.querySelectorAll(".svg-arrow"));
    elems.push(document.querySelectorAll(".custom-checkbox-insurance"));
    elems.push(document.querySelectorAll(".custom-input-label-dimensions"));
    elems.push(document.querySelectorAll(".custom-input-field-dimensions"));
    elems.push(document.querySelectorAll(".plus"));
    elems.push(document.querySelectorAll(".add-button"));
    elems.push(document.querySelectorAll(".boxing-spoiler-header"));
    elems.push(document.querySelectorAll(".triangle-arrow"));
    elems.push(document.querySelectorAll(".select-delivery-type"));
    elems.push(document.querySelectorAll(".redeem-data-plus"));
    elems.push(document.querySelectorAll(".redeem-data-minus"));
    elems.push(document.querySelectorAll(".redeem-name-input-label"));
    elems.push(document.querySelectorAll(".delivery-item-label"));
    elems.push(document.querySelectorAll(".svg-stroke"));
    elems.push(document.querySelectorAll(".rate-sign"));
    elems.push(document.querySelectorAll(".exchange-rate-elem-dollar"));
    elems.push(document.querySelectorAll(".exchange-rate-elem-yuan"));
    elems.push(document.querySelectorAll(".circle-help"));
    elems.push(document.querySelectorAll("button.tnved-calc-button"));
    elems.push(document.querySelectorAll("label.select-by-name-label"));
    elems.push(document.querySelectorAll("label.tnved-input-label"));
    elems.push(document.querySelectorAll(".tnved-calc-button"));
    elems.push(document.querySelectorAll(".arrow-to"));
    elems.push(document.querySelectorAll(".main-calc-checkbox"));
    elems.forEach((elemList) => {
      if (elemList) {
        elemList.forEach((elem) => {
          elem.classList.add("active");
        });
      }
    });
    const text1 = document.querySelector("#text1.active");
    const text2 = document.querySelector("#text2.active");
    const text3 = document.querySelector("#text3.active");
    const text4 = document.querySelector("#text4.active");
    const checkboxIT = document.querySelector("#checkbox_input_type");
    const checkboxIT2 = document.querySelector("#checkbox_input_type2");
    if (text1 && checkboxIT.checked) {
      text1.style.color = "#f09123";
      text2.style.color = "white";
      text3.style.color = "#9d9d9d";
      text4.style.color = "#9d9d9d";
    }
    if (text1 && !checkboxIT.checked && checkboxIT2.checked) {
      text1.style.color = "white";
      text2.style.color = "#f09123";
      text3.style.color = "#f09123";
      text4.style.color = "white";
    }
    if (text1 && !checkboxIT.checked && !checkboxIT2.checked) {
      text1.style.color = "white";
      text2.style.color = "#f09123";
      text3.style.color = "white";
      text4.style.color = "#f09123";
    }
  }
} /* Start:"a:4:{s:4:"full";s:49:"/calc-layout/js/delivery_choice.js?17214218482979";s:6:"source";s:34:"/calc-layout/js/delivery_choice.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
/* End */
function initializeDeliveryChoice() {
  // Находим все элементы DOM с классом 'delivery-toggle'
  const deliveryToggles = document.querySelectorAll(".delivery-toggle");
  deliveryToggles.forEach(handleDeliveryToggle);
}

function handleDeliveryToggle(deliveryToggle) {
  const deliveryTypesDropdown = deliveryToggle.closest(
    ".delivery-types-dropdown"
  );
  const kgElement = deliveryTypesDropdown.querySelector(".costs-data .kg");
  const sumElement = deliveryTypesDropdown.querySelector(".costs-data .sum");
  const costElems = deliveryTypesDropdown.querySelectorAll(".cost-elem");

  // Добавляем обработчики событий на элементы списка внутри текущего deliveryToggle
  costElems.forEach((elem) => {
    elem.addEventListener("click", () => {
      // Обновляем текст в deliveryToggle
      const arrow = deliveryToggle.querySelector(
        ".dropdown-list-delivery-arrow"
      );
      const rates = deliveryToggle.querySelector(".costs-data-exchange-rate");
      deliveryToggle.textContent = elem.firstChild.textContent;
      // Находим элемент li и его элемент help
      const listItem = elem.closest("li");
      const helpElement = listItem.querySelector(".help");

      // Если найден элемент help, добавляем его в delivery-toggle
      if (helpElement) {
        const clonedHelpElement = helpElement.cloneNode(true);
        deliveryToggle.appendChild(clonedHelpElement);
        deliveryToggle.querySelector(".help").style.marginTop = "7px";
        clonedHelpElement.addEventListener("mouseenter", updateBalloonPosition);
      }
      if (rates) {
        deliveryToggle.append(rates);
      }
      if (arrow) {
        deliveryToggle.append(arrow);
      }
      // Обновляем значения в kgElement и sumElement
      const costElement = elem.querySelector(".cost");
      const kgValue = costElement.querySelector(".kg").innerHTML;
      const sumValue = costElement.querySelector(".sum").innerHTML;

      kgElement.innerHTML = kgValue;
      sumElement.innerHTML = sumValue;
    });
  });
  // function updateBalloonPosition(event) {
  //     const helpElement = event.currentTarget;
  //     const balloonContainer = helpElement.querySelector('.balloon-container');
  //
  //     // Получаем позицию .help элемента
  //     const helpRect = helpElement.getBoundingClientRect();
  //
  //     // Устанавливаем позицию .balloon-container относительно .help элемента
  //     balloonContainer.style.top = `${helpRect.top - 208}px`;
  //     balloonContainer.style.left = `${helpRect.left + helpRect.width - 200}px`;
  // }
} /* Start:"a:4:{s:4:"full";s:55:"/calc-layout/js/change_delivery_list.js?172711007175645";s:6:"source";s:39:"/calc-layout/js/change_delivery_list.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
/* End */
// Функция для клонирования и обновления контейнера
function initializeDeliveryList() {
  document
    .querySelectorAll(".type-of-goods-dimensions")
    .forEach((typeOfGoodsDimension) => {
      typeOfGoodsDimension.classList.remove("active");
    });
  document.querySelector(".report-button-container").classList.remove("active");
  document.querySelector(".boxing-content-container").style.height = "350px";

  let deliveryToggles = document.querySelectorAll(".delivery-toggle");
  let deliveryTimes = {
    auto_regular: "20-30 дней",
    auto_fast: "12-18 дней",
    avia: "7-15 дней",
    ZhD: "35-40 дней",
  };
  let otherDeliveryData = {
    otherDelivery: ["ЖДЭ", "ПЭК", "Деловые линии", "КИТ"],
    dataWhite: [
      `<div class="title-help title-white tk-type" style="color: black; text-align: center;">ЖДЭ (до вашего города)</div>
            <div class="help-text help-text-content-white" style="color: black;">
                ЗА КГ: <span class="val-customs kg">н/д</span>
            </div>
            <div class="help-text help-text-content-white" style="color: black;">
                СУММА: <span class="val-customs sum sum-white">н/д</span>
            </div>`.trim(),
      `<div class="title-help title-white tk-type" style="color: black; text-align: center;">ПЭК (до вашего города)</div>
            <div class="help-text help-text-content-white" style="color: black;">
                ЗА КГ: <span class="val-customs kg">н/д</span>
            </div>
            <div class="help-text help-text-content-white" style="color: black;">
                СУММА: <span class="val-customs sum sum-white">н/д</span>
            </div>`.trim(),
      `<div class="title-help title-white tk-type" style="color: black; text-align: center;">Деловые линии (до вашего города)</div>
            <div class="help-text help-text-content-white" style="color: black;">
                ЗА КГ: <span class="val-customs kg">н/д</span>
            </div>
            <div class="help-text help-text-content-white" style="color: black;">
                СУММА: <span class="val-customs sum sum-white">н/д</span>
            </div>`.trim(),
      `<div class="title-help title-white tk-type" style="color: black; text-align: center;">КИТ (до вашего города)</div>
            <div class="help-text help-text-content-white" style="color: black;">
                ЗА КГ: <span class="val-customs kg">н/д</span>
            </div>
            <div class="help-text help-text-content-white" style="color: black;">
                СУММА: <span class="val-customs sum sum-white">н/д</span>
            </div>`.trim(),
    ],
    dataCargo: [
      `<tspan x="148" dy="20" class="help-text-content tk-type">ИТОГ (КАРГО + ЖДЭ)</tspan>
            <tspan x="10" dy="17" class="help-text-content" text-anchor="start">За кг:</tspan>
            <tspan x="51" class="help-text-content kg" fill="#c07000" text-anchor="start">н/д</tspan>
            <tspan x="10" dy="17" class="help-text-content" text-anchor="start">Сумма:</tspan>
            <tspan x="63" class="help-text-content sum" fill="#c07000" text-anchor="start">н/д</tspan>`.trim(),

      `<tspan x="148" dy="20" class="help-text-content tk-type">ИТОГ (КАРГО + ПЭК)</tspan>
            <tspan x="10" dy="17" class="help-text-content" text-anchor="start">За кг:</tspan>
            <tspan x="51" class="help-text-content kg" fill="#c07000" text-anchor="start">н/д</tspan>
            <tspan x="10" dy="17" class="help-text-content" text-anchor="start">Сумма:</tspan>
            <tspan x="63" class="help-text-content sum" fill="#c07000" text-anchor="start">н/д</tspan>`.trim(),

      `<tspan x="148" dy="20" class="help-text-content tk-type">ИТОГ (КАРГО + ДЛ)</tspan>
            <tspan x="10" dy="17" class="help-text-content" text-anchor="start">За кг:</tspan>
            <tspan x="51" class="help-text-content kg" fill="#c07000" text-anchor="start">н/д</tspan>
            <tspan x="10" dy="17" class="help-text-content" text-anchor="start">Сумма:</tspan>
            <tspan x="63" class="help-text-content sum" fill="#c07000" text-anchor="start">н/д</tspan>`.trim(),

      `<tspan x="148" dy="20" class="help-text-content tk-type">ИТОГ (КАРГО + КИТ)</tspan>
            <tspan x="10" dy="17" class="help-text-content" text-anchor="start">За кг:</tspan>
            <tspan x="51" class="help-text-content kg" fill="#c07000" text-anchor="start">н/д</tspan>
            <tspan x="10" dy="17" class="help-text-content" text-anchor="start">Сумма:</tspan>
            <tspan x="63" class="help-text-content sum" fill="#c07000" text-anchor="start">н/д</tspan>`.trim(),
    ],
  };
  deliveryToggles.forEach(function (deliveryToggle) {
    if (activeButton.dataset.type === "cargo") {
      deliveryToggle.innerHTML = `
                <div class="help cargo-help" style="margin-top: 7px">
                    <div id="circle-help">

<svg class="balloon-container" id="balloon-container" width="262.35" height="259.2822470337925" viewBox="0.000003856545077951523 -0.000019705447840578927 262.35 259.2822470337925" xml:space="preserve">
<g transform="matrix(4.7590291399 0 0 4.7033792463 131.1750038565 129.6411038114)">
<path style="stroke: none; fill: rgb(255,255,255); fill-rule: nonzero; opacity: 1;" transform=" translate(0.000005, 0)" d="M -27.5634 -24.71496 C -27.5634 -26.288110000000003 -26.30302 -27.5634 -24.74827 -27.5634 L 24.74826 -27.5634 L 24.74826 -27.5634 C 26.303009999999997 -27.5634 27.56339 -26.288110000000003 27.56339 -24.71496 L 27.56339 24.71496 L 27.56339 24.71496 C 27.56339 26.288110000000003 26.303009999999997 27.5634 24.74826 27.5634 L -24.74827 27.5634 L -24.74827 27.5634 C -26.30302 27.5634 -27.5634 26.288110000000003 -27.5634 24.71496 z" stroke-linecap="round"/>
</g>
<text x="10" y="10" fill="black" class="help-text" text-anchor="middle">
<tspan x="135" dy="10" class="title-help">Только до терминала ТК</tspan>
<tspan x="135" dy="20" class="title-help title-cargo tk-type">“Южные ворота” Москва</tspan>
<tspan x="135" dy="15" class="title-help title-cargo">(примерная стоимость)</tspan>
<tspan x="10" dy="20" class="help-text-content" text-anchor="start">Курс: </tspan>
<tspan x="51" class="help-text-content" fill="#c07000" text-anchor="start"><tspan fill="black">$: </tspan><tspan class="exchange-rate-elem-dollar">₽н/д</tspan><tspan fill="black">; </tspan><tspan fill="black">¥: </tspan><tspan class="exchange-rate-elem-yuan">₽н/д</tspan></tspan>
<tspan x="10" dy="20" class="help-text-content" text-anchor="start">Упаковка: </tspan>
<tspan x="79" class="help-text-content boxing-type" fill="#c07000" text-anchor="start">н/д</tspan>
<tspan x="10" dy="20" class="help-text-content" text-anchor="start">За упаковку: </tspan>
<tspan x="97" class="help-text-content packaging-price" fill="#c07000" text-anchor="start">н/д</tspan>
<tspan x="10" dy="20" class="help-text-content" text-anchor="start">Комиссия (выкуп): </tspan>
<tspan x="136" class="help-text-content redeem-commission" fill="#c07000" text-anchor="start">н/д</tspan>
<tspan x="10" dy="20" class="help-text-content" text-anchor="start">Страховка: </tspan>
<tspan x="88" class="help-text-content insurance" fill="#c07000" text-anchor="start">н/д</tspan>
<tspan x="10" dy="20" class="help-text-content" text-anchor="start">За кг:</tspan>
<tspan x="51" class="help-text-content kg" fill="#c07000" text-anchor="start">н/д</tspan>
<tspan x="10" dy="17" class="help-text-content" text-anchor="start">Сумма:</tspan>
<tspan x="63" class="help-text-content sum" fill="#c07000" text-anchor="start">н/д</tspan>
<tspan x="10" dy="20"  text-anchor="start"></tspan>
<tspan x="10" dy="58" class="help-text-content help-text-content-note" text-anchor="start"><tspan fill="red">* </tspan>Упаковка увеличит вес вашего груза</tspan>
</text>
</svg>
                    </div>
                </div>
                <svg class="dropdown-list-delivery-arrow" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="32.38141722065728" height="22.59489123485507" viewBox="110.22394056737565 250.64901537709036 32.38141722065728 22.59489123485507" xml:space="preserve">
                    <desc>Created with Fabric.js 5.3.0</desc>
                    <g transform="matrix(0 0.979842546 0.979842546 0 126.4146491777 261.9464609945)" id="DLgAgrXuFMXOEYFpJSRZM">
                        <path style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(240,145,35); fill-rule: nonzero; opacity: 1;" transform=" translate(0, 0)" d="M 8.536 -3.5215 L -3.183 -14.8535 C -3.9269999999999996 -15.5975 -4.931 -16.0135 -5.999 -16.0135 C -7.068 -16.0135 -8.072 -15.5975 -8.827 -14.8415 C -9.583 -14.0855 -9.999 -13.0815 -9.999 -12.0135 C -9.999 -10.945500000000001 -9.583 -9.9405 -8.827 -9.185500000000001 L -0.29100000000000037 -0.6915000000000013 C -0.10300000000000037 -0.5035000000000014 -3.885780586188048e-16 -0.25350000000000134 -3.885780586188048e-16 0.013499999999998624 C -3.885780586188048e-16 0.28049999999999864 -0.10400000000000038 0.5314999999999986 -0.29300000000000037 0.7204999999999986 L -8.824000000000002 9.1815 C -9.583000000000002 9.9415 -9.999000000000002 10.9465 -9.999000000000002 12.0135 C -9.999000000000002 13.0805 -9.583000000000002 14.0855 -8.827000000000002 14.8415 C -8.072000000000001 15.5975 -7.067000000000002 16.0135 -5.999000000000002 16.0135 C -4.931000000000003 16.0135 -3.9260000000000024 15.5975 -3.170000000000002 14.8415 L -1.564000000000002 13.2355 L 8.519999999999998 3.5645000000000007 C 9.478999999999997 2.6055000000000006 9.998999999999999 1.3495000000000008 9.998999999999999 0.013500000000000512 C 9.998999999999999 -1.3224999999999996 9.479 -2.5774999999999997 8.535999999999998 -3.5214999999999996 z" stroke-linecap="round"/>
                    </g>
                </svg>
            `.trim();
    } else if (activeButton.dataset.type === "white") {
      deliveryToggle.innerHTML = `
                <div class="help white-help" style="margin-top: 7px">
                    <div id="circle-help">
                         <svg class="balloon-container balloon-container-white" id="balloon-container" width="259.10224700114047" height="520.1116943482469" viewBox="-0.000019691767818130756 -0.00003952848265953435 259.1022470011404 520.1116943482469" xml:space="preserve">
                            <g transform="matrix(4.7001140462 0 0 9.4348247014 129.5511038088 260.0558076456)" id="QFrDCxhPIOVnh4tXOjZ_8">
                                <path style="stroke: none; fill: rgb(255,255,255); fill-rule: nonzero; opacity: 1;" transform=" translate(0, 0)" d="M -27.5634 -25.97852 C -27.5634 -26.85382 -26.13903 -27.5634 -24.381980000000002 -27.5634 L 24.381979999999995 -27.5634 L 24.381979999999995 -27.5634 C 26.139029999999995 -27.5634 27.563399999999994 -26.853830000000002 27.563399999999994 -25.978520000000003 L 27.563399999999994 25.978519999999996 L 27.563399999999994 25.978519999999996 C 27.563399999999994 26.853819999999995 26.139029999999995 27.563399999999994 24.381979999999995 27.563399999999994 L -24.381980000000002 27.563399999999994 L -24.381980000000002 27.563399999999994 C -26.13903 27.563399999999994 -27.5634 26.853829999999995 -27.5634 25.978519999999996 z" stroke-linecap="round"/>
                            </g>
                            <foreignObject x="10" y="10" width="240px" height="510px">
                                <div class="help-text" xmlns="http://www.w3.org/1999/xhtml" style="overflow: auto; height: 100%; width: 100%; text-align: left; white-space: nowrap;">
                                    <div class="help-text" style="font-size: 15px; color: black; text-align: center;">Таможенные расходы</div>
                                    <div class="title-help title-white" style="color: black; text-align: center;">СТАВКА:</div>
                                    <div class="help-text-content-white" style="color: black;">
                                        СУМ. ПОШЛИНА: <span class="val-customs sum-duty">н/д</span>
                                    </div>
                                    <div class="help-text-content-white" style="color: black;">
                                        НДС: <span class="val-customs">20%</span>
                                    </div>
                                    <div class="title-help title-white" style="color: black; text-align: center;">Saide:</div>
                                    <div class="help-text help-text-content-white" style="color: black;">
                                        ПЕРЕВОЗКА: <span class="val-customs">0.6$/КГ</span>
                                    </div>
                                    <div class="help-text help-text-content-white" style="color: black;">
                                        КОМИССИЯ (ВЫКУП): <span class="val-customs redeem-commission">н/д</span>
                                    </div>
                                    <div class="help-text help-text-content-white" style="color: black;">
                                        СТРАХОВКА: <span class="val-customs insurance">н/д</span>
                                    </div>
                                    <div class="help-text help-text-content-white" style="color: black;">
                                        КУРС: <span class="val-customs exchange-saide">н/д</span>
                                    </div>
                                    <div class="help-text help-text-content-white" style="color: black;">
                                        УПАКОВКА: <span class="val-customs boxing-type">н/д</span>
                                    </div>
                                    <div class="help-text help-text-content-white" style="color: black;">
                                        ЗА УПАКОВКУ: <span class="val-customs packaging-price">н/д</span>
                                    </div>
                                    <div class="title-help title-white tk-type" style="color: black; text-align: center; margin-top: 8px;">ИТОГ (Белая+Saide):</div>
                                    <div class="help-text-content-white" style="color: black;">
                                        СУМ. ПОШЛИНА: <span class="val-customs total-duty">н/д</span>
                                    </div>
                                    <div class="help-text-content-white" style="color: black;">
                                        СУМ. НДС: <span class="val-customs total-nds">н/д</span>
                                    </div>
                                    <div class="help-text-content-white" style="color: black;">
                                        СБОРЫ: <span class="val-customs fees">н/д</span>
                                    </div>
                                    <div class="help-text-content-white" style="color: black;">
                                        СУМ. SAIDE: <span class="val-customs sum-saide">н/д</span>
                                    </div>
                                    <div class="help-text-content-white" style="color: black;">
                                        ТАМОЖНЯ: <span class="val-customs total-customs">н/д</span>
                                    </div>
                                    <div class="help-text-content-white" style="color: black;">
                                        ИТОГО: <span class="val-customs total">н/д</span>
                                    </div>
                                    <div class="boxing-note-item">
                                        * <span class="boxing-note">Упаковка увеличит вес вашего груза</span>
                                    </div>
                                    <div class="doc-box">
                                        <div class="title-help title-white licenses" style="color: black; text-align: center; margin-top: 2px;">
                                            ЛИЦЕНЗИЯ:
                                        </div>
                                        <div class="title-help title-white cargo-certificates" style="color: black; text-align: center; margin-top: 8px;">
                                            СЕРТИФИКАТ:
                                        </div>
                                    </div>
                                    <div class="report-white-data">СКАЧАТЬ ПОДРОБНЫЙ ОТЧЕТ<br>(БЕЛАЯ) (XSLX)</div>
                                    <style>
                                        ::-webkit-scrollbar {
                                            width: 5px;
                                            height: 5px;/* ширина вертикальной полосы */
                                        }

                                        ::-webkit-scrollbar-thumb {
                                            background-color: #888; /* цвет полосы прокрутки */
                                            border-radius: 4px; /* скругление углов полосы прокрутки */
                                        }
                                    </style>
                                </div>
                            </foreignObject>
                        </svg>
                    </div>
                </div>
                <svg class="dropdown-list-delivery-arrow" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="32.38141722065728" height="22.59489123485507" viewBox="110.22394056737565 250.64901537709036 32.38141722065728 22.59489123485507" xml:space="preserve">
                    <desc>Created with Fabric.js 5.3.0</desc>
                    <g transform="matrix(0 0.979842546 0.979842546 0 126.4146491777 261.9464609945)" id="DLgAgrXuFMXOEYFpJSRZM">
                        <path style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(240,145,35); fill-rule: nonzero; opacity: 1;" transform=" translate(0, 0)" d="M 8.536 -3.5215 L -3.183 -14.8535 C -3.9269999999999996 -15.5975 -4.931 -16.0135 -5.999 -16.0135 C -7.068 -16.0135 -8.072 -15.5975 -8.827 -14.8415 C -9.583 -14.0855 -9.999 -13.0815 -9.999 -12.0135 C -9.999 -10.945500000000001 -9.583 -9.9405 -8.827 -9.185500000000001 L -0.29100000000000037 -0.6915000000000013 C -0.10300000000000037 -0.5035000000000014 -3.885780586188048e-16 -0.25350000000000134 -3.885780586188048e-16 0.013499999999998624 C -3.885780586188048e-16 0.28049999999999864 -0.10400000000000038 0.5314999999999986 -0.29300000000000037 0.7204999999999986 L -8.824000000000002 9.1815 C -9.583000000000002 9.9415 -9.999000000000002 10.9465 -9.999000000000002 12.0135 C -9.999000000000002 13.0805 -9.583000000000002 14.0855 -8.827000000000002 14.8415 C -8.072000000000001 15.5975 -7.067000000000002 16.0135 -5.999000000000002 16.0135 C -4.931000000000003 16.0135 -3.9260000000000024 15.5975 -3.170000000000002 14.8415 L -1.564000000000002 13.2355 L 8.519999999999998 3.5645000000000007 C 9.478999999999997 2.6055000000000006 9.998999999999999 1.3495000000000008 9.998999999999999 0.013500000000000512 C 9.998999999999999 -1.3224999999999996 9.479 -2.5774999999999997 8.535999999999998 -3.5214999999999996 z" stroke-linecap="round"/>
                    </g>
                </svg>
            `.trim();
    } else if (activeButton.dataset.type === "comparison") {
      let contentContainer = document.querySelector(
        ".boxing-content-container"
      );
      contentContainer.style.height = "490px";
      if (deliveryToggle.parentElement.id.endsWith("white")) {
        deliveryToggle.innerHTML = `
                    <div class="help white-help" style="margin-top: 7px">
                        <div id="circle-help">
                            <svg class="balloon-container balloon-container-white" id="balloon-container" width="259.10224700114047" height="520.1116943482469" viewBox="-0.000019691767818130756 -0.00003952848265953435 259.1022470011404 520.1116943482469" xml:space="preserve">
                            <g transform="matrix(4.7001140462 0 0 9.4348247014 129.5511038088 260.0558076456)" id="QFrDCxhPIOVnh4tXOjZ_8">
                                <path style="stroke: none; fill: rgb(255,255,255); fill-rule: nonzero; opacity: 1;" transform=" translate(0, 0)" d="M -27.5634 -25.97852 C -27.5634 -26.85382 -26.13903 -27.5634 -24.381980000000002 -27.5634 L 24.381979999999995 -27.5634 L 24.381979999999995 -27.5634 C 26.139029999999995 -27.5634 27.563399999999994 -26.853830000000002 27.563399999999994 -25.978520000000003 L 27.563399999999994 25.978519999999996 L 27.563399999999994 25.978519999999996 C 27.563399999999994 26.853819999999995 26.139029999999995 27.563399999999994 24.381979999999995 27.563399999999994 L -24.381980000000002 27.563399999999994 L -24.381980000000002 27.563399999999994 C -26.13903 27.563399999999994 -27.5634 26.853829999999995 -27.5634 25.978519999999996 z" stroke-linecap="round"/>
                            </g>
                                <foreignObject x="10" y="10" width="240px" height="510px">
                                    <div class="help-text" xmlns="http://www.w3.org/1999/xhtml" style="overflow: auto; height: 100%; width: 100%; text-align: left; white-space: nowrap;">
                                        <div class="help-text" style="font-size: 15px; color: black; text-align: center;">Таможенные расходы</div>
                                        <div class="title-help title-white" style="color: black; text-align: center;">СТАВКА:</div>
                                        <div class="help-text-content-white" style="color: black;">
                                            СУМ. ПОШЛИНА: <span class="val-customs sum-duty">н/д</span>
                                        </div>
                                        <div class="help-text-content-white" style="color: black;">
                                            НДС: <span class="val-customs">20%</span>
                                        </div>
                                        <div class="title-help title-white" style="color: black; text-align: center;">Saide:</div>
                                        <div class="help-text help-text-content-white" style="color: black;">
                                            ПЕРЕВОЗКА: <span class="val-customs">0.6$/КГ</span>
                                        </div>
                                        <div class="help-text help-text-content-white" style="color: black;">
                                            КОМИССИЯ (ВЫКУП): <span class="val-customs redeem-commission">н/д</span>
                                        </div>
                                        <div class="help-text help-text-content-white" style="color: black;">
                                            СТРАХОВКА: <span class="val-customs insurance">н/д</span>
                                        </div>
                                        <div class="help-text help-text-content-white" style="color: black;">
                                            КУРС: <span class="val-customs exchange-saide">н/д</span>
                                        </div>
                                        <div class="help-text help-text-content-white" style="color: black;">
                                            УПАКОВКА: <span class="val-customs boxing-type">н/д</span>
                                        </div>
                                        <div class="help-text help-text-content-white" style="color: black;">
                                            ЗА УПАКОВКУ: <span class="val-customs packaging-price">н/д</span>
                                        </div>
                                        <div class="title-help title-white tk-type" style="color: black; text-align: center; margin-top: 8px;">ИТОГ (Белая+Saide):</div>
                                        <div class="help-text-content-white" style="color: black;">
                                            СУМ. ПОШЛИНА: <span class="val-customs total-duty">н/д</span>
                                        </div>
                                        <div class="help-text-content-white" style="color: black;">
                                            СУМ. НДС: <span class="val-customs total-nds">н/д</span>
                                        </div>
                                        <div class="help-text-content-white" style="color: black;">
                                            СБОРЫ: <span class="val-customs fees">н/д</span>
                                        </div>
                                        <div class="help-text-content-white" style="color: black;">
                                            СУМ. SAIDE: <span class="val-customs sum-saide">н/д</span>
                                        </div>
                                        <div class="help-text-content-white" style="color: black;">
                                            ТАМОЖНЯ: <span class="val-customs total-customs">н/д</span>
                                        </div>
                                        <div class="help-text-content-white" style="color: black;">
                                            ИТОГО: <span class="val-customs total">н/д</span>
                                        </div>
                                        <div class="boxing-note-item">
                                            * <span class="boxing-note">Упаковка увеличит вес вашего груза</span>
                                        </div>
                                        <div class="doc-box">
                                            <div class="title-help title-white licenses" style="color: black; text-align: center; margin-top: 2px;">
                                                ЛИЦЕНЗИЯ:
                                            </div>
                                            <div class="title-help title-white cargo-certificates" style="color: black; text-align: center; margin-top: 8px;">
                                                СЕРТИФИКАТ:
                                            </div>
                                        </div>
                                        <div class="report-white-data">СКАЧАТЬ ПОДРОБНЫЙ ОТЧЕТ<br>(БЕЛАЯ) (XSLX)</div>
                                        <style>
                                            ::-webkit-scrollbar {
                                                width: 5px;
                                                height: 5px;/* ширина вертикальной полосы */
                                            }

                                            ::-webkit-scrollbar-thumb {
                                                background-color: #888; /* цвет полосы прокрутки */
                                                border-radius: 4px; /* скругление углов полосы прокрутки */
                                            }
                                        </style>
                                    </div>
                                </foreignObject>
                            </svg>
                        </div>
                    </div>
                    <svg class="dropdown-list-delivery-arrow" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="32.38141722065728" height="22.59489123485507" viewBox="110.22394056737565 250.64901537709036 32.38141722065728 22.59489123485507" xml:space="preserve">
                        <desc>Created with Fabric.js 5.3.0</desc>
                        <g transform="matrix(0 0.979842546 0.979842546 0 126.4146491777 261.9464609945)" id="DLgAgrXuFMXOEYFpJSRZM">
                            <path style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(240,145,35); fill-rule: nonzero; opacity: 1;" transform=" translate(0, 0)" d="M 8.536 -3.5215 L -3.183 -14.8535 C -3.9269999999999996 -15.5975 -4.931 -16.0135 -5.999 -16.0135 C -7.068 -16.0135 -8.072 -15.5975 -8.827 -14.8415 C -9.583 -14.0855 -9.999 -13.0815 -9.999 -12.0135 C -9.999 -10.945500000000001 -9.583 -9.9405 -8.827 -9.185500000000001 L -0.29100000000000037 -0.6915000000000013 C -0.10300000000000037 -0.5035000000000014 -3.885780586188048e-16 -0.25350000000000134 -3.885780586188048e-16 0.013499999999998624 C -3.885780586188048e-16 0.28049999999999864 -0.10400000000000038 0.5314999999999986 -0.29300000000000037 0.7204999999999986 L -8.824000000000002 9.1815 C -9.583000000000002 9.9415 -9.999000000000002 10.9465 -9.999000000000002 12.0135 C -9.999000000000002 13.0805 -9.583000000000002 14.0855 -8.827000000000002 14.8415 C -8.072000000000001 15.5975 -7.067000000000002 16.0135 -5.999000000000002 16.0135 C -4.931000000000003 16.0135 -3.9260000000000024 15.5975 -3.170000000000002 14.8415 L -1.564000000000002 13.2355 L 8.519999999999998 3.5645000000000007 C 9.478999999999997 2.6055000000000006 9.998999999999999 1.3495000000000008 9.998999999999999 0.013500000000000512 C 9.998999999999999 -1.3224999999999996 9.479 -2.5774999999999997 8.535999999999998 -3.5214999999999996 z" stroke-linecap="round"/>
                        </g>
                    </svg>
                `.trim();
      } else {
        deliveryToggle.innerHTML = `
                    <div class="help cargo-help" style="margin-top: 7px">
                        <div id="circle-help">
<svg class="balloon-container" id="balloon-container" width="262.35" height="259.2822470337925" viewBox="0.000003856545077951523 -0.000019705447840578927 262.35 259.2822470337925" xml:space="preserve">
<g transform="matrix(4.7590291399 0 0 4.7033792463 131.1750038565 129.6411038114)">
<path style="stroke: none; fill: rgb(255,255,255); fill-rule: nonzero; opacity: 1;" transform=" translate(0.000005, 0)" d="M -27.5634 -24.71496 C -27.5634 -26.288110000000003 -26.30302 -27.5634 -24.74827 -27.5634 L 24.74826 -27.5634 L 24.74826 -27.5634 C 26.303009999999997 -27.5634 27.56339 -26.288110000000003 27.56339 -24.71496 L 27.56339 24.71496 L 27.56339 24.71496 C 27.56339 26.288110000000003 26.303009999999997 27.5634 24.74826 27.5634 L -24.74827 27.5634 L -24.74827 27.5634 C -26.30302 27.5634 -27.5634 26.288110000000003 -27.5634 24.71496 z" stroke-linecap="round"/>
</g>
<text x="10" y="10" fill="black" class="help-text" text-anchor="middle">
<tspan x="135" dy="10" class="title-help">Только до терминала ТК</tspan>
<tspan x="135" dy="20" class="title-help title-cargo tk-type">“Южные ворота” Москва</tspan>
<tspan x="135" dy="15" class="title-help title-cargo">(примерная стоимость)</tspan>
<tspan x="10" dy="20" class="help-text-content" text-anchor="start">Курс: </tspan>
<tspan x="51" class="help-text-content" fill="#c07000" text-anchor="start"><tspan fill="black">$: </tspan><tspan class="exchange-rate-elem-dollar">₽н/д</tspan><tspan fill="black">; </tspan><tspan fill="black">¥: </tspan><tspan class="exchange-rate-elem-yuan">₽н/д</tspan></tspan>
<tspan x="10" dy="20" class="help-text-content" text-anchor="start">Упаковка: </tspan>
<tspan x="79" class="help-text-content boxing-type" fill="#c07000" text-anchor="start">н/д</tspan>
<tspan x="10" dy="20" class="help-text-content" text-anchor="start">За упаковку: </tspan>
<tspan x="97" class="help-text-content packaging-price" fill="#c07000" text-anchor="start">н/д</tspan>
<tspan x="10" dy="20" class="help-text-content" text-anchor="start">Комиссия (выкуп): </tspan>
<tspan x="136" class="help-text-content redeem-commission" fill="#c07000" text-anchor="start">н/д</tspan>
<tspan x="10" dy="20" class="help-text-content" text-anchor="start">Страховка: </tspan>
<tspan x="88" class="help-text-content insurance" fill="#c07000" text-anchor="start">н/д</tspan>
<tspan x="10" dy="20" class="help-text-content" text-anchor="start">За кг:</tspan>
<tspan x="51" class="help-text-content kg" fill="#c07000" text-anchor="start">н/д</tspan>
<tspan x="10" dy="17" class="help-text-content" text-anchor="start">Сумма:</tspan>
<tspan x="63" class="help-text-content sum" fill="#c07000" text-anchor="start">н/д</tspan>
<tspan x="10" dy="58" class="help-text-content help-text-content-note" text-anchor="start"><tspan fill="red">* </tspan>Упаковка увеличит вес вашего груза</tspan>
</text>
</svg>
                        </div>
                    </div>
                    <svg class="dropdown-list-delivery-arrow" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="32.38141722065728" height="22.59489123485507" viewBox="110.22394056737565 250.64901537709036 32.38141722065728 22.59489123485507" xml:space="preserve">
                        <desc>Created with Fabric.js 5.3.0</desc>
                        <g transform="matrix(0 0.979842546 0.979842546 0 126.4146491777 261.9464609945)" id="DLgAgrXuFMXOEYFpJSRZM">
                            <path style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(240,145,35); fill-rule: nonzero; opacity: 1;" transform=" translate(0, 0)" d="M 8.536 -3.5215 L -3.183 -14.8535 C -3.9269999999999996 -15.5975 -4.931 -16.0135 -5.999 -16.0135 C -7.068 -16.0135 -8.072 -15.5975 -8.827 -14.8415 C -9.583 -14.0855 -9.999 -13.0815 -9.999 -12.0135 C -9.999 -10.945500000000001 -9.583 -9.9405 -8.827 -9.185500000000001 L -0.29100000000000037 -0.6915000000000013 C -0.10300000000000037 -0.5035000000000014 -3.885780586188048e-16 -0.25350000000000134 -3.885780586188048e-16 0.013499999999998624 C -3.885780586188048e-16 0.28049999999999864 -0.10400000000000038 0.5314999999999986 -0.29300000000000037 0.7204999999999986 L -8.824000000000002 9.1815 C -9.583000000000002 9.9415 -9.999000000000002 10.9465 -9.999000000000002 12.0135 C -9.999000000000002 13.0805 -9.583000000000002 14.0855 -8.827000000000002 14.8415 C -8.072000000000001 15.5975 -7.067000000000002 16.0135 -5.999000000000002 16.0135 C -4.931000000000003 16.0135 -3.9260000000000024 15.5975 -3.170000000000002 14.8415 L -1.564000000000002 13.2355 L 8.519999999999998 3.5645000000000007 C 9.478999999999997 2.6055000000000006 9.998999999999999 1.3495000000000008 9.998999999999999 0.013500000000000512 C 9.998999999999999 -1.3224999999999996 9.479 -2.5774999999999997 8.535999999999998 -3.5214999999999996 z" stroke-linecap="round"/>
                        </g>
                    </svg>
                `.trim();
      }
    }
  });
  let deliveryLists = document.querySelectorAll(".delivery-types-list");
  let offerButton = document.querySelector(".offer-button");
  let newOfferButton = offerButton.cloneNode(true);
  // let popupOfferButton = document.querySelector('.pop-up-offer-button');
  // let newPopupOfferButton = popupOfferButton.cloneNode(true);
  if (activeButton.dataset.type === "white") {
    newOfferButton.classList.add("offer-button-white");
    newOfferButton.classList.remove("offer-button-comparison");
  }
  if (activeButton.dataset.type === "cargo") {
    newOfferButton.classList.remove("offer-button-white");
    newOfferButton.classList.remove("offer-button-comparison");
  }
  if (activeButton.dataset.type === "comparison") {
    newOfferButton.classList.remove("offer-button-white");
    newOfferButton.classList.add("offer-button-comparison");
  }
  document
    .querySelector(".boxing-content-container .report-button-container")
    .removeChild(offerButton);
  document
    .querySelector(".boxing-content-container .report-button-container")
    .appendChild(newOfferButton);
  // document.querySelector('.pop-up-get-offer-container').removeChild(popupOfferButton);
  // document.querySelector('.pop-up-get-offer-container').appendChild(newPopupOfferButton);
  let dataContainer = document.querySelector(".boxing-content-container");

  let dataElements = dataContainer.querySelectorAll(".kg, .sum");
  dataElements.forEach(function (element) {
    if (element.tagName === "tspan") {
      element.innerHTML = `$н/д<tspan fill="black">;</tspan> ₽н/д`;
    } else {
      if (!element.classList.contains("kg")) {
        element.innerHTML = `<span class="sum-dollar">$н/д</span><span class="sum-rub">₽н/д</span>`;
      } else {
        element.innerHTML = `$н/д - ₽н/д`;
      }
    }
  });
  let i = 0;
  deliveryLists.forEach(function (deliveryList) {
    let firstListItem = deliveryList.querySelector("li");

    let costElem = firstListItem.querySelector(".cost-elem");
    let helpDiv = firstListItem.querySelector(".list-help");
    let svg = firstListItem.querySelector(".balloon-container");

    let otherListItems = deliveryList.querySelectorAll("li:not(:first-child)");

    otherListItems.forEach(function (listItem) {
      let costElem = listItem.querySelector(".cost-elem");
      listItem.querySelector(".list-elem").classList.remove("selected");
      listItem.querySelector(".list-elem").classList.remove("enable-pointer");
      if (activeButton.dataset.type === "cargo") {
        if (!costElem.classList.contains("cargo-cost-elem")) {
          costElem.classList.add("cargo-cost-elem");
          costElem.classList.remove("white-cost-elem");
          let otherSvg = listItem.querySelector(".balloon-container");
          initOtherCargoHelps(
            otherSvg,
            otherDeliveryData.otherDelivery[i],
            otherDeliveryData.dataCargo[i]
          );
          i++;
        }
      } else if (activeButton.dataset.type === "white") {
        if (!costElem.classList.contains("white-cost-elem")) {
          costElem.classList.add("white-cost-elem");
          costElem.classList.remove("cargo-cost-elem");
          let otherSvg = listItem.querySelector(".balloon-container");
          initOtherWhiteHelps(
            otherSvg,
            otherDeliveryData.otherDelivery[i],
            otherDeliveryData.dataWhite[i]
          );
          i++;
        }
      } else if (activeButton.dataset.type === "comparison") {
        if (deliveryList.classList.contains("white")) {
          if (!costElem.classList.contains("white-cost-elem")) {
            costElem.classList.add("white-cost-elem");
            costElem.classList.remove("cargo-cost-elem");
            let otherSvg = listItem.querySelector(".balloon-container");
            initOtherWhiteHelps(
              otherSvg,
              otherDeliveryData.otherDelivery[i],
              otherDeliveryData.dataWhite[i]
            );
            i++;
          }
        } else {
          if (!costElem.classList.contains("cargo-cost-elem")) {
            costElem.classList.add("cargo-cost-elem");
            costElem.classList.remove("white-cost-elem");
            let otherSvg = listItem.querySelector(".balloon-container");
            initOtherCargoHelps(
              otherSvg,
              otherDeliveryData.otherDelivery[i],
              otherDeliveryData.dataCargo[i]
            );
            i++;
          }
        }
      }
    });
    i = 0;
    if (activeButton.dataset.type === "cargo") {
      helpDiv.className = "list-elem list-help cargo-help";
      costElem.className =
        "cost-elem " + costElem.classList[1] + " cargo-cost-elem";
      costElem.innerHTML = `
                <span class="cost">
                    <span class="kg-container">За кг: <span class="kg">$н/д - ₽н/д</span></span>
                    <span class="sum-container">Сумма: <span class="sum"><span class="sum-dollar">$н/д</span><span class="sum-rub">₽н/д</span></span></span>
                </span>
            `.trim();
      svg.setAttribute("width", "262.35");
      svg.setAttribute("height", "259.2822470337925");
      svg.setAttribute(
        "viewBox",
        "0.000003856545077951523 -0.000019705447840578927 262.35 259.2822470337925"
      );
      svg.setAttribute("xml:space", "preserve");
      svg.setAttribute("class", "balloon-container");
      svg.innerHTML = `
<g transform="matrix(4.7590291399 0 0 4.7033792463 131.1750038565 129.6411038114)">
<path style="stroke: none; fill: rgb(255,255,255); fill-rule: nonzero; opacity: 1;" transform=" translate(0.000005, 0)" d="M -27.5634 -24.71496 C -27.5634 -26.288110000000003 -26.30302 -27.5634 -24.74827 -27.5634 L 24.74826 -27.5634 L 24.74826 -27.5634 C 26.303009999999997 -27.5634 27.56339 -26.288110000000003 27.56339 -24.71496 L 27.56339 24.71496 L 27.56339 24.71496 C 27.56339 26.288110000000003 26.303009999999997 27.5634 24.74826 27.5634 L -24.74827 27.5634 L -24.74827 27.5634 C -26.30302 27.5634 -27.5634 26.288110000000003 -27.5634 24.71496 z" stroke-linecap="round"/>
</g>
<text x="10" y="10" fill="black" class="help-text" text-anchor="middle">
<tspan x="135" dy="10" class="title-help">Только до терминала ТК</tspan>
<tspan x="135" dy="20" class="title-help title-cargo tk-type">“Южные ворота” Москва</tspan>
<tspan x="135" dy="15" class="title-help title-cargo">(примерная стоимость)</tspan>
<tspan x="10" dy="20" class="help-text-content" text-anchor="start">Курс: </tspan>
<tspan x="51" class="help-text-content" fill="#c07000" text-anchor="start"><tspan fill="black">$: </tspan><tspan class="exchange-rate-elem-dollar">₽н/д</tspan><tspan fill="black">; </tspan><tspan fill="black">¥: </tspan><tspan class="exchange-rate-elem-yuan">₽н/д</tspan></tspan>
<tspan x="10" dy="20" class="help-text-content" text-anchor="start">Упаковка: </tspan>
<tspan x="79" class="help-text-content boxing-type" fill="#c07000" text-anchor="start">н/д</tspan>
<tspan x="10" dy="20" class="help-text-content" text-anchor="start">За упаковку: </tspan>
<tspan x="97" class="help-text-content packaging-price" fill="#c07000" text-anchor="start">н/д</tspan>
<tspan x="10" dy="20" class="help-text-content" text-anchor="start">Комиссия (выкуп): </tspan>
<tspan x="136" class="help-text-content redeem-commission" fill="#c07000" text-anchor="start">н/д</tspan>
<tspan x="10" dy="20" class="help-text-content" text-anchor="start">Страховка: </tspan>
<tspan x="88" class="help-text-content insurance" fill="#c07000" text-anchor="start">н/д</tspan>
<tspan x="10" dy="20" class="help-text-content" text-anchor="start">За кг:</tspan>
<tspan x="51" class="help-text-content kg" fill="#c07000" text-anchor="start">н/д</tspan>
<tspan x="10" dy="17" class="help-text-content" text-anchor="start">Сумма:</tspan>
<tspan x="63" class="help-text-content sum" fill="#c07000" text-anchor="start">н/д</tspan>
</text>
<foreignObject x="10" y="200" width="255px" height="40px">
    <button xmlns="http://www.w3.org/1999/xhtml" class="report-white-data offer-button report-cargo-data" href="" style="height: 30px; width: 240px; text-align: center; border-radius: 7px;" disabled>ПОЛУЧИТЬ РАСЧЕТ В PDF</button>
</foreignObject>
<text x="10" y="250" fill="black" class="help-text">
<tspan x="10" dy="0" class="help-text-content help-text-content-note" text-anchor="start"><tspan fill="red">* </tspan>Упаковка увеличит вес вашего груза</tspan>
</text>`.trim();
    } else if (activeButton.dataset.type === "white") {
      helpDiv.className = "list-elem list-help white-help";
      costElem.className = "cost-elem white white-cost-elem";
      costElem.innerHTML = `
                <span class="cost">
                    <span class="kg-container">За кг: <span class="kg">$н/д - ₽н/д</span></span>
                    <span class="sum-container">Сумма: <span class="sum"><span class="sum-dollar">$н/д</span><span class="sum-rub">₽н/д</span></span></span>
                </span>
            `.trim();
      // Установите SVG для Белой
      svg.setAttribute("width", "259.1022470011404");
      svg.setAttribute("height", "520.1116943482469");
      svg.setAttribute(
        "viewBox",
        "-0.000019691767818130756 -0.00003952848265953435 259.1022470011404 520.1116943482469"
      );
      svg.setAttribute("xml:space", "preserve");
      svg.setAttribute("class", "balloon-container balloon-container-white");
      svg.innerHTML = `
                <g transform="matrix(4.7001140462 0 0 9.4348247014 129.5511038088 260.0558076456)" id="QFrDCxhPIOVnh4tXOjZ_8">
                    <path style="stroke: none; fill: rgb(255,255,255); fill-rule: nonzero; opacity: 1;" transform=" translate(0, 0)" d="M -27.5634 -25.97852 C -27.5634 -26.85382 -26.13903 -27.5634 -24.381980000000002 -27.5634 L 24.381979999999995 -27.5634 L 24.381979999999995 -27.5634 C 26.139029999999995 -27.5634 27.563399999999994 -26.853830000000002 27.563399999999994 -25.978520000000003 L 27.563399999999994 25.978519999999996 L 27.563399999999994 25.978519999999996 C 27.563399999999994 26.853819999999995 26.139029999999995 27.563399999999994 24.381979999999995 27.563399999999994 L -24.381980000000002 27.563399999999994 L -24.381980000000002 27.563399999999994 C -26.13903 27.563399999999994 -27.5634 26.853829999999995 -27.5634 25.978519999999996 z" stroke-linecap="round"/>
                </g>
                <foreignObject x="10" y="10" width="240px" height="510px">
                    <div class="help-text" xmlns="http://www.w3.org/1999/xhtml" style="overflow: auto; height: 100%; width: 100%; text-align: left; white-space: nowrap;">
                        <div class="help-text" style="font-size: 15px; color: black; text-align: center;">Таможенные расходы</div>
                        <div class="title-help title-white" style="color: black; text-align: center;">СТАВКА:</div>
                        <div class="help-text-content-white" style="color: black;">
                            СУМ. ПОШЛИНА: <span class="val-customs sum-duty">н/д</span>
                        </div>
                        <div class="help-text-content-white" style="color: black;">
                            НДС: <span class="val-customs">20%</span>
                        </div>
                        <div class="title-help title-white" style="color: black; text-align: center;">Saide:</div>
                        <div class="help-text help-text-content-white" style="color: black;">
                            ПЕРЕВОЗКА: <span class="val-customs">0.6$/КГ</span>
                        </div>
                        <div class="help-text help-text-content-white" style="color: black;">
                            КОМИССИЯ (ВЫКУП): <span class="val-customs redeem-commission">н/д</span>
                        </div>
                        <div class="help-text help-text-content-white" style="color: black;">
                            СТРАХОВКА: <span class="val-customs insurance">н/д</span>
                        </div>
                        <div class="help-text help-text-content-white" style="color: black;">
                            КУРС: <span class="val-customs exchange-saide">н/д</span>
                        </div>
                        <div class="help-text help-text-content-white" style="color: black;">
                            УПАКОВКА: <span class="val-customs boxing-type">н/д</span>
                        </div>
                        <div class="help-text help-text-content-white" style="color: black;">
                            ЗА УПАКОВКУ: <span class="val-customs packaging-price">н/д</span>
                        </div>
                        <div class="title-help title-white tk-type" style="color: black; text-align: center; margin-top: 8px;">ИТОГ (Белая+Saide):</div>
                        <div class="help-text-content-white" style="color: black;">
                            СУМ. ПОШЛИНА: <span class="val-customs total-duty">н/д</span>
                        </div>
                        <div class="help-text-content-white" style="color: black;">
                            СУМ. НДС: <span class="val-customs total-nds">н/д</span>
                        </div>
                        <div class="help-text-content-white" style="color: black;">
                            СБОРЫ: <span class="val-customs fees">н/д</span>
                        </div>
                        <div class="help-text-content-white" style="color: black;">
                            СУМ. SAIDE: <span class="val-customs sum-saide">н/д</span>
                        </div>
                        <div class="help-text-content-white" style="color: black;">
                            ТАМОЖНЯ: <span class="val-customs total-customs">н/д</span>
                        </div>
                        <div class="help-text-content-white" style="color: black;">
                            ИТОГО: <span class="val-customs total">н/д</span>
                        </div>
                        <div class="boxing-note-item">
                            * <span class="boxing-note">Упаковка увеличит вес вашего груза</span>
                        </div>
                        <div class="doc-box">
                            <div class="title-help title-white licenses" style="color: black; text-align: center; margin-top: 2px;">
                                ЛИЦЕНЗИЯ:
                            </div>
                            <div class="title-help title-white cargo-certificates" style="color: black; text-align: center; margin-top: 8px;">
                                СЕРТИФИКАТ:
                            </div>
                        </div>
                        <div class="report-white-data">СКАЧАТЬ ПОДРОБНЫЙ ОТЧЕТ<br>(БЕЛАЯ) (XSLX)</div>
                        <button xmlns="http://www.w3.org/1999/xhtml" class="report-white-data offer-button report-cargo-data offer-button-white" href="" style="height: 30px; width: 240px; text-align: center; border-radius: 7px; top: 5%;" disabled>ПОЛУЧИТЬ РАСЧЕТ В PDF</button>
                        <style>
                            ::-webkit-scrollbar {
                                width: 5px;
                                height: 5px;/* ширина вертикальной полосы */
                            }

                            ::-webkit-scrollbar-thumb {
                                background-color: #888; /* цвет полосы прокрутки */
                                border-radius: 4px; /* скругление углов полосы прокрутки */
                            }
                        </style>
                    </div>
                </foreignObject>
            `.trim();
    } else if (activeButton.dataset.type === "comparison") {
      if (deliveryList.classList.contains("white")) {
        helpDiv.className = "list-elem list-help white-help";
        costElem.className = "cost-elem white white-cost-elem";
        costElem.innerHTML = `
                    <div class="cost">
                        <span class="kg-container kg-container-comparison">Кг: <span class="kg">$н/д - ₽н/д</span></span>
                        <div class="sum-container"><div class="sum sum-comparison"><span class="sum-dollar">$н/д</span><span class="sum-rub">₽н/д</span></div></div>
                    </div>
                `.trim();
        // Установите SVG для Белой
        svg.setAttribute("width", "259.1022470011404");
        svg.setAttribute("height", "520.1116943482469");
        svg.setAttribute(
          "viewBox",
          "-0.000019691767818130756 -0.00003952848265953435 259.1022470011404 520.1116943482469"
        );
        svg.setAttribute("xml:space", "preserve");
        svg.setAttribute("class", "balloon-container balloon-container-white");
        svg.innerHTML = `
                    <g transform="matrix(4.7001140462 0 0 9.4348247014 129.5511038088 260.0558076456)" id="QFrDCxhPIOVnh4tXOjZ_8">
                        <path style="stroke: none; fill: rgb(255,255,255); fill-rule: nonzero; opacity: 1;" transform=" translate(0, 0)" d="M -27.5634 -25.97852 C -27.5634 -26.85382 -26.13903 -27.5634 -24.381980000000002 -27.5634 L 24.381979999999995 -27.5634 L 24.381979999999995 -27.5634 C 26.139029999999995 -27.5634 27.563399999999994 -26.853830000000002 27.563399999999994 -25.978520000000003 L 27.563399999999994 25.978519999999996 L 27.563399999999994 25.978519999999996 C 27.563399999999994 26.853819999999995 26.139029999999995 27.563399999999994 24.381979999999995 27.563399999999994 L -24.381980000000002 27.563399999999994 L -24.381980000000002 27.563399999999994 C -26.13903 27.563399999999994 -27.5634 26.853829999999995 -27.5634 25.978519999999996 z" stroke-linecap="round"/>
                    </g>
                    <foreignObject x="10" y="10" width="240px" height="510px">
                        <div class="help-text" xmlns="http://www.w3.org/1999/xhtml" style="overflow: auto; height: 100%; width: 100%; text-align: left; white-space: nowrap;">
                            <div class="help-text" style="font-size: 15px; color: black; text-align: center;">Таможенные расходы</div>
                            <div class="title-help title-white" style="color: black; text-align: center;">СТАВКА:</div>
                            <div class="help-text-content-white" style="color: black;">
                                СУМ. ПОШЛИНА: <span class="val-customs sum-duty">н/д</span>
                            </div>
                            <div class="help-text-content-white" style="color: black;">
                                НДС: <span class="val-customs">20%</span>
                            </div>
                            <div class="title-help title-white" style="color: black; text-align: center;">Saide:</div>
                            <div class="help-text help-text-content-white" style="color: black;">
                                ПЕРЕВОЗКА: <span class="val-customs">0.6$/КГ</span>
                            </div>
                            <div class="help-text help-text-content-white" style="color: black;">
                                КОМИССИЯ (ВЫКУП): <span class="val-customs redeem-commission">н/д</span>
                            </div>
                            <div class="help-text help-text-content-white" style="color: black;">
                                СТРАХОВКА: <span class="val-customs insurance">н/д</span>
                            </div>
                            <div class="help-text help-text-content-white" style="color: black;">
                                КУРС: <span class="val-customs exchange-saide">н/д</span>
                            </div>
                            <div class="help-text help-text-content-white" style="color: black;">
                                УПАКОВКА: <span class="val-customs boxing-type">н/д</span>
                            </div>
                            <div class="help-text help-text-content-white" style="color: black;">
                                ЗА УПАКОВКУ: <span class="val-customs packaging-price">н/д</span>
                            </div>
                            <div class="title-help title-white tk-type" style="color: black; text-align: center; margin-top: 8px;">ИТОГ (Белая+Saide):</div>
                            <div class="help-text-content-white" style="color: black;">
                                СУМ. ПОШЛИНА: <span class="val-customs total-duty">н/д</span>
                            </div>
                            <div class="help-text-content-white" style="color: black;">
                                СУМ. НДС: <span class="val-customs total-nds">н/д</span>
                            </div>
                            <div class="help-text-content-white" style="color: black;">
                                СБОРЫ: <span class="val-customs fees">н/д</span>
                            </div>
                            <div class="help-text-content-white" style="color: black;">
                                СУМ. SAIDE: <span class="val-customs sum-saide">н/д</span>
                            </div>
                            <div class="help-text-content-white" style="color: black;">
                                ТАМОЖНЯ: <span class="val-customs total-customs">н/д</span>
                            </div>
                            <div class="help-text-content-white" style="color: black;">
                                ИТОГО: <span class="val-customs total">н/д</span>
                            </div>
                            <div class="boxing-note-item">
                                * <span class="boxing-note">Упаковка увеличит вес вашего груза</span>
                            </div>
                            <div class="doc-box">
                                <div class="title-help title-white licenses" style="color: black; text-align: center; margin-top: 2px;">
                                    ЛИЦЕНЗИЯ:
                                </div>
                                <div class="title-help title-white cargo-certificates" style="color: black; text-align: center; margin-top: 8px;">
                                    СЕРТИФИКАТ:
                                </div>
                            </div>
                            <div class="report-white-data">СКАЧАТЬ ПОДРОБНЫЙ ОТЧЕТ<br>(БЕЛАЯ) (XSLX)</div>
                            <button xmlns="http://www.w3.org/1999/xhtml" class="report-white-data offer-button report-cargo-data offer-button-white" href="" style="height: 30px; width: 240px; text-align: center; border-radius: 7px; top: 5%;" disabled>ПОЛУЧИТЬ РАСЧЕТ В PDF</button>
                            <style>
                                ::-webkit-scrollbar {
                                    width: 5px;
                                    height: 5px;/* ширина вертикальной полосы */
                                }
                                ::-webkit-scrollbar-thumb {
                                    background-color: #888; /* цвет полосы прокрутки */
                                    border-radius: 4px; /* скругление углов полосы прокрутки */
                                }
                            </style>
                        </div>
                    </foreignObject>
                `.trim();
      } else {
        helpDiv.className = "list-elem list-help cargo-help";
        costElem.className = "cost-elem cargo cargo-cost-elem";
        costElem.innerHTML = `
                    <div class="cost">
                        <span class="kg-container kg-container-comparison">Кг: <span class="kg">$н/д - ₽н/д</span></span>
                        <div class="sum-container"><div class="sum sum-comparison"><span class="sum-dollar">$н/д</span><span class="sum-rub">₽н/д</span></div></div>
                    </div>
                `.trim();
        // Установите SVG для Карго
        svg.setAttribute("width", "262.35");
        svg.setAttribute("height", "259.2822470337925");
        svg.setAttribute(
          "viewBox",
          "0.000003856545077951523 -0.000019705447840578927 262.35 259.2822470337925"
        );
        svg.setAttribute("xml:space", "preserve");
        svg.setAttribute("class", "balloon-container");
        svg.innerHTML = `
<g transform="matrix(4.7590291399 0 0 4.7033792463 131.1750038565 129.6411038114)">
<path style="stroke: none; fill: rgb(255,255,255); fill-rule: nonzero; opacity: 1;" transform=" translate(0.000005, 0)" d="M -27.5634 -24.71496 C -27.5634 -26.288110000000003 -26.30302 -27.5634 -24.74827 -27.5634 L 24.74826 -27.5634 L 24.74826 -27.5634 C 26.303009999999997 -27.5634 27.56339 -26.288110000000003 27.56339 -24.71496 L 27.56339 24.71496 L 27.56339 24.71496 C 27.56339 26.288110000000003 26.303009999999997 27.5634 24.74826 27.5634 L -24.74827 27.5634 L -24.74827 27.5634 C -26.30302 27.5634 -27.5634 26.288110000000003 -27.5634 24.71496 z" stroke-linecap="round"/>
</g>
<text x="10" y="10" fill="black" class="help-text" text-anchor="middle">
<tspan x="135" dy="10" class="title-help">Только до терминала ТК</tspan>
<tspan x="135" dy="20" class="title-help title-cargo tk-type">“Южные ворота” Москва</tspan>
<tspan x="135" dy="15" class="title-help title-cargo">(примерная стоимость)</tspan>
<tspan x="10" dy="20" class="help-text-content" text-anchor="start">Курс:</tspan>
<tspan x="51" class="help-text-content" fill="#c07000" text-anchor="start"><tspan fill="black">$: </tspan><tspan class="exchange-rate-elem-dollar">₽н/д</tspan><tspan fill="black">; </tspan><tspan fill="black">¥: </tspan><tspan class="exchange-rate-elem-yuan">₽н/д</tspan></tspan>
<tspan x="10" dy="20" class="help-text-content" text-anchor="start">Упаковка: </tspan>
<tspan x="79" class="help-text-content boxing-type" fill="#c07000" text-anchor="start">н/д</tspan>
<tspan x="10" dy="20" class="help-text-content" text-anchor="start">За упаковку: </tspan>
<tspan x="97" class="help-text-content packaging-price" fill="#c07000" text-anchor="start">н/д</tspan>
<tspan x="10" dy="20" class="help-text-content" text-anchor="start">Комиссия (выкуп): </tspan>
<tspan x="136" class="help-text-content redeem-commission" fill="#c07000" text-anchor="start">н/д</tspan>
<tspan x="10" dy="20" class="help-text-content" text-anchor="start">Страховка: </tspan>
<tspan x="88" class="help-text-content insurance" fill="#c07000" text-anchor="start">н/д</tspan>
<tspan x="10" dy="20" class="help-text-content" text-anchor="start">За кг:</tspan>
<tspan x="51" class="help-text-content kg" fill="#c07000" text-anchor="start">н/д</tspan>
<tspan x="10" dy="17" class="help-text-content" text-anchor="start">Сумма:</tspan>
<tspan x="63" class="help-text-content sum" fill="#c07000" text-anchor="start">н/д</tspan>
</text>
<foreignObject x="10" y="200" width="255px" height="40px">
    <button xmlns="http://www.w3.org/1999/xhtml" class="report-white-data offer-button report-cargo-data" style="width: 242px; height: 35px;" href="" disabled>ПОЛУЧИТЬ РАСЧЕТ В PDF</button>
</foreignObject>
<text x="10" y="193" fill="black" class="help-text">
<tspan x="10" dy="58" class="help-text-content help-text-content-note" text-anchor="start"><tspan fill="red">* </tspan>Упаковка увеличит вес вашего груза</tspan>
</text>`.trim();
      }
    }
  });
  function initOtherWhiteHelps(otherSvg, otherDelivery, otherDeliveryData) {
    otherSvg.setAttribute("width", "269.3362");
    otherSvg.setAttribute("height", "602.3777");
    otherSvg.setAttribute("viewBox", "0 0 269.3362 602.3777");
    otherSvg.setAttribute("xml:space", "preserve");
    otherSvg.setAttribute(
      "class",
      "balloon-container balloon-container-white-others"
    );
    otherSvg.innerHTML = `
            <g transform="matrix(4.8857588116 0 0 10.9271317993 134.6681 300.8568331362)" id="mLQWqDgjNBaa4qoHdDRGo">
                <path style="stroke: none; fill: rgb(255,255,255); fill-rule: nonzero; opacity: 1;" transform=" translate(0, 0)" d="M -27.5634 -26.2565 C -27.5634 -26.603109999999997 -27.25545 -26.93552 -26.7073 -27.180609999999998 C -26.15915 -27.4257 -25.4157 -27.56339 -24.64049 -27.56339 L 24.64049 -27.56339 L 24.64049 -27.56339 C 25.41569 -27.56339 26.15914 -27.4257 26.7073 -27.180609999999998 C 27.25545 -26.935519999999997 27.5634 -26.603109999999997 27.5634 -26.2565 L 27.5634 26.2565 L 27.5634 26.2565 C 27.5634 26.978279999999998 26.25477 27.56339 24.640500000000003 27.56339 L -24.640479999999997 27.56339 L -24.640479999999997 27.56339 C -26.254759999999997 27.56339 -27.563379999999995 26.97827 -27.563379999999995 26.2565 z" stroke-linecap="round"/>
            </g>
            <foreignObject x="10" y="10" width="250px" height="590px">
                <div class="help-text" xmlns="http://www.w3.org/1999/xhtml" style="overflow: auto; height: 100%; width: 100%; text-align: left; white-space: nowrap;">
                    <div class="help-text" style="font-size: 15px; color: black; text-align: center;">Таможенные расходы</div>
                    <div class="title-help title-white" style="color: black; text-align: center;">СТАВКА:</div>
                    <div class="help-text-content-white" style="color: black;">
                        СУМ. ПОШЛИНА: <span class="val-customs sum-duty">н/д</span>
                    </div>
                    <div class="help-text-content-white" style="color: black;">
                        НДС: <span class="val-customs">20%</span>
                    </div>
                    <div class="title-help title-white" style="color: black; text-align: center;">Saide:</div>
                    <div class="help-text help-text-content-white" style="color: black;">
                        ПЕРЕВОЗКА: <span class="val-customs">0.6$/КГ</span>
                    </div>
                    <div class="help-text help-text-content-white" style="color: black;">
                        КОМИССИЯ (ВЫКУП): <span class="val-customs redeem-commission">н/д</span>
                    </div>
                    <div class="help-text help-text-content-white" style="color: black;">
                        СТРАХОВКА: <span class="val-customs insurance">н/д</span>
                    </div>
                    <div class="help-text help-text-content-white" style="color: black;">
                        КУРС: <span class="val-customs exchange-saide">н/д</span>
                    </div>
                    <div class="help-text help-text-content-white" style="color: black;">
                        УПАКОВКА: <span class="val-customs boxing-type">н/д</span>
                    </div>
                    <div class="help-text help-text-content-white" style="color: black;">
                        ЗА УПАКОВКУ: <span class="val-customs packaging-price">н/д</span>
                    </div>
                    ${otherDeliveryData}
                    <div class="title-help title-white" style="color: black; text-align: center; margin-top: 8px;">ИТОГ (Saide+Белая+${otherDelivery}):</div>
                    <div class="help-text-content-white" style="color: black;">
                        СУМ. ПОШЛИНА: <span class="val-customs total-duty">н/д</span>
                    </div>
                    <div class="help-text-content-white" style="color: black;">
                        СУМ. НДС: <span class="val-customs total-nds">н/д</span>
                    </div>
                    <div class="help-text-content-white" style="color: black;">
                        СБОРЫ: <span class="val-customs fees">н/д</span>
                    </div>
                    <div class="help-text-content-white" style="color: black;">
                        СУМ. SAIDE: <span class="val-customs sum-saide">н/д</span>
                    </div>
                    <div class="help-text-content-white" style="color: black;">
                        ТАМОЖНЯ: <span class="val-customs total-customs">н/д</span>
                    </div>
                    <div class="help-text-content-white" style="color: black;">
                        ИТОГО: <span class="val-customs total">н/д</span>
                    </div>
                    <div class="boxing-note-item">
                        * <span class="boxing-note">Упаковка увеличит вес вашего груза</span>
                    </div>
                    <div class="doc-box doc-box-others">
                        <div class="title-help title-white licenses" style="color: black; text-align: center; margin-top: 2px;">
                            ЛИЦЕНЗИЯ:
                        </div>
                        <div class="title-help title-white cargo-certificates" style="color: black; text-align: center; margin-top: 8px;">
                            СЕРТИФИКАТ:
                        </div>
                    </div>
                    <div class="report-white-data">СКАЧАТЬ ПОДРОБНЫЙ ОТЧЕТ<br>(БЕЛАЯ) (XSLX)</div>
                    <button xmlns="http://www.w3.org/1999/xhtml" class="report-white-data offer-button report-cargo-data offer-button-white" href="" style="height: 30px; width: 250px; text-align: center; border-radius: 7px; top: 5%;" disabled>ПОЛУЧИТЬ РАСЧЕТ В PDF</button>
                    <style>
                        ::-webkit-scrollbar {
                        width: 5px;
                        height: 5px;/* ширина вертикальной полосы */
                    }

                        ::-webkit-scrollbar-thumb {
                        background-color: #888; /* цвет полосы прокрутки */
                        border-radius: 4px; /* скругление углов полосы прокрутки */
                    }
                    </style>
                </div>
            </foreignObject>
        `.trim();
  }
  function initOtherCargoHelps(otherSvg, otherDelivery, otherDeliveryData) {
    otherSvg.setAttribute("width", "262.7358922755646");
    otherSvg.setAttribute("height", "301.84014587969517");
    otherSvg.setAttribute(
      "viewBox",
      "0 0 262.7358922755646 301.84014587969517"
    );
    otherSvg.setAttribute("xml:space", "preserve");
    otherSvg.setAttribute(
      "class",
      "balloon-container balloon-container-cargo-others"
    );
    otherSvg.innerHTML = `
<g transform="matrix(4.766029226 0 0 5.475379414 131.3679461378 150.9200729398)" id="sv3He1D-K39enoPRawG7t">
<path style="stroke: none; fill: rgb(255,255,255); fill-rule: nonzero; opacity: 1;" transform=" translate(0.000005, 0)" d="M -27.5634 -25.3448 C -27.5634 -26.5701 -26.42226 -27.563399999999998 -25.0146 -27.563399999999998 L 25.01459 -27.563399999999998 L 25.01459 -27.563399999999998 C 26.42225 -27.563399999999998 27.56339 -26.570099999999996 27.56339 -25.3448 L 27.56339 25.3448 L 27.56339 25.3448 C 27.56339 26.5701 26.42225 27.563399999999998 25.01459 27.563399999999998 L -25.0146 27.563399999999998 L -25.0146 27.563399999999998 C -26.42226 27.563399999999998 -27.5634 26.570099999999996 -27.5634 25.3448 z" stroke-linecap="round"/>
</g>
<text x="10" y="20" fill="black" class="help-text" text-anchor="middle">
<tspan x="135" dy="17" class="title-help">КАРГО - до г. Москва</tspan>
<tspan x="135" dy="14" class="title-help arrival-city-rus-tk">${otherDelivery}</tspan>
<tspan x="135" dy="14" class="help-text-content title-cargo">(примерная стоимость)</tspan>
<tspan x="10" dy="17" class="help-text-content" text-anchor="start">Курс: </tspan>
<tspan x="51" class="help-text-content" fill="#c07000" text-anchor="start"><tspan fill="black">$: </tspan><tspan class="exchange-rate-elem-dollar">₽н/д</tspan><tspan fill="black">; </tspan><tspan fill="black">¥: </tspan><tspan class="exchange-rate-elem-yuan">₽н/д</tspan></tspan>
<tspan x="10" dy="17" class="help-text-content" text-anchor="start">Упаковка: </tspan>
<tspan x="79" class="help-text-content boxing-type" fill="#c07000" text-anchor="start">н/д</tspan>
<tspan x="10" dy="17" class="help-text-content" text-anchor="start">За упаковку: </tspan>
<tspan x="97" class="help-text-content packaging-price" fill="#c07000" text-anchor="start">н/д</tspan>
<tspan x="10" dy="20" class="help-text-content" text-anchor="start">Комиссия (выкуп): </tspan>
<tspan x="136" class="help-text-content redeem-commission" fill="#c07000" text-anchor="start">н/д</tspan>
<tspan x="10" dy="20" class="help-text-content" text-anchor="start">Страховка: </tspan>
<tspan x="88" class="help-text-content insurance" fill="#c07000" text-anchor="start">н/д</tspan>
<tspan x="10" dy="17" class="help-text-content" text-anchor="start">За кг:</tspan>
<tspan x="51" class="help-text-content kg-cargo" fill="#c07000" text-anchor="start">н/д</tspan>
<tspan x="10" dy="17" class="help-text-content" text-anchor="start">Сумма:</tspan>
<tspan x="63" class="help-text-content sum-cargo" fill="#c07000" text-anchor="start">н/д</tspan>
${otherDeliveryData}
</text>
<foreignObject x="10" y="250" width="255px" height="40px">
    <button xmlns="http://www.w3.org/1999/xhtml" class="report-white-data offer-button report-cargo-data" href="" style="height: 30px; width: 240px; text-align: center; border-radius: 7px;" disabled>ПОЛУЧИТЬ РАСЧЕТ В PDF</button>
</foreignObject>
<text x="10" y="293" fill="black" class="help-text">
<tspan x="10" dy="0" class="help-text-content help-text-content-note" text-anchor="start"><tspan fill="red">* </tspan>Упаковка увеличит вес вашего груза</tspan>
</text>`.trim();
  }
} /* Start:"a:4:{s:4:"full";s:56:"/calc-layout/js/balloon_help_position.js?172763177213983";s:6:"source";s:40:"/calc-layout/js/balloon_help_position.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/

/* End */
// Получаем ссылки на все элементы с классом .help
function initializeHelp() {
  const helpElements = document.querySelectorAll(
    ".help:not(.max-dimension-help):not(.brand-help):not(.yuan-help):not(.delivery-help):not(.redeem-help), .list-help"
  );
  const helpElementsBrand = document.querySelectorAll(".brand-help");
  const helpElementsYuan = document.querySelectorAll(".yuan-help");
  const helpElementRedeem = document.querySelector(".redeem-help");
  const helpElementInsurance = document.querySelector(
    ".custom-checkbox-insurance"
  );
  const helpElementFirstStep = document.querySelector(
    ".custom-radio-redeem.custom-radio-redeem2"
  );
  const helpElementMaxDimension = document.querySelector(
    ".help.max-dimension-help"
  );
  const helpDeliveryTypes = document.querySelectorAll(".delivery-help");
  let element = document.querySelector(".element");
  let subcontainer = document.querySelector(".sub-container");
  // Функция для обновления позиции balloon-container при наведении

  // Добавляем обработчики событий для каждого .help элемента
  helpElements.forEach((helpElement) => {
    helpElement.addEventListener("mouseenter", updateBalloonPosition);
    if (helpElement.closest(".delivery-types-list-comparison")) {
      helpElement.addEventListener("mouseenter", updateZIndexDropdown);
    }
    helpElement.addEventListener("mouseleave", updateZIndexDropdown);
    let balloonContainer = helpElement.querySelector(".balloon-container");
    balloonContainer?.addEventListener("transitionend", hideHelpContainer);
  });

  helpElementsBrand.forEach((helpElement) => {
    helpElement.addEventListener("mouseenter", updateBalloonBrandPosition);
  });

  helpElementsYuan.forEach((helpElement) => {
    helpElement.addEventListener(
      "mouseenter",
      updateBalloonExchangeRateYuanPosition
    );
  });
  helpDeliveryTypes.forEach((helpDeliveryType) => {
    helpDeliveryType.addEventListener(
      "mouseenter",
      updateBalloonDeliveryHelpPosition
    );
    const balloonContainer = helpDeliveryType.querySelector(
      ".balloon-delivery-type"
    );
    balloonContainer?.addEventListener(
      "transitionend",
      updateBalloonDeliveryHelpZIndex
    );
  });
  helpElementInsurance.addEventListener(
    "mouseenter",
    updateBalloonInsurancePosition
  );
  helpElementFirstStep.addEventListener("mouseenter", updateBalloonFirstStep);
  helpElementRedeem?.addEventListener(
    "mouseenter",
    updateBalloonRedeemPosition
  );

  if (helpElementMaxDimension) {
    helpElementMaxDimension.addEventListener(
      "mouseenter",
      updateBalloonMaxDimensionPosition
    );
  }
}

function hideHelpContainer(event) {
  let balloonContainer = event.target;
  let helpContainer = balloonContainer?.parentElement;
  if (
    event.propertyName === "opacity" &&
    window.getComputedStyle(balloonContainer).opacity === "0" &&
    !helpContainer.classList.contains("circle-help")
  ) {
    helpContainer.style.display = "none";
  }
}

function extractCityName(fullAddress) {
  // Используем регулярное выражение для поиска первого слова, начинающегося с заглавной буквы
  var match = fullAddress.match(/[A-ZА-Я][a-zA-Zа-яА-Я-]+/);

  // Возвращаем найденное слово (или полный адрес, если ничего не найдено)
  return match ? match[0] : fullAddress.trim();
}

function updateZIndexDropdown(event) {
  const helpElement = event.currentTarget;
  const balloonContainerWhite = helpElement.querySelector(
    ".balloon-container-white"
  );
  const balloonContainerComparison =
    helpElement.querySelector(".balloon-container");
  let deliveryTypesDropdown;
  if (balloonContainerWhite) {
    deliveryTypesDropdown = balloonContainerWhite.closest(
      ".delivery-types-dropdown"
    );
    deliveryTypesDropdown.style.zIndex = "0";
  }
  if (balloonContainerComparison) {
    let deliveryTypesLists = balloonContainerComparison
      ?.closest(".delivery-types-dropdown-comparison")
      ?.querySelectorAll(".delivery-types-list-comparison");
    if (deliveryTypesLists) {
      deliveryTypesLists.forEach((deliveryTypesList) => {
        if (
          deliveryTypesList ===
          balloonContainerComparison.closest(".delivery-types-list-comparison")
        ) {
          deliveryTypesList.style.zIndex = "0";
        } else {
          deliveryTypesList.style.zIndex = "-1";
        }
      });
    }
  }
}

function updateBalloonInsurancePosition(event) {
  const helpElement = event.currentTarget;
  const balloonContainer = helpElemen?.querySelector(".balloon-insurance");
  const helpRect = helpElement?.getBoundingClientRect();
  const balloonRect = balloonContainer?.getBoundingClientRect();
  let helpRectTop = 0;
  let leftMinus = [310];
  if (helpRect?.top < balloonRect?.height) {
    helpRectTop = balloonRect.height - helpRect.top + 25;
  }
  if (balloonContainer) {
    balloonContainer.style.top = `${helpRect.top - 100 + helpRectTop}px`;
    balloonContainer.style.left = `${
      helpRect.left + helpRect.width - leftMinus[0]
    }px`;
  }
}

function updateBalloonFirstStep(event) {
  const helpElement = event.currentTarget;
  const balloonContainer = helpElement?.querySelector(".balloon-first-step");
  const helpRect = helpElement?.getBoundingClientRect();
  const balloonRect = balloonContainer?.getBoundingClientRect();
  let helpRectTop = 0;
  let leftMinus = [305];
  if (balloonRect) {
    if (helpRect.top < balloonRect.height) {
      helpRectTop = balloonRect.height - helpRect.top + 25;
    }
    if (balloonContainer) {
      balloonContainer.style.top = `${helpRect.top - 145 + helpRectTop}px`;
      balloonContainer.style.left = `${
        helpRect.left + helpRect.width - leftMinus[0]
      }px`;
    }
  }
}

function updateBalloonRedeemPosition(event) {
  const helpElement = event.currentTarget;
  const balloonContainer = helpElement.querySelector(".balloon-redeem");
  const helpRect = helpElement.getBoundingClientRect();
  const balloonRect = balloonContainer.getBoundingClientRect();
  let helpRectTop = 0;
  let leftMinus = [290];
  if (helpRect.top < balloonRect.height) {
    helpRectTop = balloonRect.height - helpRect.top + 25;
  }
  if (balloonContainer) {
    balloonContainer.style.top = `${helpRect.top - 110 + helpRectTop}px`;
    balloonContainer.style.left = `${
      helpRect.left + helpRect.width - leftMinus[0]
    }px`;
  }
}

function updateBalloonDeliveryHelpPosition(event) {
  const helpElement = event.currentTarget;
  const balloonContainer = helpElement.querySelector(".balloon-delivery-type");
  let tMinus = 180;
  if (balloonContainer?.classList.contains("jde")) {
    tMinus = 105;
  }
  if (balloonContainer?.classList.contains("pek")) {
    tMinus = 240;
  }
  if (balloonContainer?.classList.contains("dl")) {
    tMinus = 110;
  }
  if (balloonContainer?.classList.contains("kit")) {
    tMinus = 280;
  }
  const helpRect = helpElement.getBoundingClientRect();
  const balloonRect = balloonContainer?.getBoundingClientRect();
  let helpRectTop = 0;
  let leftMinus = [-15];
  if (helpRect?.top < balloonRect?.height) {
    helpRectTop = balloonRect.height - helpRect.top + 15;
  }
  if (balloonContainer) {
    balloonContainer.style.top = `${helpRect.top - tMinus + helpRectTop}px`;
    balloonContainer.style.left = `${
      helpRect.left + helpRect.width - leftMinus[0]
    }px`;
    helpElement.closest(".delivery-types-dropdown").style.zIndex = 3;
  }
}

function updateBalloonDeliveryHelpZIndex(event) {
  if (
    event.propertyName === "opacity" &&
    window.getComputedStyle(event.currentTarget).opacity === "0"
  ) {
    event.currentTarget.closest(".delivery-types-dropdown").style.zIndex = 0;
  }
}

function updateBalloonMaxDimensionPosition(event) {
  const helpElement = event.currentTarget;
  const balloonContainer = helpElement.querySelector(".balloon-max-dimension");
  const helpRect = helpElement.getBoundingClientRect();
  const balloonRect = balloonContainer?.getBoundingClientRect();
  let helpRectTop = 0;
  let leftMinus = [285];
  if (helpRect.top < balloonRect.height) {
    helpRectTop = balloonRect.height - helpRect.top + 25;
  }
  if (balloonContainer) {
    balloonContainer.style.top = `${helpRect.top - 30 + helpRectTop}px`;
    balloonContainer.style.left = `${
      helpRect.left + helpRect.width - leftMinus[0]
    }px`;
  }
}

function updateBalloonBrandPosition(event) {
  event.stopPropagation();
  const helpElement = event.currentTarget;
  const balloonContainer = helpElement.querySelector(".balloon-brand");
  const helpRect = helpElement.getBoundingClientRect();
  const balloonRect = balloonContainer?.getBoundingClientRect();
  let helpRectTop = 0;
  let leftMinus = [315];
  if (helpRect.top < balloonRect.height) {
    helpRectTop = balloonRect.height - helpRect.top + 25;
  }
  if (balloonContainer) {
    balloonContainer.style.top = `${helpRect.top - 36 + helpRectTop}px`;
    balloonContainer.style.left = `${
      helpRect.left + helpRect.width - leftMinus[0]
    }px`;
  }
  event.stopPropagation();
}

function updateBalloonExchangeRateYuanPosition(event) {
  event.stopPropagation();
  const helpElement = event.currentTarget;
  const balloonContainer = helpElement?.querySelector(".balloon-yuan");
  const helpRect = helpElement?.getBoundingClientRect();
  const balloonRect = balloonContainer?.getBoundingClientRect();
  let helpRectTop = 0;
  let leftMinus = [282];
  if (helpRect?.top < balloonRect?.height) {
    helpRectTop = balloonRect.height - helpRect.top + 20;
  }
  if (balloonContainer) {
    balloonContainer.style.top = `${helpRect.top - 25 + helpRectTop}px`;
    balloonContainer.style.left = `${
      helpRect.left + helpRect.width - leftMinus[0]
    }px`;
  }
  event.stopPropagation();
}

function updateBalloonPosition(event) {
  const helpElement = event.currentTarget;
  const helpContainer = helpElement.querySelector(".help-container");
  if (helpContainer) {
    helpContainer.style.display = "block";
  }
  const balloonContainer = helpElement?.querySelector(".balloon-container");
  const balloonContainerCargoOthers = helpElement?.querySelector(
    ".balloon-container-cargo-others"
  );
  const balloonContainerWhite = helpElement?.querySelector(
    ".balloon-container-white"
  );
  const balloonContainerComparison = helpElement?.querySelector(
    ".balloon-container-comparison"
  );
  const balloonContainerWhiteOthers = helpElement?.querySelector(
    ".balloon-container-white-others"
  );
  var deliveryTypesDropdown;
  const helpRect = helpElement?.getBoundingClientRect();
  const balloonRect = balloonContainer?.getBoundingClientRect();
  let helpRectTop = 0;
  if (helpElement?.closest(".delivery-toggle")) {
    helpElement.closest(".delivery-toggle").style.zIndex = 2;
    helpElement.closest(
      ".delivery-toggle"
    ).nextElementSibling.nextElementSibling.nextElementSibling.style.zIndex = 0;
  } else if (helpElement?.closest(".delivery-types-list")) {
    // helpElement.closest('.delivery-types-list').style.zIndex = 2;
    // helpElement.closest('.delivery-types-list').previousElementSibling.previousElementSibling.previousElementSibling.style.zIndex = 0;
  }
  if (balloonRect) {
    if (helpRect.top < balloonRect.height) {
      helpRectTop = balloonRect.height - helpRect.top + 25;
    }
  }
  if (balloonContainer) {
    balloonContainer.style.zIndex = 10;
  }
  let leftMinus = [
    helpElement.closest(".desc") ? 276 : 200,
    helpElement.closest(".desc") ? 282 : 200,
  ];
  if (helpElement.closest(".desc")) {
    if (
      helpElement.closest("#delivery-types-dropdown-auto") ||
      helpElement.closest("#delivery-types-dropdown-auto-white")
    ) {
      leftMinus = [-10, -10];
    } else {
      leftMinus = [
        helpElement.closest(".desc") ? helpRect.width + 276 : 200,
        helpElement.closest(".desc") ? helpRect.width + 282 : 200,
      ];
    }
  }
  if (helpElement?.closest(".delivery-types")) {
    helpElement
      .closest(".delivery-types")
      .querySelectorAll(".desc")
      .forEach((desc) => {
        desc.style.zIndex = 0;
      });
    helpElement.closest(".desc").style.zIndex = 10;
  }

  if (balloonContainer) {
    balloonContainer.style.top = `${
      helpRect.top - (helpElement.closest(".desc") ? 268 : 208) + helpRectTop
    }px`;
    balloonContainer.style.left = `${
      helpRect.left + helpRect.width - leftMinus[0]
    }px`;
  }
  if (balloonContainerCargoOthers) {
    balloonContainer.style.top = `${helpRect.top - 309 + helpRectTop}px`;
    balloonContainer.style.left = `${
      helpRect.left + helpRect.width - leftMinus[0]
    }px`;
  }
  if (balloonContainerWhiteOthers) {
    balloonContainer.style.top = `${helpRect.top - 610 + helpRectTop}px`;
    balloonContainer.style.left = `${
      helpRect.left + helpRect.width - leftMinus[1]
    }px`;
  }
  if (balloonContainerWhite) {
    balloonContainer.style.top = `${helpRect.top - 528 + helpRectTop}px`;
    balloonContainer.style.left = `${
      helpRect.left + helpRect.width - leftMinus[0]
    }px`;

    deliveryTypesDropdown = balloonContainerWhite.closest(
      ".delivery-types-dropdown"
    );
    deliveryTypesDropdown.style.zIndex = "1";
  }

  if (balloonContainerComparison) {
    deliveryTypesDropdown = balloonContainerComparison.closest(
      ".delivery-types-dropdown"
    );
    deliveryTypesDropdown.style.zIndex = "1";
  }
} /* Start:"a:4:{s:4:"full";s:50:"/calc-layout/js/select_calc_type.js?17293427558869";s:6:"source";s:35:"/calc-layout/js/select_calc_type.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/

/* End */
let activeButton = null; // Для хранения активной кнопки
// Флаг, чтобы отслеживать, было ли уже выполнено клонирование
let isCloned = false;
let comparisonData = []; // Сохраняем ссылку на клонированные данные

let tnvedCodes = [];

let prices = [];

let weights = [];

let volumes = [];

function collectionTnvedData() {
  tnvedCodes = [];
  prices = [];
  weights = [];
  volumes = [];

  $("input[name='tnved_code[]']").each(function () {
    tnvedCodes.push($(this).val());
  });
  $("input[name='currency[]']").each(function () {
    prices.push($(this).val());
  });
  $("input[name='weight[]']").each(function () {
    weights.push($(this).val());
  });
  $("input[name='volume[]']").each(function () {
    volumes.push($(this).val());
  });
}

function toggleButton(button) {
  if (activeButton === button) {
    return;
  }
  if (activeButton) {
    activeButton.classList.remove("active");
    if (!generalGoodData?.oldButton) {
      Object.assign(generalGoodData, {
        oldButton: activeButton,
      });
    } else {
      generalGoodData.oldButton = activeButton;
    }
  } else {
    generalGoodData.oldButton = button;
  }
  button.classList.add("active");
  document.querySelector(".delivery-types").style.height = "120px";
  activeButton = button;
  const dimensionsButton = document.querySelector(
    ".main-calc-button.submit-dimensions-button"
  );
  const commonButton = document.querySelector(
    ".main-calc-button.submit-general-button"
  );
  const whiteButton = document.querySelector("#white-calc-button");
  const cargoWhiteButton = document.querySelector("#cargo-white-calc-button");
  if (button.dataset.type === "white") {
    document.querySelector(".white-page-img").classList.add("active");
    document.querySelector(".white-page-delivery-name").classList.add("active");
    document.querySelector(".white-page-help").classList.add("active");

    document.querySelector(".cargo-page-img").classList.remove("active");
    document
      .querySelector(".cargo-page-delivery-name")
      .classList.remove("active");
    document.querySelector(".cargo-page-help").classList.remove("active");
    commonButton.parentElement.classList.add("hidden");
    dimensionsButton.parentElement.classList.add("hidden");
    whiteButton.parentElement.classList.remove("hidden");
    cargoWhiteButton.parentElement.classList.add("hidden");
  }
  if (button.dataset.type === "cargo") {
    document.querySelector(".white-page-img").classList.remove("active");
    document
      .querySelector(".white-page-delivery-name")
      .classList.remove("active");
    document.querySelector(".white-page-help").classList.remove("active");

    document.querySelector(".cargo-page-img").classList.add("active");
    document.querySelector(".cargo-page-delivery-name").classList.add("active");
    document.querySelector(".cargo-page-help").classList.add("active");
    commonButton.parentElement.classList.add("hidden");
    dimensionsButton.parentElement.classList.remove("hidden");
    whiteButton.parentElement.classList.add("hidden");
    cargoWhiteButton.parentElement.classList.add("hidden");
  }
  if (button.dataset.type === "comparison") {
    commonButton.parentElement.classList.add("hidden");
    dimensionsButton.parentElement.classList.add("hidden");
    whiteButton.parentElement.classList.add("hidden");
    cargoWhiteButton.parentElement.classList.remove("hidden");
  }
  gatherGoodData(button);
}

// Найти все кнопки

function changeCalc() {
  getCalcType();
  return fetch(calcTypeUrl)
    .then((response) => response.text())
    .then((calcTypeInterface) => {
      collectionTnvedData();
      initializeGetRate();
      document.querySelector(".calc-container:not(.redeem-data)").innerHTML =
        calcTypeInterface;
      if (
        calcTypeUrl === "/calc-layout/ext_html/white_order_data.php" ||
        calcTypeUrl === "/calc-layout/ext_html/cargo_order_data.php" ||
        calcTypeUrl === "/calc-layout/ext_html/cargo_white_order_data.php"
      ) {
        let fetchPromise;
        if (
          calcTypeUrl === "/calc-layout/ext_html/cargo_white_order_data.php"
        ) {
          fetchPromise = fetch(
            "/calc-layout/ext_html/delivery_list_comparison.php"
          );
        } else {
          fetchPromise = fetch("/calc-layout/ext_html/delivery_list.php");
        }
        fetchPromise
          .then((response) => response.text())
          .then((deliveryList) => {
            document.querySelector("#delivery-types-dropdown-auto").innerHTML =
              deliveryList;
            document.querySelector(
              "#delivery-types-dropdown-fast-auto"
            ).innerHTML = deliveryList;
            document.querySelector(
              "#delivery-types-dropdown-railway"
            ).innerHTML = deliveryList;
            document.querySelector("#delivery-types-dropdown-avia").innerHTML =
              deliveryList;

            if (
              calcTypeUrl === "/calc-layout/ext_html/cargo_white_order_data.php"
            ) {
              addComparison();
              cloneAndAppend(".delivery-types");
            } else {
              removeComparison();
            }
            initializeDeliveryList();
            changeAvailableCountries();
            if (calcTypeUrl === "/calc-layout/ext_html/cargo_order_data.php") {
              initializeCheckbox();
              initializeAddGoods();
              initializeGeneralAjaxRequest();
              destroyTnvedTree();
              // hideComparisonData();
              initializeCalcVolume();
            }
            if (
              calcTypeUrl === "/calc-layout/ext_html/white_order_data.php" ||
              calcTypeUrl === "/calc-layout/ext_html/cargo_white_order_data.php"
            ) {
              initializeWhiteCalcSpace();
              initializeAddTnvedCode();
              initializeSuggestion();
              fillWhiteData($(".add"));
              if (
                calcTypeUrl ===
                "/calc-layout/ext_html/cargo_white_order_data.php"
              ) {
                initializeAjaxRequestCargoWhite();
              }
              if (
                calcTypeUrl === "/calc-layout/ext_html/white_order_data.php"
              ) {
                initializeGetRate();
                // hideComparisonData();
              }

              fetch("/calc-layout/ext_html/tnved_tree_handling.php")
                .then((response) => response.text())
                .then((tnvedTreeInterface) => {
                  document.querySelector(".tnved-tree-container").innerHTML =
                    tnvedTreeInterface;
                  initializePopupTnvedTree();
                  initializeTnvedTreeHandling();
                });
            }
            if (
              calcTypeUrl === "/calc-layout/ext_html/white_order_data.php" ||
              calcTypeUrl === "/calc-layout/ext_html/cargo_white_order_data.php"
            ) {
              initializeTnvedAjaxRequest();
              initializeReportWhiteData();
            }
            initializeHelp();
            initializeSelectDeliveryItem();
            sendGoodData(activeButton);
            activateCalculator();
          });
      }
    });
}

// Добавить обработчик события click к каждой кнопке

function addComparison() {
  document
    .querySelectorAll(".type-of-goods-dimensions.delivery-data")
    .forEach((deliveryTypesDropdown) => {
      deliveryTypesDropdown.classList.add(
        "type-of-goods-dimensions-comparison"
      );
      deliveryTypesDropdown
        .querySelector(".delivery-types-dropdown.delivery-data")
        .classList.add("delivery-types-dropdown-comparison");
    });
}

function removeComparison() {
  document
    .querySelectorAll(".type-of-goods-dimensions.delivery-data")
    .forEach((deliveryTypesDropdown) => {
      deliveryTypesDropdown.classList.remove(
        "type-of-goods-dimensions-comparison"
      );
      deliveryTypesDropdown
        .querySelector(".delivery-types-dropdown.delivery-data")
        .classList.remove("delivery-types-dropdown-comparison");
    });
  document.querySelector(".needed-space").classList.remove("active");
} /* Start:"a:4:{s:4:"full";s:49:"/calc-layout/js/white_calc_space.js?1721421857716";s:6:"source";s:35:"/calc-layout/js/white_calc_space.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
/* End */
function initializeWhiteCalcSpace() {
  const whileCalcContainer = document.querySelector(
    ".calc-container:not(.redeem-data)"
  );
  const boxingContainer = document.querySelector(".boxing-content-container");
  if (
    activeButton.dataset.type === "comparison" ||
    activeButton.dataset.type === "white"
  ) {
    whileCalcContainer.classList.add("comparison-calc-container");
    boxingContainer.classList.add("comparison-boxing-container");
    whileCalcContainer.style.height = "";
  } else {
    whileCalcContainer.classList.remove("comparison-calc-container");
    boxingContainer.classList.remove("comparison-boxing-container");
    whileCalcContainer.style.height = "200px";
  }
} /* Start:"a:4:{s:4:"full";s:48:"/calc-layout/js/add_tnved_code.js?17214218403474";s:6:"source";s:33:"/calc-layout/js/add_tnved_code.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
/* End */
function initializeAddTnvedCode() {
  let addButton = document.querySelector(".add-white-code");
  addButton.addEventListener("click", cloneContainer);
}

function fillWhiteData(addButton) {
  tnvedCodes.forEach((tnvedCode, index) => {
    $("input[name='tnved_code[]']")[index].value = tnvedCode;
    $("input[name='currency[]']")[index].value = prices[index];
    $("input[name='weight[]']")[index].value = weights[index];
    $("input[name='volume[]']")[index].value = volumes[index];
    if (index < tnvedCodes.length - 1) {
      addButton.click();
    }
  });
}

function cloneContainer() {
  const containers = document.querySelectorAll("[data-white-container]");
  const lastContainer = containers[containers.length - 1];
  const newContainer = lastContainer.cloneNode(true);

  // Найдите .select-by-name-input внутри newContainer
  const selectByNameInput = newContainer.querySelector(".select-by-name-input");
  if (newContainer.querySelector(".brand-help")) {
    newContainer
      .querySelector(".brand-help")
      .addEventListener("mouseenter", updateBalloonBrandPosition);
  }
  if (selectByNameInput) {
    addEventSuggestion(selectByNameInput);
  }
  // Генерируем уникальные id для полей ввода
  const inputs = newContainer.querySelectorAll("input");
  inputs.forEach((input, index) => {
    const idAttribute = input.getAttribute("id");
    if (idAttribute) {
      input.setAttribute("id", idAttribute + "_" + (containers.length + 1));
      input.value = ""; // Очищаем значения полей
    }
  });

  // Генерируем уникальный id для type-of-goods-dropdown
  const typeOfGoodsDropdown = newContainer.querySelector(
    ".arrival-input-label"
  );
  if (typeOfGoodsDropdown) {
    const forAttribute = typeOfGoodsDropdown.getAttribute("for");
    if (forAttribute) {
      typeOfGoodsDropdown.setAttribute(
        "for",
        forAttribute + "_" + (containers.length + 1)
      );
    }
  }

  document.body.appendChild(newContainer);

  const cloneEvent = new CustomEvent("clone", {
    detail: { clone: newContainer },
    bubbles: true,
    cancelable: true,
  });
  newContainer.dispatchEvent(cloneEvent);
  const container = document.querySelector(".calc-container:not(.redeem-data)");
  // Вставляем новый контейнер перед кнопкой add-container
  const addContainer = document.querySelector(".add-white-container");
  addContainer.parentNode.insertBefore(newContainer, addContainer);
  let calcTypeHeight = 0;
  if (activeButton.getAttribute("data-type") !== "comparison") {
    calcTypeHeight = 124;
    container.style.height =
      parseInt(container.style.height) + calcTypeHeight + "px";
  } else {
    calcTypeHeight = 184;
    container.style.height =
      parseInt(container.style.height) + calcTypeHeight + "px";
  }
  newContainer.style.marginTop = "20px";
  newContainer.style.zIndex = window.getComputedStyle(newContainer).zIndex - 1;
  const deleteButton = newContainer.querySelector(".close-cross");
  deleteButton.style.display = "block";

  if (deleteButton) {
    deleteButton.addEventListener("click", () => {
      newContainer.remove();
      container.style.height =
        parseInt(container.style.height) - calcTypeHeight + "px";
    });
  }
} /* Start:"a:4:{s:4:"full";s:44:"/calc-layout/js/suggestion.js?17293325428873";s:6:"source";s:29:"/calc-layout/js/suggestion.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
/* End */
let suggestionItems;

function initializeSuggestion() {
  let inputField = document.querySelector("#name-good-input");
  suggestionItems = document.querySelectorAll(".suggestion-item");
  addEventSuggestion(inputField);
}

function correctLineHeight() {
  let treeItems = document.querySelectorAll("li.tnved-tree-item");
  Array.from(treeItems).forEach(function (currentTreeItem, index, array) {
    if (index < array.length - 1) {
      let nextTreeItem = array[index + 1];
      let treeItemLine = currentTreeItem.querySelector(".tnved-tree-item-line");

      let currentTreeItemHeight = currentTreeItem.clientHeight;
      let nextTreeItemHeight = nextTreeItem.clientHeight;
      let lineHeight = (currentTreeItemHeight + nextTreeItemHeight) / 2 + 10;

      treeItemLine.style.height = lineHeight + "px";
      treeItemLine.style.top = currentTreeItemHeight / 2 + "px";
    }
  });
}

function addEventSuggestion(inputField) {
  // Находим соседний элемент .suggestion
  const suggestionContainer = inputField.nextElementSibling;
  let markers = inputField.previousElementSibling.querySelectorAll(".marker");
  let clock = inputField.previousElementSibling;
  // Клонируем .suggestion-item и вставляем в .suggestion
  const suggestionItemTemplate = suggestionItems[0].cloneNode(true); // Клонируем первый элемент
  document.querySelectorAll(".suggestion").forEach((suggest) => {
    suggest.innerHTML = "";
  });

  const tnvedTreePopup = document.querySelector(".tnved-tree-container");
  const overlay = document.querySelector(".overlay");
  let isCorrected = false;

  let debounceTimer;
  const debounceDelay = 2000;

  function toggleAnimation(isAnimationEnabled) {
    markers.forEach((marker) => {
      marker.style.animationPlayState = isAnimationEnabled
        ? "running"
        : "paused";
      marker.style.display = isAnimationEnabled ? "block" : "none";
    });

    clock.style.display = isAnimationEnabled ? "block" : "none";
  }

  inputField.addEventListener("input", function () {
    let inputText = this.value;

    if (inputText.length >= 3) {
      toggleAnimation(true);
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        // Очищаем предыдущие suggestion, если они есть
        suggestionContainer.innerHTMLhtml = "";
        document.querySelectorAll(".suggestion").forEach((suggest) => {
          suggest.innerHTML = "";
        });

        // Отправляем GET-запрос на указанный URL
        let apiUrl =
          "https://api-calc.wisetao.com:4343/api/get-matching-names?good_name=" +
          inputText;
        $.get(apiUrl, function (data) {
          $.each(data, function (index, item) {
            // Клонируем suggestion-item из шаблона
            let suggestionItem = suggestionItemTemplate.cloneNode(true);

            // Заполняем элементы внутри клонированного suggestion-item

            let suggestionCode =
              suggestionItem.querySelector(".suggestion-code");
            let suggestionName =
              suggestionItem.querySelector(".suggestion-name");
            suggestionCode.innerText = item.CODE;
            suggestionName.innerText = item.KR_NAIM + " " + item.probability;
            let suggestions = [suggestionCode, suggestionName];
            suggestions.forEach((suggestionButton) => {
              suggestionButton.addEventListener("click", function (e) {
                let input =
                  suggestionContainer.parentElement.parentElement.parentElement.querySelector(
                    ".tnved-input"
                  );

                let suggestionInput =
                  suggestionContainer.previousElementSibling;
                let event = new Event("input", {
                  bubbles: true, // Разрешить всплытие события (по умолчанию true)
                  cancelable: true, // Разрешить отмену события (по умолчанию true)
                });
                suggestionInput.value = "";
                suggestionInput.setAttribute("placeholder", item.KR_NAIM);
                // Вызовите событие input на элементе
                suggestionInput.dispatchEvent(event);

                if (input) {
                  input.value = suggestionCode.textContent;
                  input.dispatchEvent(event);
                }
              });
            });
            // Добавляем клонированный suggestion-item в контейнер
            suggestionContainer.appendChild(suggestionItem);
            suggestionContainer.insertAdjacentHTML(
              "beforeend",
              '<div class="suggestion-divider"></div>'
            );
          });
          // Добавляем событие клика на suggestion-link-container
          let suggestionLinkContainers = suggestionContainer.querySelectorAll(
            ".suggestion-link-container"
          );
          suggestionLinkContainers.forEach((suggestionLinkContainer) => {
            suggestionLinkContainer.addEventListener("click", function (e) {
              e.stopPropagation();
              const link = this; // В переменной link будет ссылка на элемент, на который был клик

              const suggestion = link.closest(".suggestion");

              // Добавляем класс "bindingTree" к текущему suggestion
              suggestion.classList.add("bindingTree");
              // Отображаем окно "Дерево ТН ВЭД"
              tnvedTreePopup.style.display = "block";
              overlay.style.display = "block";
              if (!isCorrected) {
                correctLineHeight();
                isCorrected = true; // Устанавливаем флаг в true после первого вызова
              }
            });
          });
          if (suggestionContainer.childElementCount === 0) {
            let suggestionItem = suggestionItemTemplate.cloneNode(true);
            suggestionItem.removeChild(suggestionItem.lastChild);
            suggestionItem.removeChild(suggestionItem.lastChild);
            suggestionItem.removeChild(suggestionItem.lastChild);
            suggestionItem.removeChild(suggestionItem.lastChild);
            suggestionItem.removeChild(suggestionItem.lastChild);
            suggestionItem.removeChild(suggestionItem.firstChild);
            suggestionItem.firstChild.removeChild(
              suggestionItem.firstChild.firstChild
            );
            suggestionItem.firstChild.removeChild(
              suggestionItem.firstChild.firstChild
            );
            suggestionItem.firstChild.removeChild(
              suggestionItem.firstChild.firstChild
            );
            suggestionItem.firstChild.removeChild(
              suggestionItem.firstChild.lastChild
            );
            suggestionItem.firstChild.innerText = "Ничего не найдено";
            suggestionContainer.appendChild(suggestionItem);
          }
          // Показываем suggestion
          suggestionContainer.style.display = "block";
          inputField.classList.add("straight-bottom");
          // Выключаем анимацию и скрываем элементы с анимацией
          toggleAnimation(false);
        }).catch(function (error) {
          console.error("Ошибка при выполнении запроса: ", error);
        });
      }, debounceDelay);
    } else {
      // Скрываем suggestion
      // Выключаем анимацию и скрываем элементы с анимацией
      toggleAnimation(false);
      suggestionContainer.style.display = "none";
      inputField.classList.remove("straight-bottom");
    }
  });
} /* Start:"a:4:{s:4:"full";s:54:"/calc-layout/js/tnved-tree-handling.js?172599027815582";s:6:"source";s:38:"/calc-layout/js/tnved-tree-handling.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
/* End */
// Получаем все элементы с классом "tnved-toggle-icon"
function initializeTnvedTreeHandling() {
  // Очищаем контейнер tnvedTreeList и удаляем имеющиеся элементы
  var tnvedTreeList = $(".tnved-tree-list");
  tnvedTreeList.empty();
  // Отправляем GET-запрос на получение элементов дерева
  $.get(
    "https://api-calc.wisetao.com:4343/api/get-tree-elems",
    { parentNode: "" },
    function (data) {
      // Очищаем контейнер tnvedTreeList и удаляем имеющиеся элементы
      var $data = $(data);

      // Находим все элементы списка и извлекаем текст
      $data.find("li").each(function () {
        var itemText = $(this).text().trim();
        var dataId = $(this).attr("data-id");
        var treeItem = $(
          '<li class="tnved-tree-item" data-id="' +
            dataId +
            '">' +
            '<div class="tnved-tree-item-line"></div>' +
            '<div class="tnved-toggle-icon"></div>' +
            '<span class="tnved-item-text">' +
            itemText +
            "</span>" +
            "</li>"
        );
        tnvedTreeList.append(treeItem);
      });
      handleItemHeight();

      var toggleIcons = document.querySelectorAll(".tnved-toggle-icon");
      var subTree;
      // Перебираем полученные элементы и добавляем обработчик события клика
      toggleIcons.forEach(function (icon) {
        icon.addEventListener("click", function () {
          // Находим ближайший родительский элемент .tnved-tree-item
          var parentItem = icon.closest(".tnved-tree-item");
          ajaxGetSubTree(parentItem, icon).catch(() => {});

          // Находим элемент .tnved-sub-tree внутри родительского элемента
        });
      });
    }
  );
  function ajaxLoadSubTreeAndHandle(parentItem) {
    return new Promise((resolve, reject) => {
      if (!parentItem.querySelector(".tnved-sub-tree")) {
        subTree = document.createElement("ul");
        subTree.classList.add("tnved-sub-tree");
        subTree.classList.add("check");
        parentItem.appendChild(subTree);
        var dataId = parentItem.dataset.id;
        $.get("https://api-calc.wisetao.com:4343/api/get-tree-elems", {
          parentNode: dataId,
        })
          .done(function (data) {
            var $data = $(data);
            $data.find("li").each(function () {
              var itemText = $(this)
                .contents()
                .filter(function () {
                  return this.nodeType === 3;
                })
                .text()
                .trim();
              dataId = $(this).attr("data-id");
              var treeItem = $(
                '<li class="tnved-tree-item" data-id="' +
                  dataId +
                  '">' +
                  '<div class="tnved-tree-item-line"></div>' +
                  '<div class="tnved-toggle-icon"></div>' +
                  '<span class="tnved-code">' +
                  $(this).find(".tnved-tree__node-code").text().trim() +
                  "</span>" +
                  '<span class="tnved-item-text">' +
                  itemText +
                  "</span>" +
                  "</li>"
              );
              // Добавляем элементы в новое поддерево
              subTree.appendChild(treeItem[0]);
            });
            var listItem = $(
              '<li class="tnved-tree-item" style="height: 0;"></li>'
            );
            subTree.appendChild(listItem[0]);
            handleItemHeight();
            resolve(subTree);
          })
          .catch(function (error) {
            reject(error);
          });
      } else {
        subTree = parentItem.querySelector(".tnved-sub-tree");
        resolve(subTree);
      }
    });
  }

  var commonParent = document.querySelector(".tnved-tree-list");

  commonParent.addEventListener("click", function (event) {
    var target = event.target;

    if (target.classList.contains("tnved-toggle-icon")) {
      var parentItem = target.closest(".tnved-tree-item");

      // Проверьте, есть ли внутри parentItem элемент с классом 'tnved-code'
      if (parentItem) {
        var hasTnvedCode = Array.from(parentItem.childNodes).find(function (
          node
        ) {
          return node.classList && node.classList.contains("tnved-code");
        });

        if (hasTnvedCode && hasTnvedCode.textContent.length < 13) {
          ajaxGetSubTree(parentItem, target).catch(() => {});
        }
      }
    }
  });

  function startLoadingAnimation(icon) {
    // Добавить класс, который отображает анимацию загрузки
    icon.style.animation = "spin 1s infinite linear";
  }

  function stopLoadingAnimation(icon) {
    // Удалить класс, который отображает анимацию загрузки
    icon.style.animation = "";
  }

  async function ajaxGetSubTree(parentItem, icon) {
    startLoadingAnimation(icon); // Начать анимацию загрузки

    try {
      var subTree = await ajaxLoadSubTreeAndHandle(parentItem);
      stopLoadingAnimation(icon); // Завершить анимацию загрузки

      if (subTree) {
        addClickEvents(subTree, icon, parentItem);
      }
    } catch (error) {
      stopLoadingAnimation(icon); // Завершить анимацию загрузки в случае ошибки
      // Обработка ошибки, если необходимо
    }
  }

  function addClickEvents(subTree, icon, parentItem) {
    subTree.classList.toggle("open"); // Переключаем класс "open" для управления видимостью
    icon.classList.toggle("expanded"); // Переключаем класс "expanded" для управления внешним видом плюсика
    var subTreeHeight = subTree.clientHeight;
    // Находим следующий элемент после родительского и смещаем его
    var siblingItems = parentItem.nextElementSibling;
    if (siblingItems && siblingItems.classList.contains("tnved-tree-item")) {
      currentMarginTop = parseInt(siblingItems.style.marginTop, 10) || 0;
      siblingItems.style.marginTop = subTree.classList.contains("open")
        ? subTreeHeight + "px"
        : "0";
      parentItem.classList.toggle("open");
      changeHeightLine(parentItem, subTreeHeight);
    }

    // Переходим в уровень выше и смещаем первый соседний элемент
    parentItem = customClosest(parentItem, ".tnved-tree-item");
    var subTreeParent;
    while (parentItem !== null) {
      var firstSibling = parentItem.nextElementSibling;
      currentMarginTop = parseInt(firstSibling.style.marginTop, 10) || 0;
      if (firstSibling && firstSibling.classList.contains("tnved-tree-item")) {
        subTreeParent = parentItem.querySelector(".tnved-sub-tree");
        subTreeHeight = subTreeParent.clientHeight;
        firstSibling.style.marginTop = subTreeParent.classList.contains("open")
          ? subTreeHeight + "px"
          : "0";
        changeHeightLine(parentItem, subTreeHeight);
      }
      parentItem = customClosest(parentItem, ".tnved-tree-item");
    }
    hideLines();
    correctLineHeight(subTree);
    var parentTreeItem = subTree.closest(".tnved-tree-item");
    if (parentTreeItem) {
      var parentTreeItemHeight = parentTreeItem.clientHeight;
      subTree.style.marginTop = parentTreeItemHeight + 10 + "px";
    }
    toggleMinus(subTree);
  }

  let lineHeight = 34;

  function changeHeightLine(parentItem, addHeight) {
    var newHeight = lineHeight + addHeight;
    parentItem.firstElementChild.style.height = newHeight + "px";
  }

  function customClosest(element, selector) {
    let current = element.parentElement;

    while (current) {
      if (current.matches(selector)) {
        return current;
      }
      current = current.parentElement;
    }

    return null;
  }

  function handleItemHeight() {
    var allItems = $(".tnved-tree-item");

    allItems.each(function () {
      var item = $(this);
      var text = item.find(".tnved-item-text");
      var textHeight = text.outerHeight();
      var lineHeight = parseInt(item.css("line-height"));

      if (textHeight > lineHeight) {
        var additionalHeight = textHeight - lineHeight;
        changeHeightLine(item, additionalHeight);
      }
    });
  }

  function hideLines() {
    // Получаем все ul элементы внутри контейнера tnved-tree-list
    var tnvedTreeList = document.querySelector(".tnved-tree-list");

    if (tnvedTreeList) {
      var ulElements = tnvedTreeList.querySelectorAll("ul");

      // Проходимся по каждому ul элементу
      ulElements.forEach(function (ul) {
        // Получаем все дочерние узлы текущего ul
        var childNodes = ul.childNodes;

        // Фильтруем только li элементы из дочерних узлов
        var liElements = Array.from(childNodes).filter(function (node) {
          return node.nodeName === "LI";
        });

        // Проверяем, что у текущего ul есть как минимум два li элемента
        if (liElements.length >= 2) {
          // Находим предпоследний li элемент
          var penultimateLi = liElements[liElements.length - 2];

          // Находим вложенный tnved-tree-item-line элемент и делаем его невидимым
          var tnvedTreeItemLine = penultimateLi.querySelector(
            ".tnved-tree-item-line"
          );

          if (tnvedTreeItemLine) {
            tnvedTreeItemLine.style.display = "none";
          }
        }
      });
    }
  }

  function toggleMinus(subTree) {
    // Получаем все ul.tnved-sub-tree
    const tnvedTreePopup = document.querySelector(".tnved-tree-container");
    const overlay = document.querySelector(".overlay");
    var treeItems = Array.from(subTree.childNodes).filter(function (child) {
      return (
        child.nodeName === "LI" && child.classList.contains("tnved-tree-item")
      );
    });
    // Если внутри ul.tnved-sub-tree ровно два элемента li, добавляем класс expanded к первому элементу
    Array.from(treeItems).forEach(function (currentTreeItem) {
      var tnvedCodeNode = Array.from(currentTreeItem.childNodes).find(function (
        child
      ) {
        return child.classList && child.classList.contains("tnved-code");
      });

      var tnvedNameNode = Array.from(currentTreeItem.childNodes).find(function (
        child
      ) {
        return child.classList && child.classList.contains("tnved-item-text");
      });

      var tnvedToggleIconNode = Array.from(currentTreeItem.childNodes).find(
        function (child) {
          return (
            child.classList && child.classList.contains("tnved-toggle-icon")
          );
        }
      );

      if (
        tnvedCodeNode &&
        tnvedCodeNode.textContent.length === 13 &&
        tnvedToggleIconNode
      ) {
        tnvedToggleIconNode.classList.add("expanded");
        tnvedCodeNode.style.cursor = "pointer";
        tnvedCodeNode.addEventListener("click", function () {
          var suggestion = document.querySelector(".suggestion.bindingTree");
          // Если suggestion найден, найдите внутри него input с классом '.tnved-input'
          if (suggestion) {
            var input =
              suggestion.parentElement.parentElement.children[1].querySelector(
                ".tnved-input"
              );

            // Если input найден, добавьте код в input

            // Удалите класс "bindingTree" у связанного suggestion
            suggestion.classList.remove("bindingTree");
            tnvedTreePopup.style.display = "none";
            overlay.style.display = "none";
            var suggestionInput = suggestion.previousElementSibling;
            var event = new Event("input", {
              bubbles: true, // Разрешить всплытие события (по умолчанию true)
              cancelable: true, // Разрешить отмену события (по умолчанию true)
            });
            suggestionInput.value = "";
            suggestionInput.setAttribute(
              "placeholder",
              tnvedNameNode.textContent
            );
            // Вызовите событие input на элементе
            suggestionInput.dispatchEvent(event);

            if (input) {
              input.value = tnvedCodeNode.textContent;
              input.dispatchEvent(event);
            }
          }
          // Вставить код в input и удалить класс bindingTree у связанного suggestion
          // Здесь можно разместить код из предыдущего сообщения
        });
      }
    });
  }

  function correctLineHeight(subTree) {
    if (!subTree.classList.contains("corrected")) {
      subTree.classList.add("corrected");
      var treeItems = Array.from(subTree.childNodes).filter(function (child) {
        return (
          child.nodeName === "LI" && child.classList.contains("tnved-tree-item")
        );
      });
      Array.from(treeItems).forEach(function (currentTreeItem, index, array) {
        if (index < array.length - 1) {
          var nextTreeItem = array[index + 1];
          var treeItemLine = currentTreeItem.querySelector(
            ".tnved-tree-item-line"
          );

          var currentTreeItemHeight = currentTreeItem.clientHeight;
          var nextTreeItemHeight = nextTreeItem.clientHeight;
          var lineHeight =
            (currentTreeItemHeight + nextTreeItemHeight) / 2 + 10;

          treeItemLine.style.height = lineHeight + "px";
          treeItemLine.style.top = currentTreeItemHeight / 2 + "px";
        }
      });
    }
  }
}

function destroyTnvedTree() {
  document.querySelector(".tnved-tree-container").innerHTML = "";
} /* Start:"a:4:{s:4:"full";s:50:"/calc-layout/js/popup_tnved_tree.js?17214218512606";s:6:"source";s:35:"/calc-layout/js/popup_tnved_tree.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
/* End */
function initializePopupTnvedTree() {
  const suggestionLinks = document.querySelectorAll(
    ".suggestion-link-container"
  );
  const tnvedTreeCloseButton = document.querySelector(
    ".tnved-tree-close-button"
  );

  // Окно "Дерево ТН ВЭД"
  const tnvedTreePopup = document.querySelector(".tnved-tree-container");
  const overlay = document.querySelector(".overlay");
  // Обработчик клика по ссылке
  // Обработчик клика для каждой ссылки
  suggestionLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.stopPropagation();
      const suggestion = link.closest(".suggestion");

      // Добавляем класс "bindingTree" к текущему suggestion
      suggestion.classList.add("bindingTree");
      // Отображаем окно "Дерево ТН ВЭД"
      tnvedTreePopup.style.display = "block";
      overlay.style.display = "block";
      correctLineHeight();
      // Добавляем класс "open" для затемнения фона
      // document.body.classList.add("open");
    });
  });

  tnvedTreeCloseButton.addEventListener("click", () => {
    tnvedTreePopup.style.display = "none";
    overlay.style.display = "none";
  });

  // Обработчик клика вне окна "Дерево ТН ВЭД" для закрытия
  document.addEventListener("click", (e) => {
    if (e.target !== tnvedTreePopup && !tnvedTreePopup.contains(e.target)) {
      // Скрываем окно "Дерево ТН ВЭД"
      tnvedTreePopup.style.display = "none";
      overlay.style.display = "none";
      // Убираем класс "open" для убирания затемнения фона
      // document.body.classList.remove("open");
    }
  });
} /* Start:"a:4:{s:4:"full";s:55:"/calc-layout/js/ajax_request_general.js?172813762791320";s:6:"source";s:39:"/calc-layout/js/ajax_request_general.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
// function correctLineHeight() {
//     var treeItems = document.querySelectorAll('li.tnved-tree-item');
//     Array.from(treeItems).forEach(function(currentTreeItem, index, array) {
//         if (index < array.length - 1) {
//             var nextTreeItem = array[index + 1];
//             var treeItemLine = currentTreeItem.querySelector('.tnved-tree-item-line');
//
//             var currentTreeItemHeight = currentTreeItem.clientHeight;
//             var nextTreeItemHeight = nextTreeItem.clientHeight;
//             var lineHeight = (currentTreeItemHeight + nextTreeItemHeight) / 2;
//
//             treeItemLine.style.height = lineHeight + 'px';
//         }
//     });
// }
/* End */
let count = 0;
function initializeGeneralAjaxRequest() {
  // Функция для отправки POST-запроса
  let $arrival = $("input[name='arrival']");
  let maxDimension;
  let dimensions = $("#checkbox_input_type");
  let cargoCalcButton = $("#cargo-calc-button");
  let cargoDimensionsCalcButton = $("#cargo-calc-dimensions-button");
  let $lengthInput = $(".dimensions-input-group .length");
  let $widthInput = $(".dimensions-input-group .width");
  let $heightInput = $(".dimensions-input-group .height");
  let $currencyInput = $(".currency_for_dimensions");
  let $weightInput = $(".weight:not(.logistic-check__item_text)");
  let $quantityInput = $(".quantity");
  let $insurance = $("input[name='insurance']");
  let $typeOfGoodsDropdown = $(".type-of-goods-dropdown-toggle.dimensions");
  let $brand = $(".brand-checkbox");
  let $brandGood = $("input[name='brand-good']");
  let $dimBrand = $("input[name='dim-brand']");
  $lengthInput.addClass("collected");
  $widthInput.addClass("collected");
  $heightInput.addClass("collected");
  $currencyInput.addClass("collected");
  $weightInput.addClass("collected");
  $quantityInput.addClass("collected");
  $typeOfGoodsDropdown.addClass("collected");
  $brand.addClass("collected");
  let dollar, yuan;
  let pendingRequest = null;
  let semicolonHelp = '<span style="color: black">; </span>';
  let semicolonHelpTspan = '<tspan fill="black">; </tspan>';

  let arrivalCity = {
    Россия: "Москва (ТК «Южные ворота»)",
    Кыргызстан: "Бишкек",
    Казахстан: "Алматы",
  };

  function trackAndSendAjaxRequests() {
    if (activeButton.dataset.type === "cargo") {
      dataChanged = true; // Устанавливаем флаг изменений в true
      if (!pendingRequest) {
        pendingRequest = sendMultipleAjaxRequests();
        pendingRequest.then(function () {
          pendingRequest = null;
        });
      }
    }
  }

  function trackAndSendDimensionsAjaxRequests() {
    if (activeButton.dataset.type === "cargo") {
      dataChanged = true; // Устанавливаем флаг изменений в true
      if (!pendingRequest) {
        pendingRequest = sendMultipleDimensionsAjaxRequests();
        pendingRequest.then(function () {
          pendingRequest = null;
        });
      }
    }
  }

  const mutationObserver = new MutationObserver(function (mutationsList) {
    // Обработка изменений и добавление класса .collected
    mutationsList.forEach(function (mutation) {
      if (
        mutation.type === "childList" &&
        !mutation.target.classList.contains("suggestion")
      ) {
        const containers = $("[data-container]");
        const lastContainer = containers.last();
        const addedElements = lastContainer.find(":not(.collected)");
        addedElements.each(function () {
          const element = $(this);
          if (
            element.is(".dimensions-input-group .length") &&
            !element.hasClass("collected")
          ) {
            element.addClass("collected");
            $lengthInput = $lengthInput.add(element);
          }

          if (
            element.is(".dimensions-input-group .width") &&
            !element.hasClass("collected")
          ) {
            element.addClass("collected");
            $widthInput = $widthInput.add(element);
          }

          if (
            element.is(".dimensions-input-group .height") &&
            !element.hasClass("collected")
          ) {
            element.addClass("collected");
            $heightInput = $heightInput.add(element);
          }

          if (
            element.is(".currency_for_dimensions") &&
            !element.hasClass("collected")
          ) {
            element.addClass("collected");
            $currencyInput = $currencyInput.add(element);
          }

          if (element.is(".weight") && !element.hasClass("collected")) {
            element.addClass("collected");
            $weightInput = $weightInput.add(element);
          }

          if (element.is(".quantity") && !element.hasClass("collected")) {
            element.addClass("collected");
            $quantityInput = $quantityInput.add(element);
          }

          if (
            element.is(".type-of-goods-dropdown-toggle.dimensions") &&
            !element.hasClass("collected")
          ) {
            element.addClass("collected");
            $typeOfGoodsDropdown = $typeOfGoodsDropdown.add(element);
          }

          if (element.is(".brand-checkbox") && !element.hasClass("collected")) {
            $brand = $brand.add(element);
            element.addClass("collected");
          }
        });
        $lengthInput = $lengthInput.filter(function () {
          // Условие: оставить элементы только если они не имеют класс 'deleted'
          return !$(this).hasClass("deleted-input");
        });
        $widthInput = $widthInput.filter(function () {
          // Условие: оставить элементы только если они не имеют класс 'deleted'
          return !$(this).hasClass("deleted-input");
        });
        $heightInput = $heightInput.filter(function () {
          // Условие: оставить элементы только если они не имеют класс 'deleted'
          return !$(this).hasClass("deleted-input");
        });
        $currencyInput = $currencyInput.filter(function () {
          // Условие: оставить элементы только если они не имеют класс 'deleted'
          return !$(this).hasClass("deleted-input");
        });
        $weightInput = $weightInput.filter(function () {
          // Условие: оставить элементы только если они не имеют класс 'deleted'
          return !$(this).hasClass("deleted-input");
        });
        $quantityInput = $quantityInput.filter(function () {
          // Условие: оставить элементы только если они не имеют класс 'deleted'
          return !$(this).hasClass("deleted-input");
        });
      }
    });
  });

  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  document.addEventListener("clone", function (event) {
    // Уберите класс .collected с новых элементов
    const newElements = event.target.querySelectorAll(".collected");
    newElements.forEach(function (element) {
      element.classList.remove("collected");
    });
  });

  function checkInputs() {
    let isAllFilled = true;
    if (
      $lengthInput.length &&
      $arrival.length &&
      $widthInput.length &&
      $heightInput.length &&
      $currencyInput.length &&
      $weightInput.length &&
      $quantityInput.length &&
      $typeOfGoodsDropdown.length
    ) {
      $lengthInput
        .add($arrival)
        .add($widthInput)
        .add($heightInput)
        .add($currencyInput)
        .add($weightInput)
        .add($quantityInput)
        .each(function () {
          if ($(this).val() === "") {
            isAllFilled = false;
            return false; // Выход из цикла, если нашли пустой элемент
          }
        });
      $typeOfGoodsDropdown.each(function () {
        if ($(this).text() === "") {
          isAllFilled = false;
          return false; // Выход из цикла, если нашли пустой элемент
        }
      });
    }
    return isAllFilled;
  }

  let dataChanged = false; // Флаг для отслеживания изменений

  async function sendMultipleAjaxRequests() {
    const submitButton = document.querySelector(".submit-general-button");
    submitButton.disabled = true;
    const boxingExpandButton = document.querySelector(".boxing-spoiler-header");
    boxingExpandButton.style.pointerEvents = "none";
    boxingExpandButton.parentElement.style.background = "grey";
    const calcTypeButtons = document.querySelectorAll(
      ".calc-type-button:not(.tnved-calc-button.submit-redeem-data.submit-excel-file):not(.submit-general-button):not(.submit-dimensions-button):not(.tnved-calc-button.submit-redeem-data.blank-excel-file)"
    );
    calcTypeButtons.forEach((calcTypeButton) => {
      calcTypeButton.setAttribute("disabled", "");
    });
    disableBoxingButtons();
    $(".list-elem").removeClass("enable-pointer");
    $(".list-elem.selected").removeClass("selected");
    document.querySelector(".main-offer-button").setAttribute("disabled", "");
    try {
      const cargoResponse = await sendCargoGeneralAjaxRequest();
      if (!cargoResponse) {
        // Если cargoResponse не был получен, выходите из функции
        submitButton.disabled = false;
        boxingExpandButton.style.pointerEvents = "all";
        boxingExpandButton.parentElement.style.background = "#141a24";
        calcTypeButtons.forEach((calcTypeButton) => {
          calcTypeButton.removeAttribute("disabled");
        });
        enableBoxingButtons();
        return;
      }
      // Отправляем остальные запросы, передавая cargoResponse
      await Promise.all([
        sendDLAjaxRequest(cargoResponse),
        sendPEKAjaxRequest(cargoResponse),
        sendJDEAjaxRequest(cargoResponse),
        sendKITAjaxRequest(cargoResponse),
      ]);
      // Если были изменения, выполнить запросы заново
      if (dataChanged) {
        await sendMultipleAjaxRequests();
      }
    } catch (error) {
      console.log("Ошибка при отправке запроса:", error);
    } finally {
      submitButton.disabled = false;
      boxingExpandButton.style.pointerEvents = "all";
      boxingExpandButton.parentElement.style.background = "#141a24";
      calcTypeButtons.forEach((calcTypeButton) => {
        calcTypeButton.removeAttribute("disabled");
      });
      enableBoxingButtons();
    }
  }

  async function sendMultipleDimensionsAjaxRequests() {
    const submitButton = document.querySelector(".submit-dimensions-button");
    submitButton.disabled = true;
    const boxingExpandButton = document.querySelector(".boxing-spoiler-header");
    boxingExpandButton.style.pointerEvents = "none";
    boxingExpandButton.parentElement.style.background = "grey";
    const calcTypeButtons = document.querySelectorAll(
      ".calc-type-button:not(.tnved-calc-button.submit-redeem-data.submit-excel-file):not(.submit-general-button):not(.submit-dimensions-button)"
    );
    calcTypeButtons.forEach((calcTypeButton) => {
      calcTypeButton.setAttribute("disabled", "");
    });
    $(".list-elem").removeClass("enable-pointer");
    $(".list-elem.selected").removeClass("selected");
    disableBoxingButtons();
    document.querySelector(".main-offer-button").setAttribute("disabled", "");
    try {
      const cargoResponse = await sendCargoDimensionsAjaxRequest();
      if (!cargoResponse) {
        // Если cargoResponse не был получен, выходите из функции
        submitButton.disabled = false;
        boxingExpandButton.style.pointerEvents = "all";
        boxingExpandButton.parentElement.style.background = "#141a24";
        calcTypeButtons.forEach((calcTypeButton) => {
          calcTypeButton.removeAttribute("disabled");
        });
        enableBoxingButtons();
        return;
      }

      // Отправляем остальные запросы, передавая cargoResponse
      await Promise.all([
        sendDLAjaxRequest(cargoResponse),
        sendPEKAjaxRequest(cargoResponse),
        sendJDEAjaxRequest(cargoResponse),
        sendKITAjaxRequest(cargoResponse),
      ]);

      // Если были изменения, выполнить запросы заново
      if (dataChanged) {
        await sendMultipleDimensionsAjaxRequests();
      }
    } catch (error) {
      console.log("Ошибка при отправке запроса:", error);
    } finally {
      submitButton.disabled = false;
      boxingExpandButton.style.pointerEvents = "all";
      boxingExpandButton.parentElement.style.background = "#141a24";
      calcTypeButtons.forEach((calcTypeButton) => {
        calcTypeButton.removeAttribute("disabled");
      });
      enableBoxingButtons();
    }
  }

  function ajaxOfferDataRequest(deliveryType, deliveryTypeRus, tkType) {
    if (offerData) {
      let tkData;
      if (
        tkType === "“Южные ворота” Москва" ||
        arrivalCity[countryGlobal] === $arrival.val()
      ) {
        tkData = false;
      }
      if (tkType === "ИТОГ (КАРГО + ЖДЭ)") {
        tkData = offerDataJDE;
      }
      if (tkType === "ИТОГ (КАРГО + ПЭК)") {
        tkData = offerDataPEK;
      }
      if (tkType === "ИТОГ (КАРГО + ДЛ)") {
        tkData = offerDataDL;
      }
      if (tkType === "ИТОГ (КАРГО + КИТ)") {
        tkData = offerDataKIT;
      }
      let offerDataRequest = {
        DeliveryType:
          "Тип доставки: " +
          deliveryTypeRus +
          " (до г. " +
          (tkData ? $arrival.val() : arrivalCity[countryGlobal].split(" ")[0]) +
          ")",
        ExchangeRateYuan: "Курс юаня SAIDE: " + offerData.yuan + "₽",
        ExchangeRateDollar: "Курс доллара SAIDE: " + offerData.dollar + "₽",
        TOTAL:
          "Стоимость до г. " +
          arrivalCity[countryGlobal] +
          " : " +
          offerData.sum_cost_price[deliveryType] +
          "$; " +
          offerData.sum_cost_price_rub[deliveryType] +
          "₽",
        TOTALTK: tkData
          ? "Стоимость до г. " +
            $arrival.val() +
            " (Терм. ТК " +
            tkType.split("ИТОГ (КАРГО + ")[1].replace(")", "") +
            "): " +
            (
              offerData.sum_cost_price[deliveryType] +
              tkData.sum_cost_price[deliveryType]
            ).toFixed(2) +
            "$; " +
            (
              offerData.sum_cost_price_rub[deliveryType] +
              tkData.sum_cost_price_rub[deliveryType]
            ).toFixed(2) +
            "₽"
          : "",
        GoodsCost: "Стоимость товара: " + offerData.total_cost + "₽",
        Weight: "Вес: " + offerData.total_weight + "кг",
        Volume:
          "Объем: " +
          parseFloat(offerData.total_volume.toFixed(3)) +
          "м" +
          String.fromCharCode(0x00b3),
        Count: "Количество: " + count,
        RedeemCommissionFirst: "Комиссия SAIDE 5%",
        RedeemCommission:
          "от стоимости товара: " +
          (
            (offerData.commission_price * offerData.yuan) /
            offerData.dollar
          ).toFixed(2) +
          "$; " +
          (offerData.commission_price * offerData.yuan).toFixed(2) +
          "₽",
        PackageType: "Упаковка: " + offerData.type_of_packaging,
        PackageCost: "За упаковку: " + offerData.packaging_price_pub + "₽",
        Insurance:
          "Страховка: " +
          offerData.insurance.toFixed(2) +
          "$; " +
          (offerData.insurance * offerData.dollar).toFixed(2) +
          "₽",
        Kg:
          "За кг: " +
          offerData.cost_price[deliveryType] +
          "$; " +
          offerData.cost_price_rub[deliveryType] +
          "₽" +
          "(до г. " +
          arrivalCity[countryGlobal].split(" ")[0] +
          ")",
        Sum:
          "Стоимость до г. " +
          arrivalCity[countryGlobal].split(" ")[0] +
          " " +
          offerData.sum_cost_price[deliveryType] +
          "$; " +
          offerData.sum_cost_price_rub[deliveryType] +
          "₽",
        tkType: tkType,
        tkData: tkData
          ? {
              kgTk:
                "За кг: " +
                tkData.cost_price[deliveryType] +
                "$; " +
                tkData.cost_price_rub[deliveryType] +
                "₽ " +
                "(г. " +
                arrivalCity[countryGlobal].split(" ")[0] +
                " - г. " +
                $arrival.val() +
                ")",
              sumTk:
                "Стоимость: " +
                tkData.sum_cost_price[deliveryType].toFixed(2) +
                "$; " +
                tkData.sum_cost_price_rub[deliveryType].toFixed(2) +
                "₽ " +
                "(г. " +
                arrivalCity[countryGlobal].split(" ")[0] +
                " - г. " +
                $arrival.val() +
                ")",
              kgTotal:
                "За кг до г. " +
                $arrival.val() +
                " (Терм. ТК " +
                tkType.split("ИТОГ (КАРГО + ")[1].replace(")", "") +
                " ): " +
                (
                  offerData.cost_price[deliveryType] +
                  tkData.cost_price[deliveryType]
                ).toFixed(2) +
                "$; " +
                (
                  offerData.cost_price_rub[deliveryType] +
                  tkData.cost_price_rub[deliveryType]
                ).toFixed(2) +
                "₽",
              sumTotal:
                "Общая стоимость до г. " +
                $arrival.val() +
                " (Терм. ТК " +
                tkType.split("ИТОГ (КАРГО + ")[1].replace(")", "") +
                " ): " +
                (
                  offerData.sum_cost_price[deliveryType] +
                  tkData.sum_cost_price[deliveryType]
                ).toFixed(2) +
                "$; " +
                (
                  offerData.sum_cost_price_rub[deliveryType] +
                  tkData.sum_cost_price_rub[deliveryType]
                ).toFixed(2) +
                "₽",
              varyKg: " (стоимость может варьир.)",
              varySum: " (стоимость может варьир.)",
            }
          : "",
      };

      showModal("Идёт передача данных диспетчеру, пожалуйста, подождите... ");
      let countdown = 20; // Максимальное время ожидания в секундах
      countdownTimer = setInterval(function () {
        updateModalMessage(
          "Идёт передача данных диспетчеру, пожалуйста, подождите... " +
            countdown +
            " сек."
        );
        countdown--;
        if (countdown < 0) {
          clearInterval(countdownTimer);
        }
      }, 1000);

      $.ajax({
        type: "POST",
        url: "https://api-calc.wisetao.com:4343/api/get-offer",
        data: offerDataRequest,
        xhrFields: {
          responseType: "blob", // Устанавливаем ожидание бинарных данных
        },
        success: function (response) {
          // Создаем объект URL из ответа
          let url = URL.createObjectURL(response);

          // Создаем временную ссылку для открытия в новой вкладке
          let aOpen = document.createElement("a");
          aOpen.href = url;
          aOpen.target = "_blank";

          // Симулируем клик по ссылке для открытия в новой вкладке
          document.body.appendChild(aOpen);
          aOpen.click();
          document.body.removeChild(aOpen);

          // Создаем временную ссылку для скачивания файла
          let aDownload = document.createElement("a");
          aDownload.href = url;
          aDownload.download = "Коммерческое предложение.pdf";

          // Симулируем клик по ссылке для скачивания файла
          document.body.appendChild(aDownload);
          aDownload.click();
          document.body.removeChild(aDownload);

          // Освобождаем ресурсы URL
          URL.revokeObjectURL(url);

          submitRedeemData(response);

          console.log("Успешно отправлено!");
          console.log("Ответ сервера:", response);
        },
        error: function (error) {
          clearInterval(countdownTimer);
          hideModal();
        },
      });
    }
  }

  async function sendCargoGeneralAjaxRequest() {
    // Проверка, если checkbox_input_type отмечен
    // Выберите активный чекбокс с классом .boxing
    let activeCheckbox = $(".boxing:checked");

    // Получите необходимые значения из формы
    let insurance = $insurance.is(":checked") ? $insurance.attr("name") : null;
    count = $("input[name='count']").val().replace(/,/g, ".");
    let $maxDimension = $("input[name='max-dimension']");
    maxDimension = !$maxDimension.val()
      ? "0"
      : $maxDimension.val().replace(/,/g, ".");
    let totalCost = $("#currency").val().replace(/,/g, ".");
    let totalVolume = $("input[name='total-volume']").val().replace(/,/g, ".");
    let totalWeight = $("input[name='total-weight']").val().replace(/,/g, ".");
    let arrival = $arrival.val();
    arrivalCityRusTK = $arrival.val();
    let typeOfGoods = $("#type-of-goods")
      .contents()
      .first()
      .text()
      .match(/[A-Za-zА-Яа-я\s]+/g) // Оставить только английские и русские символы и пробелы
      .join(" ") // Объединить в строку с пробелами
      .trim();
    let currencySign = $(".order-data-general .currency-toggle")
      .contents()
      .first()
      .text()
      .trim();
    let boxing = activeCheckbox.length > 0 ? activeCheckbox.attr("name") : null;
    // Проверьте, что все необходимые поля заполнены

    let isRansom =
      $("input[name='delivery-option']:checked").val() === "delivery-only";
    let clientName = document.querySelector('input[name="client-name"]').value;
    let clientPhone = document.querySelector(
      'input[name="client-phone"]'
    ).value;
    let isClientExist = false;
    let numberIsValid = await validateNumber(clientPhone);
    if (!numberIsValid) {
      showInvalidMessage();
    }
    if (
      arrival &&
      totalCost &&
      totalVolume &&
      totalWeight &&
      count &&
      maxDimension &&
      typeOfGoods &&
      clientName &&
      clientPhone &&
      numberIsValid &&
      ((!isRansom &&
        (validateFields() ||
          !!document.querySelector(".selected-file-name")?.childNodes[3])) ||
        isRansom)
    ) {
      activateDeliveryPicks();
      outArrivalCityRusTK();
      prepFields();

      // Определите значение параметра "clause" в зависимости от состояния чекбокса
      let clause = isRansom ? "self-purchase" : "ransom";

      let isBrand = $brandGood.is(":checked");

      let brand = isBrand ? "brand" : null;

      // Подготовьте данные для отправки
      let requestData = {
        arrival: arrival,
        total_cost: totalCost,
        total_volume: totalVolume,
        total_weight: totalWeight,
        count: count,
        max_dimension: maxDimension,
        type_of_goods: typeOfGoods,
        boxing: boxing,
        clause: clause,
        brand: brand,
        currency_sign: currencySign,
        insurance: insurance,
        country: countryGlobal,
      };
      sendClientData(clientName, clientPhone).then((isClientExist) => {
        sendOrderDataForEmail(
          requestData,
          clientName,
          clientPhone,
          isClientExist
        )
          .then(function (emailResponse) {
            console.log("Данные успешно отправлены на email:", emailResponse);
          })
          .catch(function (emailError) {
            console.error("Ошибка при отправке данных на email:", emailError);
          });
      });
      return new Promise((resolve, reject) => {
        showAwait(".cargo-cost-elem", "cargo", true);
        dataChanged = false;
        $.ajax({
          type: "POST",
          url: "https://api-calc.wisetao.com:4343/api/calculate-cargo-delivery",
          data: requestData,
          success: function (response) {
            dollar = response.dollar;
            yuan = response.yuan;
            offerData = response;
            offerData.type_of_packaging = !offerData.type_of_packaging
              ? "скотч"
              : offerData.type_of_packaging;
            updatePageWithCargoResponse(response);
            showAwait(".cargo-cost-elem", "cargo", false);
            console.log("Успешно отправлено!");
            console.log("Ответ сервера:", response);

            resolve(response);
          },
          error: function (error) {
            showAwait(".cargo-cost-elem", "cargo", false);
            reject(error);
          },
        });
      });
    } else {
      console.log(
        "Заполните все обязательные поля. Запрос не будет отправлен."
      );
      let inputs = document.querySelectorAll(
        ".js-validate-num, .client-requisites-input, .to-arrival-input"
      );

      inputs.forEach(function (input) {
        let event = new Event("blur");
        input.dispatchEvent(event);
      });
      return Promise.reject("Заполните все обязательные поля.");
    }
  }

  async function sendCargoDimensionsAjaxRequest() {
    // Сохраняем данные в массивы
    let goods = [];
    let activeCheckbox = $(".boxing:checked");
    let boxing = activeCheckbox.length > 0 ? activeCheckbox.attr("name") : null;
    let insurance = $insurance.is(":checked") ? $insurance.attr("name") : null;
    // Собираем данные из полей .dimensions-input-group .length, .dimensions-input-group .width, .dimensions-input-group .height
    // Заполняем массив dimensionsData
    // Отправляем данные только если они не пустые
    let arrival = $arrival.val();
    let isRansom =
      $("input[name='delivery-option']:checked").val() === "delivery-only";
    let clientName = document.querySelector('input[name="client-name"]').value;
    let clientPhone = document.querySelector(
      'input[name="client-phone"]'
    ).value;
    let numberIsValid = await validateNumber(clientPhone);
    if (!numberIsValid) {
      showInvalidMessage();
    }
    if (
      checkInputs() &&
      numberIsValid &&
      ((!isRansom &&
        (validateFields() ||
          !!document.querySelector(".selected-file-name")?.childNodes[3])) ||
        isRansom)
    ) {
      activateDeliveryPicks();
      outArrivalCityRusTK();
      prepFields();
      let $currencySign = $(".order-data-dimensions .currency-toggle");
      count = 0;

      for (let i = 0; i < $lengthInput.length; i++) {
        goods.push({
          length: getFloatMeter($($lengthInput[i]).val()),
          width: getFloatMeter($($widthInput[i]).val()),
          height: getFloatMeter($($heightInput[i]).val()),
          price: $($currencyInput[i]).val().replace(/,/g, "."),
          weight: $($weightInput[i]).val().replace(/,/g, "."),
          count: $($quantityInput[i]).val().replace(/,/g, "."),
          type_of_goods: $($typeOfGoodsDropdown[i])
            .contents()
            .first()
            .text()
            .match(/[A-Za-zА-Яа-я\s]+/g) // Оставить только английские и русские символы и пробелы
            .join(" ") // Объединить в строку с пробелами
            .trim(),
          currency_sign: $($currencySign[i]).contents().first().text().trim(),
          brand: $dimBrand.is(":checked")
            ? "brand"
            : $($brand[i]).is(":checked")
            ? "brand"
            : null,
        });
        count += $($quantityInput[i]).val();
      }

      // Определите значение параметра "clause" в зависимости от состояния чекбокса
      let clause = isRansom ? "self-purchase" : "ransom";
      let type_good_data = $("#checkbox_input_type2");
      let dimensions = type_good_data.is(":checked") ? "dimensions" : "";
      let good = !type_good_data.is(":checked") ? "good" : "";
      // Отправляем данные по AJAX запросу
      let requestData = {
        goods: goods,
        arrival: arrival,
        goodsForBitrix: JSON.stringify(goods),
        dimensions: dimensions,
        good: good,
        boxing: boxing,
        clause: clause,
        insurance: insurance,
      };
      sendClientData(clientName, clientPhone).then((isClientExist) => {
        sendOrderDataForEmail(
          requestData,
          clientName,
          clientPhone,
          isClientExist
        )
          .then(function (emailResponse) {
            console.log("Данные успешно отправлены на email:", emailResponse);
          })
          .catch(function (emailError) {
            console.error("Ошибка при отправке данных на email:", emailError);
          });
      });
      return new Promise((resolve, reject) => {
        showAwait(".cargo-cost-elem", "cargo", true);
        dataChanged = false;
        $.ajax({
          type: "POST",
          url: "https://api-calc.wisetao.com:4343/api/calculate-cargo-delivery",
          data: requestData,
          success: function (response) {
            dollar = response.dollar;
            yuan = response.yuan;
            offerData = response;
            offerData.type_of_packaging = !offerData.type_of_packaging
              ? "скотч"
              : offerData.type_of_packaging;
            updatePageWithCargoResponse(response);
            showAwait(".cargo-cost-elem", "cargo", false);
            console.log("Успешно отправлено!");
            console.log("Ответ сервера:", response);
            resolve(response);
          },
          error: function (error) {
            showAwait(".cargo-cost-elem", "cargo", false);
            reject(error);
          },
        });
      });
    } else {
      console.log(
        "Заполните все обязательные поля. Запрос не будет отправлен."
      );
      let inputs = document.querySelectorAll(
        ".dimensions-calc-input, .js-validate-num"
      );

      inputs.forEach(function (input) {
        let event = new Event("blur");
        input.dispatchEvent(event);
      });
      return Promise.reject("Заполните все обязательные поля.");
    }
  }

  function sendDLAjaxRequest(response) {
    let totalVolume = response.total_volume;
    let totalWeight = response.total_weight;
    let arrival = $arrival.val();

    return new Promise((resolve, reject) => {
      showAwait(".cargo-cost-elem", "dl", true);
      $.ajax({
        type: "GET",
        url: "https://api-calc.wisetao.com:4343/api/calculate-dl-delivery",
        data: {
          arrival: arrival,
          total_volume: totalVolume,
          total_weight: totalWeight,
          count: count,
          max_dimension: maxDimension,
          from:
            countryGlobal === "Россия"
              ? "Москва"
              : countryGlobal === "Кыргызстан"
              ? "Бишкек"
              : countryGlobal === "Казахстан"
              ? "Алматы"
              : "Москва",
        },
        success: function (dlResponse) {
          updatePageWithDLResponse(response, dlResponse);
          showAwait(".cargo-cost-elem", "dl", false);
          deleteUnavailableField(
            document.querySelectorAll(".list-elem.list-help.dl-help")
          );
          dlResponse.tkType = "ДЛ";
          offerDataDL = dlResponse;
          console.log("Успешно отправлен второй запрос!");
          console.log("Ответ второго запроса:", dlResponse);
          resolve();
        },
        error: function (dlError) {
          // Обработка ошибки второго запроса
          console.error("Ошибка при отправке второго запроса:", dlError);
          showAwait(".cargo-cost-elem", "dl", false);
          if (
            dlError?.responseText.includes("cURL error 28: Operation timed") ||
            dlError?.responseText.includes(
              "Failed to open stream: HTTP request failed!"
            )
          ) {
            setUnavailableField(
              document.querySelectorAll(".list-elem.list-help.dl-help"),
              "ДЛ"
            );
          }
          reject(dlError);
        },
      });
    });
  }

  function sendPEKAjaxRequest(response) {
    let totalVolume = response.total_volume;
    let totalWeight = response.total_weight;
    let arrival = $arrival.val();
    // Отправляем третий запрос
    return new Promise((resolve, reject) => {
      showAwait(".cargo-cost-elem", "pek", true);
      $.ajax({
        type: "GET",
        url: "https://api-calc.wisetao.com:4343/api/calculate-pek-delivery",
        data: {
          arrival: arrival,
          total_volume: totalVolume,
          total_weight: totalWeight,
          count: count,
          max_dimension: maxDimension,
          from:
            countryGlobal === "Россия"
              ? "Москва"
              : countryGlobal === "Кыргызстан"
              ? "Бишкек"
              : countryGlobal === "Казахстан"
              ? "Алматы"
              : "Москва",
        },
        success: function (pekResponse) {
          updatePageWithPekResponse(response, pekResponse);
          showAwait(".cargo-cost-elem", "pek", false);
          deleteUnavailableField(
            document.querySelectorAll(".list-elem.list-help.pek-help")
          );
          pekResponse.tkType = "ПЕК";
          offerDataPEK = pekResponse;
          // Обработка успешного выполнения третьего запроса
          console.log("Успешно отправлен третий запрос!");
          console.log("Ответ сервера (третий запрос):", pekResponse);
          resolve();
          // Обновление значений на странице согласно третьему запросу
          // ... (обновления значений на странице согласно вашим требованиям)
        },
        error: function (error) {
          // Обработка ошибок при отправке третьего запроса
          console.error("Ошибка при отправке третьего запроса:", error);
          showAwait(".cargo-cost-elem", "pek", false);
          if (
            error?.responseText.includes("cURL error 28: Operation timed") ||
            error?.responseText.includes(
              "Failed to open stream: HTTP request failed!"
            )
          ) {
            setUnavailableField(
              document.querySelectorAll(".list-elem.list-help.pek-help"),
              "ПЭК"
            );
          }
          reject(error);
        },
      });
    });
  }

  function sendJDEAjaxRequest(response) {
    let totalVolume = response.total_volume;
    let totalWeight = response.total_weight;
    let arrival = $arrival.val();
    // Отправляем третий запрос
    return new Promise((resolve, reject) => {
      showAwait(".cargo-cost-elem", "jde", true);
      $.ajax({
        type: "GET",
        url: "https://api-calc.wisetao.com:4343/api/calculate-railway-expedition-delivery",
        data: {
          arrival: arrival,
          total_volume: totalVolume,
          total_weight: totalWeight,
          count: count,
          max_dimension: maxDimension,
          from:
            countryGlobal === "Россия"
              ? "Москва"
              : countryGlobal === "Кыргызстан"
              ? "Бишкек"
              : countryGlobal === "Казахстан"
              ? "Алматы"
              : "Москва",
        },
        success: function (jdeResponse) {
          updatePageWithJDEResponse(response, jdeResponse);
          // Выключаем анимацию и скрываем элементы с анимацией
          showAwait(".cargo-cost-elem", "jde", false);
          deleteUnavailableField(
            document.querySelectorAll(".list-elem.list-help.jde-help")
          );
          jdeResponse.tkType = "ЖДЭ";
          offerDataJDE = jdeResponse;
          // Обработка успешного выполнения третьего запроса
          console.log("Успешно отправлен четвертый запрос!");
          console.log("Ответ сервера (четвертый запрос):", jdeResponse);
          resolve();
          // Обновление значений на странице согласно третьему запросу
          // ... (обновления значений на странице согласно вашим требованиям)
        },
        error: function (error) {
          // Обработка ошибок при отправке третьего запроса
          console.error("Ошибка при отправке четвертого запроса:", error);
          // Выключаем анимацию и скрываем элементы с анимацией
          showAwait(".cargo-cost-elem", "jde", false);
          if (
            error?.responseText.includes("cURL error 28: Operation timed") ||
            error?.responseText.includes(
              "Failed to open stream: HTTP request failed!"
            )
          ) {
            setUnavailableField(
              document.querySelectorAll(".list-elem.list-help.jde-help"),
              "ЖДЭ"
            );
          }
          reject(error);
        },
      });
    });
  }

  function sendKITAjaxRequest(response) {
    let totalVolume = response.total_volume;
    let totalWeight = response.total_weight;
    let price = response.total_cost;
    let arrival = $arrival.val();
    // Отправляем пятый запрос
    return new Promise((resolve, reject) => {
      showAwait(".cargo-cost-elem", "kit", true);
      $.ajax({
        type: "GET",
        url: "https://api-calc.wisetao.com:4343/api/calculate-kit-delivery",
        data: {
          arrival: arrival,
          total_volume: totalVolume,
          total_weight: totalWeight,
          count: count,
          max_dimension: maxDimension,
          price: price,
          from:
            countryGlobal === "Россия"
              ? "Москва"
              : countryGlobal === "Кыргызстан"
              ? "Бишкек"
              : countryGlobal === "Казахстан"
              ? "Алматы"
              : "Москва",
        },
        success: function (kitResponse) {
          updatePageWithKITResponse(response, kitResponse);
          showAwait(".cargo-cost-elem", "kit", false);
          deleteUnavailableField(
            document.querySelectorAll(".list-elem.list-help.kit-help")
          );
          kitResponse.tkType = "КИТ";
          offerDataKIT = kitResponse;
          // Обработка успешного выполнения пятого запроса
          console.log("Успешно отправлен пятый запрос!");
          console.log("Ответ сервера (пятый запрос):", kitResponse);
          resolve();
          // Обновление значений на странице согласно пятому запросу
          // ... (обновления значений на странице согласно вашим требованиям)
        },
        error: function (error) {
          // Обработка ошибок при отправке пятого запроса
          showAwait(".cargo-cost-elem", "kit", false);
          console.error("Ошибка при отправке пятого запроса:", error);
          if (
            error?.responseText.includes("cURL error 28: Operation timed") ||
            error?.responseText.includes(
              "Failed to open stream: HTTP request failed!"
            )
          ) {
            setUnavailableField(
              document.querySelectorAll(".list-elem.list-help.kit-help"),
              "КИТ"
            );
          }
          reject(error);
        },
      });
    });
  }

  function updatePageWithCargoResponse(response) {
    // Обновляем значения для delivery-types-dropdown-auto
    let autoRegularKg = response.cost_price.auto_regular;
    let autoRegularKgRub = response.cost_price_rub.auto_regular;
    $("#delivery-types-dropdown-auto .cost-elem.cargo .kg").html(
      "$" +
        response.cost_price.auto_regular +
        " - " +
        "₽" +
        response.cost_price_rub.auto_regular
    );
    $("#delivery-types-dropdown-auto .cost-elem.cargo .sum .sum-dollar").html(
      "$" + response.sum_cost_price.auto_regular
    );
    $("#delivery-types-dropdown-auto .cost-elem.cargo .sum .sum-rub").html(
      "₽" + response.sum_cost_price_rub.auto_regular
    );
    $("#delivery-types-dropdown-auto .cargo-help .balloon-container .kg").html(
      "$" +
        response.cost_price.auto_regular +
        semicolonHelpTspan +
        "₽" +
        response.cost_price_rub.auto_regular
    );
    $("#delivery-types-dropdown-auto .cargo-help .balloon-container .sum").html(
      response.sum_cost_price.auto_regular +
        "$" +
        semicolonHelpTspan +
        response.sum_cost_price_rub.auto_regular +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto .cargo-help .balloon-container .exchange-rate-elem-dollar"
    ).html(dollar);
    $(
      "#delivery-types-dropdown-auto .cargo-help .balloon-container .exchange-rate-elem-yuan"
    ).html(yuan);
    $(
      "#delivery-types-dropdown-auto .cargo-help .balloon-container .boxing-type"
    ).html(response.type_of_packaging);
    $(
      "#delivery-types-dropdown-auto .cargo-help .balloon-container .packaging-price"
    ).html(
      (response.packaging_price_pub / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        response.packaging_price_pub.toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto .cargo-help .balloon-container .redeem-commission"
    ).html(
      ((response.commission_price * yuan) / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.commission_price * yuan).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto .cargo-help .balloon-container .insurance"
    ).html(
      response.insurance.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.insurance * dollar).toFixed(2) +
        "₽"
    );

    let autoFastKg = response.cost_price.auto_fast;
    let autoFastKgRub = response.cost_price_rub.auto_fast;
    // Обновляем значения для delivery-types-dropdown-fast-auto
    $("#delivery-types-dropdown-fast-auto .cost-elem.cargo .kg").html(
      "$" +
        response.cost_price.auto_fast +
        " - " +
        "₽" +
        response.cost_price_rub.auto_fast
    );
    $(
      "#delivery-types-dropdown-fast-auto .cost-elem.cargo .sum .sum-dollar"
    ).html("$" + response.sum_cost_price.auto_fast);
    $("#delivery-types-dropdown-fast-auto .cost-elem.cargo .sum .sum-rub").html(
      "₽" + response.sum_cost_price_rub.auto_fast
    );
    $(
      "#delivery-types-dropdown-fast-auto .cargo-help .balloon-container .kg"
    ).html(
      "$" +
        response.cost_price.auto_fast +
        semicolonHelpTspan +
        "₽" +
        response.cost_price_rub.auto_fast
    );
    $(
      "#delivery-types-dropdown-fast-auto .cargo-help .balloon-container .sum"
    ).html(
      response.sum_cost_price.auto_fast +
        "$" +
        semicolonHelpTspan +
        response.sum_cost_price_rub.auto_fast +
        "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto .cargo-help .balloon-container .exchange-rate-elem-dollar"
    ).html(dollar);
    $(
      "#delivery-types-dropdown-fast-auto .cargo-help .balloon-container .exchange-rate-elem-yuan"
    ).html(yuan);
    $(
      "#delivery-types-dropdown-fast-auto .cargo-help .balloon-container .boxing-type"
    ).html(response.type_of_packaging);
    $(
      "#delivery-types-dropdown-fast-auto .cargo-help .balloon-container .packaging-price"
    ).html(
      (response.packaging_price_pub / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        response.packaging_price_pub.toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto .cargo-help .balloon-container .redeem-commission"
    ).html(
      ((response.commission_price * yuan) / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.commission_price * yuan).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto .cargo-help .balloon-container .insurance"
    ).html(
      response.insurance.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.insurance * dollar).toFixed(2) +
        "₽"
    );
    let railwayKg = response.cost_price.ZhD;
    let railwayKgRub = response.cost_price_rub.ZhD;
    // Обновляем значения для delivery-types-dropdown-railway
    $("#delivery-types-dropdown-railway .cost-elem.cargo .kg").html(
      "$" + response.cost_price.ZhD + " - " + "₽" + response.cost_price_rub.ZhD
    );
    $(
      "#delivery-types-dropdown-railway .cost-elem.cargo .sum .sum-dollar"
    ).html("$" + response.sum_cost_price.ZhD);
    $("#delivery-types-dropdown-railway .cost-elem.cargo .sum .sum-rub").html(
      "₽" + response.sum_cost_price_rub.ZhD
    );
    $(
      "#delivery-types-dropdown-railway .cargo-help .balloon-container .kg"
    ).html(
      "$" +
        response.cost_price.ZhD +
        semicolonHelpTspan +
        "₽" +
        response.cost_price_rub.ZhD
    );
    $(
      "#delivery-types-dropdown-railway .cargo-help .balloon-container .sum"
    ).html(
      response.sum_cost_price.ZhD +
        "$" +
        semicolonHelpTspan +
        response.sum_cost_price_rub.ZhD +
        "₽"
    );
    $(
      "#delivery-types-dropdown-railway .cargo-help .balloon-container .exchange-rate-elem-dollar"
    ).html(dollar);
    $(
      "#delivery-types-dropdown-railway .cargo-help .balloon-container .exchange-rate-elem-yuan"
    ).html(yuan);
    $(
      "#delivery-types-dropdown-railway .cargo-help .balloon-container .boxing-type"
    ).html(response.type_of_packaging);
    $(
      "#delivery-types-dropdown-railway .cargo-help .balloon-container .packaging-price"
    ).html(
      (response.packaging_price_pub / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        response.packaging_price_pub.toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-railway .cargo-help .balloon-container .redeem-commission"
    ).html(
      ((response.commission_price * yuan) / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.commission_price * yuan).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-railway .cargo-help .balloon-container .insurance"
    ).html(
      response.insurance.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.insurance * dollar).toFixed(2) +
        "₽"
    );

    let aviaKg = response.cost_price.avia;
    let aviaKgRub = response.cost_price_rub.avia;
    // Обновляем значения для delivery-types-dropdown-railway
    $("#delivery-types-dropdown-avia .cost-elem.cargo .kg").html(
      "$" +
        response.cost_price.avia +
        " - " +
        response.cost_price_rub.avia +
        "₽"
    );
    $("#delivery-types-dropdown-avia .cost-elem.cargo .sum .sum-dollar").html(
      "$" + response.sum_cost_price.avia
    );
    $("#delivery-types-dropdown-avia .cost-elem.cargo .sum .sum-rub").html(
      "₽" + response.sum_cost_price_rub.avia
    );
    $("#delivery-types-dropdown-avia .cargo-help .balloon-container .kg").html(
      "$" +
        response.cost_price.avia +
        semicolonHelpTspan +
        response.cost_price_rub.avia +
        "₽"
    );
    $("#delivery-types-dropdown-avia .cargo-help .balloon-container .sum").html(
      response.sum_cost_price.avia +
        "$" +
        semicolonHelpTspan +
        response.sum_cost_price_rub.avia +
        "₽"
    );
    $(
      "#delivery-types-dropdown-avia .cargo-help .balloon-container .exchange-rate-elem-dollar"
    ).html(dollar);
    $(
      "#delivery-types-dropdown-avia .cargo-help .balloon-container .exchange-rate-elem-yuan"
    ).html(yuan);
    $(
      "#delivery-types-dropdown-avia .cargo-help .balloon-container .boxing-type"
    ).html(response.type_of_packaging);
    $(
      "#delivery-types-dropdown-avia .cargo-help .balloon-container .packaging-price"
    ).html(
      (response.packaging_price_pub / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        response.packaging_price_pub.toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-avia .cargo-help .balloon-container .redeem-commission"
    ).html(
      ((response.commission_price * yuan) / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.commission_price * yuan).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-avia .cargo-help .balloon-container .insurance"
    ).html(
      response.insurance.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.insurance * dollar).toFixed(2) +
        "₽"
    );
  }

  function updatePageWithDLResponse(response, dlResponse) {
    // Обновление элементов внутри delivery-types-dropdown-auto
    let autoRegularKg =
      dlResponse.sum_cost_price.auto_regular === "н/д"
        ? "н/д"
        : parseFloat(
            (response.sum_cost_price.auto_regular +
              dlResponse.sum_cost_price.auto_regular) /
              response.total_weight
          ).toFixed(2);
    let autoRegularKgRub =
      dlResponse.sum_cost_price_rub.auto_regular === "н/д"
        ? "н/д"
        : parseFloat(
            (response.sum_cost_price_rub.auto_regular +
              dlResponse.sum_cost_price_rub.auto_regular) /
              response.total_weight
          ).toFixed(2);
    $("#delivery-types-dropdown-auto .cost-elem.dl .kg").html(
      autoRegularKg === "н/д"
        ? "$н/д" + " - " + " ₽н/д"
        : "$" + autoRegularKg + " - " + "₽" + autoRegularKgRub
    );
    $("#delivery-types-dropdown-auto .cost-elem.dl .sum .sum-dollar").html(
      autoRegularKg === "н/д"
        ? "$н/д"
        : "$" + (autoRegularKg * response.total_weight).toFixed(2)
    );
    $("#delivery-types-dropdown-auto .cost-elem.dl .sum .sum-rub").html(
      autoRegularKg === "н/д"
        ? "₽н/д"
        : "₽" + (autoRegularKgRub * response.total_weight).toFixed(2)
    );

    // Обновление элементов внутри delivery-types-dropdown-fast-auto
    let autoFastKg =
      dlResponse.sum_cost_price.auto_fast === "н/д"
        ? "н/д"
        : parseFloat(
            (response.sum_cost_price.auto_fast +
              dlResponse.sum_cost_price.auto_fast) /
              response.total_weight
          ).toFixed(2);
    let autoFastKgRub =
      dlResponse.sum_cost_price_rub.auto_fast === "н/д"
        ? "н/д"
        : parseFloat(
            (response.sum_cost_price_rub.auto_fast +
              dlResponse.sum_cost_price_rub.auto_fast) /
              response.total_weight
          ).toFixed(2);
    $("#delivery-types-dropdown-fast-auto .cost-elem.dl .kg").html(
      autoFastKg === "н/д"
        ? "$н/д" + " - " + " ₽н/д"
        : "$" + autoFastKg + " - " + "₽" + autoFastKgRub
    );
    $("#delivery-types-dropdown-fast-auto .cost-elem.dl .sum .sum-dollar").html(
      autoFastKg === "н/д"
        ? "$н/д"
        : "$" + (autoFastKg * response.total_weight).toFixed(2)
    );
    $("#delivery-types-dropdown-fast-auto .cost-elem.dl .sum .sum-rub").html(
      autoFastKg === "н/д"
        ? "₽н/д"
        : "₽" + (autoFastKgRub * response.total_weight).toFixed(2)
    );

    // Обновление элементов внутри delivery-types-dropdown-avia
    let aviaKg =
      dlResponse.sum_cost_price.avia === "н/д"
        ? "н/д"
        : parseFloat(
            (response.sum_cost_price.avia + dlResponse.sum_cost_price.avia) /
              response.total_weight
          ).toFixed(2);
    let aviaKgRub =
      dlResponse.sum_cost_price_rub.avia === "н/д"
        ? "н/д"
        : parseFloat(
            (response.sum_cost_price_rub.avia +
              dlResponse.sum_cost_price_rub.avia) /
              response.total_weight
          ).toFixed(2);
    $("#delivery-types-dropdown-avia .cost-elem.dl .kg").html(
      aviaKg === "н/д"
        ? "$н/д" + " - " + " ₽н/д"
        : "$" + aviaKg + " - " + "₽" + aviaKgRub
    );
    $("#delivery-types-dropdown-avia .cost-elem.dl .sum .sum-dollar").html(
      aviaKg === "н/д"
        ? "$н/д"
        : "$" + (aviaKg * response.total_weight).toFixed(2)
    );
    $("#delivery-types-dropdown-avia .cost-elem.dl .sum .sum-rub").html(
      aviaKg === "н/д"
        ? "₽н/д"
        : "₽" + (aviaKgRub * response.total_weight).toFixed(2)
    );

    // Обновление элементов внутри delivery-types-dropdown-auto dl-help
    $("#delivery-types-dropdown-auto .dl-help .balloon-container .kg").html(
      autoRegularKg === "н/д"
        ? "$н/д" + semicolonHelp + "₽н/д"
        : "$" + autoRegularKg + semicolonHelpTspan + "₽" + autoRegularKgRub
    );
    $("#delivery-types-dropdown-auto .dl-help .balloon-container .sum").html(
      autoRegularKg === "н/д"
        ? "$н/д" + semicolonHelp + "₽н/д"
        : (autoRegularKg * response.total_weight).toFixed(2) +
            "$" +
            semicolonHelpTspan +
            (autoRegularKgRub * response.total_weight).toFixed(2) +
            "₽"
    );
    $(
      "#delivery-types-dropdown-auto .dl-help .balloon-container .exchange-rate-elem-dollar"
    ).html(dollar);
    $(
      "#delivery-types-dropdown-auto .dl-help .balloon-container .exchange-rate-elem-yuan"
    ).html(yuan);
    $(
      "#delivery-types-dropdown-auto .dl-help .balloon-container .boxing-type"
    ).html(response.type_of_packaging);
    $(
      "#delivery-types-dropdown-auto .dl-help .balloon-container .packaging-price"
    ).html(
      (response.packaging_price_pub / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        response.packaging_price_pub.toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto .dl-help .balloon-container .kg-cargo"
    ).html(
      (response.sum_cost_price.auto_regular / response.total_weight).toFixed(
        2
      ) +
        "$" +
        semicolonHelpTspan +
        (
          (response.sum_cost_price.auto_regular / response.total_weight) *
          dollar
        ).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto .dl-help .balloon-container .sum-cargo"
    ).html(
      response.sum_cost_price.auto_regular.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.sum_cost_price.auto_regular * dollar).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto .dl-help .balloon-container .redeem-commission"
    ).html(
      ((response.commission_price * yuan) / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.commission_price * yuan).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto .dl-help .balloon-container .insurance"
    ).html(
      response.insurance.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.insurance * dollar).toFixed(2) +
        "₽"
    );

    // Обновление элементов внутри delivery-types-dropdown-fast-auto dl-help
    $(
      "#delivery-types-dropdown-fast-auto .dl-help .balloon-container .kg"
    ).html(
      autoFastKg === "н/д"
        ? "$н/д" + semicolonHelp + "₽н/д"
        : "$" + autoFastKg + semicolonHelpTspan + "₽" + autoFastKgRub
    );
    $(
      "#delivery-types-dropdown-fast-auto .dl-help .balloon-container .sum"
    ).html(
      autoFastKg === "н/д"
        ? "$н/д" + semicolonHelp + "₽н/д"
        : (autoFastKg * response.total_weight).toFixed(2) +
            "$" +
            semicolonHelpTspan +
            (autoFastKgRub * response.total_weight).toFixed(2) +
            "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto .dl-help .balloon-container .exchange-rate-elem-dollar"
    ).html(dollar);
    $(
      "#delivery-types-dropdown-fast-auto .dl-help .balloon-container .exchange-rate-elem-yuan"
    ).html(yuan);
    $(
      "#delivery-types-dropdown-fast-auto .dl-help .balloon-container .boxing-type"
    ).html(response.type_of_packaging);
    $(
      "#delivery-types-dropdown-fast-auto .dl-help .balloon-container .packaging-price"
    ).html(
      (response.packaging_price_pub / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        response.packaging_price_pub.toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto .dl-help .balloon-container .kg-cargo"
    ).html(
      (response.sum_cost_price.auto_regular / response.total_weight).toFixed(
        2
      ) +
        "$" +
        semicolonHelpTspan +
        (
          (response.sum_cost_price.auto_regular / response.total_weight) *
          dollar
        ).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto .dl-help .balloon-container .sum-cargo"
    ).html(
      response.sum_cost_price.auto_regular.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.sum_cost_price.auto_regular * dollar).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto .dl-help .balloon-container .redeem-commission"
    ).html(
      ((response.commission_price * yuan) / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.commission_price * yuan).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto .dl-help .balloon-container .insurance"
    ).html(
      response.insurance.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.insurance * dollar).toFixed(2) +
        "₽"
    );

    // Обновление элементов внутри delivery-types-dropdown-avia dl-help
    $("#delivery-types-dropdown-avia .dl-help .balloon-container .kg").html(
      aviaKg === "н/д"
        ? "$н/д" + semicolonHelp + "₽н/д"
        : "$" + aviaKg + semicolonHelpTspan + "₽" + aviaKgRub
    );
    $("#delivery-types-dropdown-avia .dl-help .balloon-container .sum").html(
      aviaKg === "н/д"
        ? "$н/д" + semicolonHelp + "₽н/д"
        : (aviaKg * response.total_weight).toFixed(2) +
            "$" +
            semicolonHelpTspan +
            (aviaKgRub * response.total_weight).toFixed(2) +
            "₽"
    );
    $(
      "#delivery-types-dropdown-avia .dl-help .balloon-container .exchange-rate-elem-dollar"
    ).html(dollar);
    $(
      "#delivery-types-dropdown-avia .dl-help .balloon-container .exchange-rate-elem-yuan"
    ).html(yuan);
    $(
      "#delivery-types-dropdown-avia .dl-help .balloon-container .boxing-type"
    ).html(response.type_of_packaging);
    $(
      "#delivery-types-dropdown-avia .dl-help .balloon-container .packaging-price"
    ).html(
      (response.packaging_price_pub / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        response.packaging_price_pub.toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-avia .dl-help .balloon-container .kg-cargo"
    ).html(
      (response.sum_cost_price.auto_regular / response.total_weight).toFixed(
        2
      ) +
        "$" +
        semicolonHelpTspan +
        (
          (response.sum_cost_price.auto_regular / response.total_weight) *
          dollar
        ).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-avia .dl-help .balloon-container .sum-cargo"
    ).html(
      response.sum_cost_price.auto_regular.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.sum_cost_price.auto_regular * dollar).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-avia .dl-help .balloon-container .redeem-commission"
    ).html(
      ((response.commission_price * yuan) / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.commission_price * yuan).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-avia .dl-help .balloon-container .insurance"
    ).html(
      response.insurance.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.insurance * dollar).toFixed(2) +
        "₽"
    );
  }

  function updatePageWithPekResponse(response, pekResponse) {
    // Обновляем значения для delivery-types-dropdown-auto
    let autoRegularKg =
      pekResponse.sum_cost_price.auto_regular === "н/д"
        ? "н/д"
        : parseFloat(
            (response.sum_cost_price.auto_regular +
              pekResponse.sum_cost_price.auto_regular) /
              response.total_weight
          ).toFixed(2);
    let autoRegularSum =
      pekResponse.sum_cost_price.auto_regular === "н/д"
        ? "н/д"
        : parseFloat(
            response.sum_cost_price.auto_regular +
              pekResponse.sum_cost_price.auto_regular
          ).toFixed(2);

    let autoRegularKgRub =
      pekResponse.sum_cost_price_rub.auto_regular === "н/д"
        ? "н/д"
        : parseFloat(
            (response.sum_cost_price_rub.auto_regular +
              pekResponse.sum_cost_price_rub.auto_regular) /
              response.total_weight
          ).toFixed(2);
    let autoRegularSumRub =
      pekResponse.sum_cost_price_rub.auto_regular === "н/д"
        ? "н/д"
        : parseFloat(
            response.sum_cost_price_rub.auto_regular +
              pekResponse.sum_cost_price_rub.auto_regular
          ).toFixed(2);
    $("#delivery-types-dropdown-auto .cost-elem.pek .kg").html(
      autoRegularKg === "н/д"
        ? "$н/д" + " - " + " ₽н/д"
        : "$" + autoRegularKg + " - " + "₽" + autoRegularKgRub
    );
    $("#delivery-types-dropdown-auto .cost-elem.pek .sum .sum-dollar").html(
      autoRegularSum === "н/д" ? "$н/д" : "$" + autoRegularSum
    );
    $("#delivery-types-dropdown-auto .cost-elem.pek .sum .sum-rub").html(
      autoRegularSum === "н/д" ? "₽н/д" : "₽" + autoRegularSumRub
    );

    // Обновляем значения для delivery-types-dropdown-auto dl-help
    $("#delivery-types-dropdown-auto .pek-help .balloon-container .kg").html(
      autoRegularKg === "н/д"
        ? "$н/д" + semicolonHelp + "₽н/д"
        : "$" + autoRegularKg + semicolonHelpTspan + autoRegularKgRub + "₽"
    );
    $("#delivery-types-dropdown-auto .pek-help .balloon-container .sum").html(
      autoRegularSum === "н/д"
        ? "$н/д" + semicolonHelp + "₽н/д"
        : autoRegularSum + "$" + semicolonHelpTspan + autoRegularSumRub + "₽"
    );
    $(
      "#delivery-types-dropdown-auto .pek-help .balloon-container .exchange-rate-elem-dollar"
    ).html(dollar);
    $(
      "#delivery-types-dropdown-auto .pek-help .balloon-container .exchange-rate-elem-yuan"
    ).html(yuan);
    $(
      "#delivery-types-dropdown-auto .pek-help .balloon-container .boxing-type"
    ).html(response.type_of_packaging);
    $(
      "#delivery-types-dropdown-auto .pek-help .balloon-container .packaging-price"
    ).html(
      (response.packaging_price_pub / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        response.packaging_price_pub.toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto .pek-help .balloon-container .kg-cargo"
    ).html(
      (response.sum_cost_price.auto_regular / response.total_weight).toFixed(
        2
      ) +
        "$" +
        semicolonHelpTspan +
        (
          (response.sum_cost_price.auto_regular / response.total_weight) *
          dollar
        ).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto .pek-help .balloon-container .sum-cargo"
    ).html(
      response.sum_cost_price.auto_regular.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.sum_cost_price.auto_regular * dollar).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto .pek-help .balloon-container .redeem-commission"
    ).html(
      ((response.commission_price * yuan) / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.commission_price * yuan).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto .pek-help .balloon-container .insurance"
    ).html(
      response.insurance.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.insurance * dollar).toFixed(2) +
        "₽"
    );

    // Обновляем значения для delivery-types-dropdown-avia
    let aviaKg =
      pekResponse.sum_cost_price.avia === "н/д"
        ? "н/д"
        : parseFloat(
            (response.sum_cost_price.avia + pekResponse.sum_cost_price.avia) /
              response.total_weight
          ).toFixed(2);
    let aviaSum =
      pekResponse.sum_cost_price.avia === "н/д"
        ? "н/д"
        : parseFloat(
            response.sum_cost_price.avia + pekResponse.sum_cost_price.avia
          ).toFixed(2);

    let aviaKgRub =
      pekResponse.sum_cost_price_rub.avia === "н/д"
        ? "н/д"
        : parseFloat(
            (response.sum_cost_price_rub.avia +
              pekResponse.sum_cost_price_rub.avia) /
              response.total_weight
          ).toFixed(2);
    let aviaSumRub =
      pekResponse.sum_cost_price_rub.avia === "н/д"
        ? "н/д"
        : parseFloat(
            response.sum_cost_price_rub.avia +
              pekResponse.sum_cost_price_rub.avia
          ).toFixed(2);
    $("#delivery-types-dropdown-avia .cost-elem.pek .kg").html(
      aviaKg === "н/д"
        ? "$н/д" + " - " + "₽н/д"
        : "$" + aviaKg + " - " + "₽" + aviaKgRub
    );
    $("#delivery-types-dropdown-avia .cost-elem.pek .sum .sum-dollar").html(
      aviaSum === "н/д" ? "$н/д" : "$" + aviaSum
    );
    $("#delivery-types-dropdown-avia .cost-elem.pek .sum .sum-rub").html(
      aviaSum === "н/д" ? "₽н/д" : "₽" + aviaSumRub
    );

    // Обновляем значения для delivery-types-dropdown-avia dl-help
    $("#delivery-types-dropdown-avia .pek-help .balloon-container .kg").html(
      aviaKg === "н/д"
        ? "$н/д" + semicolonHelp + " ₽н/д"
        : "$" + aviaKg + semicolonHelpTspan + "₽" + aviaKgRub
    );
    $("#delivery-types-dropdown-avia .pek-help .balloon-container .sum").html(
      aviaSum === "н/д"
        ? "$н/д" + semicolonHelp + " ₽н/д"
        : aviaSum + "$" + semicolonHelpTspan + aviaSumRub + "₽"
    );
    $(
      "#delivery-types-dropdown-avia .pek-help .balloon-container .exchange-rate-elem-dollar"
    ).html(dollar);
    $(
      "#delivery-types-dropdown-avia .pek-help .balloon-container .exchange-rate-elem-yuan"
    ).html(yuan);
    $(
      "#delivery-types-dropdown-avia .pek-help .balloon-container .boxing-type"
    ).html(response.type_of_packaging);
    $(
      "#delivery-types-dropdown-avia .pek-help .balloon-container .packaging-price"
    ).html(
      (response.packaging_price_pub / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        response.packaging_price_pub.toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-avia .pek-help .balloon-container .kg-cargo"
    ).html(
      (response.sum_cost_price.auto_regular / response.total_weight).toFixed(
        2
      ) +
        "$" +
        semicolonHelpTspan +
        (
          (response.sum_cost_price.auto_regular / response.total_weight) *
          dollar
        ).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-avia .pek-help .balloon-container .sum-cargo"
    ).html(
      response.sum_cost_price.auto_regular.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.sum_cost_price.auto_regular * dollar).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-avia .pek-help .balloon-container .redeem-commission"
    ).html(
      ((response.commission_price * yuan) / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.commission_price * yuan).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-avia .pek-help .balloon-container .insurance"
    ).html(
      response.insurance.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.insurance * dollar).toFixed(2) +
        "₽"
    );
  }

  function updatePageWithJDEResponse(response, jdeResponse) {
    // Обновление элементов внутри delivery-types-dropdown-auto для auto_regular
    let autoRegularKg =
      jdeResponse.sum_cost_price.auto_regular === "н/д"
        ? "н/д"
        : parseFloat(
            (response.sum_cost_price.auto_regular +
              jdeResponse.sum_cost_price.auto_regular) /
              response.total_weight
          ).toFixed(2);
    let autoRegularKgRub =
      jdeResponse.sum_cost_price_rub.auto_regular === "н/д"
        ? "н/д"
        : parseFloat(
            (response.sum_cost_price_rub.auto_regular +
              jdeResponse.sum_cost_price_rub.auto_regular) /
              response.total_weight
          ).toFixed(2);
    $("#delivery-types-dropdown-auto .cost-elem.jde .kg").html(
      autoRegularKg === "н/д"
        ? "$н/д" + " - " + "₽н/д"
        : "$" + autoRegularKg + " - " + "₽" + autoRegularKgRub
    );
    $("#delivery-types-dropdown-auto .cost-elem.jde .sum-dollar").html(
      autoRegularKg === "н/д"
        ? "$н/д"
        : "$" + (autoRegularKg * response.total_weight).toFixed(2)
    );
    $("#delivery-types-dropdown-auto .cost-elem.jde .sum-rub").html(
      autoRegularKg === "н/д"
        ? "₽н/д"
        : "₽" + (autoRegularKgRub * response.total_weight).toFixed(2)
    );

    // Обновление элементов внутри delivery-types-dropdown-fast-auto для auto_fast
    let autoFastKg =
      jdeResponse.sum_cost_price.auto_fast === "н/д"
        ? "н/д"
        : parseFloat(
            (response.sum_cost_price.auto_fast +
              jdeResponse.sum_cost_price.auto_fast) /
              response.total_weight
          ).toFixed(2);
    let autoFastKgRub =
      jdeResponse.sum_cost_price_rub.auto_fast === "н/д"
        ? "н/д"
        : parseFloat(
            (response.sum_cost_price_rub.auto_fast +
              jdeResponse.sum_cost_price_rub.auto_fast) /
              response.total_weight
          ).toFixed(2);
    $("#delivery-types-dropdown-fast-auto .cost-elem.jde .kg").html(
      autoFastKg === "н/д"
        ? "$н/д" + " - " + "₽н/д"
        : "$" + autoFastKg + " - " + "₽" + autoFastKgRub
    );
    $(
      "#delivery-types-dropdown-fast-auto .cost-elem.jde .sum .sum-dollar"
    ).html(
      autoFastKg === "н/д"
        ? "$н/д"
        : "$" + (autoFastKg * response.total_weight).toFixed(2)
    );
    $("#delivery-types-dropdown-fast-auto .cost-elem.jde .sum .sum-rub").html(
      autoFastKg === "н/д"
        ? "₽н/д"
        : "₽" + (autoFastKgRub * response.total_weight).toFixed(2)
    );

    // Обновление элементов внутри delivery-types-dropdown-auto jde-help для auto_regular
    $("#delivery-types-dropdown-auto .jde-help .balloon-container .kg").html(
      autoRegularKg === "н/д"
        ? "$н/д" + semicolonHelp + " ₽н/д"
        : "$" + autoRegularKg + semicolonHelpTspan + autoRegularKgRub + "₽"
    );
    $("#delivery-types-dropdown-auto .jde-help .balloon-container .sum").html(
      autoRegularKg === "н/д"
        ? "$н/д" + semicolonHelp + " ₽н/д"
        : (autoRegularKg * response.total_weight).toFixed(2) +
            "$" +
            semicolonHelpTspan +
            (autoRegularKgRub * response.total_weight).toFixed(2) +
            "₽"
    );
    $(
      "#delivery-types-dropdown-auto .jde-help .balloon-container .exchange-rate-elem-dollar"
    ).html(dollar);
    $(
      "#delivery-types-dropdown-auto .jde-help .balloon-container .exchange-rate-elem-yuan"
    ).html(yuan);
    $(
      "#delivery-types-dropdown-auto .jde-help .balloon-container .boxing-type"
    ).html(response.type_of_packaging);
    $(
      "#delivery-types-dropdown-auto .jde-help .balloon-container .packaging-price"
    ).html(
      (response.packaging_price_pub / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        response.packaging_price_pub.toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto .jde-help .balloon-container .kg-cargo"
    ).html(
      (response.sum_cost_price.auto_regular / response.total_weight).toFixed(
        2
      ) +
        "$" +
        semicolonHelpTspan +
        (
          (response.sum_cost_price.auto_regular / response.total_weight) *
          dollar
        ).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto .jde-help .balloon-container .sum-cargo"
    ).html(
      response.sum_cost_price.auto_regular.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.sum_cost_price.auto_regular * dollar).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto .jde-help .balloon-container .redeem-commission"
    ).html(
      ((response.commission_price * yuan) / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.commission_price * yuan).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto .jde-help .balloon-container .insurance"
    ).html(
      response.insurance.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.insurance * dollar).toFixed(2) +
        "₽"
    );

    // Обновление элементов внутри delivery-types-dropdown-fast-auto jde-help для auto_fast
    $(
      "#delivery-types-dropdown-fast-auto .jde-help .balloon-container .kg"
    ).html(
      autoFastKg === "н/д"
        ? "$н/д" + semicolonHelp + " ₽н/д"
        : "$" + autoFastKg + semicolonHelpTspan + autoFastKgRub + "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto .jde-help .balloon-container .sum"
    ).html(
      autoFastKg === "н/д"
        ? "$н/д" + semicolonHelp + " ₽н/д"
        : (autoFastKg * response.total_weight).toFixed(2) +
            "$" +
            semicolonHelpTspan +
            (autoFastKgRub * response.total_weight).toFixed(2) +
            "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto .jde-help .balloon-container .exchange-rate-elem-dollar"
    ).html(dollar);
    $(
      "#delivery-types-dropdown-fast-auto .jde-help .balloon-container .exchange-rate-elem-yuan"
    ).html(yuan);
    $(
      "#delivery-types-dropdown-fast-auto .jde-help .balloon-container .boxing-type"
    ).html(response.type_of_packaging);
    $(
      "#delivery-types-dropdown-fast-auto .jde-help .balloon-container .packaging-price"
    ).html(
      (response.packaging_price_pub / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        response.packaging_price_pub.toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto .jde-help .balloon-container .kg-cargo"
    ).html(
      (response.sum_cost_price.auto_regular / response.total_weight).toFixed(
        2
      ) +
        "$" +
        semicolonHelpTspan +
        (
          (response.sum_cost_price.auto_regular / response.total_weight) *
          dollar
        ).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto .jde-help .balloon-container .sum-cargo"
    ).html(
      response.sum_cost_price.auto_regular.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.sum_cost_price.auto_regular * dollar).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto .jde-help .balloon-container .redeem-commission"
    ).html(
      ((response.commission_price * yuan) / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.commission_price * yuan).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto .jde-help .balloon-container .insurance"
    ).html(
      response.insurance.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.insurance * dollar).toFixed(2) +
        "₽"
    );
  }

  function updatePageWithKITResponse(response, kitResponse) {
    // Обновление элементов внутри delivery-types-dropdown-auto
    let autoRegularKg =
      kitResponse.sum_cost_price.auto_regular !== "н/д"
        ? parseFloat(
            (response.sum_cost_price.auto_regular +
              kitResponse.sum_cost_price.auto_regular) /
              response.total_weight
          ).toFixed(2)
        : "н/д";
    let autoRegularKgRub =
      kitResponse.sum_cost_price_rub.auto_regular !== "н/д"
        ? parseFloat(
            (response.sum_cost_price_rub.auto_regular +
              kitResponse.sum_cost_price_rub.auto_regular) /
              response.total_weight
          ).toFixed(2)
        : "н/д";
    $("#delivery-types-dropdown-auto .cost-elem.kit .kg").html(
      autoRegularKg !== "н/д"
        ? "$" + autoRegularKg + " - " + "₽" + autoRegularKgRub
        : "$н/д" + " - " + " ₽н/д"
    );
    $("#delivery-types-dropdown-auto .cost-elem.kit .sum .sum-dollar").html(
      autoRegularKg !== "н/д"
        ? "$" + (autoRegularKg * response.total_weight).toFixed(2)
        : "$н/д"
    );
    $("#delivery-types-dropdown-auto .cost-elem.kit .sum .sum-rub").html(
      autoRegularKg !== "н/д"
        ? "₽" + (autoRegularKgRub * response.total_weight).toFixed(2)
        : "₽н/д"
    );

    // Обновление элементов внутри delivery-types-dropdown-fast-auto
    let autoFastKg =
      kitResponse.sum_cost_price.auto_fast !== "н/д"
        ? parseFloat(
            (response.sum_cost_price.auto_fast +
              kitResponse.sum_cost_price.auto_fast) /
              response.total_weight
          ).toFixed(2)
        : "н/д";
    let autoFastKgRub =
      kitResponse.sum_cost_price_rub.auto_fast !== "н/д"
        ? parseFloat(
            (response.sum_cost_price_rub.auto_fast +
              kitResponse.sum_cost_price_rub.auto_fast) /
              response.total_weight
          ).toFixed(2)
        : "н/д";
    $("#delivery-types-dropdown-fast-auto .cost-elem.kit .kg").html(
      autoFastKg !== "н/д"
        ? "$" + autoFastKg + " - " + "₽" + autoFastKgRub
        : "$н/д" + " - " + " ₽н/д"
    );
    $(
      "#delivery-types-dropdown-fast-auto .cost-elem.kit .sum .sum-dollar"
    ).html(
      autoFastKg !== "н/д"
        ? "$" + (autoFastKg * response.total_weight).toFixed(2)
        : "$н/д"
    );
    $("#delivery-types-dropdown-fast-auto .cost-elem.kit .sum .sum-rub").html(
      autoFastKg !== "н/д"
        ? "₽" + (autoFastKgRub * response.total_weight).toFixed(2)
        : "₽н/д"
    );

    // Обновление элементов внутри delivery-types-dropdown-auto kit-help
    $("#delivery-types-dropdown-auto .kit-help .balloon-container .kg").html(
      autoRegularKg !== "н/д"
        ? "$" + autoRegularKg + semicolonHelpTspan + autoRegularKgRub + "₽"
        : "$н/д" + semicolonHelp + " ₽н/д"
    );
    $("#delivery-types-dropdown-auto .kit-help .balloon-container .sum").html(
      autoRegularKg !== "н/д"
        ? (autoRegularKg * response.total_weight).toFixed(2) +
            "$" +
            semicolonHelpTspan +
            (autoRegularKgRub * response.total_weight).toFixed(2) +
            "₽"
        : "$н/д" + semicolonHelp + " ₽н/д"
    );
    $(
      "#delivery-types-dropdown-auto .kit-help .balloon-container .exchange-rate-elem-dollar"
    ).html(dollar);
    $(
      "#delivery-types-dropdown-auto .kit-help .balloon-container .exchange-rate-elem-yuan"
    ).html(yuan);
    $(
      "#delivery-types-dropdown-auto .kit-help .balloon-container .boxing-type"
    ).html(response.type_of_packaging);
    $(
      "#delivery-types-dropdown-auto .kit-help .balloon-container .packaging-price"
    ).html(
      (response.packaging_price_pub / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        response.packaging_price_pub.toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto .kit-help .balloon-container .kg-cargo"
    ).html(
      (response.sum_cost_price.auto_regular / response.total_weight).toFixed(
        2
      ) +
        "$" +
        semicolonHelpTspan +
        (
          (response.sum_cost_price.auto_regular / response.total_weight) *
          dollar
        ).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto .kit-help .balloon-container .sum-cargo"
    ).html(
      response.sum_cost_price.auto_regular.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.sum_cost_price.auto_regular * dollar).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto .kit-help .balloon-container .redeem-commission"
    ).html(
      ((response.commission_price * yuan) / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.commission_price * yuan).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto .kit-help .balloon-container .insurance"
    ).html(
      response.insurance.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.insurance * dollar).toFixed(2) +
        "₽"
    );

    // Обновление элементов внутри delivery-types-dropdown-fast-auto kit-help
    $(
      "#delivery-types-dropdown-fast-auto .kit-help .balloon-container .kg"
    ).html(
      autoFastKg !== "н/д"
        ? "$" + autoFastKg + semicolonHelpTspan + autoFastKgRub + "₽"
        : "$н/д" + semicolonHelp + " ₽н/д"
    );
    $(
      "#delivery-types-dropdown-fast-auto .kit-help .balloon-container .sum"
    ).html(
      autoFastKg !== "н/д"
        ? (autoFastKg * response.total_weight).toFixed(2) +
            "$" +
            semicolonHelpTspan +
            (autoFastKgRub * response.total_weight).toFixed(2) +
            "₽"
        : "$н/д" + semicolonHelp + " ₽н/д"
    );
    $(
      "#delivery-types-dropdown-fast-auto .kit-help .balloon-container .exchange-rate-elem-dollar"
    ).html(dollar);
    $(
      "#delivery-types-dropdown-fast-auto .kit-help .balloon-container .exchange-rate-elem-yuan"
    ).html(yuan);
    $(
      "#delivery-types-dropdown-fast-auto .kit-help .balloon-container .boxing-type"
    ).html(response.type_of_packaging);
    $(
      "#delivery-types-dropdown-fast-auto .kit-help .balloon-container .packaging-price"
    ).html(
      (response.packaging_price_pub / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        response.packaging_price_pub.toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto .kit-help .balloon-container .kg-cargo"
    ).html(
      (response.sum_cost_price.auto_regular / response.total_weight).toFixed(
        2
      ) +
        "$" +
        semicolonHelpTspan +
        (
          (response.sum_cost_price.auto_regular / response.total_weight) *
          dollar
        ).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto .kit-help .balloon-container .sum-cargo"
    ).html(
      response.sum_cost_price.auto_regular.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.sum_cost_price.auto_regular * dollar).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto .kit-help .balloon-container .redeem-commission"
    ).html(
      ((response.commission_price * yuan) / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.commission_price * yuan).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto .kit-help .balloon-container .insurance"
    ).html(
      response.insurance.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.insurance * dollar).toFixed(2) +
        "₽"
    );
  }

  cargoCalcButton.on("click", function (event) {
    event.stopPropagation();
    event.preventDefault();
    if (_tmr) {
      _tmr.push({ type: "reachGoal", id: 3555455, goal: "calculate_button" });
    }
    changeArrivalSaide();
    trackAndSendAjaxRequests();
    event.stopPropagation();
    event.preventDefault();
  });
  cargoDimensionsCalcButton.on("click", function (event) {
    event.stopPropagation();
    event.preventDefault();
    if (_tmr) {
      _tmr.push({ type: "reachGoal", id: 3555455, goal: "calculate_button" });
    }
    changeArrivalSaide();
    trackAndSendDimensionsAjaxRequests();
    event.stopPropagation();
    event.preventDefault();
  });

  let $boxing = $(".boxing");
  if (dimensions.is(":checked")) {
    $boxing.off("change");
    if (_tmr) {
      _tmr.push({ type: "reachGoal", id: 3555455, goal: "calculate_button" });
    }
    $boxing.on("change", trackAndSendAjaxRequests);
  } else {
    $boxing.off("change");
    if (_tmr) {
      _tmr.push({ type: "reachGoal", id: 3555455, goal: "calculate_button" });
    }
    $boxing.on("change", trackAndSendDimensionsAjaxRequests);
  }

  dimensions.on("change", function () {
    if (!dimensions.is(":checked")) {
      // Чекбокс отмечен, продолжаем отслеживать изменения в полях
      $boxing.off("change");
      if (_tmr) {
        _tmr.push({ type: "reachGoal", id: 3555455, goal: "calculate_button" });
      }
      $boxing.on("change", trackAndSendDimensionsAjaxRequests);
    } else {
      // Чекбокс не отмечен, останавливаем отслеживание изменений в полях
      $boxing.off("change");
      if (_tmr) {
        _tmr.push({ type: "reachGoal", id: 3555455, goal: "calculate_button" });
      }
      $boxing.on("change", trackAndSendAjaxRequests);
    }
  });

  let $offerButtons = $(".offer-button");
  $offerButtons.on("click", function (event) {
    event.stopPropagation();
    event.preventDefault();

    if (document.querySelector(".list-help.selected")) {
      if (_tmr) {
        _tmr.push({ type: "reachGoal", id: 3555455, goal: "calculate_offer" });
      }
      ajaxOfferDataRequest(
        document
          .querySelector(".list-help.selected")
          .closest(".desc")
          .querySelector(".delivery-types-dropdown").dataset.delivery_type,
        document
          .querySelector(".list-help.selected")
          .closest(".desc")
          .querySelector(".delivery-item-label")
          .textContent.trim(),
        document
          .querySelector(".list-help.selected")
          .querySelector(".tk-type")
          .textContent.trim()
      );
      // document.querySelector('.pop-up-dark-back-offer').style.display = 'flex';
    }
    event.stopPropagation();
    event.preventDefault();
  });

  // let $offerButton = $(".pop-up-offer-button");
  // $offerButton.on('click', function (event) {
  //     event.stopPropagation();
  //     event.preventDefault();
  //     let notice = document.querySelector('.pop-up-email').nextElementSibling;
  //     if (document.querySelector('.pop-up-email').value !== '') {
  //         if (document.querySelector('.list-help.selected')) {
  //             ajaxOfferDataRequest(
  //                 document.querySelector('.list-help.selected').closest('.desc').querySelector('.delivery-types-dropdown').dataset.delivery_type,
  //                 document.querySelector('.list-help.selected').closest('.desc').querySelector('.delivery-item-label').textContent.trim(),
  //             );
  //         }
  //         hideNoticePopUp();
  //     }
  //     else {
  //         notice.textContent = "заполните " + '"EMail"';
  //         notice.style.display = 'block'; // Отобразить надпись
  //         document.querySelector('.pop-up-email').style.border = '1px solid #a81d29';
  //     }
  //     event.stopPropagation();
  //     event.preventDefault();
  // });
}

// function hideNoticePopUp() {
//     let notice = document.querySelector('.pop-up-email').nextElementSibling;
//     notice.style.display = 'none'; // Скрыть надпись
//     document.querySelector('.pop-up-email').style.border = ''; // Убрать красную рамку поля
// }

function showAwait(costElemName, deliveryName, onShow) {
  let costElem = $(`${costElemName}.${deliveryName}`);

  let clocks = costElem
    .map(function () {
      let currentCostElem = $(this);
      let clocks = currentCostElem.closest("li").find(".clock");
      return clocks.get();
    })
    .get();

  let markers = costElem
    .map(function () {
      let currentCostElem = $(this);
      let markers = currentCostElem.closest("li").find(".marker");
      return markers.get();
    })
    .get();

  let overlays = costElem
    .map(function () {
      let currentCostElem = $(this);
      let overlays = currentCostElem
        .closest("li")
        .find(".overlay-delivery-item");
      return overlays.get();
    })
    .get();

  if (onShow) {
    $(clocks).show();
    $(markers).css("animation-play-state", "running");
    $(markers).show();
    $(overlays).show();
    $(overlays).parent().removeClass("enable-pointer");
  } else {
    $(clocks).hide();
    $(markers).css("animation-play-state", "paused");
    $(markers).hide();
    $(overlays).hide();
    $(overlays).parent().addClass("enable-pointer");
  }
}

function prepFields() {
  let boxingContentContainer = document.querySelector(
    ".boxing-content-container"
  );
  if (boxingContentContainer) {
    boxingContentContainer.classList.remove("hidden");
  }
  const selectors = [
    ".kg",
    ".sum .sum-dollar",
    ".sum .sum-rub",
    ".balloon-container .sum",
    ".balloon-container .exchange-rate-elem-dollar",
    ".balloon-container .exchange-rate-elem-yuan",
    ".boxing-type",
    ".packaging-price",
    ".redeem-commission",
    ".insurance",
    ".kg-cargo",
    ".sum-cargo",
  ];

  selectors.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      if (element.classList.contains("kg")) {
        element.innerHTML = "$н/д - ₽н/д";
      } else {
        element.innerHTML = "н/д";
      }
    });
  });
}

function setUnavailableField(cells, name) {
  let unavailableField = document.createElement("div");
  unavailableField.innerHTML = `Сервис ${name}<br>временно недоступен`;
  unavailableField.classList.add("unavailable-field");
  unavailableField.style.background = "rgba(47, 55, 67)";
  cells.forEach((cell) => {
    cell.classList.remove("enable-pointer");
    cell.parentElement.insertBefore(unavailableField.cloneNode(true), cell);
  });
}

function deleteUnavailableField(cells) {
  cells.forEach((cell) => {
    cell.classList.add("enable-pointer");
    let liElem = cell.parentElement;
    let unavailableField = liElem.querySelector(".unavailable-field");
    if (unavailableField) {
      liElem.removeChild(unavailableField);
    }
  });
}

async function sendOrderDataForEmail(
  requestData,
  clientName,
  clientPhone,
  isClientExist
) {
  let emailData = { ...requestData }; // Копируем данные из requestData
  emailData.SITE_ID = "s3"; // Добавляем SITE_ID
  emailData.sessid = BX.message("bitrix_sessid"); // Добавляем идентификатор сессии

  let formData = new FormData();

  for (const key in emailData) {
    if (emailData.hasOwnProperty(key)) {
      formData.append(key, emailData[key]);
    }
  }

  if (emailData.clause === "ransom" || emailData.clause === "ransom-white") {
    let blobRedeem = await submitRedeemData(); // \calc-layout\js\submit_redeem_data.js
    formData.append(
      "redeemFile",
      new File([blobRedeem], "Данные для выкупа заказа.xlsx", {
        type: blobRedeem.type,
      })
    );
  }
  formData.append("name", clientName);
  formData.append("phone", clientPhone);
  formData.append("isClientExist", isClientExist);
  formData.set("clause", emailData.clause === "self-purchase" ? "Нет" : "Да");

  let query = {
    action:
      "telegram:document.api.OrderDataController.send_order_data_by_email", // Определяем маршрут для второго запроса
  };

  let options = {
    type: "POST",
    url: "/bitrix/services/main/ajax.php?" + $.param(query),
    data: formData,
    contentType: false,
    processData: false,
    dataType: "json",
  };

  return $.ajax(options)
    .then(function (response) {
      console.log("Данные успешно отправлены:", response);
      return response;
    })
    .catch(function (error) {
      console.error("Ошибка при отправке данных:", error);
      return { error: error };
    });
}

function outArrivalCityRusTK() {
  document.querySelectorAll(".arrival-city-rus-tk").forEach((cityRusTK) => {
    cityRusTK.innerHTML += ` - до г. ${arrivalCityRusTK}`;
  });
}

function getFloatMeter(value) {
  return parseFloat(value.replace(/,/g, ".")) / 100;
}

function showInvalidMessage() {
  let notice = document.querySelector(".input-notice-valid-number");
  if (notice) {
    notice.style.display = "block";
    notice.textContent = "Неверный номер";
    let inputPhone = notice.parentElement.querySelector(
      ".client-requisites-input.phone"
    );
    if (inputPhone) {
      inputPhone.style.color = "#ed5555";
    }
  }
} /* Start:"a:4:{s:4:"full";s:59:"/calc-layout/js/ajax_request_tnved_calc.js?1729330411101219";s:6:"source";s:42:"/calc-layout/js/ajax_request_tnved_calc.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
/* End */
goodData = {
  totalWeight: 0,
  totalVolume: 0,
  totalCost: 0,
  count: 0,
  packagingPrice: 0,
  typeOfPackaging: "",
  ransomGoods: 0,
};
function initializeTnvedAjaxRequest() {
  // Находим кнопку "Рассчитать" по классу
  let calculateButton = $("#white-calc-button");
  calculateButton =
    calculateButton.length > 0
      ? calculateButton
      : $("#cargo-white-calc-button");
  let $arrival = $("input[name='arrival']");
  let totalWeight;
  let totalVolume;
  let totalCost;
  let totalDuty;
  let totalNds;
  let sumDuty;
  let sumRateSaide;
  let sumRateSaideRub;
  const RateSaide = 0.7;
  let exchangeRateSaide;
  let totalCustoms;
  let totalCustomsRub;
  let fees;
  let total;
  let totalRub;
  let kg;
  let kgRub;
  let license;
  let certificate;
  let codes;
  let postfix = "";
  let semicolon = '<span style="color: white">; </span>';
  let semicolonHelp = '<span style="color: black">; </span>';
  let semicolonHelpTspan = '<tspan fill="black">; </tspan>';
  let packagingPrice = 0;
  let boxing;
  let $insurance = $("input[name='insurance']");
  let typeOfPackaging = "";
  let ransomGoods = 0;
  let yuan = 0;
  let successPackaging = false;
  let successRedeem = false;
  let usdRate;
  if (activeButton.dataset.type === "comparison") {
    postfix = " .delivery-types-list-comparison.white";
  }

  async function sendWhiteMultipleAjaxRequests() {
    const submitButton = document.querySelector(
      ".tnved-calc-button:not(.submit-excel-file)"
    );
    submitButton.disabled = true;
    const boxingExpandButton = document.querySelector(".boxing-spoiler-header");
    boxingExpandButton.style.pointerEvents = "none";
    boxingExpandButton.parentElement.style.background = "grey";
    const calcTypeButtons = document.querySelectorAll(
      ".calc-type-button:not(.tnved-calc-button.submit-redeem-data.submit-excel-file):not(.submit-general-button):not(.submit-dimensions-button)"
    );
    calcTypeButtons.forEach((calcTypeButton) => {
      calcTypeButton.setAttribute("disabled", "");
    });
    $(".list-elem").removeClass("enable-pointer");
    $(".list-elem.selected").removeClass("selected");
    disableBoxingButtons();
    document.querySelector(".main-offer-button").setAttribute("disabled", "");
    try {
      const whiteResponse = await sendWhiteGeneralAjaxRequest();
      if (!whiteResponse) {
        // Если cargoResponse не был получен, выходите из функции
        submitButton.disabled = false;
        boxingExpandButton.style.pointerEvents = "all";
        boxingExpandButton.parentElement.style.background = "#141a24";
        calcTypeButtons.forEach((calcTypeButton) => {
          calcTypeButton.removeAttribute("disabled");
        });
        enableBoxingButtons();
        return;
      }
      // Отправляем остальные запросы, передавая cargoResponse
      await Promise.all([
        sendDLAjaxRequest(whiteResponse),
        sendPEKAjaxRequest(whiteResponse),
        sendJDEAjaxRequest(whiteResponse),
        sendKITAjaxRequest(whiteResponse),
      ]);
    } catch (error) {
      console.log("Ошибка при отправке запроса:", error);
    } finally {
      submitButton.disabled = false;
      boxingExpandButton.style.pointerEvents = "all";
      boxingExpandButton.parentElement.style.background = "#141a24";
      calcTypeButtons.forEach((calcTypeButton) => {
        calcTypeButton.removeAttribute("disabled");
      });
      enableBoxingButtons();
    }
  }

  function sumCustoms(response) {
    sumDuty = 0;
    totalDuty = 0;
    totalNds = 0;
    exchangeRateSaide = response.dollar;
    yuan = response.yuan;
    sumRateSaide = 0;
    sumRateSaideRub = 0;
    fees = 0;
    totalCustoms = 0;
    totalCustomsRub = 0;
    total = 0;
    totalRub = 0;
    kg = 0;
    kgRub = 0;
    license = [];
    certificate = [];
    codes = [];
    isDataReceived = true;

    response.RESULT.ITEMS.forEach(function (item) {
      totalDuty += item.DUTY;
      totalNds += item.NDS;
      codes.push(item.TNVED_NAME.match(/\[(.*?)\]/)[1]);
      if (item["LICIMP_PR"]) {
        license.push("Нужна, но есть ограничения.");
      } else {
        license.push(item["LICENSE"] ? "Да, нужна" : "Нет");
      }
      if (item["SAFETY_PR"]) {
        certificate.push("Нужен, но есть ограничения.");
      } else {
        certificate.push(item["SAFETY"] ? "Да, нужен." : "Нет");
      }
      let impPrintValue = parseFloat(item.IMP_PRINT.match(/[\d.]+/));
      sumDuty += impPrintValue;
    });

    usdRate = parseFloat(response.RATES.USD.UF_RATE);

    sumDuty = sumDuty + " €/кг";
    totalDuty = (totalDuty / usdRate).toFixed(2);
    totalNds = (totalNds / usdRate).toFixed(2);
    sumRateSaide = (RateSaide * totalWeight + packagingPrice).toFixed(2);
    sumRateSaideRub = (sumRateSaide * response.dollar).toFixed(2);
    fees = (response.RESULT.DUTY2 / usdRate).toFixed(2);
    totalCustoms = (response.RESULT.TOTAL / usdRate).toFixed(2);
    totalCustomsRub = response.RESULT.TOTAL.toFixed(2);
    total = parseFloat(
      (parseFloat(totalCustoms) + parseFloat(sumRateSaide)).toFixed(2)
    );
    totalRub = (response.RESULT.TOTAL + parseFloat(sumRateSaideRub)).toFixed(2);
    kg = parseFloat((total / totalWeight).toFixed(2));
    kgRub = parseFloat((totalRub / totalWeight).toFixed(2));
  }

  function ajaxWhiteOfferDataRequest(deliveryType, deliveryTypeRus, tkType) {
    if (offerData) {
      sumCustoms(offerData);
      let tkData;
      if (tkType === "ИТОГ (Белая+Saide):") {
        tkData = false;
      }
      if (tkType === "ЖДЭ (до вашего города)") {
        tkData = offerDataJDE;
      }
      if (tkType === "ПЭК (до вашего города)") {
        tkData = offerDataPEK;
      }
      if (tkType === "Деловые линии (до вашего города)") {
        tkData = offerDataDL;
      }
      if (tkType === "КИТ (до вашего города)") {
        tkData = offerDataKIT;
      }
      let offerDataRequest = {
        sumDuty: "ПОШЛИНА: " + sumDuty,
        NDS: "НДС: " + "20%",
        Saide: "ПЕРЕВОЗКА SAIDE: 0.7$/кг",
        totalDuty: "СУММ. ПОШЛИНА: " + totalDuty + "$",
        totalNds: "CУММ. НДС: " + totalNds + "$",
        totalCustoms:
          "ТАМОЖНЯ: " + totalCustoms + "$; " + totalCustomsRub + "₽",
        fees: "Сборы: " + fees + "$",
        ExchangeRateYuan: "Курс юаня SAIDE: " + offerData.yuan + "₽",
        ExchangeRateDollar: "Курс доллара SAIDE: " + offerData.dollar + "₽",
        TOTAL:
          "Стоимость до г. Благовещенск (Тамож.+Saide): " +
          (total + goodData.packagingPrice).toFixed(2) +
          "$; " +
          (
            parseFloat(totalRub) +
            goodData.packagingPrice * exchangeRateSaide
          ).toFixed(2) +
          "₽",
        TOTALTK: tkData
          ? "Стоимость до г. " +
            $arrival.val() +
            " (Терм. ТК " +
            tkType.split(" (до вашего города)")[0] +
            "): " +
            (
              total +
              goodData.packagingPrice +
              tkData.sum_cost_price[deliveryType]
            ).toFixed(2) +
            "$; " +
            (
              parseFloat(totalRub) +
              goodData.packagingPrice * exchangeRateSaide +
              tkData.sum_cost_price_rub[deliveryType]
            ).toFixed(2) +
            "₽"
          : "",
        GoodsCost:
          "Стоимость товара: " +
          goodData.totalCost.toFixed(2) +
          "$; " +
          (goodData.totalCost * dollarGlobal).toFixed(2) +
          "₽",
        Weight: "Вес: " + goodData.totalWeight + "кг",
        Volume:
          "Объем: " + goodData.totalVolume + "м" + String.fromCharCode(0x00b3),
        RedeemCommissionFirst: "Комиссия SAIDE 5%",
        RedeemCommission:
          "от стоимости товара: " +
          ((goodData.ransomGoods * offerData.yuan) / offerData.dollar).toFixed(
            2
          ) +
          "$; " +
          (goodData.ransomGoods * offerData.yuan).toFixed(2) +
          "₽",
        Items: offerData.RESULT.ITEMS,
        SumSaide:
          "Стоимость перевозки SAIDE (до г. Благовещенск 0.7$/кг): " +
          sumRateSaide +
          "$; " +
          sumRateSaideRub +
          "₽",
        PackageType: "Упаковка: " + goodData.typeOfPackaging,
        PackageCost: "За упаковку: " + goodData.packagingPrice + "₽",
        Kg:
          "За кг: " +
          ((parseFloat(kg) + goodData.packagingPrice) / totalWeight).toFixed(
            2
          ) +
          "$; " +
          (
            ((parseFloat(kgRub) + goodData.packagingPrice) *
              exchangeRateSaide) /
            goodData.totalWeight
          ).toFixed(2) +
          "₽ (Тамож. + SAIDE до г. Благовещенск)",
        Sum:
          "Стоимость: " +
          (total + goodData.packagingPrice).toFixed(2) +
          "$; " +
          (
            parseFloat(totalRub) +
            goodData.packagingPrice * exchangeRateSaide
          ).toFixed(2) +
          "₽ (Тамож. + SAIDE до г. Благовещенск)",
        tkType: tkType,
        tkData: tkData
          ? {
              kgTk:
                "За кг: " +
                tkData.cost_price[deliveryType] +
                "$; " +
                tkData.cost_price_rub[deliveryType] +
                "₽ " +
                "(г. Благовещенск - г. " +
                $arrival.val() +
                ")",
              sumTk:
                "Стоимость: " +
                tkData.sum_cost_price[deliveryType].toFixed(2) +
                "$; " +
                tkData.sum_cost_price_rub[deliveryType].toFixed(2) +
                "₽ " +
                "(г. Благовещенск - г. " +
                $arrival.val() +
                ")",
              kgTotal:
                "За кг до г. " +
                $arrival.val() +
                " (Терм. ТК " +
                tkType.split(" (до вашего города)")[0] +
                " ): " +
                (parseFloat(kg) + tkData.cost_price[deliveryType]).toFixed(2) +
                "$; " +
                (
                  parseFloat(kgRub) + tkData.cost_price_rub[deliveryType]
                ).toFixed(2) +
                "₽",
              sumTotal:
                "Общая стоимость до г. " +
                $arrival.val() +
                " (Терм. ТК " +
                tkType.split(" (до вашего города)")[0] +
                " ): " +
                (total + tkData.sum_cost_price[deliveryType]).toFixed(2) +
                "$; " +
                (
                  parseFloat(totalRub) + tkData.sum_cost_price_rub[deliveryType]
                ).toFixed(2) +
                "₽",
              varyKg: " (варьир.)",
              varySum: " (варьир.)",
            }
          : "",
        USD_RATE: usdRate,
      };

      showModal("Идёт передача данных менеджеру, пожалуйста, подождите... ");
      let countdown = 20;
      countdownTimer = setInterval(function () {
        updateModalMessage(
          "Идёт передача данных менеджеру, пожалуйста, подождите... " +
            countdown +
            " сек."
        );
        countdown--;
        if (countdown < 0) {
          clearInterval(countdownTimer);
        }
      }, 1000);

      $.ajax({
        type: "POST",
        url: "https://api-calc.wisetao.com:4343/api/get-offer-white",
        data: offerDataRequest,
        xhrFields: {
          responseType: "blob",
        },
        success: function (response) {
          // Создаем объект URL из ответа
          let url = URL.createObjectURL(response);

          // Создаем временную ссылку для открытия в новой вкладке
          let aOpen = document.createElement("a");
          aOpen.href = url;
          aOpen.target = "_blank";

          // Симулируем клик по ссылке для открытия в новой вкладке
          document.body.appendChild(aOpen);
          aOpen.click();
          document.body.removeChild(aOpen);

          // Создаем временную ссылку для скачивания файла
          let aDownload = document.createElement("a");
          aDownload.href = url;
          aDownload.download = "Коммерческое предложение.pdf";

          // Симулируем клик по ссылке для скачивания файла
          document.body.appendChild(aDownload);
          aDownload.click();
          document.body.removeChild(aDownload);

          // Освобождаем ресурсы URL
          URL.revokeObjectURL(url);

          submitRedeemData(response);

          console.log("Успешно отправлено!");
          console.log("Ответ сервера:", response);
        },
        error: function (error) {
          clearInterval(countdownTimer);
          hideModal();
        },
      });
    }
  }

  async function sendWhiteGeneralAjaxRequest() {
    let isAllInputFieldsFilled = true;
    let activeCheckbox = $(".boxing:checked");
    boxing = activeCheckbox.length > 0 ? activeCheckbox.attr("name") : null;
    let insurance = $insurance.is(":checked") ? $insurance.attr("name") : null;
    $(".tnved-data-container input")
      .add($arrival)
      .each(function () {
        if (!$(this).hasClass("select-by-name-input")) {
          if ($(this).val() === "") {
            isAllInputFieldsFilled = false;
            return false;
          }
        }
      });
    let isRansom =
      $("input[name='delivery-option']:checked").val() === "delivery-only";
    let clientName = document.querySelector('input[name="client-name"]').value;
    let clientPhone = document.querySelector(
      'input[name="client-phone"]'
    ).value;
    let numberIsValid = await validateNumber(clientPhone);
    if (!numberIsValid) {
      showInvalidMessage();
    }
    if (
      isAllInputFieldsFilled &&
      ((!isRansom &&
        (validateFields() ||
          !!document.querySelector(".selected-file-name")?.childNodes[3])) ||
        isRansom)
    ) {
      activateDeliveryPicks();
      let requestData = {
        "date-currency": "",
        action: "customs-calculator-calculate",
        "costs-to-border": "0",
        "costs-to-border-currency": "USD",
        items: [],
      };
      totalWeight = 0;
      totalVolume = 0;
      totalCost = 0;

      let currencySign = $(".tnved-currency .dropdown-toggle")
        .contents()
        .first()
        .text()
        .trim();

      let redeemCommission = isRansom ? "self-purchase" : "ransom-white";
      items = [];
      let itemsForBitrix = [];
      $(".tnved-data-container").each(function () {
        let weight = parseFloat($(this).find('[name="weight[]"]').val());
        let volume = parseFloat($(this).find('[name="volume[]"]').val());
        let currency = parseFloat($(this).find('[name="currency[]"]').val());
        totalWeight += weight;
        totalVolume += volume;
        totalCost +=
          $(this).find(".dropdown-toggle").data("currency") === "USD"
            ? currency
            : $(this).find(".dropdown-toggle").data("currency") === "CNY"
            ? (currency * yuanGlobal) / dollarGlobal
            : currency / dollarGlobal;
        let item = {
          code: $(this).find('[name="tnved_code[]"]').val().replace(/\s/g, ""),
          price: $(this).find('[name="currency[]"]').val(),
          "price-currency": $(this).find(".dropdown-toggle").data("currency"),
          weight: weight,
          country: 1,
        };
        let itemForBitrix = {
          good_name: $(this).find(".select-by-name-input").attr("placeholder"),
          volume: volume,
        };
        items.push(item);
        itemsForBitrix.push(Object.assign({}, item, itemForBitrix));
        requestData.items.push(item);
      });
      requestData.itemsForBitrix = JSON.stringify(itemsForBitrix);
      requestData.clause = redeemCommission;
      requestData.calc_type = "Белая доставка";
      requestData.total_volume = totalVolume;
      requestData.total_weight = totalWeight;
      requestData.boxing = boxing;
      requestData.arrival = $arrival.val();
      goodData.totalCost = totalCost;
      goodData.totalWeight = totalWeight;
      goodData.totalVolume = totalVolume;
      sendClientData(clientName, clientPhone).then((isClientExist) => {
        sendOrderDataForEmail(
          requestData,
          clientName,
          clientPhone,
          isClientExist
        )
          .then(function (emailResponse) {
            console.log("Данные успешно отправлены на email:", emailResponse);
          })
          .catch(function (emailError) {
            console.error("Ошибка при отправке данных на email:", emailError);
          });
      });
      return new Promise((resolve, reject) => {
        showAwait(".white-cost-elem", "white", true);
        isDataReceived = false;
        let promises = [];
        $.ajax({
          url: "https://api-calc.wisetao.com:4343/api/get-tnved-calculation",
          type: "POST",
          data: requestData,
          success: function (response) {
            if (boxing !== null || redeemCommission === "ransom-white") {
              if (boxing !== null) {
                let requestPackagingPrice = {
                  boxing: boxing,
                  volume: totalVolume,
                };
                promises.push(
                  new Promise((resolvePackaging, rejectPackaging) => {
                    $.ajax({
                      url: "https://api-calc.wisetao.com:4343/api/get-boxing-price",
                      type: "POST",
                      data: requestPackagingPrice,
                      success: function (packagingResponse) {
                        packagingPrice = packagingResponse.packaging_price;
                        typeOfPackaging = packagingResponse.type_of_packaging;
                        goodData.packagingPrice =
                          packagingResponse.packaging_price;
                        goodData.typeOfPackaging =
                          packagingResponse.type_of_packaging;
                        resolvePackaging();
                      },
                      error: function (error) {
                        console.error("Ошибка при выполнении запроса: ", error);
                        rejectPackaging(error);
                      },
                    });
                  })
                );
              }
              if (redeemCommission === "ransom-white") {
                let requestRedeem = {
                  ransom: redeemCommission,
                  total_cost: totalCost,
                  currency_sign: "$",
                };
                promises.push(
                  new Promise((resolveRedeem, rejectRedeem) => {
                    $.ajax({
                      url: "https://api-calc.wisetao.com:4343/api/get-redeem-commission",
                      type: "POST",
                      data: requestRedeem,
                      success: function (redeemResponse) {
                        ransomGoods = redeemResponse.ransom;
                        goodData.ransomGoods = ransomGoods;
                        resolveRedeem();
                      },
                      error: function (error) {
                        console.error("Ошибка при выполнении запроса: ", error);
                        rejectRedeem(error);
                      },
                    });
                  })
                );
              }
              Promise.all(promises)
                .then(() => {
                  showAwait(".white-cost-elem", "white", false);
                  sumCustoms(response);
                  offerData = response;
                  updatePageWithWhiteResponse(response);
                  console.log(response);
                  resolve(response);
                })
                .catch((error) => {
                  console.error("Ошибка при выполнении запроса: ", error);
                  reject(error);
                });
            } else {
              showAwait(".white-cost-elem", "white", false);
              typeOfPackaging = "коробка";
              goodData.typeOfPackaging = "коробка";
              ransomGoods = 0;
              goodData.ransomGoods = ransomGoods;
              sumCustoms(response);
              offerData = response;
              updatePageWithWhiteResponse(response);
              console.log(response);
              resolve(response);
            }
          },
          error: function (error) {
            console.error("Ошибка при выполнении запроса: ", error);
            showAwait(".white-cost-elem", "white", false);
            resolve(reject);
          },
        });
      });
    } else {
      console.log("Заполните все поля ввода перед рассчетом.");
      let inputs = document.querySelectorAll(".tnved-data-container input");

      inputs.forEach(function (input) {
        let event = new Event("blur");
        input.dispatchEvent(event);
      });
    }
  }

  calculateButton.on("click", function (event) {
    // Проверяем, что все поля ввода заполнены
    event.preventDefault();
    if (_tmr) {
      _tmr.push({ type: "reachGoal", id: 3555455, goal: "calculate_button" });
    }
    if (
      activeButton.dataset.type === "white" ||
      activeButton.dataset.type === "comparison"
    ) {
      prepFields();
      cleanFieldsWhite();
      sendWhiteMultipleAjaxRequests().catch(() => {});
    }
    event.preventDefault();
    event.stopPropagation();
  });

  let $offerButtons = $(".offer-button");
  $offerButtons.on("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    if (
      document
        .querySelector(".list-help.selected")
        .closest("ul")
        .firstElementChild.querySelector("li .list-help")
        .classList.contains("white-help")
    ) {
      if (_tmr) {
        _tmr.push({ type: "reachGoal", id: 3555455, goal: "calculate_offer" });
      }
      ajaxWhiteOfferDataRequest(
        document
          .querySelector(".list-help.selected")
          .closest(".desc")
          .querySelector(".delivery-types-dropdown").dataset.delivery_type,
        document
          .querySelector(".list-help.selected")
          .closest(".desc")
          .querySelector(".delivery-types-dropdown").dataset.delivery_type_rus,
        document
          .querySelector(".list-help.selected")
          .querySelector(".tk-type")
          .textContent.trim()
      );
      // document.querySelector('.pop-up-dark-back-offer').style.display = 'flex';
    }
    event.preventDefault();
    event.stopPropagation();
  });

  // let $offerButton = $(".pop-up-offer-button");
  // $offerButton.on('click', function (event) {
  //     event.stopPropagation();
  //     event.preventDefault();
  //     let notice = document.querySelector('.pop-up-email').nextElementSibling;
  //     if (document.querySelector('.pop-up-email').value !== '') {
  //         if (document.querySelector('.list-help.selected').closest('ul').firstElementChild.querySelector('li .list-help').classList.contains('white-help')) {
  //             ajaxWhiteOfferDataRequest(
  //                 document.querySelector('.list-help.selected').closest('.desc').querySelector('.delivery-types-dropdown').dataset.delivery_type,
  //                 document.querySelector('.list-help.selected').closest('.desc').querySelector('.delivery-types-dropdown').dataset.delivery_type_rus,
  //             );
  //         }
  //         hideNoticePopUp();
  //
  //     }
  //     else {
  //         notice.textContent = "заполните " + '"EMail"';
  //         notice.style.display = 'block'; // Отобразить надпись
  //         document.querySelector('.pop-up-email').style.border = '1px solid #a81d29';
  //     }
  //     event.stopPropagation();
  //     event.preventDefault();
  // });

  function handleBoxingChangeWhite() {
    if (
      activeButton.dataset.type === "white" ||
      activeButton.dataset.type === "comparison"
    ) {
      sendWhiteMultipleAjaxRequests().catch(() => {});
    }
  }

  let $boxing = $(".boxing");
  $boxing.off("change", handleBoxingChangeWhite);
  $boxing.on("change", handleBoxingChangeWhite);

  function sendDLAjaxRequest(response) {
    return new Promise((resolve, reject) => {
      showAwait(".white-cost-elem", "dl", true);
      $.ajax({
        type: "GET",
        url: "https://api-calc.wisetao.com:4343/api/calculate-dl-delivery",
        data: {
          arrival: $arrival.val(),
          total_volume: totalVolume,
          total_weight: totalWeight,
          // count: count,
          // max_dimension: maxDimension,
          from: "Благовещенск",
        },
        success: function (dlResponse) {
          updatePageWithDLResponse(response, dlResponse);
          showAwait(".white-cost-elem", "dl", false);
          dlResponse.tkType = "ДЛ";
          offerDataDL = dlResponse;
          console.log("Успешно отправлен второй запрос!");
          console.log("Ответ второго запроса:", dlResponse);
          resolve();
        },
        error: function (dlError) {
          // Обработка ошибки второго запроса
          console.error("Ошибка при отправке второго запроса:", dlError);
          showAwait(".white-cost-elem", "dl", false);
          reject(dlError);
        },
      });
    });
  }

  function sendPEKAjaxRequest(response) {
    // Отправляем третий запрос
    return new Promise((resolve, reject) => {
      showAwait(".white-cost-elem", "pek", true);
      $.ajax({
        type: "GET",
        url: "https://api-calc.wisetao.com:4343/api/calculate-pek-delivery",
        data: {
          arrival: $arrival.val(),
          total_volume: totalVolume,
          total_weight: totalWeight,
          // count: count,
          // max_dimension: maxDimension,
          from: "Благовещенск",
        },
        success: function (pekResponse) {
          updatePageWithPekResponse(response, pekResponse);
          showAwait(".white-cost-elem", "pek", false);
          pekResponse.tkType = "ПЕК";
          offerDataPEK = pekResponse;
          // Обработка успешного выполнения третьего запроса
          console.log("Успешно отправлен третий запрос!");
          console.log("Ответ сервера (третий запрос):", pekResponse);
          resolve();
          // Обновление значений на странице согласно третьему запросу
          // ... (обновления значений на странице согласно вашим требованиям)
        },
        error: function (error) {
          // Обработка ошибок при отправке третьего запроса
          console.error("Ошибка при отправке третьего запроса:", error);
          showAwait(".white-cost-elem", "pek", false);
          reject(error);
        },
      });
    });
  }

  function sendJDEAjaxRequest(response) {
    // Отправляем третий запрос
    return new Promise((resolve, reject) => {
      showAwait(".white-cost-elem", "jde", true);
      $.ajax({
        type: "GET",
        url: "https://api-calc.wisetao.com:4343/api/calculate-railway-expedition-delivery",
        data: {
          arrival: $arrival.val(),
          total_volume: totalVolume,
          total_weight: totalWeight,
          // count: count,
          // max_dimension: maxDimension,
          from: "Благовещенск",
        },
        success: function (jdeResponse) {
          updatePageWithJDEResponse(response, jdeResponse);
          // Выключаем анимацию и скрываем элементы с анимацией
          showAwait(".white-cost-elem", "jde", false);
          jdeResponse.tkType = "ЖДЭ";
          offerDataJDE = jdeResponse;
          // Обработка успешного выполнения третьего запроса
          console.log("Успешно отправлен четвертый запрос!");
          console.log("Ответ сервера (четвертый запрос):", jdeResponse);
          resolve();
          // Обновление значений на странице согласно третьему запросу
          // ... (обновления значений на странице согласно вашим требованиям)
        },
        error: function (error) {
          // Обработка ошибок при отправке третьего запроса
          console.error("Ошибка при отправке четвертого запроса:", error);
          reject(error);
          // Выключаем анимацию и скрываем элементы с анимацией
          showAwait(".white-cost-elem", "jde", false);
        },
      });
    });
  }

  function sendKITAjaxRequest(response) {
    // Отправляем пятый запрос
    return new Promise((resolve, reject) => {
      showAwait(".white-cost-elem", "kit", true);
      $.ajax({
        type: "GET",
        url: "https://api-calc.wisetao.com:4343/api/calculate-kit-delivery",
        data: {
          arrival: $arrival.val(),
          total_volume: totalVolume,
          total_weight: totalWeight,
          // count: count,
          // max_dimension: maxDimension,
          price: totalCost,
          from: "Благовещенск",
        },
        success: function (kitResponse) {
          updatePageWithKITResponse(response, kitResponse);
          showAwait(".white-cost-elem", "kit", false);
          kitResponse.tkType = "КИТ";
          offerDataKIT = kitResponse;
          // Обработка успешного выполнения пятого запроса
          console.log("Успешно отправлен пятый запрос!");
          console.log("Ответ сервера (пятый запрос):", kitResponse);
          resolve();
          // Обновление значений на странице согласно пятому запросу
          // ... (обновления значений на странице согласно вашим требованиям)
        },
        error: function (error) {
          // Обработка ошибок при отправке пятого запроса
          showAwait(".white-cost-elem", "kit", false);
          console.error("Ошибка при отправке пятого запроса:", error);
          reject(error);
        },
      });
    });
  }

  function updatePageWithWhiteResponse(response) {
    $("#delivery-types-dropdown-auto" + postfix + " .cost-elem.white .kg").html(
      "$" +
        (kg + packagingPrice / totalWeight).toFixed(2) +
        " - " +
        "₽" +
        (kgRub + (packagingPrice * exchangeRateSaide) / totalWeight).toFixed(2)
    );
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .cost-elem.white .sum .sum-dollar"
    ).html("$" + (total + packagingPrice).toFixed(2));
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .cost-elem.white .sum .sum-rub"
    ).html(
      "₽" +
        (parseFloat(totalRub) + packagingPrice * exchangeRateSaide).toFixed(2)
    );

    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .white-help .balloon-container .total"
    ).html(
      (total + packagingPrice).toFixed(2) +
        "$" +
        semicolonHelp +
        (parseFloat(totalRub) + packagingPrice * exchangeRateSaide).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .white-help .balloon-container .total-customs"
    ).html(totalCustoms + "$" + semicolonHelp + totalCustomsRub + "₽");
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .white-help .balloon-container .sum-saide"
    ).html(sumRateSaide + "$" + semicolonHelp + sumRateSaideRub + "₽");
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .white-help .balloon-container .fees"
    ).text(fees + "$");
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .white-help .balloon-container .total-nds"
    ).text(totalNds + "$");
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .white-help .balloon-container .total-duty"
    ).text(totalDuty + "$");
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .white-help .balloon-container .redeem-commission"
    ).html(
      ((ransomGoods * yuan) / exchangeRateSaide).toFixed(2) +
        "$" +
        semicolonHelp +
        (ransomGoods * yuan).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .white-help .balloon-container .packaging-price"
    ).html(
      packagingPrice +
        "$" +
        semicolonHelp +
        (packagingPrice * exchangeRateSaide).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .white-help .balloon-container .boxing-type"
    ).text(typeOfPackaging);
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .white-help .balloon-container .exchange-saide"
    ).html(
      "$: " + exchangeRateSaide + "₽" + semicolonHelp + " ¥: " + yuan + "₽"
    );
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .white-help .balloon-container .sum-duty"
    ).text(sumDuty);

    // Обновляем значения для delivery-types-dropdown-fast-auto
    $(
      "#delivery-types-dropdown-fast-auto" + postfix + " .cost-elem.white .kg"
    ).html(
      "$" +
        (kg + packagingPrice / totalWeight).toFixed(2) +
        " - " +
        "₽" +
        (kgRub + (packagingPrice * exchangeRateSaide) / totalWeight).toFixed(2)
    );
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .cost-elem.white .sum .sum-dollar"
    ).html("$" + (total + packagingPrice).toFixed(2));
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .cost-elem.white .sum .sum-rub"
    ).html(
      "₽" +
        (parseFloat(totalRub) + packagingPrice * exchangeRateSaide).toFixed(2)
    );
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .white-help .balloon-container .total"
    ).html(
      (total + packagingPrice).toFixed(2) +
        "$" +
        semicolonHelp +
        (parseFloat(totalRub) + packagingPrice * exchangeRateSaide).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .white-help .balloon-container .total-customs"
    ).html(totalCustoms + "$" + semicolonHelp + totalCustomsRub + "₽");
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .white-help .balloon-container .sum-saide"
    ).html(sumRateSaide + "$" + semicolonHelp + sumRateSaideRub + "₽");
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .white-help .balloon-container .fees"
    ).text(fees + "$");
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .white-help .balloon-container .total-nds"
    ).text(totalNds + "$");
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .white-help .balloon-container .total-duty"
    ).text(totalDuty + "$");
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .white-help .balloon-container .redeem-commission"
    ).html(
      ((ransomGoods * yuan) / exchangeRateSaide).toFixed(2) +
        "$" +
        semicolonHelp +
        (ransomGoods * yuan).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .white-help .balloon-container .packaging-price"
    ).html(
      packagingPrice +
        "$" +
        semicolonHelp +
        (packagingPrice * exchangeRateSaide).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .white-help .balloon-container .boxing-type"
    ).text(typeOfPackaging);
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .white-help .balloon-container .exchange-saide"
    ).html(
      "$: " + exchangeRateSaide + "₽" + semicolonHelp + " ¥: " + yuan + "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .white-help .balloon-container .sum-duty"
    ).text(sumDuty + "$");

    // Обновляем значения для delivery-types-dropdown-railway
    $(
      "#delivery-types-dropdown-railway" + postfix + " .cost-elem.white .kg"
    ).html(
      "$" +
        (kg + packagingPrice / totalWeight).toFixed(2) +
        " - " +
        "₽" +
        (kgRub + (packagingPrice * exchangeRateSaide) / totalWeight).toFixed(2)
    );
    $(
      "#delivery-types-dropdown-railway" +
        postfix +
        " .cost-elem.white .sum .sum-dollar"
    ).html("$" + (total + packagingPrice).toFixed(2));
    $(
      "#delivery-types-dropdown-railway" +
        postfix +
        " .cost-elem.white .sum .sum-rub"
    ).html(
      "₽" +
        (parseFloat(totalRub) + packagingPrice * exchangeRateSaide).toFixed(2)
    );
    $(
      "#delivery-types-dropdown-railway" +
        postfix +
        " .white-help .balloon-container .balloon-container .total"
    ).html(
      (total + packagingPrice).toFixed(2) +
        "$" +
        semicolonHelp +
        (parseFloat(totalRub) + packagingPrice * exchangeRateSaide).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-railway" +
        postfix +
        " .white-help .balloon-container .total-customs"
    ).html(totalCustoms + "$" + semicolonHelp + totalCustomsRub + "₽");
    $(
      "#delivery-types-dropdown-railway" +
        postfix +
        " .white-help .balloon-container .sum-saide"
    ).html(sumRateSaide + "$" + semicolonHelp + sumRateSaideRub + "₽");
    $(
      "#delivery-types-dropdown-railway" +
        postfix +
        " .white-help .balloon-container .fees"
    ).text(fees + "$");
    $(
      "#delivery-types-dropdown-railway" +
        postfix +
        " .white-help .balloon-container .total-nds"
    ).text(totalNds + "$");
    $(
      "#delivery-types-dropdown-railway" +
        postfix +
        " .white-help .balloon-container .total-duty"
    ).text(totalDuty + "$");
    $(
      "#delivery-types-dropdown-railway" +
        postfix +
        " .white-help .balloon-container .redeem-commission"
    ).html(
      ((ransomGoods * yuan) / exchangeRateSaide).toFixed(2) +
        "$" +
        semicolonHelp +
        (ransomGoods * yuan).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-railway" +
        postfix +
        " .white-help .balloon-container .packaging-price"
    ).html(
      packagingPrice +
        "$" +
        semicolonHelp +
        (packagingPrice * exchangeRateSaide).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-railway" +
        postfix +
        " .white-help .balloon-container .boxing-type"
    ).text(typeOfPackaging);
    $(
      "#delivery-types-dropdown-railway" +
        postfix +
        " .white-help .balloon-container .exchange-saide"
    ).html(
      "$: " + exchangeRateSaide + "₽" + semicolonHelp + " ¥: " + yuan + "₽"
    );
    $(
      "#delivery-types-dropdown-railway" +
        postfix +
        " .white-help .balloon-container .sum-duty"
    ).text(sumDuty + "$");

    // Обновляем значения для delivery-types-dropdown-railway
    $("#delivery-types-dropdown-avia" + postfix + " .cost-elem.white .kg").html(
      "$" +
        (kg + packagingPrice / totalWeight).toFixed(2) +
        " - " +
        "₽" +
        (kgRub + (packagingPrice * exchangeRateSaide) / totalWeight).toFixed(2)
    );
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .cost-elem.white .sum .sum-dollar"
    ).html("$" + (total + packagingPrice).toFixed(2));
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .cost-elem.white .sum .sum-rub"
    ).html(
      "₽" +
        (parseFloat(totalRub) + packagingPrice * exchangeRateSaide).toFixed(2)
    );
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .white-help .balloon-container .total"
    ).html(
      (total + packagingPrice).toFixed(2) +
        "$" +
        semicolonHelp +
        (parseFloat(totalRub) + packagingPrice * exchangeRateSaide).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .white-help .balloon-container .total-customs"
    ).html(totalCustoms + "$" + semicolonHelp + totalCustomsRub + "₽");
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .white-help .balloon-container .sum-saide"
    ).html(sumRateSaide + "$" + semicolonHelp + sumRateSaideRub + "₽");
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .white-help .balloon-container .fees"
    ).text(fees + "$");
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .white-help .balloon-container .total-nds"
    ).text(totalNds + "$");
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .white-help .balloon-container .total-duty"
    ).text(totalDuty + "$");
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .white-help .balloon-container .redeem-commission"
    ).html(
      ((ransomGoods * yuan) / exchangeRateSaide).toFixed(2) +
        "$" +
        semicolonHelp +
        (ransomGoods * yuan).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .white-help .balloon-container .packaging-price"
    ).html(
      packagingPrice +
        "$" +
        semicolonHelp +
        (packagingPrice * exchangeRateSaide).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .white-help .balloon-container .boxing-type"
    ).text(typeOfPackaging);
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .white-help .balloon-container .exchange-saide"
    ).html(
      "$: " + exchangeRateSaide + "₽" + semicolonHelp + " ¥: " + yuan + "₽"
    );
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .white-help .balloon-container .sum-duty"
    ).text(sumDuty + "$");

    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .white-help .balloon-container .licenses"
    ).html("ЛИЦЕНЗИЯ:");
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .white-help .balloon-container .cargo-certificates"
    ).html("СЕРТИФИКАТ:");
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .white-help .balloon-container .licenses"
    ).html("ЛИЦЕНЗИЯ:");
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .white-help .balloon-container .cargo-certificates"
    ).html("СЕРТИФИКАТ:");
    $(
      "#delivery-types-dropdown-railway" +
        postfix +
        " .white-help .balloon-container .licenses"
    ).html("ЛИЦЕНЗИЯ:");
    $(
      "#delivery-types-dropdown-railway" +
        postfix +
        " .white-help .balloon-container .cargo-certificates"
    ).html("СЕРТИФИКАТ:");
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .white-help .balloon-container .licenses"
    ).html("ЛИЦЕНЗИЯ:");
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .white-help .balloon-container .cargo-certificates"
    ).html("СЕРТИФИКАТ:");

    certificate.forEach((item, index) => {
      $(
        "#delivery-types-dropdown-auto" +
          postfix +
          " .white-help .balloon-container .licenses"
      ).append(`
                <div class="help-text-content-white" style="color: black; text-align: left; margin-left: 2px; word-wrap: break-word;">
                    <span class="code-customs code">${codes[index]}: </span><span class="val-customs licence" style="margin-bottom: 3px">${license[index]}</span>
                </div>
            `);
      $(
        "#delivery-types-dropdown-auto" +
          postfix +
          " .white-help .balloon-container .cargo-certificates"
      ).append(`
                <div class="help-text-content-white" style="color: black; text-align: left; margin-left: 2px; word-wrap: break-word; margin-bottom: 3px">
                    <span class="code-customs code">${codes[index]}: </span><span class="val-customs certificate" style="margin-bottom: 3px">${certificate[index]}</span>
                </div>
            `);
      $(
        "#delivery-types-dropdown-fast-auto" +
          postfix +
          " .white-help .balloon-container .licenses"
      ).append(`
                <div class="help-text-content-white" style="color: black; text-align: left; margin-left: 2px; word-wrap: break-word;">
                    <span class="code-customs code">${codes[index]}: </span><span class="val-customs licence" style="margin-bottom: 3px">${license[index]}</span>
                </div>
            `);
      $(
        "#delivery-types-dropdown-fast-auto" +
          postfix +
          " .white-help .balloon-container .cargo-certificates"
      ).append(`
                <div class="help-text-content-white" style="color: black; text-align: left; margin-left: 2px; word-wrap: break-word; margin-bottom: 3px">
                    <span class="code-customs code">${codes[index]}: </span><span class="val-customs certificate" style="margin-bottom: 3px">${certificate[index]}</span>
                </div>
            `);
      $(
        "#delivery-types-dropdown-railway" +
          postfix +
          " .white-help .balloon-container .licenses"
      ).append(`
                <div class="help-text-content-white" style="color: black; text-align: left; margin-left: 2px; word-wrap: break-word;">
                    <span class="code-customs code">${codes[index]}: </span><span class="val-customs licence" style="margin-bottom: 3px">${license[index]}</span>
                </div>
            `);
      $(
        "#delivery-types-dropdown-railway" +
          postfix +
          " .white-help .balloon-container .cargo-certificates"
      ).append(`
                <div class="help-text-content-white" style="color: black; text-align: left; margin-left: 2px; word-wrap: break-word; margin-bottom: 3px">
                    <span class="code-customs code">${codes[index]}: </span><span class="val-customs certificate" style="margin-bottom: 3px">${certificate[index]}</span>
                </div>
            `);
      $(
        "#delivery-types-dropdown-avia" +
          postfix +
          " .white-help .balloon-container .licenses"
      ).append(`
                <div class="help-text-content-white" style="color: black; text-align: left; margin-left: 2px; word-wrap: break-word;">
                    <span class="code-customs code">${codes[index]}: </span><span class="val-customs licence" style="margin-bottom: 3px">${license[index]}</span>
                </div>
            `);
      $(
        "#delivery-types-dropdown-avia" +
          postfix +
          " .white-help .balloon-container .cargo-certificates"
      ).append(`
                <div class="help-text-content-white" style="color: black; text-align: left; margin-left: 2px; word-wrap: break-word; margin-bottom: 3px">
                    <span class="code-customs code">${codes[index]}: </span><span class="val-customs certificate" style="margin-bottom: 3px">${certificate[index]}</span>
                </div>
            `);
    });
  }

  function updatePageWithDLResponse(response, dlResponse) {
    let autoRegularKg =
      dlResponse.sum_cost_price.auto_regular === "н/д"
        ? "н/д"
        : (
            (parseFloat(total) +
              parseFloat(dlResponse.sum_cost_price.auto_regular)) /
            totalWeight
          ).toFixed(2);
    let autoRegularKgRub =
      dlResponse.sum_cost_price_rub.auto_regular === "н/д"
        ? "н/д"
        : (
            (parseFloat(totalRub) +
              parseFloat(dlResponse.sum_cost_price_rub.auto_regular)) /
            totalWeight
          ).toFixed(2);
    let autoRegularKgDl =
      dlResponse.sum_cost_price.auto_regular === "н/д"
        ? "н/д"
        : (
            parseFloat(dlResponse.sum_cost_price.auto_regular) / totalWeight
          ).toFixed(2);
    let autoRegularKgRubDl =
      dlResponse.sum_cost_price_rub.auto_regular === "н/д"
        ? "н/д"
        : (
            parseFloat(dlResponse.sum_cost_price_rub.auto_regular) / totalWeight
          ).toFixed(2);

    $("#delivery-types-dropdown-auto" + postfix + " .cost-elem.dl .kg").html(
      autoRegularKg === "н/д"
        ? "$н/д" + " - " + " ₽н/д"
        : "$" +
            (parseFloat(autoRegularKg) + packagingPrice / totalWeight).toFixed(
              2
            ) +
            " - " +
            "₽" +
            (
              parseFloat(autoRegularKgRub) +
              (packagingPrice * exchangeRateSaide) / totalWeight
            ).toFixed(2)
    );
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .cost-elem.dl .sum .sum-dollar"
    ).html(
      autoRegularKg === "н/д"
        ? "$н/д"
        : "$" + (autoRegularKg * totalWeight + packagingPrice).toFixed(2)
    );
    $(
      "#delivery-types-dropdown-auto" + postfix + " .cost-elem.dl .sum .sum-rub"
    ).html(
      autoRegularKg === "н/д"
        ? "₽н/д"
        : "₽" +
            (
              autoRegularKgRub * totalWeight +
              packagingPrice * exchangeRateSaide
            ).toFixed(2)
    );

    // Обновление элементов внутри delivery-types-dropdown-fast-auto
    let autoFastKg =
      dlResponse.sum_cost_price.auto_fast === "н/д"
        ? "н/д"
        : (
            (parseFloat(total) +
              parseFloat(dlResponse.sum_cost_price.auto_fast)) /
            totalWeight
          ).toFixed(2);
    let autoFastKgRub =
      dlResponse.sum_cost_price_rub.auto_fast === "н/д"
        ? "н/д"
        : (
            (parseFloat(totalRub) +
              parseFloat(dlResponse.sum_cost_price_rub.auto_fast)) /
            totalWeight
          ).toFixed(2);
    let autoFastKgDl =
      dlResponse.sum_cost_price.auto_fast === "н/д"
        ? "н/д"
        : (
            parseFloat(dlResponse.sum_cost_price.auto_fast) / totalWeight
          ).toFixed(2);
    let autoFastKgRubDl =
      dlResponse.sum_cost_price_rub.auto_fast === "н/д"
        ? "н/д"
        : (
            parseFloat(dlResponse.sum_cost_price_rub.auto_fast) / totalWeight
          ).toFixed(2);

    $(
      "#delivery-types-dropdown-fast-auto" + postfix + " .cost-elem.dl .kg"
    ).html(
      autoFastKg === "н/д"
        ? "$н/д" + " - " + " ₽н/д"
        : "$" +
            (parseFloat(autoFastKg) + packagingPrice / totalWeight).toFixed(2) +
            " - " +
            "₽" +
            (
              parseFloat(autoFastKgRub) +
              (packagingPrice * exchangeRateSaide) / totalWeight
            ).toFixed(2)
    );
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .cost-elem.dl .sum .sum-dollar"
    ).html(
      autoFastKg === "н/д"
        ? "$н/д"
        : "$" + (autoFastKg * totalWeight + packagingPrice).toFixed(2)
    );
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .cost-elem.dl .sum .sum-rub"
    ).html(
      autoFastKg === "н/д"
        ? "₽н/д"
        : "₽" +
            (
              autoFastKgRub * totalWeight +
              packagingPrice * exchangeRateSaide
            ).toFixed(2)
    );

    // Обновление элементов внутри delivery-types-dropdown-avia
    let aviaKg =
      dlResponse.sum_cost_price.avia === "н/д"
        ? "н/д"
        : (
            (parseFloat(total) + parseFloat(dlResponse.sum_cost_price.avia)) /
            totalWeight
          ).toFixed(2);
    let aviaKgRub =
      dlResponse.sum_cost_price_rub.avia === "н/д"
        ? "н/д"
        : (
            (parseFloat(totalRub) +
              parseFloat(dlResponse.sum_cost_price_rub.avia)) /
            totalWeight
          ).toFixed(2);
    let aviaKgDl =
      dlResponse.sum_cost_price.avia === "н/д"
        ? "н/д"
        : (parseFloat(dlResponse.sum_cost_price.avia) / totalWeight).toFixed(2);
    let aviaKgRubDl =
      dlResponse.sum_cost_price_rub.avia === "н/д"
        ? "н/д"
        : (
            parseFloat(dlResponse.sum_cost_price_rub.avia) / totalWeight
          ).toFixed(2);

    $("#delivery-types-dropdown-avia" + postfix + " .cost-elem.dl .kg").html(
      aviaKg === "н/д"
        ? "$н/д" + semicolon + "₽н/д"
        : "$" +
            (parseFloat(aviaKg) + packagingPrice / totalWeight).toFixed(2) +
            " - " +
            "₽" +
            (
              parseFloat(aviaKgRub) +
              (packagingPrice * exchangeRateSaide) / totalWeight
            ).toFixed(2)
    );
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .cost-elem.dl .sum .sum-dollar"
    ).html(
      aviaKg === "н/д"
        ? "$н/д"
        : "$" + (aviaKg * totalWeight + packagingPrice).toFixed(2)
    );
    $(
      "#delivery-types-dropdown-avia" + postfix + " .cost-elem.dl .sum .sum-rub"
    ).html(
      aviaKg === "н/д"
        ? "₽н/д"
        : "₽" +
            (
              aviaKgRub * totalWeight +
              packagingPrice * exchangeRateSaide
            ).toFixed(2)
    );

    // Обновление элементов внутри delivery-types-dropdown-auto dl-help
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .dl-help .balloon-container .kg"
    ).html(
      autoRegularKgDl === "н/д"
        ? "$н/д" + semicolonHelp + " ₽н/д"
        : parseFloat(autoRegularKgDl) +
            "$" +
            semicolonHelp +
            autoRegularKgRubDl +
            "₽"
    );
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .dl-help .balloon-container .sum"
    ).html(
      autoRegularKgDl === "н/д"
        ? "$н/д" + semicolonHelp + " ₽н/д"
        : (autoRegularKgDl * totalWeight).toFixed(2) +
            "$" +
            semicolonHelp +
            (autoRegularKgRubDl * totalWeight).toFixed(2) +
            "₽"
    );
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .dl-help .balloon-container .total"
    ).html(
      autoRegularKg === "н/д"
        ? "$н/д" + semicolonHelp + " ₽н/д"
        : (autoRegularKg * totalWeight + packagingPrice).toFixed(2) +
            "$" +
            semicolonHelp +
            (
              autoRegularKgRub * totalWeight +
              packagingPrice * exchangeRateSaide
            ).toFixed(2) +
            "₽"
    );
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .dl-help .balloon-container .total-customs"
    ).html(totalCustoms + "$" + semicolonHelp + totalCustomsRub + "₽");
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .dl-help .balloon-container .sum-saide"
    ).html(sumRateSaide + "$" + semicolonHelp + sumRateSaideRub + "₽");
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .dl-help .balloon-container .fees"
    ).text(fees + "$");
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .dl-help .balloon-container .total-nds"
    ).text(totalNds + "$");
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .dl-help .balloon-container .total-duty"
    ).text(totalDuty + "$");
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .dl-help .balloon-container .redeem-commission"
    ).html(
      ((ransomGoods * yuan) / exchangeRateSaide).toFixed(2) +
        "$" +
        semicolonHelp +
        (ransomGoods * yuan).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .dl-help .balloon-container .packaging-price"
    ).html(
      packagingPrice +
        "$" +
        semicolonHelp +
        (packagingPrice * exchangeRateSaide).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .dl-help .balloon-container .boxing-type"
    ).text(typeOfPackaging);
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .dl-help .balloon-container .exchange-saide"
    ).html(
      "$: " + exchangeRateSaide + "₽" + semicolonHelp + " ¥: " + yuan + "₽"
    );
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .dl-help .balloon-container .sum-duty"
    ).text(sumDuty);

    // Обновление элементов внутри delivery-types-dropdown-fast-auto dl-help
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .dl-help .balloon-container .kg"
    ).html(
      autoFastKgDl === "н/д"
        ? "$н/д" + semicolonHelp + " ₽н/д"
        : parseFloat(autoFastKgDl) + "$" + semicolonHelp + autoFastKgRubDl + "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .dl-help .balloon-container .sum"
    ).html(
      autoFastKgDl === "н/д"
        ? "$н/д" + semicolonHelp + " ₽н/д"
        : (autoFastKgDl * totalWeight).toFixed(2) +
            "$" +
            semicolonHelp +
            (autoFastKgRubDl * totalWeight).toFixed(2) +
            "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .dl-help .balloon-container .total"
    ).html(
      autoFastKg === "н/д"
        ? "$н/д" + semicolonHelp + " ₽н/д"
        : (autoFastKg * totalWeight + packagingPrice).toFixed(2) +
            "$" +
            semicolonHelp +
            (
              autoFastKgRub * totalWeight +
              packagingPrice * exchangeRateSaide
            ).toFixed(2) +
            "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .dl-help .balloon-container .total-customs"
    ).html(totalCustoms + "$" + semicolonHelp + totalCustomsRub + "₽");
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .dl-help .balloon-container .sum-saide"
    ).html(sumRateSaide + "$" + semicolonHelp + sumRateSaideRub + "₽");
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .dl-help .balloon-container .fees"
    ).text(fees + "$");
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .dl-help .balloon-container .total-nds"
    ).text(totalNds + "$");
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .dl-help .balloon-container .total-duty"
    ).text(totalDuty + "$");
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .dl-help .balloon-container .redeem-commission"
    ).html(
      ((ransomGoods * yuan) / exchangeRateSaide).toFixed(2) +
        "$" +
        semicolonHelp +
        (ransomGoods * yuan).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .dl-help .balloon-container .packaging-price"
    ).html(
      packagingPrice +
        "$" +
        semicolonHelp +
        (packagingPrice * exchangeRateSaide).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .dl-help .balloon-container .boxing-type"
    ).text(typeOfPackaging);
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .dl-help .balloon-container .exchange-saide"
    ).html(
      "$: " + exchangeRateSaide + "₽" + semicolonHelp + " ¥: " + yuan + "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .dl-help .balloon-container .sum-duty"
    ).text(sumDuty);

    // Обновление элементов внутри delivery-types-dropdown-avia dl-help
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .dl-help .balloon-container .kg"
    ).html(
      aviaKgDl === "н/д"
        ? "$н/д" + semicolonHelp + " ₽н/д"
        : parseFloat(aviaKgDl) + "$" + semicolonHelp + aviaKgRubDl + "₽"
    );
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .dl-help .balloon-container .sum"
    ).html(
      aviaKgDl === "н/д"
        ? "$н/д" + semicolonHelp + " ₽н/д"
        : (aviaKgDl * totalWeight).toFixed(2) +
            "$" +
            semicolonHelp +
            (aviaKgRubDl * totalWeight).toFixed(2) +
            "₽"
    );
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .dl-help .balloon-container .total"
    ).html(
      aviaKg === "н/д"
        ? "$н/д" + semicolonHelp + " ₽н/д"
        : (aviaKg * totalWeight + packagingPrice).toFixed(2) +
            "$" +
            semicolonHelp +
            (
              aviaKgRub * totalWeight +
              packagingPrice * exchangeRateSaide
            ).toFixed(2) +
            "₽"
    );
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .dl-help .balloon-container .total-customs"
    ).html(totalCustoms + "$" + semicolonHelp + totalCustomsRub + "₽");
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .dl-help .balloon-container .sum-saide"
    ).html(sumRateSaide + "$" + semicolonHelp + sumRateSaideRub + "₽");
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .dl-help .balloon-container .fees"
    ).text(fees + "$");
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .dl-help .balloon-container .total-nds"
    ).text(totalNds + "$");
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .dl-help .balloon-container .total-duty"
    ).text(totalDuty + "$");
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .dl-help .balloon-container .redeem-commission"
    ).html(
      ((ransomGoods * yuan) / exchangeRateSaide).toFixed(2) +
        "$" +
        semicolonHelp +
        (ransomGoods * yuan).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .dl-help .balloon-container .packaging-price"
    ).html(
      packagingPrice +
        "$" +
        semicolonHelp +
        (packagingPrice * exchangeRateSaide).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .dl-help .balloon-container .boxing-type"
    ).text(typeOfPackaging);
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .dl-help .balloon-container .exchange-saide"
    ).html(
      "$: " + exchangeRateSaide + "₽" + semicolonHelp + " ¥: " + yuan + "₽"
    );
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .dl-help .balloon-container .sum-duty"
    ).text(sumDuty);

    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .dl-help .balloon-container .licenses"
    ).html("ЛИЦЕНЗИЯ:");
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .dl-help .balloon-container .cargo-certificates"
    ).html("СЕРТИФИКАТ:");
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .dl-help .balloon-container .licenses"
    ).html("ЛИЦЕНЗИЯ:");
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .dl-help .balloon-container .cargo-certificates"
    ).html("СЕРТИФИКАТ:");
    $(
      "#delivery-types-dropdown-railway" +
        postfix +
        " .dl-help .balloon-container .licenses"
    ).html("ЛИЦЕНЗИЯ:");
    $(
      "#delivery-types-dropdown-railway" +
        postfix +
        " .dl-help .balloon-container .cargo-certificates"
    ).html("СЕРТИФИКАТ:");
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .dl-help .balloon-container .licenses"
    ).html("ЛИЦЕНЗИЯ:");
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .dl-help .balloon-container .cargo-certificates"
    ).html("СЕРТИФИКАТ:");

    certificate.forEach((item, index) => {
      $(
        "#delivery-types-dropdown-auto" +
          postfix +
          " .dl-help .balloon-container .licenses"
      ).append(`
                <div class="help-text-content-white" style="color: black; text-align: left; margin-left: 2px; word-wrap: break-word;">
                    <span class="code-customs code">${codes[index]}: </span><span class="val-customs licence" style="margin-bottom: 3px">${license[index]}</span>
                </div>
            `);
      $(
        "#delivery-types-dropdown-auto" +
          postfix +
          " .dl-help .balloon-container .cargo-certificates"
      ).append(`
                <div class="help-text-content-white" style="color: black; text-align: left; margin-left: 2px; word-wrap: break-word; margin-bottom: 3px">
                    <span class="code-customs code">${codes[index]}: </span><span class="val-customs certificate" style="margin-bottom: 3px">${certificate[index]}</span>
                </div>
            `);
      $(
        "#delivery-types-dropdown-fast-auto" +
          postfix +
          " .dl-help .balloon-container .licenses"
      ).append(`
                <div class="help-text-content-white" style="color: black; text-align: left; margin-left: 2px; word-wrap: break-word;">
                    <span class="code-customs code">${codes[index]}: </span><span class="val-customs licence" style="margin-bottom: 3px">${license[index]}</span>
                </div>
            `);
      $(
        "#delivery-types-dropdown-fast-auto" +
          postfix +
          " .dl-help .balloon-container .cargo-certificates"
      ).append(`
                <div class="help-text-content-white" style="color: black; text-align: left; margin-left: 2px; word-wrap: break-word; margin-bottom: 3px">
                    <span class="code-customs code">${codes[index]}: </span><span class="val-customs certificate" style="margin-bottom: 3px">${certificate[index]}</span>
                </div>
            `);
      $(
        "#delivery-types-dropdown-avia" +
          postfix +
          " .dl-help .balloon-container .licenses"
      ).append(`
                <div class="help-text-content-white" style="color: black; text-align: left; margin-left: 2px; word-wrap: break-word;">
                    <span class="code-customs code">${codes[index]}: </span><span class="val-customs licence" style="margin-bottom: 3px">${license[index]}</span>
                </div>
            `);
      $(
        "#delivery-types-dropdown-avia" +
          postfix +
          " .dl-help .balloon-container .cargo-certificates"
      ).append(`
                <div class="help-text-content-white" style="color: black; text-align: left; margin-left: 2px; word-wrap: break-word; margin-bottom: 3px">
                    <span class="code-customs code">${codes[index]}: </span><span class="val-customs certificate" style="margin-bottom: 3px">${certificate[index]}</span>
                </div>
            `);
    });
  }

  function updatePageWithPekResponse(response, pekResponse) {
    let autoRegularKg =
      pekResponse.sum_cost_price.auto_regular === "н/д"
        ? "н/д"
        : (
            (parseFloat(total) +
              parseFloat(pekResponse.sum_cost_price.auto_regular)) /
            totalWeight
          ).toFixed(2);
    let autoRegularSum =
      pekResponse.sum_cost_price.auto_regular === "н/д"
        ? "н/д"
        : (
            parseFloat(total) +
            parseFloat(pekResponse.sum_cost_price.auto_regular)
          ).toFixed(2);
    let autoRegularKgPek =
      pekResponse.sum_cost_price.auto_regular === "н/д"
        ? "н/д"
        : (
            parseFloat(pekResponse.sum_cost_price.auto_regular) / totalWeight
          ).toFixed(2);
    let autoRegularSumPek =
      pekResponse.sum_cost_price.auto_regular === "н/д"
        ? "н/д"
        : parseFloat(pekResponse.sum_cost_price.auto_regular).toFixed(2);

    let autoRegularKgRub =
      pekResponse.sum_cost_price_rub.auto_regular === "н/д"
        ? "н/д"
        : (
            (parseFloat(totalRub) +
              parseFloat(pekResponse.sum_cost_price_rub.auto_regular)) /
            totalWeight
          ).toFixed(2);
    let autoRegularSumRub =
      pekResponse.sum_cost_price_rub.auto_regular === "н/д"
        ? "н/д"
        : (
            parseFloat(totalRub) +
            parseFloat(pekResponse.sum_cost_price_rub.auto_regular)
          ).toFixed(2);
    let autoRegularKgRubPek =
      pekResponse.sum_cost_price_rub.auto_regular === "н/д"
        ? "н/д"
        : (
            parseFloat(pekResponse.sum_cost_price_rub.auto_regular) /
            totalWeight
          ).toFixed(2);
    let autoRegularSumRubPek =
      pekResponse.sum_cost_price_rub.auto_regular === "н/д"
        ? "н/д"
        : parseFloat(pekResponse.sum_cost_price_rub.auto_regular).toFixed(2);

    $("#delivery-types-dropdown-auto" + postfix + " .cost-elem.pek .kg").html(
      autoRegularKg === "н/д"
        ? "$н/д" + " - " + " ₽н/д"
        : "$" +
            (parseFloat(autoRegularKg) + packagingPrice / totalWeight).toFixed(
              2
            ) +
            " - " +
            "₽" +
            (
              parseFloat(autoRegularKgRub) +
              (packagingPrice * exchangeRateSaide) / totalWeight
            ).toFixed(2)
    );
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .cost-elem.pek .sum .sum-dollar"
    ).html(
      autoRegularSum === "н/д"
        ? "$н/д"
        : "$" + (parseFloat(autoRegularSum) + packagingPrice).toFixed(2)
    );
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .cost-elem.pek .sum .sum-rub"
    ).html(
      autoRegularSum === "н/д"
        ? "₽н/д"
        : "₽" +
            (
              parseFloat(autoRegularSumRub) +
              packagingPrice * exchangeRateSaide
            ).toFixed(2)
    );

    // Обновляем значения для delivery-types-dropdown-auto dl-help
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .pek-help .balloon-container .kg"
    ).html(
      autoRegularKgPek === "н/д"
        ? "$н/д" + semicolonHelp + " ₽н/д"
        : parseFloat(autoRegularKgPek) +
            "$" +
            semicolonHelp +
            parseFloat(autoRegularKgRubPek) +
            "₽"
    );
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .pek-help .balloon-container .sum"
    ).html(
      autoRegularSumPek === "н/д"
        ? "$н/д" + semicolonHelp + " ₽н/д"
        : parseFloat(autoRegularSumPek) +
            "$" +
            semicolonHelp +
            parseFloat(autoRegularSumRubPek) +
            "₽"
    );
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .pek-help .balloon-container .total"
    ).html(
      autoRegularSum === "н/д"
        ? "$н/д" + semicolonHelp + " ₽н/д"
        : (parseFloat(autoRegularSum) + packagingPrice).toFixed(2) +
            "$" +
            semicolonHelp +
            (
              parseFloat(autoRegularSumRub) +
              packagingPrice * exchangeRateSaide
            ).toFixed(2) +
            "₽"
    );
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .pek-help .balloon-container .total-customs"
    ).html(totalCustoms + "$" + semicolonHelp + totalCustomsRub + "₽");
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .pek-help .balloon-container .sum-saide"
    ).html(sumRateSaide + "$" + semicolonHelp + sumRateSaideRub + "₽");
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .pek-help .balloon-container .fees"
    ).text(fees + "$");
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .pek-help .balloon-container .total-nds"
    ).text(totalNds + "$");
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .pek-help .balloon-container .total-duty"
    ).text(totalDuty + "$");
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .pek-help .balloon-container .redeem-commission"
    ).html(
      ((ransomGoods * yuan) / exchangeRateSaide).toFixed(2) +
        "$" +
        semicolonHelp +
        (ransomGoods * yuan).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .pek-help .balloon-container .packaging-price"
    ).html(
      packagingPrice +
        "$" +
        semicolonHelp +
        (packagingPrice * exchangeRateSaide).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .pek-help .balloon-container .boxing-type"
    ).text(typeOfPackaging);
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .pek-help .balloon-container .exchange-saide"
    ).html(
      "$: " + exchangeRateSaide + "₽" + semicolonHelp + " ¥: " + yuan + "₽"
    );
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .pek-help .balloon-container .sum-duty"
    ).text(sumDuty);

    // Обновляем значения для delivery-types-dropdown-avia
    let aviaKg =
      pekResponse.sum_cost_price.avia === "н/д"
        ? "н/д"
        : (
            (parseFloat(total) + parseFloat(pekResponse.sum_cost_price.avia)) /
            totalWeight
          ).toFixed(2);
    let aviaSum =
      pekResponse.sum_cost_price.avia === "н/д"
        ? "н/д"
        : (
            parseFloat(total) + parseFloat(pekResponse.sum_cost_price.avia)
          ).toFixed(2);
    let aviaKgPek =
      pekResponse.sum_cost_price.avia === "н/д"
        ? "н/д"
        : (parseFloat(pekResponse.sum_cost_price.avia) / totalWeight).toFixed(
            2
          );
    let aviaSumPek =
      pekResponse.sum_cost_price.avia === "н/д"
        ? "н/д"
        : parseFloat(pekResponse.sum_cost_price.avia).toFixed(2);

    let aviaKgRub =
      pekResponse.sum_cost_price_rub.avia === "н/д"
        ? "н/д"
        : (
            (parseFloat(totalRub) +
              parseFloat(pekResponse.sum_cost_price_rub.avia)) /
            totalWeight
          ).toFixed(2);
    let aviaSumRub =
      pekResponse.sum_cost_price_rub.avia === "н/д"
        ? "н/д"
        : (
            parseFloat(totalRub) +
            parseFloat(pekResponse.sum_cost_price_rub.avia)
          ).toFixed(2);
    let aviaKgRubPek =
      pekResponse.sum_cost_price_rub.avia === "н/д"
        ? "н/д"
        : (
            parseFloat(pekResponse.sum_cost_price_rub.avia) / totalWeight
          ).toFixed(2);
    let aviaSumRubPek =
      pekResponse.sum_cost_price_rub.avia === "н/д"
        ? "н/д"
        : parseFloat(pekResponse.sum_cost_price_rub.avia).toFixed(2);

    $("#delivery-types-dropdown-avia" + postfix + " .cost-elem.pek .kg").html(
      aviaKg === "н/д"
        ? "$н/д" + " - " + "₽н/д"
        : "$" +
            (parseFloat(aviaKg) + packagingPrice / totalWeight).toFixed(2) +
            " - " +
            "₽" +
            (
              parseFloat(aviaKgRub) +
              (packagingPrice * exchangeRateSaide) / totalWeight
            ).toFixed(2)
    );
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .cost-elem.pek .sum .sum-dollar"
    ).html(
      aviaSum === "н/д"
        ? "$н/д"
        : "$" + (parseFloat(aviaSum) + packagingPrice).toFixed(2)
    );
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .cost-elem.pek .sum .sum-rub"
    ).html(
      aviaSum === "н/д"
        ? "₽н/д"
        : "₽" +
            (
              parseFloat(aviaSumRub) +
              packagingPrice * exchangeRateSaide
            ).toFixed(2)
    );

    // Обновляем значения для delivery-types-dropdown-avia dl-help
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .pek-help .balloon-container .kg"
    ).html(
      aviaKgPek === "н/д"
        ? "$н/д" + semicolonHelp + " ₽н/д"
        : parseFloat(aviaKgPek) + "$" + semicolonHelp + aviaKgRubPek + "₽"
    );
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .pek-help .balloon-container .sum"
    ).html(
      aviaSumPek === "н/д"
        ? "$н/д" + semicolonHelp + " ₽н/д"
        : parseFloat(aviaSumPek) + "$" + semicolonHelp + aviaSumRubPek + "₽"
    );
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .pek-help .balloon-container .total"
    ).html(
      aviaSum === "н/д"
        ? "$н/д" + semicolonHelp + " ₽н/д"
        : (parseFloat(aviaSum) + packagingPrice).toFixed(2) +
            "$" +
            semicolonHelp +
            (
              parseFloat(aviaSumRub) +
              packagingPrice * exchangeRateSaide
            ).toFixed(2) +
            "₽"
    );
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .pek-help .balloon-container .total-customs"
    ).html(totalCustoms + "$" + semicolonHelp + totalCustomsRub + "₽");
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .pek-help .balloon-container .sum-saide"
    ).html(sumRateSaide + "$" + semicolonHelp + sumRateSaideRub + "₽");
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .pek-help .balloon-container .fees"
    ).text(fees + "$");
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .pek-help .balloon-container .total-nds"
    ).text(totalNds + "$");
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .pek-help .balloon-container .total-duty"
    ).text(totalDuty + "$");
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .pek-help .balloon-container .redeem-commission"
    ).html(
      ((ransomGoods * yuan) / exchangeRateSaide).toFixed(2) +
        "$" +
        semicolonHelp +
        (ransomGoods * yuan).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .pek-help .balloon-container .packaging-price"
    ).html(
      packagingPrice +
        "$" +
        semicolonHelp +
        (packagingPrice * exchangeRateSaide).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .pek-help .balloon-container .boxing-type"
    ).text(typeOfPackaging);
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .pek-help .balloon-container .exchange-saide"
    ).html(
      "$: " + exchangeRateSaide + "₽" + semicolonHelp + " ¥: " + yuan + "₽"
    );
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .pek-help .balloon-container .sum-duty"
    ).text(sumDuty);

    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .pek-help .balloon-container .licenses"
    ).html("ЛИЦЕНЗИЯ:");
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .pek-help .balloon-container .cargo-certificates"
    ).html("СЕРТИФИКАТ:");
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .pek-help .balloon-container .licenses"
    ).html("ЛИЦЕНЗИЯ:");
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .pek-help .balloon-container .cargo-certificates"
    ).html("СЕРТИФИКАТ:");
    $(
      "#delivery-types-dropdown-railway" +
        postfix +
        " .pek-help .balloon-container .licenses"
    ).html("ЛИЦЕНЗИЯ:");
    $(
      "#delivery-types-dropdown-railway" +
        postfix +
        " .pek-help .balloon-container .cargo-certificates"
    ).html("СЕРТИФИКАТ:");
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .pek-help .balloon-container .licenses"
    ).html("ЛИЦЕНЗИЯ:");
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .pek-help .balloon-container .cargo-certificates"
    ).html("СЕРТИФИКАТ:");

    certificate.forEach((item, index) => {
      $(
        "#delivery-types-dropdown-auto" +
          postfix +
          " .pek-help .balloon-container .licenses"
      ).append(`
                <div class="help-text-content-white" style="color: black; text-align: left; margin-left: 2px; word-wrap: break-word;">
                    <span class="code-customs code">${codes[index]}: </span><span class="val-customs licence" style="margin-bottom: 3px">${license[index]}</span>
                </div>
            `);
      $(
        "#delivery-types-dropdown-auto" +
          postfix +
          " .pek-help .balloon-container .cargo-certificates"
      ).append(`
                <div class="help-text-content-white" style="color: black; text-align: left; margin-left: 2px; word-wrap: break-word; margin-bottom: 3px">
                    <span class="code-customs code">${codes[index]}: </span><span class="val-customs certificate" style="margin-bottom: 3px">${certificate[index]}</span>
                </div>
            `);
      $(
        "#delivery-types-dropdown-avia" +
          postfix +
          " .pek-help .balloon-container .licenses"
      ).append(`
                <div class="help-text-content-white" style="color: black; text-align: left; margin-left: 2px; word-wrap: break-word;">
                    <span class="code-customs code">${codes[index]}: </span><span class="val-customs licence" style="margin-bottom: 3px">${license[index]}</span>
                </div>
            `);
      $(
        "#delivery-types-dropdown-avia" +
          postfix +
          " .pek-help .balloon-container .cargo-certificates"
      ).append(`
                <div class="help-text-content-white" style="color: black; text-align: left; margin-left: 2px; word-wrap: break-word; margin-bottom: 3px">
                    <span class="code-customs code">${codes[index]}: </span><span class="val-customs certificate" style="margin-bottom: 3px">${certificate[index]}</span>
                </div>
            `);
    });
  }

  function updatePageWithJDEResponse(response, jdeResponse) {
    let autoRegularKg =
      jdeResponse.sum_cost_price.auto_regular === "н/д"
        ? "н/д"
        : (
            (parseFloat(total) +
              parseFloat(jdeResponse.sum_cost_price.auto_regular)) /
            totalWeight
          ).toFixed(2);
    let autoRegularKgRub =
      jdeResponse.sum_cost_price_rub.auto_regular === "н/д"
        ? "н/д"
        : (
            (parseFloat(totalRub) +
              parseFloat(jdeResponse.sum_cost_price_rub.auto_regular)) /
            totalWeight
          ).toFixed(2);
    let autoRegularKgJDE =
      jdeResponse.sum_cost_price.auto_regular === "н/д"
        ? "н/д"
        : (
            parseFloat(jdeResponse.sum_cost_price.auto_regular) / totalWeight
          ).toFixed(2);
    let autoRegularKgRubJDE =
      jdeResponse.sum_cost_price_rub.auto_regular === "н/д"
        ? "н/д"
        : (
            parseFloat(jdeResponse.sum_cost_price_rub.auto_regular) /
            totalWeight
          ).toFixed(2);

    $("#delivery-types-dropdown-auto" + postfix + " .cost-elem.jde .kg").html(
      autoRegularKg === "н/д"
        ? "$н/д" + " - " + " ₽н/д"
        : "$" +
            (parseFloat(autoRegularKg) + packagingPrice / totalWeight).toFixed(
              2
            ) +
            " - " +
            "₽" +
            (
              parseFloat(autoRegularKgRub) +
              (packagingPrice * exchangeRateSaide) / totalWeight
            ).toFixed(2)
    );
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .cost-elem.jde .sum .sum-dollar"
    ).html(
      autoRegularKg === "н/д"
        ? "$н/д"
        : "$" + (autoRegularKg * totalWeight + packagingPrice).toFixed(2)
    );
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .cost-elem.jde .sum .sum-rub"
    ).html(
      autoRegularKg === "н/д"
        ? "₽н/д"
        : "₽" +
            (
              autoRegularKgRub * totalWeight +
              packagingPrice * exchangeRateSaide
            ).toFixed(2)
    );

    // Обновление элементов внутри delivery-types-dropdown-fast-auto для auto_fast
    let autoFastKg =
      jdeResponse.sum_cost_price.auto_fast === "н/д"
        ? "н/д"
        : (
            (parseFloat(total) +
              parseFloat(jdeResponse.sum_cost_price.auto_fast)) /
            totalWeight
          ).toFixed(2);
    let autoFastKgRub =
      jdeResponse.sum_cost_price_rub.auto_fast === "н/д"
        ? "н/д"
        : (
            (parseFloat(totalRub) +
              parseFloat(jdeResponse.sum_cost_price_rub.auto_fast)) /
            totalWeight
          ).toFixed(2);
    let autoFastKgJDE =
      jdeResponse.sum_cost_price.auto_fast === "н/д"
        ? "н/д"
        : (
            parseFloat(jdeResponse.sum_cost_price.auto_fast) / totalWeight
          ).toFixed(2);
    let autoFastKgRubJDE =
      jdeResponse.sum_cost_price_rub.auto_fast === "н/д"
        ? "н/д"
        : (
            parseFloat(jdeResponse.sum_cost_price_rub.auto_fast) / totalWeight
          ).toFixed(2);

    $(
      "#delivery-types-dropdown-fast-auto" + postfix + " .cost-elem.jde .kg"
    ).html(
      autoFastKg === "н/д"
        ? "$н/д" + " - " + "₽н/д"
        : "$" +
            (parseFloat(autoFastKg) + packagingPrice / totalWeight).toFixed(2) +
            " - " +
            "₽" +
            (
              parseFloat(autoFastKgRub) +
              (packagingPrice * exchangeRateSaide) / totalWeight
            ).toFixed(2)
    );
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .cost-elem.jde .sum .sum-dollar"
    ).html(
      autoFastKg === "н/д"
        ? "$н/д"
        : "$" + (autoFastKg * totalWeight + packagingPrice).toFixed(2)
    );
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .cost-elem.jde .sum .sum-rub"
    ).html(
      autoFastKg === "н/д"
        ? "₽н/д"
        : "₽" +
            (
              autoFastKgRub * totalWeight +
              packagingPrice * exchangeRateSaide
            ).toFixed(2)
    );

    // Обновление элементов внутри delivery-types-dropdown-auto jde-help для auto_regular
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .jde-help .balloon-container .kg"
    ).html(
      autoRegularKgJDE === "н/д"
        ? "$н/д" + semicolonHelp + " ₽н/д"
        : autoRegularKgJDE + "$" + semicolonHelp + autoRegularKgRubJDE + "₽"
    );
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .jde-help .balloon-container .sum"
    ).html(
      autoRegularKgJDE === "н/д"
        ? "$н/д" + semicolonHelp + " ₽н/д"
        : (autoRegularKgJDE * totalWeight).toFixed(2) +
            "$" +
            semicolonHelp +
            (autoRegularKgRubJDE * totalWeight).toFixed(2) +
            "₽"
    );
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .jde-help .balloon-container .total"
    ).html(
      autoRegularKg === "н/д"
        ? "$н/д" + semicolonHelp + " ₽н/д"
        : (autoRegularKg * totalWeight + packagingPrice).toFixed(2) +
            "$" +
            semicolonHelp +
            (
              autoRegularKgRub * totalWeight +
              packagingPrice * exchangeRateSaide
            ).toFixed(2) +
            "₽"
    );
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .jde-help .balloon-container .total-customs"
    ).html(totalCustoms + "$" + semicolonHelp + totalCustomsRub + "₽");
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .jde-help .balloon-container .sum-saide"
    ).html(sumRateSaide + "$" + semicolonHelp + sumRateSaideRub + "₽");
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .jde-help .balloon-container .fees"
    ).text(fees + "$");
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .jde-help .balloon-container .total-nds"
    ).text(totalNds + "$");
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .jde-help .balloon-container .total-duty"
    ).text(totalDuty + "$");
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .jde-help .balloon-container .redeem-commission"
    ).html(
      ((ransomGoods * yuan) / exchangeRateSaide).toFixed(2) +
        "$" +
        semicolonHelp +
        (ransomGoods * yuan).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .jde-help .balloon-container .packaging-price"
    ).html(
      packagingPrice +
        "$" +
        semicolonHelp +
        (packagingPrice * exchangeRateSaide).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .jde-help .balloon-container .boxing-type"
    ).text(typeOfPackaging);
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .jde-help .balloon-container .exchange-saide"
    ).html(
      "$: " + exchangeRateSaide + "₽" + semicolonHelp + " ¥: " + yuan + "₽"
    );
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .jde-help .balloon-container .sum-duty"
    ).text(sumDuty);

    // Обновление элементов внутри delivery-types-dropdown-fast-auto jde-help для auto_fast
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .jde-help .balloon-container .kg"
    ).html(
      autoFastKgJDE === "н/д"
        ? "$н/д" + semicolonHelp + " ₽н/д"
        : autoFastKgJDE + "$" + semicolonHelp + autoFastKgRubJDE + "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .jde-help .balloon-container .sum"
    ).html(
      autoFastKgJDE === "н/д"
        ? "$н/д" + semicolonHelp + " ₽н/д"
        : (autoFastKgJDE * totalWeight).toFixed(2) +
            "$" +
            semicolonHelp +
            (autoFastKgRubJDE * totalWeight).toFixed(2) +
            "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .jde-help .balloon-container .total"
    ).html(
      autoFastKg === "н/д"
        ? "$н/д" + semicolonHelp + " ₽н/д"
        : (autoFastKg * totalWeight + packagingPrice).toFixed(2) +
            "$" +
            semicolonHelp +
            (
              autoFastKgRub * totalWeight +
              packagingPrice * exchangeRateSaide
            ).toFixed(2) +
            "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .jde-help .balloon-container .total-customs"
    ).html(totalCustoms + "$" + semicolonHelp + totalCustomsRub + "₽");
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .jde-help .balloon-container .sum-saide"
    ).html(sumRateSaide + "$" + semicolonHelp + sumRateSaideRub + "₽");
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .jde-help .balloon-container .fees"
    ).text(fees + "$");
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .jde-help .balloon-container .total-nds"
    ).text(totalNds + "$");
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .jde-help .balloon-container .total-duty"
    ).text(totalDuty + "$");
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .jde-help .balloon-container .redeem-commission"
    ).html(
      ((ransomGoods * yuan) / exchangeRateSaide).toFixed(2) +
        "$" +
        semicolonHelp +
        (ransomGoods * yuan).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .jde-help .balloon-container .packaging-price"
    ).html(
      packagingPrice +
        "$" +
        semicolonHelp +
        (packagingPrice * exchangeRateSaide).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .jde-help .balloon-container .boxing-type"
    ).text(typeOfPackaging);
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .jde-help .balloon-container .exchange-saide"
    ).html(
      "$: " + exchangeRateSaide + "₽" + semicolonHelp + " ¥: " + yuan + "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .jde-help .balloon-container .sum-duty"
    ).text(sumDuty);

    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .jde-help .balloon-container .licenses"
    ).html("ЛИЦЕНЗИЯ:");
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .jde-help .balloon-container .cargo-certificates"
    ).html("СЕРТИФИКАТ:");
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .jde-help .balloon-container .licenses"
    ).html("ЛИЦЕНЗИЯ:");
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .jde-help .balloon-container .cargo-certificates"
    ).html("СЕРТИФИКАТ:");
    $(
      "#delivery-types-dropdown-railway" +
        postfix +
        " .jde-help .balloon-container .licenses"
    ).html("ЛИЦЕНЗИЯ:");
    $(
      "#delivery-types-dropdown-railway" +
        postfix +
        " .jde-help .balloon-container .cargo-certificates"
    ).html("СЕРТИФИКАТ:");
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .jde-help .balloon-container .licenses"
    ).html("ЛИЦЕНЗИЯ:");
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .jde-help .balloon-container .cargo-certificates"
    ).html("СЕРТИФИКАТ:");

    certificate.forEach((item, index) => {
      $(
        "#delivery-types-dropdown-auto" +
          postfix +
          " .jde-help .balloon-container .licenses"
      ).append(`
                <div class="help-text-content-white" style="color: black; text-align: left; margin-left: 2px; word-wrap: break-word;">
                    <span class="code-customs code">${codes[index]}: </span><span class="val-customs licence" style="margin-bottom: 3px">${license[index]}</span>
                </div>
            `);
      $(
        "#delivery-types-dropdown-auto" +
          postfix +
          " .jde-help .balloon-container .cargo-certificates"
      ).append(`
                <div class="help-text-content-white" style="color: black; text-align: left; margin-left: 2px; word-wrap: break-word; margin-bottom: 3px">
                    <span class="code-customs code">${codes[index]}: </span><span class="val-customs certificate" style="margin-bottom: 3px">${certificate[index]}</span>
                </div>
            `);
      $(
        "#delivery-types-dropdown-fast-auto" +
          postfix +
          " .jde-help .balloon-container .licenses"
      ).append(`
                <div class="help-text-content-white" style="color: black; text-align: left; margin-left: 2px; word-wrap: break-word;">
                    <span class="code-customs code">${codes[index]}: </span><span class="val-customs licence" style="margin-bottom: 3px">${license[index]}</span>
                </div>
            `);
      $(
        "#delivery-types-dropdown-fast-auto" +
          postfix +
          " .jde-help .balloon-container .cargo-certificates"
      ).append(`
                <div class="help-text-content-white" style="color: black; text-align: left; margin-left: 2px; word-wrap: break-word; margin-bottom: 3px">
                    <span class="code-customs code">${codes[index]}: </span><span class="val-customs certificate" style="margin-bottom: 3px">${certificate[index]}</span>
                </div>
            `);
    });
  }

  function updatePageWithKITResponse(response, kitResponse) {
    // Обновление элементов внутри delivery-types-dropdown-auto
    let autoRegularKg =
      kitResponse.sum_cost_price.auto_regular !== "н/д"
        ? (
            (parseFloat(total) +
              parseFloat(kitResponse.sum_cost_price.auto_regular)) /
            totalWeight
          ).toFixed(2)
        : "н/д";
    let autoRegularKgRub =
      kitResponse.sum_cost_price_rub.auto_regular !== "н/д"
        ? (
            (parseFloat(totalRub) +
              parseFloat(kitResponse.sum_cost_price_rub.auto_regular)) /
            totalWeight
          ).toFixed(2)
        : "н/д";
    let autoRegularKgKit =
      kitResponse.sum_cost_price.auto_regular !== "н/д"
        ? (
            parseFloat(kitResponse.sum_cost_price.auto_regular) / totalWeight
          ).toFixed(2)
        : "н/д";
    let autoRegularKgRubKit =
      kitResponse.sum_cost_price_rub.auto_regular !== "н/д"
        ? (
            parseFloat(kitResponse.sum_cost_price_rub.auto_regular) /
            totalWeight
          ).toFixed(2)
        : "н/д";

    $("#delivery-types-dropdown-auto" + postfix + " .cost-elem.kit .kg").html(
      autoRegularKg !== "н/д"
        ? "$" +
            (parseFloat(autoRegularKg) + packagingPrice / totalWeight).toFixed(
              2
            ) +
            " - " +
            "₽" +
            (
              parseFloat(autoRegularKgRub) +
              (packagingPrice * exchangeRateSaide) / totalWeight
            ).toFixed(2)
        : "$н/д" + " - " + "₽н/д"
    );
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .cost-elem.kit .sum .sum-dollar"
    ).html(
      autoRegularKg !== "н/д"
        ? "$" + (autoRegularKg * totalWeight + packagingPrice).toFixed(2)
        : "$н/д"
    );
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .cost-elem.kit .sum .sum-rub"
    ).html(
      autoRegularKg !== "н/д"
        ? "₽" +
            (
              autoRegularKgRub * totalWeight +
              packagingPrice * exchangeRateSaide
            ).toFixed(2)
        : "₽н/д"
    );

    // Обновление элементов внутри delivery-types-dropdown-fast-auto
    let autoFastKg =
      kitResponse.sum_cost_price.auto_fast !== "н/д"
        ? (
            (parseFloat(total) +
              parseFloat(kitResponse.sum_cost_price.auto_fast)) /
            totalWeight
          ).toFixed(2)
        : "н/д";
    let autoFastKgRub =
      kitResponse.sum_cost_price_rub.auto_fast !== "н/д"
        ? (
            (parseFloat(totalRub) +
              parseFloat(kitResponse.sum_cost_price_rub.auto_fast)) /
            totalWeight
          ).toFixed(2)
        : "н/д";
    let autoFastKgKit =
      kitResponse.sum_cost_price.auto_fast !== "н/д"
        ? (
            parseFloat(kitResponse.sum_cost_price.auto_fast) / totalWeight
          ).toFixed(2)
        : "н/д";
    let autoFastKgRubKit =
      kitResponse.sum_cost_price_rub.auto_fast !== "н/д"
        ? (
            parseFloat(kitResponse.sum_cost_price_rub.auto_fast) / totalWeight
          ).toFixed(2)
        : "н/д";

    $(
      "#delivery-types-dropdown-fast-auto" + postfix + " .cost-elem.kit .kg"
    ).html(
      autoFastKg !== "н/д"
        ? "$" +
            (parseFloat(autoFastKg) + packagingPrice / totalWeight).toFixed(2) +
            " - " +
            "₽" +
            (
              parseFloat(autoFastKgRub) +
              (packagingPrice * exchangeRateSaide) / totalWeight
            ).toFixed(2)
        : "$н/д" + " - " + "₽н/д"
    );
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .cost-elem.kit .sum .sum-dollar"
    ).html(
      autoFastKg !== "н/д"
        ? "$" + (autoFastKg * totalWeight + packagingPrice).toFixed(2)
        : "$н/д"
    );
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .cost-elem.kit .sum .sum-rub"
    ).html(
      autoFastKg !== "н/д"
        ? "₽" +
            (
              autoFastKgRub * totalWeight +
              packagingPrice * exchangeRateSaide
            ).toFixed(2)
        : "₽н/д"
    );

    // Обновление элементов внутри delivery-types-dropdown-auto kit-help
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .kit-help .balloon-container .kg"
    ).html(
      autoRegularKgKit !== "н/д"
        ? autoRegularKgKit + "$" + semicolonHelp + autoRegularKgRubKit + "₽"
        : "$н/д" + semicolonHelp + " ₽н/д"
    );
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .kit-help .balloon-container .sum"
    ).html(
      autoRegularKgKit !== "н/д"
        ? (autoRegularKgKit * totalWeight).toFixed(2) +
            "$" +
            semicolonHelp +
            (autoRegularKgRubKit * totalWeight).toFixed(2) +
            "₽"
        : "$н/д" + semicolonHelp + " ₽н/д"
    );
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .kit-help .balloon-container .total"
    ).html(
      autoRegularKg !== "н/д"
        ? (autoRegularKg * totalWeight + packagingPrice).toFixed(2) +
            "$" +
            semicolonHelp +
            (
              autoRegularKgRub * totalWeight +
              packagingPrice * exchangeRateSaide
            ).toFixed(2) +
            "₽"
        : "$н/д" + semicolonHelp + " ₽н/д"
    );
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .kit-help .balloon-container .total-customs"
    ).html(totalCustoms + "$" + semicolonHelp + totalCustomsRub + "₽");
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .kit-help .balloon-container .sum-saide"
    ).html(sumRateSaide + "$" + semicolonHelp + sumRateSaideRub + "₽");
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .kit-help .balloon-container .fees"
    ).text(fees + "$");
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .kit-help .balloon-container .total-nds"
    ).text(totalNds + "$");
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .kit-help .balloon-container .total-duty"
    ).text(totalDuty + "$");
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .kit-help .balloon-container .redeem-commission"
    ).html(
      ((ransomGoods * yuan) / exchangeRateSaide).toFixed(2) +
        "$" +
        semicolonHelp +
        (ransomGoods * yuan).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .kit-help .balloon-container .packaging-price"
    ).html(
      packagingPrice +
        "$" +
        semicolonHelp +
        (packagingPrice * exchangeRateSaide).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .kit-help .balloon-container .boxing-type"
    ).text(typeOfPackaging);
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .kit-help .balloon-container .exchange-saide"
    ).html(
      "$: " + exchangeRateSaide + "₽" + semicolonHelp + " ¥: " + yuan + "₽"
    );
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .kit-help .balloon-container .sum-duty"
    ).text(sumDuty);

    // Обновление элементов внутри delivery-types-dropdown-fast-auto kit-help
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .kit-help .balloon-container .kg"
    ).html(
      autoFastKgKit !== "н/д"
        ? autoFastKgKit + "$" + semicolonHelp + autoFastKgRubKit + "₽"
        : "$н/д" + semicolonHelp + " ₽н/д"
    );
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .kit-help .balloon-container .sum"
    ).html(
      autoFastKgKit !== "н/д"
        ? (autoFastKgKit * totalWeight).toFixed(2) +
            "$" +
            semicolonHelp +
            (autoFastKgRubKit * totalWeight).toFixed(2) +
            "₽"
        : "$н/д" + semicolonHelp + " ₽н/д"
    );
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .kit-help .balloon-container .total"
    ).html(
      autoFastKg !== "н/д"
        ? (autoFastKg * totalWeight + packagingPrice).toFixed(2) +
            "$" +
            semicolonHelp +
            (
              autoFastKgRub * totalWeight +
              packagingPrice * exchangeRateSaide
            ).toFixed(2) +
            "₽"
        : "$н/д" + semicolonHelp + " ₽н/д"
    );
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .kit-help .balloon-container .total-customs"
    ).html(totalCustoms + "$" + semicolonHelp + totalCustomsRub + "₽");
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .kit-help .balloon-container .sum-saide"
    ).html(sumRateSaide + "$" + semicolonHelp + sumRateSaideRub + "₽");
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .kit-help .balloon-container .fees"
    ).text(fees + "$");
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .kit-help .balloon-container .total-nds"
    ).text(totalNds + "$");
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .kit-help .balloon-container .total-duty"
    ).text(totalDuty + "$");
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .kit-help .balloon-container .redeem-commission"
    ).html(
      ((ransomGoods * yuan) / exchangeRateSaide).toFixed(2) +
        "$" +
        semicolonHelp +
        (ransomGoods * yuan).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .kit-help .balloon-container .packaging-price"
    ).html(
      packagingPrice +
        "$" +
        semicolonHelp +
        (packagingPrice * exchangeRateSaide).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .kit-help .balloon-container .boxing-type"
    ).text(typeOfPackaging);
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .kit-help .balloon-container .exchange-saide"
    ).html(
      "$: " + exchangeRateSaide + "₽" + semicolonHelp + " ¥: " + yuan + "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .kit-help .balloon-container .sum-duty"
    ).text(sumDuty);

    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .kit-help .balloon-container .licenses"
    ).html("ЛИЦЕНЗИЯ:");
    $(
      "#delivery-types-dropdown-auto" +
        postfix +
        " .kit-help .balloon-container .cargo-certificates"
    ).html("СЕРТИФИКАТ:");
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .kit-help .balloon-container .licenses"
    ).html("ЛИЦЕНЗИЯ:");
    $(
      "#delivery-types-dropdown-fast-auto" +
        postfix +
        " .kit-help .balloon-container .cargo-certificates"
    ).html("СЕРТИФИКАТ:");
    $(
      "#delivery-types-dropdown-railway" +
        postfix +
        " .kit-help .balloon-container .licenses"
    ).html("ЛИЦЕНЗИЯ:");
    $(
      "#delivery-types-dropdown-railway" +
        postfix +
        " .kit-help .balloon-container .cargo-certificates"
    ).html("СЕРТИФИКАТ:");
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .kit-help .balloon-container .licenses"
    ).html("ЛИЦЕНЗИЯ:");
    $(
      "#delivery-types-dropdown-avia" +
        postfix +
        " .kit-help .balloon-container .cargo-certificates"
    ).html("СЕРТИФИКАТ:");

    certificate.forEach((item, index) => {
      $(
        "#delivery-types-dropdown-auto" +
          postfix +
          " .kit-help .balloon-container .licenses"
      ).append(`
                <div class="help-text-content-white" style="color: black; text-align: left; margin-left: 2px; word-wrap: break-word;">
                    <span class="code-customs code">${codes[index]}: </span><span class="val-customs licence" style="margin-bottom: 3px">${license[index]}</span>
                </div>
            `);
      $(
        "#delivery-types-dropdown-auto" +
          postfix +
          " .kit-help .balloon-container .cargo-certificates"
      ).append(`
                <div class="help-text-content-white" style="color: black; text-align: left; margin-left: 2px; word-wrap: break-word; margin-bottom: 3px">
                    <span class="code-customs code">${codes[index]}: </span><span class="val-customs certificate" style="margin-bottom: 3px">${certificate[index]}</span>
                </div>
            `);
      $(
        "#delivery-types-dropdown-fast-auto" +
          postfix +
          " .kit-help .balloon-container .licenses"
      ).append(`
                <div class="help-text-content-white" style="color: black; text-align: left; margin-left: 2px; word-wrap: break-word;">
                    <span class="code-customs code">${codes[index]}: </span><span class="val-customs licence" style="margin-bottom: 3px">${license[index]}</span>
                </div>
            `);
      $(
        "#delivery-types-dropdown-fast-auto" +
          postfix +
          " .kit-help .balloon-container .cargo-certificates"
      ).append(`
                <div class="help-text-content-white" style="color: black; text-align: left; margin-left: 2px; word-wrap: break-word; margin-bottom: 3px">
                    <span class="code-customs code">${codes[index]}: </span><span class="val-customs certificate" style="margin-bottom: 3px">${certificate[index]}</span>
                </div>
            `);
    });
  }
}

function cleanFieldsWhite() {
  const selectors = [
    ".total-customs",
    ".sum-saide",
    ".fees",
    ".total-nds",
    ".total-duty",
    ".sum-duty",
    ".exchange-saide",
  ];

  selectors.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      element.innerHTML = "н/д";
    });
  });
} /* Start:"a:4:{s:4:"full";s:64:"/calc-layout/js/ajax_request_cargo_from_white.js?172704754569338";s:6:"source";s:48:"/calc-layout/js/ajax_request_cargo_from_white.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
/* End */
function initializeAjaxRequestCargoWhite() {
  let calculateButton = $("#cargo-white-calc-button");
  let $arrival = $("input[name='arrival']");
  let $insurance = $("input[name='insurance']");
  let dollar, yuan;
  let semicolon = '<span style="color: white">; </span>';
  let semicolonHelp = '<span style="color: black">; </span>';
  let semicolonHelpTspan = '<tspan fill="black">; </tspan>';
  async function sendCargoForWhiteMultipleAjaxRequests() {
    const submitButton = document.querySelector("#cargo-white-calc-button");
    submitButton.disabled = true;
    const boxingExpandButton = document.querySelector(".boxing-spoiler-header");
    boxingExpandButton.style.pointerEvents = "none";
    boxingExpandButton.parentElement.style.background = "grey";
    const calcTypeButtons = document.querySelectorAll(
      ".calc-type-button:not(.tnved-calc-button.submit-redeem-data.submit-excel-file):not(.submit-general-button):not(.submit-dimensions-button)"
    );
    calcTypeButtons.forEach((calcTypeButton) => {
      calcTypeButton.setAttribute("disabled", "");
    });
    $(".list-elem").removeClass("enable-pointer");
    $(".list-elem.selected").removeClass("selected");
    document.querySelector(".main-offer-button").setAttribute("disabled", "");
    disableBoxingButtons();
    try {
      const cargoResponse = await sendCargoFromWhiteAjaxRequest();
      if (!cargoResponse) {
        // Если cargoResponse не был получен, выходите из функции
        submitButton.disabled = false;
        boxingExpandButton.style.pointerEvents = "all";
        boxingExpandButton.parentElement.style.background = "#141a24";
        calcTypeButtons.forEach((calcTypeButton) => {
          calcTypeButton.removeAttribute("disabled");
        });
        enableBoxingButtons();
        return;
      }
      // Отправляем остальные запросы, передавая cargoResponse
      await Promise.all([
        sendDLAjaxRequest(cargoResponse),
        sendPEKAjaxRequest(cargoResponse),
        sendJDEAjaxRequest(cargoResponse),
        sendKITAjaxRequest(cargoResponse),
      ]);
      // Если были изменения, выполнить запросы заново
    } catch (error) {
      console.log("Ошибка при отправке запроса:", error);
    } finally {
      submitButton.disabled = false;
      boxingExpandButton.style.pointerEvents = "all";
      boxingExpandButton.parentElement.style.background = "#141a24";
      calcTypeButtons.forEach((calcTypeButton) => {
        calcTypeButton.removeAttribute("disabled");
      });
      enableBoxingButtons();
    }
  }

  function ajaxofferDataCargoRequest(deliveryType, deliveryTypeRus) {
    if (offerDataCargo) {
      let offerDataCargoRequest = {
        DeliveryType: "Тип доставки: " + deliveryTypeRus,
        ExchangeRateYuan: "Курс юаня SAIDE: " + offerDataCargo.yuan + "₽",
        ExchangeRateDollar:
          "Курс доллара SAIDE: " + offerDataCargo.dollar + "₽",
        TOTAL:
          "ИТОГО: " +
          offerDataCargo.sum_cost_price[deliveryType] +
          "$; " +
          offerDataCargo.sum_cost_price_rub[deliveryType] +
          "₽",
        GoodsCost: "Стоимость товара: " + offerDataCargo.total_cost + "₽",
        Weight: "Вес: " + offerDataCargo.total_weight + "кг",
        Volume:
          "Объем: " +
          parseFloat(offerDataCargo.total_volume.toFixed(3)) +
          "м" +
          String.fromCharCode(0x00b3),
        Count: "Количество: ",
        RedeemCommission:
          "Комиссия SAIDE 5% от стоимости товара: " +
          (
            (offerDataCargo.commission_price * offerDataCargo.yuan) /
            offerDataCargo.dollar
          ).toFixed(2) +
          "$; " +
          (offerDataCargo.commission_price * offerDataCargo.yuan).toFixed(2) +
          "₽",
        PackageType: "Упаковка: " + offerDataCargo.type_of_packaging,
        PackageCost: "За упаковку: " + offerDataCargo.packaging_price_pub + "₽",
        Insurance:
          "Страховка: " +
          offerDataCargo.insurance.toFixed(2) +
          "$; " +
          (offerDataCargo.insurance * offerDataCargo.dollar).toFixed(2) +
          "₽",
        Kg:
          "За кг: " +
          offerDataCargo.cost_price[deliveryType] +
          "$; " +
          offerDataCargo.cost_price_rub[deliveryType] +
          "₽",
        Sum:
          "Сумма: " +
          offerDataCargo.sum_cost_price[deliveryType] +
          "$; " +
          offerDataCargo.sum_cost_price_rub[deliveryType] +
          "₽",
      };

      showModal("Идёт передача данных диспетчеру, пожалуйста, подождите... ");
      let countdown = 20; // Максимальное время ожидания в секундах
      countdownTimer = setInterval(function () {
        updateModalMessage(
          "Идёт передача данных диспетчеру, пожалуйста, подождите... " +
            countdown +
            " сек."
        );
        countdown--;
        if (countdown < 0) {
          clearInterval(countdownTimer);
        }
      }, 1000);

      $.ajax({
        type: "POST",
        url: "https://api-calc.wisetao.com:4343/api/get-offer",
        data: offerDataCargoRequest,
        xhrFields: {
          responseType: "blob", // Устанавливаем ожидание бинарных данных
        },
        success: function (response) {
          let url = URL.createObjectURL(response);

          // Открываем PDF в новой вкладке браузера
          window.open(url, "_blank");

          // Освобождаем ресурсы URL
          URL.revokeObjectURL(url);

          console.log("Успешно отправлено!");
          console.log("Ответ сервера:", response);

          submitRedeemData(response);
        },
        error: function (error) {
          clearInterval(countdownTimer);
          hideModal();
        },
      });
    }
  }

  function sendCargoFromWhiteAjaxRequest() {
    // Проверка, если checkbox_input_type отмечен
    // Выберите активный чекбокс с классом .boxing
    let isAllInputFieldsFilled = true;
    let $tnvedDataContainer = $(".tnved-data-container");
    $tnvedDataContainer.each(function () {
      $(this)
        .find("input")
        .add($arrival)
        .each(function () {
          if (!$(this).hasClass("select-by-name-input")) {
            if ($(this).val() === "") {
              isAllInputFieldsFilled = false;
              return false; // Выход из цикла, как только найдено незаполненное поле
            }
          }
        });
    });
    let activeCheckbox = $(".boxing:checked");

    let isRansom =
      $("input[name='delivery-option']:checked").val() === "delivery-only";

    if (
      isAllInputFieldsFilled &&
      ((!isRansom &&
        (validateFields() ||
          !!document.querySelector(".selected-file-name")?.childNodes[3])) ||
        isRansom)
    ) {
      activateDeliveryPicks();
      totalVolume = 0;
      let goods = [];
      // Получение данных из полей ввода и списков
      $tnvedDataContainer.each(function () {
        // Получите значение поля weight и преобразуйте его в число
        let weight = parseFloat($(this).find('[name="weight[]"]').val());
        let volume = parseFloat($(this).find('[name="volume[]"]').val());
        let currency = parseFloat($(this).find('[name="currency[]"]').val());
        let $typeOfGoodsDropdown = $(this).find(
          ".type-of-goods-dropdown-toggle"
        );
        let $currencySign = $(this).find(".currency-toggle");
        let $brand = $(this).find(".brand-checkbox");
        goods.push({
          price: currency,
          weight: weight,
          volume: volume,
          count: 1,
          type_of_goods: $typeOfGoodsDropdown
            .contents()
            .first()
            .text()
            .match(/[A-Za-zА-Яа-я\s]+/g) // Оставить только английские и русские символы и пробелы
            .join(" ") // Объединить в строку с пробелами
            .trim(),
          currency_sign: $currencySign.contents().first().text(),
          brand: $brand.is(":checked") ? "brand" : null,
        });
        // Создайте объект item и добавьте его в requestData.items (ваш существующий код)
      });
      let boxing =
        activeCheckbox.length > 0 ? activeCheckbox.attr("name") : null;
      let insurance = $insurance.is(":checked")
        ? $insurance.attr("name")
        : null;
      // Получите значение чекбокса с именем "ransom"

      // Определите значение параметра "clause" в зависимости от состояния чекбокса
      let clause = isRansom ? "self-purchase" : "ransom";

      // Подготовьте данные для отправки
      let requestData = {
        goods: goods,
        boxing: boxing,
        clause: clause,
        white: "white",
        insurance: insurance,
      };
      return new Promise((resolve, reject) => {
        showAwait(".cargo-cost-elem:not(.white-cost-elem)", "cargo", true);
        $.ajax({
          type: "POST",
          url: "https://api-calc.wisetao.com:4343/api/calculate-cargo-delivery",
          data: requestData,
          success: function (response) {
            offerDataCargo = response;
            dollar = response.dollar;
            yuan = response.yuan;
            updatePageWithCargoResponse(response);
            showAwait(".cargo-cost-elem:not(.white-cost-elem)", "cargo", false);
            console.log("Успешно отправлено!");
            console.log("Ответ сервера:", response);

            resolve(response);
          },
          error: function (error) {
            showAwait(".cargo-cost-elem:not(.white-cost-elem)", "cargo", false);
            reject(error);
          },
        });
      });
    } else {
      console.log(
        "Заполните все обязательные поля. Запрос не будет отправлен."
      );
      return Promise.reject("Заполните все обязательные поля.");
    }
  }

  function handleBoxingChangeCargoForWhite() {
    if (activeButton.dataset.type === "comparison") {
      sendCargoForWhiteMultipleAjaxRequests().catch(() => {});
    }
  }

  let $boxing = $(".boxing");
  $boxing.off("change", handleBoxingChangeCargoForWhite);
  $boxing.on("change", handleBoxingChangeCargoForWhite);

  let $offerButtons = $(".offer-button");
  $offerButtons.on("click", function (event) {
    event.stopPropagation();
    event.preventDefault();
    if (
      document
        .querySelector(".list-help.selected")
        .closest("ul")
        .firstElementChild.querySelector("li .list-help")
        .classList.contains("cargo-help")
    ) {
      if (_tmr) {
        _tmr.push({ type: "reachGoal", id: 3555455, goal: "calculate_offer" });
      }
      // document.querySelector('.pop-up-dark-back-offer').style.display = 'flex';
      ajaxofferDataCargoRequest(
        document
          .querySelector(".list-help.selected")
          .closest(".desc")
          .querySelector(".delivery-types-dropdown").dataset.delivery_type,
        document
          .querySelector(".list-help.selected")
          .closest(".desc")
          .querySelector(".delivery-types-dropdown").dataset.delivery_type_rus
      );
    }
    event.stopPropagation();
    event.preventDefault();
  });

  // let $offerButton = $(".pop-up-offer-button");
  // $offerButton.on('click', function (event) {
  //     event.stopPropagation();
  //     event.preventDefault();
  //     let notice = document.querySelector('.pop-up-email').nextElementSibling;
  //     if (document.querySelector('.pop-up-email').value !== '') {
  //         if (document.querySelector('.list-help.selected').closest('ul').firstElementChild.querySelector('li .list-help').classList.contains('cargo-help')) {
  //             ajaxofferDataCargoRequest(
  //                 document.querySelector('.list-help.selected').closest('.desc').querySelector('.delivery-types-dropdown').dataset.delivery_type,
  //                 document.querySelector('.list-help.selected').closest('.desc').querySelector('.delivery-types-dropdown').dataset.delivery_type_rus,
  //             );
  //         }
  //         hideNoticePopUp();
  //     }
  //     else {
  //         notice.textContent = "заполните " + '"EMail"';
  //         notice.style.display = 'block'; // Отобразить надпись
  //         document.querySelector('.pop-up-email').style.border = '1px solid #a81d29';
  //     }
  //     event.stopPropagation();
  //     event.preventDefault();
  // });

  calculateButton.on("click", function (event) {
    // Проверяем, что все поля ввода заполнены
    event.preventDefault();
    if (_tmr) {
      _tmr.push({ type: "reachGoal", id: 3555455, goal: "calculate_button" });
    }
    if (activeButton.dataset.type === "comparison") {
      sendCargoForWhiteMultipleAjaxRequests().catch(() => {});
    }
    event.preventDefault();
    event.stopPropagation();
  });

  function sendDLAjaxRequest(response) {
    let totalVolume = response.total_volume;
    let totalWeight = response.total_weight;
    let arrival = $arrival.val();

    let count = $(".tnved-data-container").length;
    return new Promise((resolve, reject) => {
      showAwait(".cargo-cost-elem:not(.white-cost-elem)", "dl", true);
      $.ajax({
        type: "GET",
        url: "https://api-calc.wisetao.com:4343/api/calculate-dl-delivery",
        data: {
          arrival: arrival,
          total_volume: totalVolume,
          total_weight: totalWeight,
          count: count,
          max_dimension: 0,
          from: "Москва",
        },
        success: function (dlResponse) {
          updatePageWithDLResponse(response, dlResponse);
          showAwait(".cargo-cost-elem:not(.white-cost-elem)", "dl", false);
          console.log("Успешно отправлен второй запрос!");
          console.log("Ответ второго запроса:", dlResponse);
          resolve();
        },
        error: function (dlError) {
          // Обработка ошибки второго запроса
          console.error("Ошибка при отправке второго запроса:", dlError);
          showAwait(".cargo-cost-elem:not(.white-cost-elem)", "dl", false);
          reject(dlError);
        },
      });
    });
  }

  function sendPEKAjaxRequest(response) {
    let totalVolume = response.total_volume;
    let totalWeight = response.total_weight;
    let arrival = $arrival.val();
    let count = $(".tnved-data-container").length;
    // Отправляем третий запрос
    return new Promise((resolve, reject) => {
      showAwait(".cargo-cost-elem:not(.white-cost-elem)", "pek", true);
      $.ajax({
        type: "GET",
        url: "https://api-calc.wisetao.com:4343/api/calculate-pek-delivery",
        data: {
          arrival: arrival,
          total_volume: totalVolume,
          total_weight: totalWeight,
          count: count,
          max_dimension: 0,
          from: "Москва",
        },
        success: function (pekResponse) {
          updatePageWithPekResponse(response, pekResponse);
          showAwait(".cargo-cost-elem:not(.white-cost-elem)", "pek", false);
          // Обработка успешного выполнения третьего запроса
          console.log("Успешно отправлен третий запрос!");
          console.log("Ответ сервера (третий запрос):", pekResponse);
          resolve();
          // Обновление значений на странице согласно третьему запросу
          // ... (обновления значений на странице согласно вашим требованиям)
        },
        error: function (error) {
          // Обработка ошибок при отправке третьего запроса
          console.error("Ошибка при отправке третьего запроса:", error);
          showAwait(".cargo-cost-elem:not(.white-cost-elem)", "pek", false);
          reject(error);
        },
      });
    });
  }

  function sendJDEAjaxRequest(response) {
    let totalVolume = response.total_volume;
    let totalWeight = response.total_weight;
    let arrival = $arrival.val();
    let count = $(".tnved-data-container").length;
    // Отправляем третий запрос
    return new Promise((resolve, reject) => {
      showAwait(".cargo-cost-elem:not(.white-cost-elem)", "jde", true);
      $.ajax({
        type: "GET",
        url: "https://api-calc.wisetao.com:4343/api/calculate-railway-expedition-delivery",
        data: {
          arrival: arrival,
          total_volume: totalVolume,
          total_weight: totalWeight,
          count: count,
          max_dimension: 0,
          from: "Москва",
        },
        success: function (jdeResponse) {
          updatePageWithJDEResponse(response, jdeResponse);
          // Выключаем анимацию и скрываем элементы с анимацией
          showAwait(".cargo-cost-elem:not(.white-cost-elem)", "jde", false);
          // Обработка успешного выполнения третьего запроса
          console.log("Успешно отправлен четвертый запрос!");
          console.log("Ответ сервера (четвертый запрос):", jdeResponse);
          resolve();
          // Обновление значений на странице согласно третьему запросу
          // ... (обновления значений на странице согласно вашим требованиям)
        },
        error: function (error) {
          // Обработка ошибок при отправке третьего запроса
          console.error("Ошибка при отправке четвертого запроса:", error);
          showAwait(".cargo-cost-elem:not(.white-cost-elem)", "jde", false);
          reject(error);
          // Выключаем анимацию и скрываем элементы с анимацией
        },
      });
    });
  }

  function sendKITAjaxRequest(response) {
    let totalVolume = response.total_volume;
    let totalWeight = response.total_weight;
    let price = response.total_cost;
    let arrival = $arrival.val();
    let count = $(".tnved-data-container").length;
    // Отправляем пятый запрос
    return new Promise((resolve, reject) => {
      showAwait(".cargo-cost-elem:not(.white-cost-elem)", "kit", true);
      $.ajax({
        type: "GET",
        url: "https://api-calc.wisetao.com:4343/api/calculate-kit-delivery",
        data: {
          arrival: arrival,
          total_volume: totalVolume,
          total_weight: totalWeight,
          count: count,
          max_dimension: 0,
          price: price,
          from: "Москва",
        },
        success: function (kitResponse) {
          updatePageWithKITResponse(response, kitResponse);
          showAwait(".cargo-cost-elem:not(.white-cost-elem)", "kit", false);
          // Обработка успешного выполнения пятого запроса
          console.log("Успешно отправлен пятый запрос!");
          console.log("Ответ сервера (пятый запрос):", kitResponse);
          resolve();
          // Обновление значений на странице согласно пятому запросу
          // ... (обновления значений на странице согласно вашим требованиям)
        },
        error: function (error) {
          // Обработка ошибок при отправке пятого запроса
          showAwait(".cargo-cost-elem:not(.white-cost-elem)", "kit", false);
          console.error("Ошибка при отправке пятого запроса:", error);
          reject(error);
        },
      });
    });
  }

  function updateDeliveryToggle(
    deliveryToggle,
    currentKg,
    currentSum,
    currentRateDollar,
    currentRateYuan,
    kgValue,
    sumValue,
    kgValueRub,
    sumValueRub,
    helpElement,
    name
  ) {
    // Находим текущие значения в deliveryToggle
    const kg = currentKg.html();
    const arrow = deliveryToggle[0].querySelector(
      ".dropdown-list-delivery-arrow"
    );
    const rates = deliveryToggle[0].querySelector(".costs-data-exchange-rate");
    // Сравниваем новые значения с текущими и проверяем, что они не равны 'н/д'
    if (
      kg === "$н/д" + semicolon + " ₽н/д" ||
      parseFloat(kgValue) < parseFloat(kg) ||
      (deliveryToggle[0].innerText.substring(0, 5) === "Карго" &&
        kg !== "$н/д" + semicolon + " ₽н/д" &&
        name !== "Карго")
    ) {
      // Обновляем текст в deliveryToggle
      currentKg.html(kgValue + "$" + semicolon + " " + kgValueRub + "₽");
      currentSum.html(sumValue + "$" + semicolon + " " + sumValueRub + "₽");
      currentRateDollar.text(dollar + "₽");
      currentRateYuan.text(yuan + "₽");
      deliveryToggle[0].textContent = name;
      if (helpElement) {
        const clonedHelpElement = helpElement.cloneNode(true);
        deliveryToggle.append(clonedHelpElement);
        clonedHelpElement.style.marginTop = "7px";
        clonedHelpElement.addEventListener("mouseenter", updateBalloonPosition);
        clonedHelpElement
          .querySelector(".offer-button")
          .addEventListener("click", function (event) {
            event.stopPropagation();
            event.preventDefault();
            ajaxofferDataCargoRequest(
              event.target
                .closest(".desc")
                .querySelector(".delivery-types-dropdown").dataset
                .delivery_type,
              event.target
                .closest(".desc")
                .querySelector(".delivery-item-label")
                .textContent.trim()
            );
            event.preventDefault();
            event.stopPropagation();
          });
      }
      if (rates) {
        deliveryToggle.append(rates);
      }
      if (arrow) {
        deliveryToggle.append(arrow);
      }
    }
    // Если найден элемент help, обновляем его в delivery-toggle
  }

  function updatePageWithCargoResponse(response) {
    // Обновляем значения для delivery-types-dropdown-auto
    let autoRegularKg = response.cost_price.auto_regular;
    let autoRegularKgRub = response.cost_price_rub.auto_regular;
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .cost-elem.cargo .kg"
    ).html(
      "$" +
        response.cost_price.auto_regular +
        " - " +
        "₽" +
        response.cost_price_rub.auto_regular
    );
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .cost-elem.cargo .sum .sum-dollar"
    ).html("$" + response.sum_cost_price.auto_regular);
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .cost-elem.cargo .sum .sum-rub"
    ).html("₽" + response.sum_cost_price_rub.auto_regular);
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .cargo-help .balloon-container .kg"
    ).html(
      "$" +
        response.cost_price.auto_regular +
        semicolonHelpTspan +
        "₽" +
        response.cost_price_rub.auto_regular
    );
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .cargo-help .balloon-container .sum"
    ).html(
      response.sum_cost_price.auto_regular +
        "$" +
        semicolonHelpTspan +
        response.sum_cost_price_rub.auto_regular +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .cargo-help .balloon-container .exchange-rate-elem-dollar"
    ).html(dollar);
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .cargo-help .balloon-container .exchange-rate-elem-yuan"
    ).html(yuan);
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .cargo-help .balloon-container .boxing-type"
    ).html(response.type_of_packaging);
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .cargo-help .balloon-container .packaging-price"
    ).html(
      (response.packaging_price_pub / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        response.packaging_price_pub.toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .cargo-help .balloon-container .redeem-commission"
    ).html(
      ((response.commission_price * yuan) / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.commission_price * yuan).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .cargo-help .balloon-container .insurance"
    ).html(
      response.insurance.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.insurance * dollar).toFixed(2) +
        "₽"
    );

    let autoFastKg = response.cost_price.auto_fast;
    let autoFastKgRub = response.cost_price_rub.auto_fast;
    // Обновляем значения для delivery-types-dropdown-fast-auto
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .cost-elem.cargo .kg"
    ).html(
      "$" +
        response.cost_price.auto_fast +
        " - " +
        "₽" +
        response.cost_price_rub.auto_fast
    );
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .cost-elem.cargo .sum .sum-dollar"
    ).html("$" + response.sum_cost_price.auto_fast);
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .cost-elem.cargo .sum .sum-rub"
    ).html("₽" + response.sum_cost_price_rub.auto_fast);
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .cargo-help .balloon-container .kg"
    ).html(
      "$" +
        response.cost_price.auto_fast +
        semicolonHelpTspan +
        "₽" +
        response.cost_price_rub.auto_fast
    );
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .cargo-help .balloon-container .sum"
    ).html(
      response.sum_cost_price.auto_fast +
        "$" +
        semicolonHelpTspan +
        response.sum_cost_price_rub.auto_fast +
        "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .cargo-help .balloon-container .exchange-rate-elem-dollar"
    ).html(dollar);
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .cargo-help .balloon-container .exchange-rate-elem-yuan"
    ).html(yuan);
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .cargo-help .balloon-container .boxing-type"
    ).html(response.type_of_packaging);
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .cargo-help .balloon-container .packaging-price"
    ).html(
      (response.packaging_price_pub / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        response.packaging_price_pub.toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .cargo-help .balloon-container .redeem-commission"
    ).html(
      ((response.commission_price * yuan) / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.commission_price * yuan).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .cargo-help .balloon-container .insurance"
    ).html(
      response.insurance.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.insurance * dollar).toFixed(2) +
        "₽"
    );

    let railwayKg = response.cost_price.ZhD;
    let railwayKgRub = response.cost_price_rub.ZhD;
    // Обновляем значения для delivery-types-dropdown-railway
    $(
      "#delivery-types-dropdown-railway .delivery-types-list-comparison.cargo .cost-elem.cargo .kg"
    ).html(
      "$" + response.cost_price.ZhD + " - " + "₽" + response.cost_price_rub.ZhD
    );
    $(
      "#delivery-types-dropdown-railway .delivery-types-list-comparison.cargo .cost-elem.cargo .sum .sum-dollar"
    ).html("$" + response.sum_cost_price.ZhD);
    $(
      "#delivery-types-dropdown-railway .delivery-types-list-comparison.cargo .cost-elem.cargo .sum .sum-rub"
    ).html("₽" + response.sum_cost_price_rub.ZhD);
    $(
      "#delivery-types-dropdown-railway .delivery-types-list-comparison.cargo .cargo-help .balloon-container .kg"
    ).html(
      "$" +
        response.cost_price.ZhD +
        semicolonHelpTspan +
        "₽" +
        response.cost_price_rub.ZhD
    );
    $(
      "#delivery-types-dropdown-railway .delivery-types-list-comparison.cargo .cargo-help .balloon-container .sum"
    ).html(
      response.sum_cost_price.ZhD +
        "$" +
        semicolonHelpTspan +
        response.sum_cost_price_rub.ZhD +
        "₽"
    );
    $(
      "#delivery-types-dropdown-railway .delivery-types-list-comparison.cargo .cargo-help .balloon-container .exchange-rate-elem-dollar"
    ).html(dollar);
    $(
      "#delivery-types-dropdown-railway .delivery-types-list-comparison.cargo .cargo-help .balloon-container .exchange-rate-elem-yuan"
    ).html(yuan);
    $(
      "#delivery-types-dropdown-railway .delivery-types-list-comparison.cargo .cargo-help .balloon-container .boxing-type"
    ).html(response.type_of_packaging);
    $(
      "#delivery-types-dropdown-railway .delivery-types-list-comparison.cargo .cargo-help .balloon-container .packaging-price"
    ).html(
      (response.packaging_price_pub / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        response.packaging_price_pub.toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-railway .delivery-types-list-comparison.cargo .cargo-help .balloon-container .redeem-commission"
    ).html(
      ((response.commission_price * yuan) / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.commission_price * yuan).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-railway .delivery-types-list-comparison.cargo .cargo-help .balloon-container .insurance"
    ).html(
      response.insurance.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.insurance * dollar).toFixed(2) +
        "₽"
    );

    let aviaKg = response.cost_price.avia;
    let aviaKgRub = response.cost_price_rub.avia;
    // Обновляем значения для delivery-types-dropdown-railway
    $(
      "#delivery-types-dropdown-avia .delivery-types-list-comparison.cargo .cost-elem.cargo .kg"
    ).html(
      "$" +
        response.cost_price.avia +
        " - " +
        "₽" +
        response.cost_price_rub.avia
    );
    $(
      "#delivery-types-dropdown-avia .delivery-types-list-comparison.cargo .cost-elem.cargo .sum .sum-dollar"
    ).html("$" + response.sum_cost_price.avia);
    $(
      "#delivery-types-dropdown-avia .delivery-types-list-comparison.cargo .cost-elem.cargo .sum .sum-rub"
    ).html("₽" + response.sum_cost_price_rub.avia);
    $(
      "#delivery-types-dropdown-avia .delivery-types-list-comparison.cargo .cargo-help .balloon-container .kg"
    ).html(
      "$" +
        response.cost_price.avia +
        semicolonHelpTspan +
        response.cost_price_rub.avia +
        "₽"
    );
    $(
      "#delivery-types-dropdown-avia .delivery-types-list-comparison.cargo .cargo-help .balloon-container .sum"
    ).html(
      response.sum_cost_price.avia +
        "$" +
        semicolonHelpTspan +
        response.sum_cost_price_rub.avia +
        "₽"
    );
    $(
      "#delivery-types-dropdown-avia .delivery-types-list-comparison.cargo .cargo-help .balloon-container .exchange-rate-elem-dollar"
    ).html(dollar);
    $(
      "#delivery-types-dropdown-avia .delivery-types-list-comparison.cargo .cargo-help .balloon-container .exchange-rate-elem-yuan"
    ).html(yuan);
    $(
      "#delivery-types-dropdown-avia .delivery-types-list-comparison.cargo .cargo-help .balloon-container .boxing-type"
    ).html(response.type_of_packaging);
    $(
      "#delivery-types-dropdown-avia .delivery-types-list-comparison.cargo .cargo-help .balloon-container .packaging-price"
    ).html(
      (response.packaging_price_pub / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        response.packaging_price_pub.toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-avia .delivery-types-list-comparison.cargo .cargo-help .balloon-container .redeem-commission"
    ).html(
      ((response.commission_price * yuan) / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.commission_price * yuan).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-avia .delivery-types-list-comparison.cargo .cargo-help .balloon-container .insurance"
    ).html(
      response.insurance.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.insurance * dollar).toFixed(2) +
        "₽"
    );
  }

  function updatePageWithDLResponse(response, dlResponse) {
    // Обновление элементов внутри delivery-types-dropdown-auto
    let autoRegularKg =
      dlResponse.sum_cost_price.auto_regular === "н/д"
        ? "н/д"
        : parseFloat(
            (response.sum_cost_price.auto_regular +
              dlResponse.sum_cost_price.auto_regular) /
              response.total_weight
          ).toFixed(2);
    let autoRegularKgRub =
      dlResponse.sum_cost_price_rub.auto_regular === "н/д"
        ? "н/д"
        : parseFloat(
            (response.sum_cost_price_rub.auto_regular +
              dlResponse.sum_cost_price_rub.auto_regular) /
              response.total_weight
          ).toFixed(2);
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .cost-elem.dl .kg"
    ).html(
      autoRegularKg === "н/д"
        ? "$н/д" + " - " + " ₽н/д"
        : "$" + autoRegularKg + " - " + "₽" + autoRegularKgRub
    );
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .cost-elem.dl .sum .sum-dollar"
    ).html(
      autoRegularKg === "н/д"
        ? "$н/д"
        : "$" + (autoRegularKg * response.total_weight).toFixed(2)
    );
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .cost-elem.dl .sum .sum-rub"
    ).html(
      autoRegularKg === "н/д"
        ? "₽н/д"
        : "₽" + (autoRegularKgRub * response.total_weight).toFixed(2)
    );

    // Обновление элементов внутри delivery-types-dropdown-fast-auto
    let autoFastKg =
      dlResponse.sum_cost_price.auto_fast === "н/д"
        ? "н/д"
        : parseFloat(
            (response.sum_cost_price.auto_fast +
              dlResponse.sum_cost_price.auto_fast) /
              response.total_weight
          ).toFixed(2);
    let autoFastKgRub =
      dlResponse.sum_cost_price_rub.auto_fast === "н/д"
        ? "н/д"
        : parseFloat(
            (response.sum_cost_price_rub.auto_fast +
              dlResponse.sum_cost_price_rub.auto_fast) /
              response.total_weight
          ).toFixed(2);
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .cost-elem.dl .kg"
    ).html(
      autoFastKg === "н/д"
        ? "$н/д" + " - " + "₽н/д"
        : "$" + autoFastKg + " - " + "₽" + autoFastKgRub
    );
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .cost-elem.dl .sum .sum-dollar"
    ).html(
      autoFastKg === "н/д"
        ? "$н/д"
        : "$" + (autoFastKg * response.total_weight).toFixed(2)
    );
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .cost-elem.dl .sum .sum-rub"
    ).html(
      autoFastKg === "н/д"
        ? "₽н/д"
        : "₽" + (autoFastKgRub * response.total_weight).toFixed(2)
    );

    // Обновление элементов внутри delivery-types-dropdown-avia
    let aviaKg =
      dlResponse.sum_cost_price.avia === "н/д"
        ? "н/д"
        : parseFloat(
            (response.sum_cost_price.avia + dlResponse.sum_cost_price.avia) /
              response.total_weight
          ).toFixed(2);
    let aviaKgRub =
      dlResponse.sum_cost_price_rub.avia === "н/д"
        ? "н/д"
        : parseFloat(
            (response.sum_cost_price_rub.avia +
              dlResponse.sum_cost_price_rub.avia) /
              response.total_weight
          ).toFixed(2);
    $(
      "#delivery-types-dropdown-avia .delivery-types-list-comparison.cargo .cost-elem.dl .kg"
    ).html(
      aviaKg === "н/д"
        ? "$н/д" + " - " + " ₽н/д"
        : "$" + aviaKg + " - " + "₽" + aviaKgRub
    );
    $(
      "#delivery-types-dropdown-avia .delivery-types-list-comparison.cargo .cost-elem.dl .sum .sum-dollar"
    ).html(
      aviaKg === "н/д"
        ? "$н/д"
        : "$" + (aviaKg * response.total_weight).toFixed(2)
    );
    $(
      "#delivery-types-dropdown-avia .delivery-types-list-comparison.cargo .cost-elem.dl .sum .sum-rub"
    ).html(
      aviaKg === "н/д"
        ? "₽н/д"
        : "₽" + (aviaKgRub * response.total_weight).toFixed(2)
    );

    // Обновление элементов внутри delivery-types-dropdown-auto dl-help
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .dl-help .balloon-container .kg"
    ).html(
      autoRegularKg === "н/д"
        ? "$н/д" + semicolonHelp + " ₽н/д"
        : "$" + autoRegularKg + semicolonHelpTspan + "₽" + autoRegularKgRub
    );
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .dl-help .balloon-container .sum"
    ).html(
      autoRegularKg === "н/д"
        ? "$н/д" + semicolonHelp + " ₽н/д"
        : (autoRegularKg * response.total_weight).toFixed(2) +
            "$" +
            semicolonHelpTspan +
            (autoRegularKgRub * response.total_weight).toFixed(2) +
            "₽"
    );
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .dl-help .balloon-container .exchange-rate-elem-dollar"
    ).html(dollar);
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .dl-help .balloon-container .exchange-rate-elem-yuan"
    ).html(yuan);
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .dl-help .balloon-container .boxing-type"
    ).html(response.type_of_packaging);
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .dl-help .balloon-container .packaging-price"
    ).html(
      (response.packaging_price_pub / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        response.packaging_price_pub.toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .dl-help .balloon-container .kg-cargo"
    ).html(
      (response.sum_cost_price.auto_regular / response.total_weight).toFixed(
        2
      ) +
        "$" +
        semicolonHelpTspan +
        (
          (response.sum_cost_price.auto_regular / response.total_weight) *
          dollar
        ).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .dl-help .balloon-container .sum-cargo"
    ).html(
      response.sum_cost_price.auto_regular.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.sum_cost_price.auto_regular * dollar).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .dl-help .balloon-container .redeem-commission"
    ).html(
      ((response.commission_price * yuan) / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.commission_price * yuan).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .dl-help .balloon-container .insurance"
    ).html(
      response.insurance.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.insurance * dollar).toFixed(2) +
        "₽"
    );

    // Обновление элементов внутри delivery-types-dropdown-fast-auto dl-help
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .dl-help .balloon-container .kg"
    ).html(
      autoFastKg === "н/д"
        ? "$н/д" + semicolonHelp + " ₽н/д"
        : "$" + autoFastKg + semicolonHelpTspan + "₽" + autoFastKgRub
    );
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .dl-help .balloon-container .sum"
    ).html(
      autoFastKg === "н/д"
        ? "$н/д" + semicolonHelp + " ₽н/д"
        : (autoFastKg * response.total_weight).toFixed(2) +
            "$" +
            semicolonHelpTspan +
            (autoFastKgRub * response.total_weight).toFixed(2) +
            "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .dl-help .balloon-container .exchange-rate-elem-dollar"
    ).html(dollar);
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .dl-help .balloon-container .exchange-rate-elem-yuan"
    ).html(yuan);
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .dl-help .balloon-container .boxing-type"
    ).html(response.type_of_packaging);
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .dl-help .balloon-container .packaging-price"
    ).html(
      (response.packaging_price_pub / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        response.packaging_price_pub.toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .dl-help .balloon-container .kg-cargo"
    ).html(
      (response.sum_cost_price.auto_regular / response.total_weight).toFixed(
        2
      ) +
        "$" +
        semicolonHelpTspan +
        (
          (response.sum_cost_price.auto_regular / response.total_weight) *
          dollar
        ).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .dl-help .balloon-container .sum-cargo"
    ).html(
      response.sum_cost_price.auto_regular.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.sum_cost_price.auto_regular * dollar).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .dl-help .balloon-container .redeem-commission"
    ).html(
      ((response.commission_price * yuan) / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.commission_price * yuan).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .dl-help .balloon-container .insurance"
    ).html(
      response.insurance.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.insurance * dollar).toFixed(2) +
        "₽"
    );

    // Обновление элементов внутри delivery-types-dropdown-avia dl-help
    $(
      "#delivery-types-dropdown-avia .delivery-types-list-comparison.cargo .dl-help .balloon-container .kg"
    ).html(
      aviaKg === "н/д"
        ? "$н/д" + semicolonHelp + " ₽н/д"
        : "$" + aviaKg + semicolonHelpTspan + "₽" + aviaKgRub
    );
    $(
      "#delivery-types-dropdown-avia .delivery-types-list-comparison.cargo .dl-help .balloon-container .sum"
    ).html(
      aviaKg === "н/д"
        ? "$н/д" + semicolonHelp + " ₽н/д"
        : (aviaKg * response.total_weight).toFixed(2) +
            "$" +
            semicolonHelpTspan +
            (aviaKgRub * response.total_weight).toFixed(2) +
            "₽"
    );
    $(
      "#delivery-types-dropdown-avia .delivery-types-list-comparison.cargo .dl-help .balloon-container .exchange-rate-elem-dollar"
    ).html(dollar);
    $(
      "#delivery-types-dropdown-avia .delivery-types-list-comparison.cargo .dl-help .balloon-container .exchange-rate-elem-yuan"
    ).html(yuan);
    $(
      "#delivery-types-dropdown-avia .delivery-types-list-comparison.cargo .dl-help .balloon-container .boxing-type"
    ).html(response.type_of_packaging);
    $(
      "#delivery-types-dropdown-avia .delivery-types-list-comparison.cargo .dl-help .balloon-container .packaging-price"
    ).html(
      (response.packaging_price_pub / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        response.packaging_price_pub.toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-avia .delivery-types-list-comparison.cargo .dl-help .balloon-container .kg-cargo"
    ).html(
      (response.sum_cost_price.auto_regular / response.total_weight).toFixed(
        2
      ) +
        "$" +
        semicolonHelpTspan +
        (
          (response.sum_cost_price.auto_regular / response.total_weight) *
          dollar
        ).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-avia .delivery-types-list-comparison.cargo .dl-help .balloon-container .sum-cargo"
    ).html(
      response.sum_cost_price.auto_regular.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.sum_cost_price.auto_regular * dollar).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-avia .delivery-types-list-comparison.cargo .dl-help .balloon-container .redeem-commission"
    ).html(
      ((response.commission_price * yuan) / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.commission_price * yuan).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-avia .delivery-types-list-comparison.cargo .dl-help .balloon-container .insurance"
    ).html(
      response.insurance.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.insurance * dollar).toFixed(2) +
        "₽"
    );
  }

  function updatePageWithPekResponse(response, pekResponse) {
    // Обновляем значения для delivery-types-dropdown-auto
    let autoRegularKg =
      pekResponse.sum_cost_price.auto_regular === "н/д"
        ? "н/д"
        : parseFloat(
            (response.sum_cost_price.auto_regular +
              pekResponse.sum_cost_price.auto_regular) /
              response.total_weight
          ).toFixed(2);
    let autoRegularSum =
      pekResponse.sum_cost_price.auto_regular === "н/д"
        ? "н/д"
        : parseFloat(
            response.sum_cost_price.auto_regular +
              pekResponse.sum_cost_price.auto_regular
          ).toFixed(2);

    let autoRegularKgRub =
      pekResponse.sum_cost_price_rub.auto_regular === "н/д"
        ? "н/д"
        : parseFloat(
            (response.sum_cost_price_rub.auto_regular +
              pekResponse.sum_cost_price_rub.auto_regular) /
              response.total_weight
          ).toFixed(2);
    let autoRegularSumRub =
      pekResponse.sum_cost_price_rub.auto_regular === "н/д"
        ? "н/д"
        : parseFloat(
            response.sum_cost_price_rub.auto_regular +
              pekResponse.sum_cost_price_rub.auto_regular
          ).toFixed(2);
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .cost-elem.pek .kg"
    ).html(
      autoRegularKg === "н/д"
        ? "$н/д" + " - " + " ₽н/д"
        : "$" + autoRegularKg + " - " + "₽" + autoRegularKgRub
    );
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .cost-elem.pek .sum .sum-dollar"
    ).html(autoRegularSum === "н/д" ? "$н/д" : "$" + autoRegularSum);
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .cost-elem.pek .sum .sum-rub"
    ).html(autoRegularSum === "н/д" ? "₽н/д" : "₽" + autoRegularSumRub);

    // Обновляем значения для delivery-types-dropdown-auto dl-help
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .pek-help .balloon-container .kg"
    ).html(
      autoRegularKg === "н/д"
        ? "$н/д" + semicolonHelp + " ₽н/д"
        : "$" + autoRegularKg + semicolonHelpTspan + autoRegularKgRub + "₽"
    );
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .pek-help .balloon-container .sum"
    ).html(
      autoRegularSum === "н/д"
        ? "$н/д" + semicolonHelp + " ₽н/д"
        : autoRegularSum + "$" + semicolonHelpTspan + autoRegularSumRub + "₽"
    );
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .pek-help .balloon-container .exchange-rate-elem-dollar"
    ).html(dollar);
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .pek-help .balloon-container .exchange-rate-elem-yuan"
    ).html(yuan);
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .pek-help .balloon-container .boxing-type"
    ).html(response.type_of_packaging);
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .pek-help .balloon-container .packaging-price"
    ).html(
      (response.packaging_price_pub / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        response.packaging_price_pub.toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .pek-help .balloon-container .kg-cargo"
    ).html(
      (response.sum_cost_price.auto_regular / response.total_weight).toFixed(
        2
      ) +
        "$" +
        semicolonHelpTspan +
        (
          (response.sum_cost_price.auto_regular / response.total_weight) *
          dollar
        ).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .pek-help .balloon-container .sum-cargo"
    ).html(
      response.sum_cost_price.auto_regular.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.sum_cost_price.auto_regular * dollar).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .pek-help .balloon-container .redeem-commission"
    ).html(
      ((response.commission_price * yuan) / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.commission_price * yuan).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .pek-help .balloon-container .insurance"
    ).html(
      response.insurance.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.insurance * dollar).toFixed(2) +
        "₽"
    );

    // Обновляем значения для delivery-types-dropdown-avia
    let aviaKg =
      pekResponse.sum_cost_price.avia === "н/д"
        ? "н/д"
        : parseFloat(
            (response.sum_cost_price.avia + pekResponse.sum_cost_price.avia) /
              response.total_weight
          ).toFixed(2);
    let aviaSum =
      pekResponse.sum_cost_price.avia === "н/д"
        ? "н/д"
        : parseFloat(
            response.sum_cost_price.avia + pekResponse.sum_cost_price.avia
          ).toFixed(2);

    let aviaKgRub =
      pekResponse.sum_cost_price_rub.avia === "н/д"
        ? "н/д"
        : parseFloat(
            (response.sum_cost_price_rub.avia +
              pekResponse.sum_cost_price_rub.avia) /
              response.total_weight
          ).toFixed(2);
    let aviaSumRub =
      pekResponse.sum_cost_price_rub.avia === "н/д"
        ? "н/д"
        : parseFloat(
            response.sum_cost_price_rub.avia +
              pekResponse.sum_cost_price_rub.avia
          ).toFixed(2);
    $(
      "#delivery-types-dropdown-avia .delivery-types-list-comparison.cargo .cost-elem.pek .kg"
    ).html(
      aviaKg === "н/д"
        ? "$н/д" + " - " + " ₽н/д"
        : "$" + aviaKg + " - " + "₽" + aviaKgRub
    );
    $(
      "#delivery-types-dropdown-avia .delivery-types-list-comparison.cargo .cost-elem.pek .sum .sum-dollar"
    ).html(aviaSum === "н/д" ? "$н/д" : "$" + aviaSum);
    $(
      "#delivery-types-dropdown-avia .delivery-types-list-comparison.cargo .cost-elem.pek .sum .sum-rub"
    ).html(aviaSum === "н/д" ? "₽н/д" : "₽" + aviaSumRub);

    // Обновляем значения для delivery-types-dropdown-avia dl-help
    $(
      "#delivery-types-dropdown-avia .delivery-types-list-comparison.cargo .pek-help .balloon-container .kg"
    ).html(
      aviaKg === "н/д"
        ? "$н/д" + semicolonHelp + " ₽н/д"
        : "$" + aviaKg + semicolonHelpTspan + "₽" + aviaKgRub
    );
    $(
      "#delivery-types-dropdown-avia .delivery-types-list-comparison.cargo .pek-help .balloon-container .sum"
    ).html(
      aviaSum === "н/д"
        ? "$н/д" + semicolonHelp + " ₽н/д"
        : aviaSum + "$" + semicolonHelpTspan + aviaSumRub + "₽"
    );
    $(
      "#delivery-types-dropdown-avia .delivery-types-list-comparison.cargo .pek-help .balloon-container .exchange-rate-elem-dollar"
    ).html(dollar);
    $(
      "#delivery-types-dropdown-avia .delivery-types-list-comparison.cargo .pek-help .balloon-container .exchange-rate-elem-yuan"
    ).html(yuan);
    $(
      "#delivery-types-dropdown-avia .delivery-types-list-comparison.cargo .pek-help .balloon-container .boxing-type"
    ).html(response.type_of_packaging);
    $(
      "#delivery-types-dropdown-avia .delivery-types-list-comparison.cargo .pek-help .balloon-container .packaging-price"
    ).html(
      (response.packaging_price_pub / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        response.packaging_price_pub.toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-avia .delivery-types-list-comparison.cargo .pek-help .balloon-container .kg-cargo"
    ).html(
      (response.sum_cost_price.auto_regular / response.total_weight).toFixed(
        2
      ) +
        "$" +
        semicolonHelpTspan +
        (
          (response.sum_cost_price.auto_regular / response.total_weight) *
          dollar
        ).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-avia .delivery-types-list-comparison.cargo .pek-help .balloon-container .sum-cargo"
    ).html(
      response.sum_cost_price.auto_regular.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.sum_cost_price.auto_regular * dollar).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-avia .delivery-types-list-comparison.cargo .pek-help .balloon-container .redeem-commission"
    ).html(
      ((response.commission_price * yuan) / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.commission_price * yuan).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-avia .delivery-types-list-comparison.cargo .pek-help .balloon-container .insurance"
    ).html(
      response.insurance.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.insurance * dollar).toFixed(2) +
        "₽"
    );
  }

  function updatePageWithJDEResponse(response, jdeResponse) {
    // Обновление элементов внутри delivery-types-dropdown-auto для auto_regular
    let autoRegularKg =
      jdeResponse.sum_cost_price.auto_regular === "н/д"
        ? "н/д"
        : parseFloat(
            (response.sum_cost_price.auto_regular +
              jdeResponse.sum_cost_price.auto_regular) /
              response.total_weight
          ).toFixed(2);
    let autoRegularKgRub =
      jdeResponse.sum_cost_price_rub.auto_regular === "н/д"
        ? "н/д"
        : parseFloat(
            (response.sum_cost_price_rub.auto_regular +
              jdeResponse.sum_cost_price_rub.auto_regular) /
              response.total_weight
          ).toFixed(2);
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .cost-elem.jde .kg"
    ).html(
      autoRegularKg === "н/д"
        ? "$н/д" + " - " + " ₽н/д"
        : "$" + autoRegularKg + " - " + "₽" + autoRegularKgRub
    );
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .cost-elem.jde .sum .sum-dollar"
    ).html(
      autoRegularKg === "н/д"
        ? "$н/д"
        : "$" + (autoRegularKg * response.total_weight).toFixed(2)
    );
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .cost-elem.jde .sum .sum-rub"
    ).html(
      autoRegularKg === "н/д"
        ? "₽н/д"
        : "₽" + (autoRegularKgRub * response.total_weight).toFixed(2)
    );

    // Обновление элементов внутри delivery-types-dropdown-fast-auto для auto_fast
    let autoFastKg =
      jdeResponse.sum_cost_price.auto_fast === "н/д"
        ? "н/д"
        : parseFloat(
            (response.sum_cost_price.auto_fast +
              jdeResponse.sum_cost_price.auto_fast) /
              response.total_weight
          ).toFixed(2);
    let autoFastKgRub =
      jdeResponse.sum_cost_price_rub.auto_fast === "н/д"
        ? "н/д"
        : parseFloat(
            (response.sum_cost_price_rub.auto_fast +
              jdeResponse.sum_cost_price_rub.auto_fast) /
              response.total_weight
          ).toFixed(2);
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .cost-elem.jde .kg"
    ).html(
      autoFastKg === "н/д"
        ? "$н/д" + " - " + " ₽н/д"
        : "$" + autoFastKg + " - " + "₽" + autoFastKgRub
    );
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .cost-elem.jde .sum .sum-dollar"
    ).html(
      autoFastKg === "н/д"
        ? "$н/д"
        : "$" + (autoFastKg * response.total_weight).toFixed(2)
    );
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .cost-elem.jde .sum .sum-rub"
    ).html(
      autoFastKg === "н/д"
        ? "₽н/д"
        : "₽" + (autoFastKgRub * response.total_weight).toFixed(2)
    );

    // Обновление элементов внутри delivery-types-dropdown-auto jde-help для auto_regular
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .jde-help .balloon-container .kg"
    ).html(
      autoRegularKg === "н/д"
        ? "$н/д" + semicolonHelp + " ₽н/д"
        : "$" + autoRegularKg + semicolonHelpTspan + autoRegularKgRub + "₽"
    );
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .jde-help .balloon-container .sum"
    ).html(
      autoRegularKg === "н/д"
        ? "$н/д" + semicolonHelp + " ₽н/д"
        : (autoRegularKg * response.total_weight).toFixed(2) +
            "$" +
            semicolonHelpTspan +
            (autoRegularKgRub * response.total_weight).toFixed(2) +
            "₽"
    );
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .jde-help .balloon-container .exchange-rate-elem-dollar"
    ).html(dollar);
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .jde-help .balloon-container .exchange-rate-elem-yuan"
    ).html(yuan);
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .jde-help .balloon-container .boxing-type"
    ).html(response.type_of_packaging);
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .jde-help .balloon-container .packaging-price"
    ).html(
      (response.packaging_price_pub / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        response.packaging_price_pub.toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .jde-help .balloon-container .kg-cargo"
    ).html(
      (response.sum_cost_price.auto_regular / response.total_weight).toFixed(
        2
      ) +
        "$" +
        semicolonHelpTspan +
        (
          (response.sum_cost_price.auto_regular / response.total_weight) *
          dollar
        ).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .jde-help .balloon-container .sum-cargo"
    ).html(
      response.sum_cost_price.auto_regular.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.sum_cost_price.auto_regular * dollar).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .jde-help .balloon-container .redeem-commission"
    ).html(
      ((response.commission_price * yuan) / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.commission_price * yuan).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .jde-help .balloon-container .insurance"
    ).html(
      response.insurance.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.insurance * dollar).toFixed(2) +
        "₽"
    );

    // Обновление элементов внутри delivery-types-dropdown-fast-auto jde-help для auto_fast
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .jde-help .balloon-container .kg"
    ).html(
      autoFastKg === "н/д"
        ? "$н/д" + semicolonHelp + " ₽н/д"
        : "$" + autoFastKg + semicolonHelpTspan + autoFastKgRub + "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .jde-help .balloon-container .sum"
    ).html(
      autoFastKg === "н/д"
        ? "$н/д" + semicolonHelp + " ₽н/д"
        : (autoFastKg * response.total_weight).toFixed(2) +
            "$" +
            semicolonHelpTspan +
            (autoFastKgRub * response.total_weight).toFixed(2) +
            "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .jde-help .balloon-container .exchange-rate-elem-dollar"
    ).html(dollar);
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .jde-help .balloon-container .exchange-rate-elem-yuan"
    ).html(yuan);
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .jde-help .balloon-container .boxing-type"
    ).html(response.type_of_packaging);
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .jde-help .balloon-container .packaging-price"
    ).html(
      (response.packaging_price_pub / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        response.packaging_price_pub.toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .jde-help .balloon-container .kg-cargo"
    ).html(
      (response.sum_cost_price.auto_regular / response.total_weight).toFixed(
        2
      ) +
        "$" +
        semicolonHelpTspan +
        (
          (response.sum_cost_price.auto_regular / response.total_weight) *
          dollar
        ).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .jde-help .balloon-container .sum-cargo"
    ).html(
      response.sum_cost_price.auto_regular.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.sum_cost_price.auto_regular * dollar).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .jde-help .balloon-container .redeem-commission"
    ).html(
      ((response.commission_price * yuan) / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.commission_price * yuan).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .jde-help .balloon-container .insurance"
    ).html(
      response.insurance.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.insurance * dollar).toFixed(2) +
        "₽"
    );
  }

  function updatePageWithKITResponse(response, kitResponse) {
    // Обновление элементов внутри delivery-types-dropdown-auto
    let autoRegularKg =
      kitResponse.sum_cost_price.auto_regular !== "н/д"
        ? parseFloat(
            (response.sum_cost_price.auto_regular +
              kitResponse.sum_cost_price.auto_regular) /
              response.total_weight
          ).toFixed(2)
        : "н/д";
    let autoRegularKgRub =
      kitResponse.sum_cost_price_rub.auto_regular !== "н/д"
        ? parseFloat(
            (response.sum_cost_price_rub.auto_regular +
              kitResponse.sum_cost_price_rub.auto_regular) /
              response.total_weight
          ).toFixed(2)
        : "н/д";
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .cost-elem.kit .kg"
    ).html(
      autoRegularKg !== "н/д"
        ? "$" + autoRegularKg + " - " + "₽" + autoRegularKgRub
        : "$н/д" + " - " + " ₽н/д"
    );
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .cost-elem.kit .sum .sum-dollar"
    ).html(
      autoRegularKg !== "н/д"
        ? "$" + (autoRegularKg * response.total_weight).toFixed(2)
        : "$н/д"
    );
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .cost-elem.kit .sum .sum-rub"
    ).html(
      autoRegularKg !== "н/д"
        ? "₽" + (autoRegularKgRub * response.total_weight).toFixed(2)
        : "₽н/д"
    );

    // Обновление элементов внутри delivery-types-dropdown-fast-auto
    let autoFastKg =
      kitResponse.sum_cost_price.auto_fast !== "н/д"
        ? parseFloat(
            (response.sum_cost_price.auto_fast +
              kitResponse.sum_cost_price.auto_fast) /
              response.total_weight
          ).toFixed(2)
        : "н/д";
    let autoFastKgRub =
      kitResponse.sum_cost_price_rub.auto_fast !== "н/д"
        ? parseFloat(
            (response.sum_cost_price_rub.auto_fast +
              kitResponse.sum_cost_price_rub.auto_fast) /
              response.total_weight
          ).toFixed(2)
        : "н/д";
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .cost-elem.kit .kg"
    ).html(
      autoFastKg !== "н/д"
        ? "$" + autoFastKg + " - " + "₽" + autoFastKgRub
        : "$н/д" + " - " + " ₽н/д"
    );
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .cost-elem.kit .sum .sum-dollar"
    ).html(
      autoFastKg !== "н/д"
        ? "$" + (autoFastKg * response.total_weight).toFixed(2)
        : "$н/д" + semicolon + " ₽н/д"
    );
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .cost-elem.kit .sum .sum-rub"
    ).html(
      autoFastKg !== "н/д"
        ? "₽" + (autoFastKgRub * response.total_weight).toFixed(2)
        : "$н/д" + semicolon + " ₽н/д"
    );

    // Обновление элементов внутри delivery-types-dropdown-auto kit-help
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .kit-help .balloon-container .kg"
    ).html(
      autoRegularKg !== "н/д"
        ? "$" + autoRegularKg + semicolonHelpTspan + autoRegularKgRub + "₽"
        : "$н/д" + semicolonHelp + " ₽н/д"
    );
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .kit-help .balloon-container .sum"
    ).html(
      autoRegularKg !== "н/д"
        ? (autoRegularKg * response.total_weight).toFixed(2) +
            "$" +
            semicolonHelpTspan +
            (autoRegularKgRub * response.total_weight).toFixed(2) +
            "₽"
        : "$н/д" + semicolonHelp + " ₽н/д"
    );
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .kit-help .balloon-container .exchange-rate-elem-dollar"
    ).html(dollar);
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .kit-help .balloon-container .exchange-rate-elem-yuan"
    ).html(yuan);
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .kit-help .balloon-container .boxing-type"
    ).html(response.type_of_packaging);
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .kit-help .balloon-container .packaging-price"
    ).html(
      (response.packaging_price_pub / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        response.packaging_price_pub.toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .kit-help .balloon-container .kg-cargo"
    ).html(
      (response.sum_cost_price.auto_regular / response.total_weight).toFixed(
        2
      ) +
        "$" +
        semicolonHelpTspan +
        (
          (response.sum_cost_price.auto_regular / response.total_weight) *
          dollar
        ).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .kit-help .balloon-container .sum-cargo"
    ).html(
      response.sum_cost_price.auto_regular.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.sum_cost_price.auto_regular * dollar).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .kit-help .balloon-container .redeem-commission"
    ).html(
      ((response.commission_price * yuan) / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.commission_price * yuan).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-auto .delivery-types-list-comparison.cargo .kit-help .balloon-container .insurance"
    ).html(
      response.insurance.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.insurance * dollar).toFixed(2) +
        "₽"
    );

    // Обновление элементов внутри delivery-types-dropdown-fast-auto kit-help
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .kit-help .balloon-container .kg"
    ).html(
      autoFastKg !== "н/д"
        ? "$" + autoFastKg + semicolonHelpTspan + autoFastKgRub + "₽"
        : "$н/д" + semicolonHelp + " ₽н/д"
    );
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .kit-help .balloon-container .sum"
    ).html(
      autoFastKg !== "н/д"
        ? (autoFastKg * response.total_weight).toFixed(2) +
            "$" +
            semicolonHelpTspan +
            (autoFastKgRub * response.total_weight).toFixed(2) +
            "₽"
        : "$н/д" + semicolonHelp + " ₽н/д"
    );
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .kit-help .balloon-container .exchange-rate-elem-dollar"
    ).html(dollar);
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .kit-help .balloon-container .exchange-rate-elem-yuan"
    ).html(yuan);
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .kit-help .balloon-container .boxing-type"
    ).html(response.type_of_packaging);
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .kit-help .balloon-container .packaging-price"
    ).html(
      (response.packaging_price_pub / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        response.packaging_price_pub.toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .kit-help .balloon-container .kg-cargo"
    ).html(
      (response.sum_cost_price.auto_regular / response.total_weight).toFixed(
        2
      ) +
        "$" +
        semicolonHelpTspan +
        (
          (response.sum_cost_price.auto_regular / response.total_weight) *
          dollar
        ).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .kit-help .balloon-container .sum-cargo"
    ).html(
      response.sum_cost_price.auto_regular.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.sum_cost_price.auto_regular * dollar).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .kit-help .balloon-container .redeem-commission"
    ).html(
      ((response.commission_price * yuan) / dollar).toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.commission_price * yuan).toFixed(2) +
        "₽"
    );
    $(
      "#delivery-types-dropdown-fast-auto .delivery-types-list-comparison.cargo .kit-help .balloon-container .insurance"
    ).html(
      response.insurance.toFixed(2) +
        "$" +
        semicolonHelpTspan +
        (response.insurance * dollar).toFixed(2) +
        "₽"
    );
  }
} /* Start:"a:4:{s:4:"full";s:61:"/calc-layout/js/ajax_request_get_order_data.js?17255436507070";s:6:"source";s:46:"/calc-layout/js/ajax_request_get_order_data.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
/* End */
function initializeGetOrderData() {
  let orderNumberInput = document.querySelector(".logistic-check__form_text");
  let getOrderButton = document.querySelector(
    ".logistic-check__form_btn.main-btn"
  );

  // function trackAndSendAjaxRequests() {
  //     if (activeButton.dataset.type === 'cargo') {
  //         dataChanged = true; // Устанавливаем флаг изменений в true
  //         if (!pendingRequest) {
  //             pendingRequest = sendMultipleAjaxRequests();
  //             pendingRequest.then(function () {
  //                 pendingRequest = null;
  //             });
  //         }
  //     }
  // }

  function ajaxOrderDataRequest() {
    let orderNumber = $(orderNumberInput).val();
    if (orderNumber) {
      let requestData = {
        order_number: orderNumber,
      };
      return new Promise((resolve, reject) => {
        // showAwait('.cargo-cost-elem', 'cargo', true);
        $.ajax({
          type: "POST",
          url: "https://api-calc.wisetao.com:4343/api/get-milestones",
          data: requestData,
          success: function (response) {
            if (response) {
              document
                .querySelector(".logistic-check__info")
                .classList.remove("hidden");
              document
                .querySelector(".logistic-check__status")
                .classList.remove("hidden");
              document
                .querySelector(".logistic-check__error")
                .classList.add("hidden");
              outputOrderData(response);
            } else {
              document
                .querySelector(".logistic-check__error")
                .classList.remove("hidden");
              document
                .querySelector(".logistic-check__info")
                .classList.add("hidden");
              document
                .querySelector(".logistic-check__status")
                .classList.add("hidden");
            }
            console.log("Успешно отправлено!");
            console.log("Ответ сервера:", response);

            resolve(response);
          },
          error: function (error) {
            // showAwait('.cargo-cost-elem', 'cargo', false);
            document
              .querySelector(".logistic-check__error")
              .classList.remove("hidden");
            document
              .querySelector(".logistic-check__info")
              .classList.add("hidden");
            document
              .querySelector(".logistic-check__status")
              .classList.add("hidden");
            reject(error);
          },
        });
      });
    } else {
      console.log(
        "Заполните все обязательные поля. Запрос не будет отправлен."
      );
    }
  }

  getOrderButton.addEventListener("click", (event) => {
    event.preventDefault();
    ajaxOrderDataRequest();
    event.preventDefault();
  });
}

function outputOrderData(response) {
  let recipientName = document.querySelector(
    ".logistic-check__item_text.recipient-name"
  );
  let arrival = document.querySelector(".logistic-check__item_text.arrival");
  let arrivalDate = document.querySelector(
    ".logistic-check__item_text.arrival-date"
  );
  let deliveryType = document.querySelector(
    ".logistic-check__item_text.delivery-type"
  );
  let paymentStatus = document.querySelector(
    ".logistic-check__item_text.payment-status"
  );
  let volume = document.querySelector(".logistic-check__item_text.volume");
  let weight = document.querySelector(".logistic-check__item_text.weight");

  recipientName.innerText = response.recipient_name;
  arrival.innerText = response.destination;
  arrivalDate.innerText = response.arrival_date;
  deliveryType.innerText = response.delivery_type.type;
  paymentStatus.innerText =
    response.payment_status === 1 ? "Оплачено" : "Не оплачено";
  let statusStyle = response.payment_status === 1 ? "_paid" : "_unpaid";
  let statusStyleRem = response.payment_status === 1 ? "_unpaid" : "_paid";
  paymentStatus.classList.add(statusStyle);
  paymentStatus.classList.remove(statusStyleRem);
  volume.innerText = response.volume + " м³";
  weight.innerText = response.weight + " кг";

  let logisticCheckStatus = document.querySelector(".logistic-check__status");
  let logisticCheckStatusHidden = document.querySelector(
    ".logistic-check__status"
  );
  let activeItemOrigin = document.querySelector(
    ".logistic-check__status_item._active"
  );
  let activeItem = activeItemOrigin.cloneNode(true);

  let hiddenItemOrigin = document.querySelector(
    ".logistic-check__status_item.hidden"
  );
  let hiddenItem = hiddenItemOrigin.cloneNode(true); // Клонируем

  document.querySelectorAll(".logistic-check__status_item").forEach((item) => {
    item.remove();
  });

  let shippingDate = parseDate(response.shipping_date);

  shippingDate = new Date(shippingDate);
  let isFirst = true;

  let milestoneKeys = Object.keys(response.milestones);

  for (let milestone in response.milestones) {
    let days = response.milestones[milestone]; // Значение (дни)

    // Добавляем к дате отправки количество дней для текущего этапа
    let milestoneDate = new Date(shippingDate);
    milestoneDate.setDate(shippingDate.getDate() + days);

    let formattedDate = milestoneDate.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    if (milestone === milestoneKeys[milestoneKeys.length - 1]) {
      // Заполняем первый элемент и добавляем в документ
      activeItem.textContent = `${milestone} (${formattedDate})`;
      // logisticCheckStatus.appendChild(activeItem); // Добавляем activeItem в документ
      logisticCheckStatus.insertBefore(
        activeItem,
        logisticCheckStatus.firstChild
      ); // Добавляем activeItem в документ
      isFirst = false;
    } else {
      // Заполняем остальные элементы и добавляем в документ
      let hiddenClone = hiddenItem.cloneNode(true);
      hiddenClone.textContent = `${milestone} (${formattedDate})`;
      // logisticCheckStatus.appendChild(hiddenClone);
      logisticCheckStatus.insertBefore(
        hiddenClone,
        logisticCheckStatus.firstChild
      ); // Добавляем скрытый элемент в документ
    }
  }
}

function parseDate(dateStr) {
  const [day, month, year] = dateStr.split(".").map(Number);
  return new Date(year, month - 1, day); // Месяцы в JavaScript начинаются с 0
} /* Start:"a:4:{s:4:"full";s:51:"/calc-layout/js/report_white_data.js?17214218521526";s:6:"source";s:36:"/calc-layout/js/report_white_data.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/

/* End */
// Функция для клонирования и обновления контейнера
let isDataReceived;
let items = [];

function initializeReportWhiteData() {
  let reportWhiteDataButtons = document.querySelectorAll(
    ".report-white-data:not(.offer-button-white):not(.offer-button-comparison):not(.offer-button)"
  );
  reportWhiteDataButtons.forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      reportWhiteData(event);
      event.preventDefault();
    });
  });
}

function reportWhiteData(event) {
  event.stopPropagation();
  if (isDataReceived) {
    $.ajax({
      url: "https://api-calc.wisetao.com:4343/api/get-tnved-calculation-file",
      type: "POST",
      data: {
        items: items,
      },
      success: function (response) {
        let mimeType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        let a = document.createElement("a");
        document.body.appendChild(a);
        a.style.display = "none";
        a.href = "data:" + mimeType + ";base64," + response;
        a.download = `white-data.xlsx`;
        a.click();
        a.remove();
      },
      error: function (error) {
        console.error("Ошибка при выполнении запроса: ", error);
      },
    });
  }
  event.stopPropagation();
} /* Start:"a:4:{s:4:"full";s:45:"/calc-layout/js/calc_volume.js?17271164051803";s:6:"source";s:30:"/calc-layout/js/calc_volume.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/

/* End */
function initializeCalcVolume() {
  // const orderDataDimensions = document.querySelector('.order-data-dimensions');
  // const lengthInput = orderDataDimensions.querySelector('.length');
  // const widthInput = orderDataDimensions.querySelector('.width');
  // const heightInput = orderDataDimensions.querySelector('.height');
  // const resultSpan = orderDataDimensions.querySelector('.result');
  // lengthInput.addEventListener('input', function(event) {
  //     updateResult(lengthInput, widthInput, heightInput, resultSpan, event)
  // });
  // widthInput.addEventListener('input', function(event) {
  //     updateResult(lengthInput, widthInput, heightInput, resultSpan, event)
  // });
  // heightInput.addEventListener('input', function(event) {
  //     updateResult(lengthInput, widthInput, heightInput, resultSpan, event)
  // });
}

// Функция для обновления результата
function updateResult(lengthInput, widthInput, heightInput, resultSpan, event) {
  // Получаем значения из полей ввода
  const lengthValue =
    parseFloat(lengthInput.value.replace(/,/g, ".")) / 100 || 0;
  const widthValue = parseFloat(widthInput.value.replace(/,/g, ".")) / 100 || 0;
  const heightValue =
    parseFloat(heightInput.value.replace(/,/g, ".")) / 100 || 0;

  // Вычисляем произведение значений

  // Обновляем текст в элементе результата
  resultSpan.textContent = lengthValue * widthValue * heightValue;

  if (parseFloat(resultSpan.textContent) !== 0) {
    resultSpan.textContent = (lengthValue * widthValue * heightValue).toFixed(
      3
    );
  }
} /* Start:"a:4:{s:4:"full";s:54:"/calc-layout/js/select_delivery_item.js?17271098541333";s:6:"source";s:39:"/calc-layout/js/select_delivery_item.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/

// Добавляем обработчики событий для полей ввода

/* End */
function initializeSelectDeliveryItem() {
  // if (!deliveryItems) {
  deliveryItems = document.querySelectorAll(".list-help");
  deliveryItems.forEach((deliveryItem) => {
    deliveryItem.addEventListener("click", selectDeliveryItem);
  });
  document.querySelectorAll(".offer-button").forEach((button) => {
    button.setAttribute("disabled", "");
  });
  // }
}

function selectDeliveryItem(event) {
  const selectItem = document.querySelector(".list-help.selected");
  let offerButton = event.currentTarget.querySelector(
    ".report-white-data.offer-button.report-cargo-data"
  );
  let mainOfferButton = document.querySelector(".main-offer-button");
  if (selectItem) {
    let otherOfferButton = selectItem.querySelector(
      ".report-white-data.offer-button.report-cargo-data"
    );
    if (selectItem !== event.currentTarget) {
      selectItem.classList.remove("selected");
      otherOfferButton.setAttribute("disabled", "");
    }
  }
  event.currentTarget.classList.toggle("selected");
  if (event.currentTarget.classList.contains("selected")) {
    offerButton.removeAttribute("disabled");
    mainOfferButton.removeAttribute("disabled");
  } else {
    offerButton.setAttribute("disabled", "");
    mainOfferButton.setAttribute("disabled", "");
  }
} /* Start:"a:4:{s:4:"full";s:45:"/calc-layout/js/input_excel.js?17214218491999";s:6:"source";s:30:"/calc-layout/js/input_excel.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
/* End */
function initializeInputExcel() {
  // Функция для инициализации squareOuter и input file
  let selectFile = document.querySelector(".submit-excel-file");
  let excelInput = document.querySelector(".photo-input");
  let fileNameDisplay = document.querySelector(".selected-file-name");
  let deleteFile = document.querySelector(".del-file");
  deleteFile.addEventListener("click", deleteExcelFile);

  excelInput.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  selectFile.addEventListener("click", function (event) {
    event.stopPropagation();
    event.preventDefault();
    excelInput.removeAttribute("disabled");
    excelInput.setAttribute(
      "accept",
      "application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    excelInput.click();
    excelInput.setAttribute("disabled", "");
    event.preventDefault();
    event.stopPropagation();
  });

  excelInput.addEventListener("change", function () {
    excelFile = excelInput.files[0]; // Получаем выбранный файл
    if (excelFile && excelInput.getAttribute("accept") !== "image/*") {
      if (
        fileNameDisplay.childNodes.length >= 4 &&
        fileNameDisplay.childNodes[3].nodeType === Node.TEXT_NODE &&
        fileNameDisplay.childNodes[3].nodeValue.trim().length > 1
      ) {
        let newText = document.createTextNode(excelFile.name);
        fileNameDisplay.replaceChild(newText, fileNameDisplay.childNodes[3]);
      }
      if (fileNameDisplay.childNodes.length < 4) {
        fileNameDisplay.append(excelFile.name);
      }
      fileNameDisplay.style.display = "flex";
      disableFields();
    }
  });
}

function deleteExcelFile() {
  excelFile = null;
  let file = document.querySelector(".selected-file-name");
  file.removeChild(file.childNodes[3]);
  file.style.display = "none";
  enableFields();
} /* Start:"a:4:{s:4:"full";s:63:"/calc-layout/js/send_data_between_calc_types.js?172142185412642";s:6:"source";s:47:"/calc-layout/js/send_data_between_calc_types.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
/* End */
function gatherGoodData(button) {
  let input_type = $("#checkbox_input_type").is(":checked");
  let input_type2 = $("#checkbox_input_type2").is(":checked");
  generalGoodData.checkbox_input_type = input_type;
  generalGoodData.checkbox_input_type2 = input_type2;
  if (button.dataset.type === "comparison") {
    if (generalGoodData.oldButton.dataset.type === "cargo") {
      if (input_type) {
        let inputs = document.querySelectorAll(
          ".general-calc-input:not(.count-input)"
        );
        let goodToggle = document
          .querySelector(".type-of-goods-dropdown-toggle")
          .childNodes[0].nodeValue.trim();
        let currency = document
          .querySelector(".dropdown-toggle.currency-toggle")
          .childNodes[0].nodeValue.trim();
        let dataCurrency = document.querySelector(
          ".order-data-general .dropdown-toggle.currency-toggle"
        ).dataset.currency;
        inputs.forEach((input) => {
          Object.assign(generalGoodData, {
            [input.getAttribute("name")]: input.value,
          });
        });
        Object.assign(generalGoodData, {
          "type-of-goods-dropdown-toggle": goodToggle,
          brand: $("input[name='brand-good']").is(":checked"),
          currency: currency,
          dataCurrency: dataCurrency,
        });
      } else {
        generalGoodData.goods = [];
        let dimensionsInputGroups = document.querySelectorAll(
          ".dimensions-input-group .result"
        );
        let currencyForDimensions = document.querySelectorAll(
          ".currency_for_dimensions"
        );
        let wightsForDimensions = document.querySelectorAll(
          ".input-container-dimensions .custom-input.weight"
        );
        let currencies = document.querySelectorAll(
          ".order-data-dimensions .dropdown-toggle.currency-toggle"
        );
        let goodToggle = document.querySelectorAll(
          ".type-of-goods-dropdown-toggle-dimensions"
        );
        let brand = true;
        let brands;
        if (input_type2) {
          brand = $("input[name='dim-brand']").is(":checked");
        } else {
          brands = document.querySelectorAll(".brand-checkbox");
        }
        dimensionsInputGroups.forEach((result, i) => {
          let good = {
            dimension: result.childNodes[0].nodeValue.trim(),
            cost: currencyForDimensions[i].value,
            weight: wightsForDimensions[i].value,
            brand: input_type2 ? brand : $(brands[i]).is(":checked"),
            currency: currencies[i].childNodes[0].nodeValue.trim(),
            dataCurrency: currencies[i].dataset.currency,
            goodToggle: goodToggle[i].childNodes[0].nodeValue.trim(),
          };
          if (!generalGoodData.goods) {
            generalGoodData.goods = [good];
          } else {
            generalGoodData.goods.push(good);
          }
        });
      }
    }
  }
  if (button.dataset.type === "cargo") {
    if (generalGoodData.oldButton.dataset.type === "comparison") {
      generalGoodData.goods = [];
      let costs = document.querySelectorAll(".custom-input-tnved-currency");
      let weights = document.querySelectorAll('input[name="weight[]"]');
      let volumes = document.querySelectorAll('input[name="volume[]"]');
      let currencies = document.querySelectorAll(
        ".dropdown-toggle.currency-toggle"
      );
      let brands = document.querySelectorAll(".brand-checkbox");
      let goodToggle = document.querySelectorAll(
        ".cargo-white-data-container .type-of-goods-dropdown-toggle"
      );
      costs.forEach((cost, i) => {
        let good = {
          dimension: volumes[i].value,
          cost: cost.value,
          weight: weights[i].value,
          brand: $(brands[i]).is(":checked"),
          currency: currencies[i].childNodes[0].nodeValue.trim(),
          dataCurrency: currencies[i].dataset.currency,
          goodToggle: goodToggle[i].childNodes[0].nodeValue.trim(),
        };
        if (!generalGoodData.goods) {
          generalGoodData.goods = [good];
        } else {
          generalGoodData.goods.push(good);
        }
      });
    }
  }
  if (
    (button.dataset.type === "comparison" &&
      generalGoodData.oldButton.dataset.type === "white") ||
    (generalGoodData.oldButton.dataset.type === "comparison" &&
      button.dataset.type === "white")
  ) {
    generalGoodData.goods = [];
    let byNames = document.querySelectorAll(".select-by-name-input");
    let currencies = document.querySelectorAll(
      ".dropdown-toggle.currency-toggle"
    );
    currencies.forEach((currency, i) => {
      let good = {
        currency: currency.childNodes[0].nodeValue.trim(),
        dataCurrency: currency.dataset.currency,
        byName: byNames[i].getAttribute("placeholder"),
      };
      if (!generalGoodData.goods) {
        generalGoodData.goods = [good];
      } else {
        generalGoodData.goods.push(good);
      }
    });
  }
}

function sendGoodData(button) {
  if (button.dataset.type === "comparison") {
    if (generalGoodData.oldButton.dataset.type === "cargo") {
      if (generalGoodData.checkbox_input_type === true) {
        document.querySelector("#currency").value =
          generalGoodData["total-cost"];
        document.querySelector('input[name="weight[]"]').value =
          generalGoodData["total-weight"];
        document.querySelector('input[name="volume[]"]').value =
          generalGoodData["total-volume"];
        document.querySelector(
          ".dropdown-toggle.currency-toggle"
        ).childNodes[0].nodeValue = generalGoodData["currency"];
        document.querySelector(
          ".dropdown-toggle.currency-toggle"
        ).dataset.currency = generalGoodData["dataCurrency"];
        if (generalGoodData["brand"] === true) {
          document.querySelector(".brand-checkbox").setAttribute("checked", "");
        } else {
          document.querySelector(".brand-checkbox").removeAttribute("checked");
        }
        [...document.querySelectorAll("li span.type-of-goods-values")].some(
          (typeOfGoodsValue) => {
            if (
              typeOfGoodsValue.textContent.trim() ===
              generalGoodData["type-of-goods-dropdown-toggle"]
            ) {
              sendToggleValues(typeOfGoodsValue);
              return true;
            }
            return false;
          }
        );
      } else {
        let addButton = document.querySelector(
          ".add-container:not(.redeem-add) .add-button .add"
        );
        generalGoodData.goods.forEach((good, index) => {
          if (index > 0) {
            addButton.click();
          }
        });
        let costs = document.querySelectorAll(".custom-input-tnved-currency");
        let weights = document.querySelectorAll('input[name="weight[]"]');
        let volumes = document.querySelectorAll('input[name="volume[]"]');
        let brand = document.querySelectorAll(".brand-checkbox");
        let currencies = document.querySelectorAll(
          ".dropdown-toggle.currency-toggle"
        );
        generalGoodData.goods.forEach((good, i) => {
          costs[i].value = good["cost"];
          weights[i].value = good["weight"];
          volumes[i].value = good["dimension"];
          currencies[i].childNodes[0].nodeValue = good["currency"];
          currencies[i].dataset.currency = good["dataCurrency"];
          if (good["brand"] === true) {
            brand[i].setAttribute("checked", "");
          } else {
            brand[i].removeAttribute("checked");
          }
        });

        document
          .querySelectorAll(
            "ul.type-of-goods-dropdown-list:not(.delivery-types-list)"
          )
          .forEach((typeOfGoodsList, index) => {
            [
              ...typeOfGoodsList.querySelectorAll(
                "li span.type-of-goods-values"
              ),
            ].some((typeOfGoodsValue) => {
              if (
                typeOfGoodsValue.textContent.trim() ===
                generalGoodData.goods[index]["goodToggle"]
              ) {
                sendToggleValues(typeOfGoodsValue);
                return true;
              }
              return false;
            });
          });
      }
    }
  }
  if (button.dataset.type === "cargo") {
    if (generalGoodData.oldButton.dataset.type === "comparison") {
      let addButton = document.querySelector(
        ".add-container:not(.redeem-add) .add-button .add"
      );
      document.querySelector("#checkbox_input_type").click();
      document.querySelector("#checkbox_input_type2").click();
      generalGoodData.goods.forEach((good, index) => {
        if (index > 0) {
          addButton.click();
        }
      });
      let volumes = document.querySelectorAll(
        ".dimensions-input-group .result"
      );
      let costs = document.querySelectorAll(".currency_for_dimensions");
      let weights = document.querySelectorAll(
        ".input-container-dimensions .custom-input.weight"
      );
      let currencies = document.querySelectorAll(
        ".order-data-dimensions .dropdown-toggle.currency-toggle"
      );
      let brands = document.querySelectorAll(".brand-checkbox");
      generalGoodData.goods.forEach((good, i) => {
        costs[i].value = good["cost"];
        weights[i].value = good["weight"];
        volumes[i].childNodes[0].nodeValue = good["dimension"];
        currencies[i].childNodes[0].nodeValue = good["currency"];
        currencies[i].dataset.currency = good["dataCurrency"];
        if (good["brand"] === true) {
          brands[i].setAttribute("checked", "");
        } else {
          brands[i].removeAttribute("checked");
        }
      });

      document
        .querySelectorAll(
          ".order-data-dimensions ul.type-of-goods-dropdown-list:not(.delivery-types-list)"
        )
        .forEach((typeOfGoodsList, index) => {
          [
            ...typeOfGoodsList.querySelectorAll("li span.type-of-goods-values"),
          ].some((typeOfGoodsValue) => {
            if (
              typeOfGoodsValue.textContent.trim() ===
              generalGoodData.goods[index]["goodToggle"]
            ) {
              sendToggleValues(typeOfGoodsValue);
              return true;
            }
            return false;
          });
        });
    }
  }
  if (
    (button.dataset.type === "comparison" &&
      generalGoodData.oldButton.dataset.type === "white") ||
    (generalGoodData.oldButton.dataset.type === "comparison" &&
      button.dataset.type === "white")
  ) {
    let currencies = document.querySelectorAll(
      ".dropdown-toggle.currency-toggle"
    );
    let byNames = document.querySelectorAll(".select-by-name-input");
    generalGoodData.goods.forEach((good, i) => {
      currencies[i].childNodes[0].nodeValue = good["currency"];
      currencies[i].dataset.currency = good["dataCurrency"];
      byNames[i].setAttribute("placeholder", good["byName"]);
    });
  }
}

function sendToggleValues(typeOfGoodsValue) {
  const helpContent = typeOfGoodsValue.nextElementSibling.cloneNode(true);
  if (helpContent) {
    helpContent.addEventListener("mouseenter", updateBalloonPosition);
    helpContent.className =
      "help " +
      "type-of-goods-dropdown-toggle-" +
      helpContent.className.split(" ")[1];
  }
  let arrow = document
    .querySelector(".dropdown-list-goods-arrow")
    .cloneNode(true);
  helpContent.innerHTML.trim();
  typeOfGoodsValue.closest("ul").previousElementSibling.innerHTML =
    typeOfGoodsValue.textContent.trim();
  typeOfGoodsValue
    .closest("ul")
    .previousElementSibling.appendChild(helpContent);
  typeOfGoodsValue.closest("ul").previousElementSibling.appendChild(arrow);
} /* Start:"a:4:{s:4:"full";s:53:"/calc-layout/js/available_countries.js?17232078851428";s:6:"source";s:38:"/calc-layout/js/available_countries.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/

/* End */
function setPositionCounriesContainer() {
  let countriesContainer = document.querySelector(".available-countries");
  let arrivalContainer = document.querySelector(".arrival-container");
  let toponymInput = document.querySelector(".to-arrival-input");
  if (countriesContainer && toponymInput) {
    toponymInput.addEventListener("focus", () => {
      if (toponymInput.value === "") {
        let inputRect = toponymInput.getBoundingClientRect();
        // Устанавливаем ширину и позицию countriesContainer
        countriesContainer.style.width = `${inputRect.width}px`;
        countriesContainer.style.left = 0;
        countriesContainer.style.top = `${
          arrivalContainer.getBoundingClientRect().height
        }px`;
        countriesContainer.style.display = "block";
        toponymInput.style.borderBottomLeftRadius = "0";
        toponymInput.style.borderBottomRightRadius = "0";
        countriesContainer.nextElementSibling.style.display = "none";
        toponymInput.style.border = "none";
      }
    });
    toponymInput.addEventListener("blur", () => {
      countriesContainer.style.display = "none";
      toponymInput.style.borderBottomLeftRadius = "10px";
      toponymInput.style.borderBottomRightRadius = "10px";
    });
  }
} /* Start:"a:4:{s:4:"full";s:52:"/calc-layout/js/check-window-popup.js?17265637211495";s:6:"source";s:37:"/calc-layout/js/check-window-popup.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
/* End */
document.addEventListener("DOMContentLoaded", () => {
  // checkPopup();
});

function checkPopup() {
  var testWindow = window.open("", "_blank", "width=1,height=1");
  if (
    !testWindow ||
    testWindow.closed ||
    typeof testWindow.closed == "undefined"
  ) {
    createMessage();
  } else {
    testWindow.close();
  }
}

function createMessage() {
  let allow_popup_message = document.createElement("div");
  allow_popup_message.innerHTML = `<div class="pop-up-allow-popup-content">
        <div class="pop-up-allow-popup-cross-close">
            <img src="/calc-layout/images/cross.svg" alt="">
        </div>
        <div class="pop-up-allow-popup-container">
            <div class="pop-up-tittle">
                АКТИВИРУЙТЕ ВОЗМОЖНОСТЬ ПОЛУЧАТЬ<br>КОММЕРЧЕСКИЕ ПРЕДЛОЖЕНИЯ В PDF<br>ПО РУЗУЛЬАТАМ РАСЧЕТА КАЛЬКУЛЯТОРА
            </div>
            <div class="pop-up-allow-popup-text">
                ДЛЯ АКТИВАЦИИ НУЖНО РАЗРЕШИТЬ<br>ВСПЛЫВАЮЩИЕ ОКНА ДЛЯ ЭТОГО САЙТА.
            </div>
        </div>
    </div>`;
  document.body.appendChild(allow_popup_message);
  document
    .querySelector(".pop-up-allow-popup-cross-close")
    .addEventListener("click", (event) => {
      event.stopPropagation();
      document.querySelector(".pop-up-allow-popup-content").style.display =
        "none";
    });
} /* /calc-layout/js/builder.js?172934281412314*/ /* /calc-layout/js/get_exchange_rate.js?17293451611000*/ /* /calc-layout/js/suggestView.js?172589011011799*/ /* /calc-layout/js/checkbox.js?172732282711137*/ /* /calc-layout/js/currency.js?172782910212481*/ /* /calc-layout/js/count_goods.js?17271202418881*/ /* /calc-layout/js/type_of_goods.js?17214218576755*/ /* /calc-layout/js/add_goods.js?17214218393098*/ /* /calc-layout/js/spoiler.js?17301717732119*/ /* /calc-layout/js/boxing_img.js?17271076972752*/ /* /calc-layout/js/input_photo.js?17214218493225*/ /* /calc-layout/js/add_redeems.js?17214218403683*/ /* /calc-layout/js/submit_redeem_data.js?172775066915642*/ /* /calc-layout/js/redeem_checkbox.js?17279345076151*/ /* /calc-layout/js/delivery_choice.js?17214218482979*/ /* /calc-layout/js/change_delivery_list.js?172711007175645*/ /* /calc-layout/js/balloon_help_position.js?172763177213983*/ /* /calc-layout/js/select_calc_type.js?17293427558869*/ /* /calc-layout/js/white_calc_space.js?1721421857716*/ /* /calc-layout/js/add_tnved_code.js?17214218403474*/ /* /calc-layout/js/suggestion.js?17293325428873*/ /* /calc-layout/js/tnved-tree-handling.js?172599027815582*/ /* /calc-layout/js/popup_tnved_tree.js?17214218512606*/ /* /calc-layout/js/ajax_request_general.js?172813762791320*/ /* /calc-layout/js/ajax_request_tnved_calc.js?1729330411101219*/ /* /calc-layout/js/ajax_request_cargo_from_white.js?172704754569338*/ /* /calc-layout/js/ajax_request_get_order_data.js?17255436507070*/ /* /calc-layout/js/report_white_data.js?17214218521526*/ /* /calc-layout/js/calc_volume.js?17271164051803*/ /* /calc-layout/js/select_delivery_item.js?17271098541333*/ /* /calc-layout/js/input_excel.js?17214218491999*/ /* /calc-layout/js/send_data_between_calc_types.js?172142185412642*/ /* /calc-layout/js/available_countries.js?17232078851428*/ /* /calc-layout/js/check-window-popup.js?17265637211495*/

/* End */
