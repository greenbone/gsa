/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {describe, test, expect, testing} from '@gsa/testing';
import {screen, within, rendererWith} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Filter from 'gmp/models/filter';
import AuditReportFilterDialog from 'web/pages/reports/AuditFilterDialog';

const caps = new Capabilities(['everything']);

const manualUrl = 'test/';

describe('Filter Dialog for Audit report', () => {
  test('should render filter with compliance level group', () => {
    const onFilterChanged = testing.fn();
    const onFilterCreated = testing.fn();
    const onClose = testing.fn();

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

    render(
      <AuditReportFilterDialog
        createFilterType="result"
        delta={false}
        filter={filter}
        onClose={onClose}
        onFilterChanged={onFilterChanged}
        onFilterCreated={onFilterCreated}
      />,
    );

    expect(screen.getByText('Filter')).toBeVisible();
    expect(screen.getByText('Compliance')).toBeVisible();

    const filterGroup = screen.getByTestId('compliance-levels-filter-group');
    const {getByTestId, getAllByRole} = within(filterGroup);

    expect(getByTestId('compliance-state-yes')).toHaveTextContent('Yes');
    expect(getByTestId('compliance-state-no')).toHaveTextContent('No');
    expect(getByTestId('compliance-state-incomplete')).toHaveTextContent(
      'Incomplete',
    );
    expect(getByTestId('compliance-state-undefined')).toHaveTextContent(
      'Undefined',
    );

    expect(getAllByRole('checkbox')).toHaveLength(4);

    expect(screen.getByText('QoD')).toBeVisible();
    expect(screen.getByText('From Task (name)')).toBeVisible();
    expect(screen.getByText('First result')).toBeVisible();
    expect(screen.getByText('Results per page')).toBeVisible();
    expect(screen.getByText('Sort by')).toBeVisible();

    const ascendingRadio = screen.getByLabelText('Ascending');
    const descendingRadio = screen.getByLabelText('Descending');

    expect(ascendingRadio).toBeVisible();
    expect(descendingRadio).toBeVisible();

    expect(ascendingRadio).toBeChecked();
    expect(descendingRadio).not.toBeChecked();
  });
});
