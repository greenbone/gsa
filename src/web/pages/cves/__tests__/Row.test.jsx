/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWithTable, fireEvent, screen} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Cve from 'gmp/models/cve';
import {parseDate} from 'gmp/parser';
import {SEVERITY_RATING_CVSS_3} from 'gmp/utils/severity';
import CveRow from 'web/pages/cves/Row';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

const gmp = {settings: {severityRating: SEVERITY_RATING_CVSS_3}};
const caps = new Capabilities(['everything']);

const entity = Cve.fromElement({
  _id: 'CVE-2020-9992',
  name: 'CVE-2020-9992',
  creationTime: parseDate('2020-10-22T19:15:00Z'),
  cve: {
    cvss_vector: 'AV:N/AC:M/Au:N/C:C/I:C/A:C',
    severity: '9.3',
    description: 'foo bar baz',
  },
});

describe('CVEv2 Row tests', () => {
  test('should render', () => {
    const handleToggleDetailsClick = testing.fn();

    const {render, store} = rendererWithTable({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('username'));

    const {baseElement} = render(
      <CveRow
        entity={entity}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    // Name
    expect(baseElement).toHaveTextContent('CVE-2020-9992');

    // CVSS Base Vector
    const links = baseElement.querySelectorAll('a');

    expect(links[0]).toHaveAttribute(
      'href',
      '/cvsscalculator?cvssVector=AV%3AN%2FAC%3AM%2FAu%3AN%2FC%3AC%2FI%3AC%2FA%3AC',
    );
    expect(links[0]).toHaveTextContent('AV:N/AC:M/Au:N/C:C/I:C/A:C');

    // Published
    expect(baseElement).toHaveTextContent(
      'Thu, Oct 22, 2020 9:15 PM Central European Summer Time',
    );

    // Severity
    const bars = screen.getAllByTestId('progressbar-box');
    expect(bars[0]).toHaveAttribute('title', 'Critical');
    expect(bars[0]).toHaveTextContent('9.3 (Critical)');

    // Description
    expect(baseElement).toHaveTextContent('foo bar baz');
  });

  test('should call click handlers', () => {
    const handleToggleDetailsClick = testing.fn();

    const {render} = rendererWithTable({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    const {baseElement} = render(
      <CveRow
        entity={entity}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[1]);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(
      undefined,
      'CVE-2020-9992',
    );
  });
});

const entity_v3 = Cve.fromElement({
  _id: 'CVE-2020-9992',
  name: 'CVE-2020-9992',
  creationTime: '2020-10-22T19:15:00Z',
  cve: {
    cvss_vector: 'CVSS:3.1/AV:L/AC:L/PR:N/UI:R/S:U/C:N/I:H/A:H',
    severity: '7.1',
    description: 'foo bar baz',
  },
});

describe('CVEv3 Row tests', () => {
  test('should render', () => {
    const handleToggleDetailsClick = testing.fn();

    const {render, store} = rendererWithTable({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('username'));

    const {baseElement} = render(
      <CveRow
        entity={entity_v3}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    // Name
    expect(baseElement).toHaveTextContent('CVE-2020-9992');

    // CVSS Base Vector
    const links = baseElement.querySelectorAll('a');

    expect(links[0]).toHaveAttribute(
      'href',
      '/cvsscalculator?cvssVector=CVSS%3A3.1%2FAV%3AL%2FAC%3AL%2FPR%3AN%2FUI%3AR%2FS%3AU%2FC%3AN%2FI%3AH%2FA%3AH',
    );
    expect(links[0]).toHaveTextContent(
      'CVSS:3.1/AV:L/AC:L/PR:N/UI:R/S:U/C:N/I:H/A:H',
    );

    // Published
    expect(baseElement).toHaveTextContent(
      'Thu, Oct 22, 2020 9:15 PM Central European Summer Time',
    );

    // Severity
    const bars = screen.getAllByTestId('progressbar-box');
    expect(bars[0]).toHaveAttribute('title', 'High');
    expect(bars[0]).toHaveTextContent('7.1 (High)');

    // Description
    expect(baseElement).toHaveTextContent('foo bar baz');
  });

  test('should call click handlers', () => {
    const handleToggleDetailsClick = testing.fn();

    const {render} = rendererWithTable({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    const {baseElement} = render(
      <CveRow
        entity={entity}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[1]);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(
      undefined,
      'CVE-2020-9992',
    );
  });
});
