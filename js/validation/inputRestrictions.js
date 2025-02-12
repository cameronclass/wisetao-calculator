// inputRestrictions.js
export default class InputRestrictions {
  static setupFieldRestriction(field, regex, maxDecimals = null) {
    if (!field) return;
    field.addEventListener("input", () => {
      // Удаляем все нежелательные символы
      field.value = field.value.replace(regex, "");
      // Заменяем запятые на точки
      field.value = field.value.replace(/,/g, ".");
      const partsDot = field.value.split(".");
      if (partsDot.length > 2) {
        field.value = partsDot[0] + "." + partsDot.slice(1).join("");
      }
      if (maxDecimals !== null && partsDot[1]?.length > maxDecimals) {
        field.value = `${partsDot[0]}.${partsDot[1].substring(0, maxDecimals)}`;
      }
    });
  }

  static setupInputRestrictions(fields) {
    // Применяем ограничение для указанных полей
    this.setupFieldRestriction(fields.totalVolume, /[^0-9.,]/g, 4);
    this.setupFieldRestriction(fields.totalWeight, /[^0-9.,]/g, 2);
    this.setupFieldRestriction(fields.totalCost, /[^0-9.,]/g, 2);
    this.setupFieldRestriction(fields.quantity, /[^0-9]/g);
  }

  static setupNumericVolumeRestrictions(fields) {
    const numericFields = [
      fields.volumeLength,
      fields.volumeWidth,
      fields.volumeHeight,
    ];
    numericFields.forEach((field) => {
      if (!field) return;
      field.addEventListener("input", () => {
        field.value = field.value.replace(/[^0-9.]/g, "");
        const parts = field.value.split(".");
        if (parts.length > 2) {
          field.value = parts[0] + "." + parts.slice(1).join("");
        }
        if (parts[1]?.length > 2) {
          field.value = `${parts[0]}.${parts[1].substring(0, 2)}`;
        }
      });
    });
  }
}
