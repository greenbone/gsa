/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export const DURATION_HOUR = 60 * 60;
export const DURATION_DAY = DURATION_HOUR * 24;
export const DURATION_WEEK = DURATION_DAY * 7;
export const DURATION_MONTH = DURATION_DAY * 31;
export const DURATION_YEAR = DURATION_DAY * 365;

const DURATIONS = {
  hour: DURATION_HOUR,
  day: DURATION_DAY,
  week: DURATION_WEEK,
  month: DURATION_MONTH,
  year: DURATION_YEAR,
} as const;

export type Duration = keyof typeof DURATIONS;

export const getDurationInSeconds = (duration: Duration): number => {
  return DURATIONS[duration];
};
