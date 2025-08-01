/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import durationPlugin from 'dayjs/plugin/duration';
import isoWeek from 'dayjs/plugin/isoWeek';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import localeDataPlugin from 'dayjs/plugin/localeData';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import 'dayjs/locale/af';
import 'dayjs/locale/ar';
import 'dayjs/locale/de';
import 'dayjs/locale/fr';
import 'dayjs/locale/pt-br';
import 'dayjs/locale/ru';
import 'dayjs/locale/tr';
import 'dayjs/locale/zh-cn';

export type Date = dayjs.Dayjs;
export type Duration = durationPlugin.Duration;

dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(durationPlugin);
dayjs.extend(isoWeek);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(localeDataPlugin);
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.extend(timezone);
dayjs.extend(utc);

export const isDuration = dayjs.isDuration;
export const isDate = dayjs.isDayjs;
export const setLocaleDayjs = dayjs.locale;
export const _localeData = dayjs.localeData;
export const duration = dayjs.duration;

export default dayjs;
