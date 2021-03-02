/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import moment from 'moment-timezone';

import 'moment/locale/ar';
import 'moment/locale/de';
import 'moment/locale/fr';
import 'moment/locale/pt-br';
import 'moment/locale/ru';
import 'moment/locale/tr';
import 'moment/locale/zh-cn';

export const {
  isDuration,
  isMoment: isDate,
  locale: setLocale,
  duration,
  localeData: _localeData,
} = moment;

export default moment;

// vim: set ts=2 sw=2 tw=80:
