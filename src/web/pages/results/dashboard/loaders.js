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
import React from 'react';

import Loader, {
  loadFunc,
  loaderPropTypes,
} from 'web/store/dashboard/data/loader';

export const RESULTS_DESCRIPTION_WORDCOUNT = 'results-description-wordcount';
export const RESULTS_SEVERITY = 'results-severity';
export const RESULTS_WORDCOUNT = 'results-wordcount';

export const resultsSeverityLoader = loadFunc(
  ({gmp, filter}) =>
    gmp.results.getSeverityAggregates({filter}).then(r => r.data),
  RESULTS_SEVERITY,
);

export const ResultsSeverityLoader = ({filter, children}) => (
  <Loader
    dataId={RESULTS_SEVERITY}
    filter={filter}
    load={resultsSeverityLoader}
    subscriptions={['results.timer', 'results.changed']}
  >
    {children}
  </Loader>
);

ResultsSeverityLoader.propTypes = loaderPropTypes;

export const resultsWordCountLoader = loadFunc(
  ({gmp, filter}) =>
    gmp.results.getWordCountsAggregates({filter}).then(r => r.data),
  RESULTS_WORDCOUNT,
);

export const ResultsWordCountLoader = ({filter, children}) => (
  <Loader
    dataId={RESULTS_WORDCOUNT}
    filter={filter}
    load={resultsWordCountLoader}
    subscriptions={['results.timer', 'results.changed']}
  >
    {children}
  </Loader>
);

ResultsWordCountLoader.propTypes = loaderPropTypes;

export const resultsDescriptionWordCountLoader = loadFunc(
  ({gmp, filter}) =>
    gmp.results.getDescriptionWordCountsAggregates({filter}).then(r => r.data),
  RESULTS_DESCRIPTION_WORDCOUNT,
);

export const ResultsDescriptionWordCountLoader = ({filter, children}) => (
  <Loader
    dataId={RESULTS_DESCRIPTION_WORDCOUNT}
    filter={filter}
    load={resultsDescriptionWordCountLoader}
    subscriptions={['results.timer', 'results.changed']}
  >
    {children}
  </Loader>
);

ResultsDescriptionWordCountLoader.propTypes = loaderPropTypes;

// vim: set ts=2 sw=2 tw=80:
