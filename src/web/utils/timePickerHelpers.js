/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export const formatSplitTime = (start_hour, start_minute) => {
  const formattedStartHour = start_hour.toString().padStart(2, '0');
  const formattedStartMinute = start_minute.toString().padStart(2, '0');
  return `${formattedStartHour}:${formattedStartMinute}`;
};

export const formatTimeForTimePicker = date =>
  `${date.hours().toString().padStart(2, '0')}:${date.minutes().toString().padStart(2, '0')}`;
