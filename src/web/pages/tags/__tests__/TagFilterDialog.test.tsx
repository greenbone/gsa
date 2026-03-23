/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {changeInputValue, fireEvent, rendererWith, screen} from 'web/testing';
import Filter from 'gmp/models/filter';
import TagFilterDialog from 'web/pages/tags/TagFilterDialog';

describe('TagFilterDialog tests', () => {
  test('should render dialog', () => {
    const filter = new Filter();
    const gmp = {filter: {}};
    const {render} = rendererWith({capabilities: true, gmp});

    const handleClose = testing.fn();
    const handleFilterChanged = testing.fn();
    render(
      <TagFilterDialog
        filter={filter}
        onClose={handleClose}
        onFilterChanged={handleFilterChanged}
      />,
    );

    screen.getByText('Name');
    screen.getDialogTitle();
    screen.getDialogSaveButton();

    const closeButton = screen.getDialogCloseButton();
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalled();
  });

  test('should call onFilterChanged on save', () => {
    const handleClose = testing.fn();
    const handleFilterChanged = testing.fn();
    const filter = new Filter();
    const gmp = {filter: {}};
    const {render} = rendererWith({capabilities: true, gmp});

    render(
      <TagFilterDialog
        filter={filter}
        onClose={handleClose}
        onFilterChanged={handleFilterChanged}
      />,
    );

    const filterInput = screen.getByName('filter');
    changeInputValue(filterInput, 'foo=bar');
    fireEvent.click(screen.getDialogSaveButton());

    expect(handleFilterChanged).toHaveBeenCalledWith(
      Filter.fromString('foo=bar'),
    );
  });
});
