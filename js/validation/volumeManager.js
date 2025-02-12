// volumeManager.js
export default class VolumeManager {
  static setupVolumeModeListeners(fields, formInstance) {
    const { weightVolumeChange, volumeLength, volumeWidth, volumeHeight } =
      fields;

    // (1) При переключении режима ввода объёма
    if (weightVolumeChange) {
      weightVolumeChange.addEventListener("change", () => {
        VolumeManager.toggleVolumeMode(fields);
        if (weightVolumeChange.checked) {
          formInstance.clearErrors();
          formInstance.clearFields([volumeLength, volumeWidth, volumeHeight]);
        } else {
          formInstance.clearErrors();
          formInstance.clearFields([fields.totalVolume]);
        }
        formInstance.hideCalculationResult();
      });
    }

    // (2) При изменении габаритов пересчитываем объём
    [volumeLength, volumeWidth, volumeHeight].forEach((field) => {
      if (!field) return;
      field.addEventListener("input", () => {
        VolumeManager.calculateVolume(fields);
        formInstance.hideCalculationResult();
      });
    });
  }

  static toggleVolumeMode(fields) {
    const {
      weightVolumeChange,
      totalVolume,
      volumeLength,
      volumeWidth,
      volumeHeight,
      totalVolumeCalculated,
    } = fields;

    if (!weightVolumeChange) return;

    if (weightVolumeChange.checked) {
      // Режим "Ввести объём напрямую"
      if (totalVolume) totalVolume.disabled = false;
      if (volumeLength) volumeLength.disabled = true;
      if (volumeWidth) volumeWidth.disabled = true;
      if (volumeHeight) volumeHeight.disabled = true;
      if (totalVolumeCalculated) {
        totalVolumeCalculated.value = "";
        totalVolumeCalculated.disabled = true;
      }
    } else {
      // Режим "Вычислить из габаритов"
      if (totalVolume) totalVolume.disabled = true;
      if (volumeLength) volumeLength.disabled = false;
      if (volumeWidth) volumeWidth.disabled = false;
      if (volumeHeight) volumeHeight.disabled = false;
      if (totalVolumeCalculated) totalVolumeCalculated.disabled = false;
    }
  }

  static calculateVolume(fields) {
    const { volumeLength, volumeWidth, volumeHeight, totalVolumeCalculated } =
      fields;
    if (
      !volumeLength ||
      !volumeWidth ||
      !volumeHeight ||
      !totalVolumeCalculated
    ) {
      return;
    }
    const length = parseFloat(volumeLength.value) || 0;
    const width = parseFloat(volumeWidth.value) || 0;
    const height = parseFloat(volumeHeight.value) || 0;

    const calcVol = (length * width * height) / 1_000_000;
    totalVolumeCalculated.value = calcVol > 0 ? calcVol.toFixed(4) : "";
  }
}
