/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import React from 'react';

import Capabilities from 'gmp/capabilities/capabilities';

import Filter from 'gmp/models/filter';

import {rendererWith} from 'web/utils/testing';

import AuditReportFilter from 'web/pages/reports/auditfilterdialog';

const caps = new Capabilities(['everything']);

const manualUrl = 'test/';

describe('Filter Dialog for Audit report', () => {
  test('should render filter with compliance level group', () => {
    const onFilterChanged = testing.fn();
    const onFilterCreated = testing.fn();
    const onCloseClick = testing.fn();

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
