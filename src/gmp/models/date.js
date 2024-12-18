/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import moment from 'moment-timezone';

import 'moment/dist/locale/ar';
import 'moment/dist/locale/de';
import 'moment/dist/locale/fr';
import 'moment/dist/locale/pt-br.js';
import 'moment/dist/locale/ru.js';
import 'moment/dist/locale/tr.js';
import 'moment/dist/locale/zh-cn.js';

export const {
  isDuration,
  isMoment: isDate,
  locale: setLocale,
  duration,
  localeData: _localeData,
} = moment;

export default moment;
