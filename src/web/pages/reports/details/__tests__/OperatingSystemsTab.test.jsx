/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, rendererWith} from 'web/testing';
import Filter from 'gmp/models/filter';
import {SEVERITY_RATING_CVSS_3} from 'gmp/utils/severity';
import {getMockAuditReport} from 'web/pages/reports/__mocks__/MockAuditReport';
import {getMockReport} from 'web/pages/reports/__mocks__/MockReport';
import OperatingSystemsTab from 'web/pages/reports/details/OperatingSystemsTab';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

const filter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity',
);
const gmp = {
  settings: {
    severityRating: SEVERITY_RATING_CVSS_3,
  },
};

describe('Report Operating Systems Tab tests', () => {
  test('should render Report Operating Systems Tab', () => {
    const {operatingsystems} = getMockReport();

    const onSortChange = testing.fn();
    const onInteraction = testing.fn();

    const {render, store} = rendererWith({
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {baseElement} = render(
      <OperatingSystemsTab
        counts={operatingsystems.counts}
        filter={filter}
        isUpdating={false}
        operatingsystems={operatingsystems.entities}
        sortField={'severity'}
        sortReverse={true}
        onInteraction={onInteraction}
        onSortChange={onSortChange}
      />,
    );

    const images = baseElement.querySelectorAll('img');
    const links = baseElement.querySelectorAll('a');
    const header = baseElement.querySelectorAll('th');
    const bars = screen.getAllByTestId('progressbar-box');

    // Headings
    expect(header[0]).toHaveTextContent('Operating System');
    expect(header[1]).toHaveTextContent('CPE');
    expect(header[2]).toHaveTextContent('Hosts');
    expect(header[3]).toHaveTextContent('Severity');

    // Row 1
    expect(images[0]).toHaveAttribute('src', '/img/os_unknown.svg');
    expect(links[1]).toHaveAttribute(
      'href',
      '/operatingsystems?filter=name%3Dcpe%3A%2Ffoo%2Fbar',
    );
    expect(links[0]).toHaveTextContent('Foo OS');
    expect(links[0]).toHaveAttribute(
      'href',
      '/operatingsystems?filter=name%3Dcpe%3A%2Ffoo%2Fbar',
    );
    expect(links[1]).toHaveTextContent('cpe:/foo/bar');
    expect(bars[0]).toHaveAttribute('title', 'Critical');
    expect(bars[0]).toHaveTextContent('10.0 (Critical)');

    // Row 2
    expect(images[1]).toHaveAttribute('src', '/img/os_unknown.svg');
    expect(links[2]).toHaveAttribute(
      'href',
      '/operatingsystems?filter=name%3Dcpe%3A%2Florem%2Fipsum',
    );
    expect(links[2]).toHaveTextContent('Lorem OS');
    expect(links[2]).toHaveAttribute(
      'href',
      '/operatingsystems?filter=name%3Dcpe%3A%2Florem%2Fipsum',
    );
    expect(links[3]).toHaveTextContent('cpe:/lorem/ipsum');
    expect(bars[1]).toHaveAttribute('title', 'Medium');
    expect(bars[1]).toHaveTextContent('5.0 (Medium)');

    // Filter
    expect(baseElement).toHaveTextContent(
      '(Applied filter: apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity)',
    );
  });
});

const auditfilter = Filter.fromString(
  'apply_overrides=0 levels=hmlg rows=3 min_qod=70 first=1 sort=compliant',
);

describe('Audit Report Operating Systems Tab tests', () => {
  test('should render Audit Report Operating Systems Tab', () => {
    const {operatingsystems} = getMockAuditReport();

    const onSortChange = testing.fn();
    const onInteraction = testing.fn();

    const {render, store} = rendererWith({
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {baseElement} = render(
      <OperatingSystemsTab
        audit={true}
        counts={operatingsystems.counts}
        filter={auditfilter}
        isUpdating={false}
        operatingsystems={operatingsystems.entities}
        sortField={'compliant'}
        sortReverse={true}
        onInteraction={onInteraction}
        onSortChange={onSortChange}
      />,
    );

    const images = baseElement.querySelectorAll('img');
    const links = baseElement.querySelectorAll('a');
    const header = baseElement.querySelectorAll('th');
    const bars = screen.getAllByTestId('progressbar-box');

    // Headings
    expect(header[0]).toHaveTextContent('Operating System');
    expect(header[1]).toHaveTextContent('CPE');
    expect(header[2]).toHaveTextContent('Hosts');
    expect(header[3]).toHaveTextContent('Compliant');

    // Row 1
    expect(images[0]).toHaveAttribute('src', '/img/os_unknown.svg');
    expect(links[0]).toHaveAttribute(
      'href',
      '/operatingsystems?filter=name%3Dcpe%3A%2Ffoo%2Fbar',
    );
    expect(links[0]).toHaveTextContent('Foo OS');
    expect(links[1]).toHaveAttribute(
      'href',
      '/operatingsystems?filter=name%3Dcpe%3A%2Ffoo%2Fbar',
    );
    expect(links[1]).toHaveTextContent('cpe:/foo/bar');
    expect(bars[0]).toHaveAttribute('title', 'No');
    expect(bars[0]).toHaveTextContent('No');

    // Row 2
    expect(images[1]).toHaveAttribute('src', '/img/os_unknown.svg');
    expect(links[2]).toHaveAttribute(
      'href',
      '/operatingsystems?filter=name%3Dcpe%3A%2Florem%2Fipsum',
    );
    expect(links[2]).toHaveTextContent('Lorem OS');
    expect(links[2]).toHaveAttribute(
      'href',
      '/operatingsystems?filter=name%3Dcpe%3A%2Florem%2Fipsum',
    );
    expect(links[3]).toHaveTextContent('cpe:/lorem/ipsum');
    expect(bars[1]).toHaveAttribute('title', 'Incomplete');
    expect(bars[1]).toHaveTextContent('Incomplete');

    // Filter
    expect(baseElement).toHaveTextContent(
      '(Applied filter: apply_overrides=0 levels=hmlg rows=3 min_qod=70 first=1 sort=compliant)',
    );
  });
});
