/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type Date} from 'gmp/models/date';

/**
 * Formats the given hour and minute into a string with leading zeros.
 *
 * @param startHour - The hour to format.
 * @param startMinute - The minute to format.
 * @returns The formatted time string in HH:MM format.
 */

export const formatSplitTime = (
  startHour: number,
  startMinute: number,
): string => {
  const formattedStartHour = startHour.toString().padStart(2, '0');
  const formattedStartMinute = startMinute.toString().padStart(2, '0');
  return `${formattedStartHour}:${formattedStartMinute}`;
};

/**
 * Formats the given date object into a time string for the time picker rounding to the closest o'clock.
 *
 * @param date - The date object to format.
 * @returns The formatted time string in HH:MM format.
 */
export const formatTimeForTimePicker = (date: Date) =>
  `${date.hour().toString().padStart(2, '0')}:${date.minute().toString().padStart(2, '0')}`;
