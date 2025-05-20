/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
} as const;

/**
 * Group multiple sequential calls in a single one
 *
 * @param func Function to call
 * @param wait Wait time in ms until no more calls to the
 *             wrapper function are fired
 * @param immediate Call func initially
 *
 * @returns Wrapper function
 */
export const debounce = (func, wait?: number, immediate = false) => {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  return function (...args) {
    // @ts-expect-error
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
};

/**
 * Throttle animation paths by using requestAnimationFrame
 *
 * If a animation is scheduled func will not be called. Only
 * after the animation has been rendered func can will be called again.
 *
 * @param func Function to call
 *
 * @returns Wrapper function
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
