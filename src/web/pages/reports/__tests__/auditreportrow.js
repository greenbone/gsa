/* Copyright (C) 2024 Greenbone AG
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
import {rendererWith} from 'web/utils/testing';
import AuditRow from '../auditreportrow';

import {getMockAuditReport} from 'web/pages/reports/__mocks__/mockauditreport';

describe('Audit report row', () => {
  const {render} = rendererWith({
    capabilities: true,
    store: true,
    router: true,
  });

  test('should render row for Audit report', () => {
    const {entity} = getMockAuditReport();
    const onReportDeleteClick = jest.fn();
    const onReportDeltaSelect = jest.fn();

    const {baseElement, getAllByTestId} = render(
      <table>
        <tbody>
          <AuditRow
            entity={entity}
            onReportDeleteClick={onReportDeleteClick}
            onReportDeltaSelect={onReportDeltaSelect}
          />
        </tbody>
      </table>,
    );

    const icons = baseElement.querySelectorAll('svg');
    const bars = getAllByTestId('progressbar-box');
    const links = baseElement.querySelectorAll('a');

    expect(links[0]).toHaveAttribute('href', '/auditreport/1234');
    expect(baseElement).toHaveTextContent('Mon, Jun 3, 2019 1:00 PM');
    expect(bars[0]).toHaveAttribute('title', 'Done');
    expect(bars[0]).toHaveTextContent('Done');
    expect(baseElement).toHaveTextContent('foo');
    expect(links[1]).toHaveAttribute('href', '/task/314');
    expect(bars[1]).toHaveAttribute('title', 'No');
    expect(bars[1]).toHaveTextContent('No');
    expect(baseElement).toHaveTextContent('321'); // yes: 3, no: 2, incomplete: 1
    expect(icons[0]).toHaveTextContent('delta.svg');
    expect(icons[1]).toHaveTextContent('delete.svg');
  });
});
