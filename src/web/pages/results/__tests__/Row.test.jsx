/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Result from 'gmp/models/result';
import Row from 'web/pages/results/Row';
import {rendererWith} from 'web/utils/Testing';


const gmp = {settings: {enableEPSS: true}};

describe('Should render EPSS fields', () => {
  const {render} = rendererWith({gmp, store: true});

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
        epss: {
          max_severity: {
            score: 0.8765,
            percentile: 0.8,
            cve: {
              _id: 'CVE-2019-1234',
              severity: 5.0,
            },
          },
          max_epss: {
            score: 0.9876,
            percentile: 0.9,
            cve: {
              _id: 'CVE-2020-5678',
              severity: 2.0,
            },
          },
        },
      },
    });

    const {element} = render(
      <table>
        <tbody>
          <Row entity={entity} />
        </tbody>
      </table>,
    );

    expect(element).toHaveTextContent('0.87650');
    expect(element).toHaveTextContent('80.000%');
  });
});

describe('Delta reports V2 with changed severity, qod and hostname', () => {
  const {render} = rendererWith({gmp, store: true});

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

    const {getAllByTestId} = render(
      <table>
        <tbody>
          <Row entity={entity} />
        </tbody>
      </table>,
    );
    const icons = getAllByTestId('svg-icon');

    expect(icons.length).toEqual(3);
    expect(icons[0]).toHaveAttribute('title', 'Severity is changed from 2.6.');
    expect(icons[1]).toHaveAttribute('title', 'QoD is changed from 70.');
    expect(icons[2]).toHaveAttribute('title', 'Hostname is changed from bar.');
  });
});

describe('Delta reports V2 with same severity, qod and hostname', () => {
  const {render} = rendererWith({gmp, store: true});

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

    const {queryAllByTestId} = render(
      <table>
        <tbody>
          <Row entity={entity} />
        </tbody>
      </table>,
    );
    const icons = queryAllByTestId('svg-icon');

    expect(icons.length).toBe(0);
  });
});

describe('Audit reports with compliance', () => {
  const {render} = rendererWith({gmp, store: true});

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

    const {getAllByTestId} = render(
      <table>
        <tbody>
          <Row audit={true} entity={entity} />
        </tbody>
      </table>,
    );
    const bars = getAllByTestId('progressbar-box');

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

    const {getAllByTestId} = render(
      <table>
        <tbody>
          <Row audit={true} entity={entity} />
        </tbody>
      </table>,
    );
    const bars = getAllByTestId('progressbar-box');
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

    const {getAllByTestId} = render(
      <table>
        <tbody>
          <Row audit={true} entity={entity} />
        </tbody>
      </table>,
    );
    const bars = getAllByTestId('progressbar-box');
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

    const {getAllByTestId} = render(
      <table>
        <tbody>
          <Row audit={true} entity={entity} />
        </tbody>
      </table>,
    );
    const bars = getAllByTestId('progressbar-box');
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

    const {getAllByTestId} = render(
      <table>
        <tbody>
          <Row audit={true} entity={entity} />
        </tbody>
      </table>,
    );
    const icons = getAllByTestId('svg-icon');
    expect(icons.length).toEqual(1);
    expect(icons[0]).toHaveAttribute(
      'title',
      'Compliance is changed from yes.',
    );
  });
});
