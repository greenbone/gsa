/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, render, fireEvent} from 'web/testing';
import {NO_VALUE, YES_VALUE} from 'gmp/parser';
import AddResultsToAssetsGroup from 'web/pages/tasks/AddResultsToAssetsGroup';

describe('AddResultsToAssetsGroup tests', () => {
  test('should render AddResultsToAssetsGroup component', () => {
    render(<AddResultsToAssetsGroup inAssets={YES_VALUE} />);

    expect(screen.getByText('Add results to Assets')).toBeInTheDocument();
    expect(screen.getByRole('radio', {name: 'Yes'})).toBeInTheDocument();
    expect(screen.getByRole('radio', {name: 'No'})).toBeInTheDocument();
  });

  test("should render inAssets is 'yes'", () => {
    render(<AddResultsToAssetsGroup inAssets={YES_VALUE} />);
    expect(screen.getByRole('radio', {name: 'Yes'})).toBeChecked();
  });

  test("should render inAssets is 'no'", () => {
    render(<AddResultsToAssetsGroup inAssets={NO_VALUE} />);
    expect(screen.getByRole('radio', {name: 'No'})).toBeChecked();
  });

  test('should handle change event', () => {
    const handleChange = testing.fn();
    render(<AddResultsToAssetsGroup onChange={handleChange} />);

    const yesRadio = screen.getByRole('radio', {name: 'Yes'});
    fireEvent.click(yesRadio);
    expect(handleChange).toHaveBeenCalledWith(YES_VALUE, 'in_assets');

    const noRadio = screen.getByRole('radio', {name: 'No'});
    fireEvent.click(noRadio);
    expect(handleChange).toHaveBeenCalledWith(NO_VALUE, 'in_assets');
  });
});
