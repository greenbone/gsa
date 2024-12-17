/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
