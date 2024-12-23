// project/src/data/State.js
export const State = {
  directionsData: {
    // Будем хранить данные по направлениям: auto, train, avia
  },

  /**
   * Сохраняет данные для указанного направления.
   * @param {string} direction - 'auto' | 'train' | 'avia'
   * @param {object} data - Объект с данными расчетов для данного направления.
   */
  setDirectionData(direction, data) {
    this.directionsData[direction] = data;
  },

  /**
   * Возвращает данные для указанного направления.
   * @param {string} direction - 'auto' | 'train' | 'avia'
   * @returns {object|null} Объект с данными или null, если нет данных.
   */
  getDirectionData(direction) {
    return this.directionsData[direction] || null;
  },
};
