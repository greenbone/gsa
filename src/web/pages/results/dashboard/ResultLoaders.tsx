/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Loader, {
  createLoadFunc,
  type DisplayLoaderProps,
} from 'web/components/dashboard/display/Loader';
import {type SeverityData} from 'web/components/dashboard/display/severity/severity-class-transform';

interface ResultWordCloudDataGroup {
  count: number;
  value: string;
}

export interface ResultWordCloudData {
  groups?: ResultWordCloudDataGroup[];
}

export const RESULTS_DESCRIPTION_WORDCOUNT = 'results-description-wordcount';
export const RESULTS_SEVERITY = 'results-severity';
export const RESULTS_WORD_COUNT = 'results-wordcount';

export const resultsSeverityLoadFunc = createLoadFunc(
  ({gmp, filter}) =>
    gmp.results.getSeverityAggregates({filter}).then(r => r.data),
  RESULTS_SEVERITY,
);

export const ResultsSeverityLoader = ({
  filter,
  children,
}: DisplayLoaderProps<SeverityData>) => (
  <Loader
    dataId={RESULTS_SEVERITY}
    filter={filter}
    load={resultsSeverityLoadFunc}
    subscriptions={['results.timer', 'results.changed']}
  >
    {children}
  </Loader>
);

export const resultsWordCountLoadFunc = createLoadFunc(
  ({gmp, filter}) =>
    gmp.results.getWordCountsAggregates({filter}).then(r => r.data),
  RESULTS_WORD_COUNT,
);

export const ResultsWordCountLoader = ({
  filter,
  children,
}: DisplayLoaderProps<ResultWordCloudData>) => (
  <Loader
    dataId={RESULTS_WORD_COUNT}
    filter={filter}
    load={resultsWordCountLoadFunc}
    subscriptions={['results.timer', 'results.changed']}
  >
    {children}
  </Loader>
);

export const resultsDescriptionWordCountLoadFunc = createLoadFunc(
  ({gmp, filter}) =>
    gmp.results.getDescriptionWordCountsAggregates({filter}).then(r => r.data),
  RESULTS_DESCRIPTION_WORDCOUNT,
);

export const ResultsDescriptionWordCountLoader = ({
  filter,
  children,
}: DisplayLoaderProps<ResultWordCloudData>) => (
  <Loader
    dataId={RESULTS_DESCRIPTION_WORDCOUNT}
    filter={filter}
    load={resultsDescriptionWordCountLoadFunc}
    subscriptions={['results.timer', 'results.changed']}
  >
    {children}
  </Loader>
);
