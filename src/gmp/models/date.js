/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import moment from 'moment-timezone';

import 'moment/locale/ar';
import 'moment/locale/de';
import 'moment/locale/fr';
import 'moment/locale/pt-br.js';
import 'moment/locale/ru.js';
import 'moment/locale/tr.js';
import 'moment/locale/zh-cn.js';

export const {
  isDuration,
  isMoment: isDate,
  locale: setLocale,
  duration,
  localeData: _localeData,
} = moment;

export default moment;

// vim: set ts=2 sw=2 tw=80:
