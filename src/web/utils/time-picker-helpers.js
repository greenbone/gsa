/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Formats the given hour and minute into a string with leading zeros.
 *
 * @param {number} start_hour - The hour to format.
 * @param {number} start_minute - The minute to format.
 * @returns {string} The formatted time string in HH:MM format.
 */

export const formatSplitTime = (start_hour, start_minute) => {
  const formattedStartHour = start_hour.toString().padStart(2, '0');
  const formattedStartMinute = start_minute.toString().padStart(2, '0');
  return `${formattedStartHour}:${formattedStartMinute}`;
};

/**
 * Formats the given date object into a time string for the time picker rounding to the closest o'clock.
 *
 * @param {Object} date - The date object to format.
 * @returns {string} The formatted time string in HH:MM format.
 */
export const formatTimeForTimePicker = date =>
  `${date.hour().toString().padStart(2, '0')}:${date.minute().toString().padStart(2, '0')}`;
