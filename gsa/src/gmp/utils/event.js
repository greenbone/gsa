/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
export const KeyCode = {
  ESC: 27,
  BACKSPACE: 8,
  COMMA: 188,
  DELETE: 46,
  DOWN: 40,
  END: 35,
  ENTER: 13,
  HOME: 36,
  LEFT: 37,
  PAGE_DOWN: 34,
  PAGE_UP: 33,
  PERIOD: 190,
  RIGHT: 39,
  SPACE: 32,
  TAB: 9,
  UP: 38,
  SUBTRACT: 109,
  MINUS: 173,
};

/**
 * Group multiple sequential calls in a single one
 *
 * @param {Function} func      Function to call
 * @param {Number}   wait      Wait time until no more calls to the wrapper
 *                             function are fired
 * @param {Boolean}  immediate Call func initially
 *
 * @returns {Function} Wrapper function
 */
export function debounce(func, wait, immediate = false) {
  let timeout;
  return function(...args) {
    const context = this;
    const later = () => {
      timeout = undefined;
      func.apply(context, args);
    };
    const callNow = immediate && !timeout;

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) {
      func.apply(context, args);
    }
  };
}

/**
 * Throttle animation paths by using requestAnimationFrame
 *
 * If a animation is scheduled func will not be called. Only
 * after the animation has been rendered func can will be called again.
 *
 * @param {Function} func Function to call
 *
 * @returns {Function} Wrapper function
 */
export const throttleAnimation = func => {
  let calling = false;
  return (...args) => {

    if (!calling) {
      calling = true;
      window.requestAnimationFrame(() => {
        calling = false;
        func(...args);
      });
    }
  };
};

// vim: set ts=2 sw=2 tw=80:
