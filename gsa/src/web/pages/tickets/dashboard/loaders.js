/* Copyright (C) 2019 Greenbone Networks GmbH
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
import React from 'react';

import Filter from 'gmp/models/filter';

import Loader, {
  loadFunc,
  loaderPropTypes,
} from 'web/store/dashboard/data/loader';

const TICKETS_LIST = 'tickets-list';

const DEFAULT_FILTER = Filter.fromString('sort-reverse=modified');

const ticketsListLoader = loadFunc(
  ({gmp, filter = DEFAULT_FILTER}) =>
    gmp.tickets
      .getAll({
        filter,
      })
      .then(r => r.data),
  TICKETS_LIST,
);

export const TicketsListLoader = ({children, filter}) => (
  <Loader
    dataId={TICKETS_LIST}
    filter={filter}
    load={ticketsListLoader}
    subscriptions={['tickets.timer', 'tickets.changed']}
  >
    {children}
  </Loader>
);

TicketsListLoader.propTypes = loaderPropTypes;
