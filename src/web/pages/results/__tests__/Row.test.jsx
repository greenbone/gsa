/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {rendererWithTable, screen} from 'web/testing';
import Result from 'gmp/models/result';
import Row from 'web/pages/results/Row';

const gmp = {settings: {enableEPSS: true}};

describe('Should render EPSS fields', () => {
  const {render} = rendererWithTable({gmp, store: true});

  test('should render EPSS columns', () => {
    const entity = Result.fromElement({
      _id: '101',
      name: 'Result 1',
      host: {__text: '123.456.78.910', hostname: 'foo'},
      port: '80/tcp',
      severity: 10.0,
      qod: {value: 80},
      notes: [],
      overrides: [],
      tickets: [],
      nvt: {
        type: 'nvt',
        epss: {
          maxSeverity: {
            score: 0.8765,
            percentile: 80.0,
            cve: {
              _id: 'CVE-2019-1234',
              severity: 5.0,
            },
          },
          maxEpss: {
            score: 0.9876,
            percentile: 90.0,
            cve: {
              _id: 'CVE-2020-5678',
              severity: 2.0,
            },
          },
        },
      },
    });

    const {element} = render(<Row entity={entity} />);

    expect(element).toHaveTextContent('87.650%');
    expect(element).toHaveTextContent('80th');
  });
});

describe('Delta reports V2 with changed severity, qod and hostname', () => {
  const {render} = rendererWithTable({gmp, store: true});

  test('should render Delta Difference icon', () => {
    const entity = Result.fromElement({
      _id: '101',
      name: 'Result 1',
      host: {__text: '123.456.78.910', hostname: 'foo'},
      port: '80/tcp',
      severity: 10.0,
      qod: {value: 80},
      notes: [],
      overrides: [],
      tickets: [],
      delta: {
        result: {
          _id: '102',
          name: 'Result 2',
          host: {__text: '123.456.78.910', hostname: 'bar'},
          port: '80/tcp',
          severity: 2.6,
          qod: {value: 70},
        },
      },
    });

    render(<Row entity={entity} />);

    expect(screen.getAllByTestId('delta-difference-icon')[0]).toHaveAttribute(
      'title',
      'Severity is changed from 2.6.',
    );
    expect(screen.getAllByTestId('delta-difference-icon')[1]).toHaveAttribute(
      'title',
      'QoD is changed from 70.',
    );
    expect(screen.getAllByTestId('delta-difference-icon')[2]).toHaveAttribute(
      'title',
      'Hostname is changed from bar.',
    );
  });
});

describe('Delta reports V2 with same severity, qod and hostname', () => {
  const {render} = rendererWithTable({gmp, store: true});

  test('should not render Delta Difference icon', () => {
    const entity = Result.fromElement({
      _id: '101',
      name: 'Result 1',
      host: {__text: '123.456.78.910', hostname: 'foo'},
      port: '80/tcp',
      severity: 10.0,
      qod: {value: 80},
      notes: [],
      overrides: [],
      tickets: [],
      delta: {
        result: {
          _id: '102',
          name: 'Result 2',
          host: {__text: '123.456.78.910', hostname: 'foo'},
          port: '80/tcp',
          severity: 10.0,
          qod: {value: 80},
        },
      },
    });

    render(<Row entity={entity} />);

    const icons = screen.queryAllByTestId('svg-icon');
    expect(icons.length).toBe(0);
  });
});

describe('Audit reports with compliance', () => {
  const {render} = rendererWithTable({gmp, store: true});

  test('should render Audit report with compliance yes', () => {
    const entity = Result.fromElement({
      _id: '101',
      name: 'Result 1',
      host: {__text: '123.456.78.910', hostname: 'foo'},
      port: '80/tcp',
      severity: 10.0,
      qod: {value: 80},
      notes: [],
      overrides: [],
      tickets: [],
      compliance: 'yes',
    });

    render(<Row audit={true} entity={entity} />);
    const bars = screen.getAllByTestId('progressbar-box');

    expect(bars[0]).toHaveAttribute('title', 'Yes');
    expect(bars[0]).toHaveTextContent('Yes');
  });

  test('should render Audit report with compliance no', () => {
    const entity = Result.fromElement({
      _id: '101',
      name: 'Result 1',
      host: {__text: '123.456.78.910', hostname: 'foo'},
      port: '80/tcp',
      severity: 10.0,
      qod: {value: 80},
      notes: [],
      overrides: [],
      tickets: [],
      compliance: 'no',
    });

    render(<Row audit={true} entity={entity} />);
    const bars = screen.getAllByTestId('progressbar-box');
    expect(bars[0]).toHaveAttribute('title', 'No');
    expect(bars[0]).toHaveTextContent('No');
  });

  test('should render Audit report with compliance incomplete', () => {
    const entity = Result.fromElement({
      _id: '101',
      name: 'Result 1',
      host: {__text: '123.456.78.910', hostname: 'foo'},
      port: '80/tcp',
      severity: 10.0,
      qod: {value: 80},
      notes: [],
      overrides: [],
      tickets: [],
      compliance: 'incomplete',
    });

    render(<Row audit={true} entity={entity} />);
    const bars = screen.getAllByTestId('progressbar-box');
    expect(bars[0]).toHaveAttribute('title', 'Incomplete');
    expect(bars[0]).toHaveTextContent('Incomplete');
  });

  test('should render Audit report with compliance undefined', () => {
    const entity = Result.fromElement({
      _id: '101',
      name: 'Result 1',
      host: {__text: '123.456.78.910', hostname: 'foo'},
      port: '80/tcp',
      severity: 10.0,
      qod: {value: 80},
      notes: [],
      overrides: [],
      tickets: [],
      compliance: 'undefined',
    });

    render(<Row audit={true} entity={entity} />);
    const bars = screen.getAllByTestId('progressbar-box');
    expect(bars[0]).toHaveAttribute('title', 'Undefined');
    expect(bars[0]).toHaveTextContent('Undefined');
  });

  test('Delta audit report with changed compliance', () => {
    const entity = Result.fromElement({
      _id: '101',
      name: 'Result 1',
      host: {__text: '123.456.78.910', hostname: 'foo'},
      port: '80/tcp',
      severity: 10.0,
      qod: {value: 80},
      notes: [],
      overrides: [],
      tickets: [],
      compliance: 'undefined',
      delta: {
        delta_type: 'changed',
        result: {
          compliance: 'yes',
        },
      },
    });

    render(<Row audit={true} entity={entity} />);
    const icons = screen.getAllByTestId('delta-difference-icon');
    expect(icons.length).toEqual(1);
    expect(icons[0]).toHaveAttribute(
      'title',
      'Compliance is changed from yes.',
    );
  });
});
