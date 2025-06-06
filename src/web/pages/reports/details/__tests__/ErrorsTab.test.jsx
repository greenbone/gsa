/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Filter from 'gmp/models/filter';
import {getMockReport} from 'web/pages/reports/__mocks__/MockReport';
import ErrorsTab from 'web/pages/reports/details/ErrorsTab';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

const caps = new Capabilities(['everything']);

const filter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity',
);

describe('Report Errors Tab tests', () => {
  test('should render Report Errors Tab', () => {
    const {errors} = getMockReport();

    const onSortChange = testing.fn();
    const onInteraction = testing.fn();

    const {render, store} = rendererWith({
      capabilities: caps,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {baseElement} = render(
      <ErrorsTab
        counts={errors.counts}
        errors={errors.entities}
        filter={filter}
        isUpdating={false}
        sortField={'severity'}
        sortReverse={true}
        onInteraction={onInteraction}
        onSortChange={sortField => onSortChange('errors', sortField)}
      />,
    );

    const header = baseElement.querySelectorAll('th');
    const rows = baseElement.querySelectorAll('tr');
    const links = baseElement.querySelectorAll('a');

    // Headings
    expect(header[0]).toHaveTextContent('Error Message');
    expect(header[1]).toHaveTextContent('Host');
    expect(header[2]).toHaveTextContent('Hostname');
    expect(header[3]).toHaveTextContent('NVT');
    expect(header[4]).toHaveTextContent('Port');

    // Row 1
    expect(rows[1]).toHaveTextContent('This is an error.');
    expect(links[0]).toHaveAttribute('href', '/host/123');
    expect(links[0]).toHaveTextContent('123.456.78.910');
    expect(rows[1]).toHaveTextContent('foo.bar');
    expect(links[1]).toHaveAttribute('href', '/nvt/314');
    expect(links[1]).toHaveTextContent('NVT1');
    expect(rows[1]).toHaveTextContent('123/tcp');

    // Row 2
    expect(rows[2]).toHaveTextContent('This is another error');
    expect(links[2]).toHaveAttribute('href', '/host/109');
    expect(links[2]).toHaveTextContent('109.876.54.321');
    expect(rows[2]).toHaveTextContent('lorem.ipsum');
    expect(links[3]).toHaveAttribute('href', '/nvt/159');
    expect(links[3]).toHaveTextContent('NVT2');
    expect(rows[2]).toHaveTextContent('456/tcp');

    // Filter
    expect(baseElement).toHaveTextContent(
      '(Applied filter: apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity)',
    );
  });
});
