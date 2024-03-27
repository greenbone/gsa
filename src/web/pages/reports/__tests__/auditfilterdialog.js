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

import Capabilities from 'gmp/capabilities/capabilities';
import {setLocale} from 'gmp/locale/lang';

import Filter from 'gmp/models/filter';

import {rendererWith} from 'web/utils/testing';

import AuditReportFilter from 'web/pages/reports/auditfilterdialog';

setLocale('en');

const caps = new Capabilities(['everything']);

const manualUrl = 'test/';

describe('Filter Dialog for Audit report', () => {
  test('should render filter with compliance level group', () => {
    const onFilterChanged = jest.fn();
    const onFilterCreated = jest.fn();
    const onCloseClick = jest.fn();

    const filter = Filter.fromString(
      'apply_overrides=0 levels=hmlg rows=100 min_qod=70 first=1 sort=compliant',
    );

    const gmp = {
      settings: {manualUrl, reportResultsThreshold: 10},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
    });

    const {getAllByTestId} = render(
      <AuditReportFilter
        filter={filter}
        delta={false}
        onFilterChanged={onFilterChanged}
        onCloseClick={onCloseClick}
        createFilterType="result"
        onFilterCreated={onFilterCreated}
      />,
    );

    const formgroups = getAllByTestId('formgroup-title');
    const content = getAllByTestId('formgroup-content');
    const radioTitles = getAllByTestId('radio-title');

    expect(formgroups[0]).toHaveTextContent('Filter');
    expect(formgroups[1]).toHaveTextContent('Compliance');
    expect(content[1]).toHaveTextContent('YesNoIncompleteUndefined');
    expect(formgroups[2]).toHaveTextContent('QoD');
    expect(formgroups[3]).toHaveTextContent('From Task (name)');
    expect(formgroups[4]).toHaveTextContent('First result');
    expect(formgroups[5]).toHaveTextContent('Results per page');
    expect(formgroups[6]).toHaveTextContent('Sort by');
    expect(radioTitles[0]).toHaveTextContent('Ascending');
    expect(radioTitles[1]).toHaveTextContent('Descending');
  });
});
