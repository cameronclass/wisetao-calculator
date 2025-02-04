// StateManager.js
import { State } from "../data/State.js";

class StateManager {
  constructor() {
    this.subscribers = [];
  }

  /**
   * Обновляет свойство глобального состояния и уведомляет подписчиков.
   * @param {string} prop – имя свойства.
   * @param {*} value – новое значение.
   */
  update(prop, value) {
    State[prop] = value;
    this.notify(prop, value);
  }

  /**
   * Уведомляет всех подписчиков об изменении.
   */
  notify(prop, value) {
    this.subscribers.forEach((callback) => callback({ prop, value }));
  }

  /**
   * Подписка на изменения состояния.
   * @param {Function} callback – функция, получающая объект { prop, value }.
   */
  subscribe(callback) {
    this.subscribers.push(callback);
  }
}

export default new StateManager();
