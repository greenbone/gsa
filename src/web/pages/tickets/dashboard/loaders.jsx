/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
