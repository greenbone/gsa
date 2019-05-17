/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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
import X2JS2 from 'x2js';

import {isDefined} from '../../utils/identity';

import {parseEnvelopeMeta} from '../../parser';

import {success, rejection} from './xml';

const x2js2 = new X2JS2();

const xml2json = (...args) => x2js2.dom2js(...args);

const transformXmlData = response => {
  const {envelope} = xml2json(response.plainData('xml'));
  const meta = parseEnvelopeMeta(envelope);
  return response.set(envelope, meta);
};

const transfromRejection = rej => {
  const xml = rej.plainData('xml');
  return isDefined(xml) ? xml2json(xml) : undefined;
};

export default {
  rejection: rejection(transfromRejection),
  success: success(transformXmlData),
};

// vim: set ts=2 sw=2 tw=80:
