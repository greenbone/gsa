/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, within} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import Result from 'gmp/models/result';
import ContainerScanningResultsTable from 'web/pages/reports/details/ContainerScanningResultsTable';

const filter = Filter.fromString('first=1 rows=10');

const createMockResult = (overrides = {}) => {
  return Result.fromElement({
    _id: '101',
    name: 'CVE-2019-1234',
    host: {
      __text: 'sha256:abc123',
      hostname: 'oci://ct-harborv1.devel.greenbone.net/eu/path/image-name:tag',
      image: 'image-name:tag',
      path: 'eu/path/',
      registry: 'ct-harborv1.devel.greenbone.net',
    },
    port: '443/tcp',
    severity: 7.5,
    qod: {value: 80},
    creation_time: '2024-01-15T10:00:00Z',
    modification_time: '2024-01-15T10:00:00Z',
    nvt: {
      _oid: '1.3.6.1.4.1.25623.1.0.12345',
      type: 'nvt',
      name: 'CVE-2019-1234',
      solution: {
        _type: 'VendorFix',
      },
    },
    ...overrides,
  });
};

describe('ContainerScanningResultsTable', () => {
  test('should render table with all columns', () => {
    const entities = [createMockResult()];
    const counts = new CollectionCounts({
      filtered: 1,
      all: 1,
      first: 1,
      rows: 10,
    });

    const gmp = {
      settings: {
        enableEPSS: false,
      },
    };

    const onSortChange = testing.fn();
    const {render} = rendererWith({gmp});

    render(
      <ContainerScanningResultsTable
        entities={entities}
        entitiesCounts={counts}
        filter={filter}
        sortBy="severity"
        sortDir="desc"
        onSortChange={onSortChange}
      />,
    );

    const table = screen.getByRole('table');
    const columnHeaders = within(table).getAllByRole('columnheader');

    // Check all expected columns
    expect(
      columnHeaders.some(th => /Vulnerability/i.exec(th.textContent)),
    ).toBe(true);
    expect(columnHeaders.some(th => /Severity/i.exec(th.textContent))).toBe(
      true,
    );
    expect(columnHeaders.some(th => /QoD/i.exec(th.textContent))).toBe(true);
    expect(columnHeaders.some(th => /Image/i.exec(th.textContent))).toBe(true);
    expect(columnHeaders.some(th => /Location/i.exec(th.textContent))).toBe(
      true,
    );
    expect(columnHeaders.some(th => /Name/i.exec(th.textContent))).toBe(true);
    expect(columnHeaders.some(th => /Created/i.exec(th.textContent))).toBe(
      true,
    );
  });

  test('should render Name column with full hostname in title attribute', () => {
    const longHostname =
      'oci://ct-harborv1.devel.greenbone.net/eu/very/long/path/to/image-name:tag-with-very-long-name';
    const entities = [
      createMockResult({
        host: {
          __text: 'sha256:abc123',
          hostname: longHostname,
        },
      }),
    ];
    const counts = new CollectionCounts({
      filtered: 1,
      all: 1,
      first: 1,
      rows: 10,
    });

    const gmp = {
      settings: {
        enableEPSS: false,
      },
    };

    const {render} = rendererWith({gmp});

    render(
      <ContainerScanningResultsTable
        entities={entities}
        entitiesCounts={counts}
        filter={filter}
        sortBy="severity"
        sortDir="desc"
      />,
    );

    // Find the span containing the hostname
    const nameCell = screen.getByText((_content, element) => {
      return (
        element?.tagName === 'SPAN' &&
        element?.getAttribute('title') === longHostname
      );
    });

    expect(nameCell).toBeInTheDocument();
    expect(nameCell).toHaveAttribute('title', longHostname);
  });

  test('should render Name column with title and text content', () => {
    const entities = [createMockResult()];
    const counts = new CollectionCounts({
      filtered: 1,
      all: 1,
      first: 1,
      rows: 10,
    });

    const gmp = {
      settings: {
        enableEPSS: false,
      },
    };

    const {render} = rendererWith({gmp});

    render(
      <ContainerScanningResultsTable
        entities={entities}
        entitiesCounts={counts}
        filter={filter}
        sortBy="severity"
        sortDir="desc"
      />,
    );

    // Find the span containing the hostname
    const hostname =
      'oci://ct-harborv1.devel.greenbone.net/eu/path/image-name:tag';
    const nameCell = screen.getByText((content, element) => {
      return (
        element?.tagName === 'SPAN' &&
        element?.getAttribute('title') === hostname
      );
    });

    expect(nameCell).toBeInTheDocument();
    expect(nameCell).toHaveAttribute('title', hostname);
  });

  test('should render shortened Name when hostname is long', () => {
    const longHostname =
      'oci://ct-harborv1.devel.greenbone.net/eu/very/long/path/to/image-name-with-very-long-name-that-exceeds-limit:tag';
    const entities = [
      createMockResult({
        host: {
          _id: 'host-123',
          __text: 'sha256:abc123',
          hostname: longHostname,
        },
      }),
    ];
    const counts = new CollectionCounts({
      filtered: 1,
      all: 1,
      first: 1,
      rows: 10,
    });

    const gmp = {
      settings: {
        enableEPSS: false,
      },
    };

    const {render} = rendererWith({gmp});

    render(
      <ContainerScanningResultsTable
        entities={entities}
        entitiesCounts={counts}
        filter={filter}
        sortBy="severity"
        sortDir="desc"
      />,
    );

    // The displayed text should be shortened (40 chars + ...)
    const nameCell = screen.getByText((content, element) => {
      return (
        element?.tagName === 'SPAN' &&
        element?.getAttribute('title') === longHostname &&
        element?.textContent?.includes('...')
      );
    });

    expect(nameCell).toBeInTheDocument();
    expect(nameCell.textContent?.length).toBeLessThan(longHostname.length);
  });

  test('should not render Name cell when hostname is undefined', () => {
    const entities = [
      createMockResult({
        host: {
          __text: 'sha256:abc123',
          // hostname is intentionally omitted
        },
      }),
    ];
    const counts = new CollectionCounts({
      filtered: 1,
      all: 1,
      first: 1,
      rows: 10,
    });

    const gmp = {
      settings: {
        enableEPSS: false,
      },
    };

    const {render} = rendererWith({gmp});

    render(
      <ContainerScanningResultsTable
        entities={entities}
        entitiesCounts={counts}
        filter={filter}
        sortBy="severity"
        sortDir="desc"
      />,
    );

    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row');
    const dataRow = rows.find(
      row => within(row).queryAllByRole('cell').length > 0,
    );

    // The Name column should exist but be empty
    expect(dataRow).toBeInTheDocument();
  });

  test('should render Image column with parsed OCI URL', () => {
    const entities = [createMockResult()];
    const counts = new CollectionCounts({
      filtered: 1,
      all: 1,
      first: 1,
      rows: 10,
    });

    const gmp = {
      settings: {
        enableEPSS: false,
      },
    };

    const {render} = rendererWith({gmp});

    render(
      <ContainerScanningResultsTable
        entities={entities}
        entitiesCounts={counts}
        filter={filter}
        sortBy="severity"
        sortDir="desc"
      />,
    );

    // Check that the image name is displayed from the backend field
    expect(screen.getByText('image-name:tag')).toBeInTheDocument();
  });

  test('should render Location column with parsed OCI path', () => {
    const entities = [createMockResult()];
    const counts = new CollectionCounts({
      filtered: 1,
      all: 1,
      first: 1,
      rows: 10,
    });

    const gmp = {
      settings: {
        enableEPSS: false,
      },
    };

    const {render} = rendererWith({gmp});

    render(
      <ContainerScanningResultsTable
        entities={entities}
        entitiesCounts={counts}
        filter={filter}
        sortBy="severity"
        sortDir="desc"
      />,
    );

    // Check that the location is displayed from the backend field
    expect(screen.getByText('eu/path/')).toBeInTheDocument();
  });

  test('should render with EPSS columns when enabled', () => {
    const entities = [
      createMockResult({
        nvt: {
          _oid: '1.3.6.1.4.1.25623.1.0.12345',
          type: 'nvt',
          name: 'CVE-2019-1234',
          solution: {
            _type: 'VendorFix',
          },
          epss: {
            max_epss: {
              score: 0.8765,
              percentile: 85.5,
              cve: {
                _id: 'CVE-2019-1234',
                severity: 7.5,
              },
            },
          },
        },
      }),
    ];
    const counts = new CollectionCounts({
      filtered: 1,
      all: 1,
      first: 1,
      rows: 10,
    });

    const gmp = {
      settings: {
        enableEPSS: true,
      },
    };

    const {render} = rendererWith({gmp});

    render(
      <ContainerScanningResultsTable
        entities={entities}
        entitiesCounts={counts}
        filter={filter}
        sortBy="severity"
        sortDir="desc"
      />,
    );

    expect(screen.getByText('87.650%')).toBeInTheDocument();
    expect(screen.getByText('86th')).toBeInTheDocument();
  });

  test('should handle sorting by clicking on column headers', async () => {
    const entities = [createMockResult(), createMockResult({_id: '102'})];
    const counts = new CollectionCounts({
      filtered: 2,
      all: 2,
      first: 1,
      rows: 10,
    });

    const gmp = {
      settings: {
        enableEPSS: false,
      },
    };

    const onSortChange = testing.fn();
    const {render} = rendererWith({gmp});

    const {userEvent} = render(
      <ContainerScanningResultsTable
        entities={entities}
        entitiesCounts={counts}
        filter={filter}
        sortBy="severity"
        sortDir="desc"
        onSortChange={onSortChange}
      />,
    );

    const nameHeader = screen.getByRole('button', {name: /Name/i});
    await userEvent.click(nameHeader);

    expect(onSortChange).toHaveBeenCalledWith('hostname');
  });

  test('should render solution type icon when solution is defined', () => {
    const entities = [createMockResult()];
    const counts = new CollectionCounts({
      filtered: 1,
      all: 1,
      first: 1,
      rows: 10,
    });

    const gmp = {
      settings: {
        enableEPSS: false,
      },
    };

    const {render} = rendererWith({gmp});

    render(
      <ContainerScanningResultsTable
        entities={entities}
        entitiesCounts={counts}
        filter={filter}
        sortBy="severity"
        sortDir="desc"
      />,
    );

    // Check that solution type icon column exists
    const table = screen.getByRole('table');
    const solutionTypeHeader = within(table).getByTitle('Solution type');
    expect(solutionTypeHeader).toBeInTheDocument();
  });
});
