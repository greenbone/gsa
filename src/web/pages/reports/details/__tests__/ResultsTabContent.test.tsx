/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import Result from 'gmp/models/result';
import {TASK_STATUS} from 'gmp/models/task';
import ResultsTabContent from 'web/pages/reports/details/ResultsTabContent';

const filter = Filter.fromString('first=1 rows=10');

const createMockResult = (id = '101') => {
  return Result.fromElement({
    _id: id,
    name: 'CVE-2019-1234',
    host: {
      __text: 'sha256:abc123',
      hostname: 'oci://ct-harborv1.devel.greenbone.net/eu/path/image-name:tag',
    },
    port: '443/tcp',
    severity: 7.5,
    qod: {value: 80},
    creation_time: '2024-01-15T10:00:00Z',
    modification_time: '2024-01-15T10:00:00Z',
  });
};

describe('ResultsTabContent', () => {
  describe('Container Scanning', () => {
    test('should render ContainerScanningResultsTab when isContainerScanning is true and has results', () => {
      const results = {
        entities: [createMockResult()],
        counts: new CollectionCounts({
          filtered: 1,
          all: 1,
          first: 1,
          rows: 10,
        }),
      };

      const reportResultsCounts = new CollectionCounts({
        filtered: 1,
        all: 1,
        first: 1,
        rows: 10,
      });

      const getMock = testing.fn().mockResolvedValue({
        data: results.entities,
        meta: {
          counts: results.counts,
          filter,
        },
      });

      const gmp = {
        results: {
          get: getMock,
        },
        settings: {
          token: 'test-token',
          enableEPSS: false,
        },
      };

      const {render} = rendererWith({gmp});

      render(
        <ResultsTabContent
          hasTarget={true}
          isContainerScanning={true}
          isLoading={false}
          progress={100}
          reportFilter={filter}
          reportId="report-123"
          reportResultsCounts={reportResultsCounts}
          results={results}
          status={TASK_STATUS.done}
          onFilterDecreaseMinQoDClick={testing.fn()}
          onFilterEditClick={testing.fn()}
          onFilterRemoveClick={testing.fn()}
          onTargetEditClick={testing.fn()}
        />,
      );

      // ContainerScanningResultsTab should be rendered
      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    test('should render EmptyReport when container scanning has no results at all', () => {
      const results = {
        entities: [],
        counts: new CollectionCounts({
          filtered: 0,
          all: 0,
          first: 1,
          rows: 10,
        }),
      };

      const reportResultsCounts = new CollectionCounts({
        filtered: 0,
        all: 0,
        first: 1,
        rows: 10,
      });

      const gmp = {
        settings: {
          enableEPSS: false,
        },
      };

      const onTargetEditClick = testing.fn();
      const {render} = rendererWith({gmp, capabilities: true});

      render(
        <ResultsTabContent
          hasTarget={true}
          isContainerScanning={true}
          isLoading={false}
          progress={100}
          reportFilter={filter}
          reportId="report-123"
          reportResultsCounts={reportResultsCounts}
          results={results}
          status={TASK_STATUS.done}
          onFilterDecreaseMinQoDClick={testing.fn()}
          onFilterEditClick={testing.fn()}
          onFilterRemoveClick={testing.fn()}
          onTargetEditClick={onTargetEditClick}
        />,
      );

      expect(
        screen.getByText(/The scan did not collect any results/i),
      ).toBeInTheDocument();
    });

    test('should render EmptyResultsReport when container scanning has results but filtered to 0', () => {
      const results = {
        entities: [],
        counts: new CollectionCounts({
          filtered: 0,
          all: 5,
          first: 1,
          rows: 10,
        }),
      };

      const reportResultsCounts = new CollectionCounts({
        filtered: 0,
        all: 5,
        first: 1,
        rows: 10,
      });

      const gmp = {
        settings: {
          enableEPSS: false,
        },
      };

      const onFilterEditClick = testing.fn();
      const {render} = rendererWith({gmp});

      render(
        <ResultsTabContent
          hasTarget={true}
          isContainerScanning={true}
          isLoading={false}
          progress={100}
          reportFilter={filter}
          reportId="report-123"
          reportResultsCounts={reportResultsCounts}
          results={results}
          status={TASK_STATUS.done}
          onFilterDecreaseMinQoDClick={testing.fn()}
          onFilterEditClick={onFilterEditClick}
          onFilterRemoveClick={testing.fn()}
          onTargetEditClick={testing.fn()}
        />,
      );

      expect(
        screen.getByText(
          /The report is empty. The filter does not match any of the 5 results./i,
        ),
      ).toBeInTheDocument();
    });
  });

  describe('Regular Scanning', () => {
    test('should render ResultsTab when isContainerScanning is false', () => {
      const results = {
        entities: [createMockResult()],
        counts: new CollectionCounts({
          filtered: 1,
          all: 1,
          first: 1,
          rows: 10,
        }),
      };

      const reportResultsCounts = new CollectionCounts({
        filtered: 1,
        all: 1,
        first: 1,
        rows: 10,
      });

      const getMock = testing.fn().mockResolvedValue({
        data: results.entities,
        meta: {
          counts: results.counts,
          filter,
        },
      });

      const gmp = {
        results: {
          get: getMock,
        },
        settings: {
          token: 'test-token',
          enableEPSS: false,
        },
      };

      const {render} = rendererWith({gmp});

      render(
        <ResultsTabContent
          hasTarget={true}
          isContainerScanning={false}
          isLoading={false}
          progress={100}
          reportFilter={filter}
          reportId="report-123"
          reportResultsCounts={reportResultsCounts}
          results={results}
          status={TASK_STATUS.done}
          onFilterDecreaseMinQoDClick={testing.fn()}
          onFilterEditClick={testing.fn()}
          onFilterRemoveClick={testing.fn()}
          onTargetEditClick={testing.fn()}
        />,
      );

      // ResultsTab should be rendered (which shows loading initially)
      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    test('should render Loading when isLoading is true and no entities', () => {
      const results = {
        entities: undefined,
        counts: undefined,
      };

      const gmp = {
        settings: {
          enableEPSS: false,
        },
      };

      const {render} = rendererWith({gmp});

      render(
        <ResultsTabContent
          hasTarget={true}
          isContainerScanning={false}
          isLoading={true}
          progress={50}
          reportFilter={filter}
          reportId="report-123"
          results={results}
          status={TASK_STATUS.running}
          onFilterDecreaseMinQoDClick={testing.fn()}
          onFilterEditClick={testing.fn()}
          onFilterRemoveClick={testing.fn()}
          onTargetEditClick={testing.fn()}
        />,
      );

      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    test('should render Loading when isLoading is true and entities array is empty', () => {
      const results = {
        entities: [],
        counts: new CollectionCounts({
          filtered: 0,
          all: 0,
          first: 1,
          rows: 10,
        }),
      };

      const gmp = {
        settings: {
          enableEPSS: false,
        },
      };

      const {render} = rendererWith({gmp});

      render(
        <ResultsTabContent
          hasTarget={true}
          isContainerScanning={false}
          isLoading={true}
          progress={50}
          reportFilter={filter}
          reportId="report-123"
          results={results}
          status={TASK_STATUS.running}
          onFilterDecreaseMinQoDClick={testing.fn()}
          onFilterEditClick={testing.fn()}
          onFilterRemoveClick={testing.fn()}
          onTargetEditClick={testing.fn()}
        />,
      );

      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });
  });

  describe('Filter callbacks', () => {
    test('should pass filter callbacks to EmptyResultsReport for container scanning', () => {
      const results = {
        entities: [],
        counts: new CollectionCounts({
          filtered: 0,
          all: 5,
          first: 1,
          rows: 10,
        }),
      };

      const reportResultsCounts = new CollectionCounts({
        filtered: 0,
        all: 5,
        first: 1,
        rows: 10,
      });

      const gmp = {
        settings: {
          enableEPSS: false,
        },
      };

      const onFilterAddLogLevelClick = testing.fn();
      const onFilterDecreaseMinQoDClick = testing.fn();
      const onFilterEditClick = testing.fn();
      const onFilterRemoveClick = testing.fn();
      const onFilterRemoveSeverityClick = testing.fn();

      const {render} = rendererWith({gmp});

      render(
        <ResultsTabContent
          hasTarget={true}
          isContainerScanning={true}
          isLoading={false}
          progress={100}
          reportFilter={filter}
          reportId="report-123"
          reportResultsCounts={reportResultsCounts}
          results={results}
          status={TASK_STATUS.done}
          onFilterAddLogLevelClick={onFilterAddLogLevelClick}
          onFilterDecreaseMinQoDClick={onFilterDecreaseMinQoDClick}
          onFilterEditClick={onFilterEditClick}
          onFilterRemoveClick={onFilterRemoveClick}
          onFilterRemoveSeverityClick={onFilterRemoveSeverityClick}
          onTargetEditClick={testing.fn()}
        />,
      );

      // Check that the EmptyResultsReport is rendered
      expect(
        screen.getByText(
          /The report is empty. The filter does not match any of the 5 results./i,
        ),
      ).toBeInTheDocument();
    });
  });
});
