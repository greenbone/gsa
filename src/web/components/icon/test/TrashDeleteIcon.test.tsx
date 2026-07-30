/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {render, screen, fireEvent} from 'web/testing';
import TrashDeleteIcon from 'web/components/icon/TrashDeleteIcon';

describe('TrashDeleteIcon component tests', () => {
  test('should render with the default delete-icon testid', () => {
    render(<TrashDeleteIcon />);

    expect(screen.getByTestId('delete-icon')).toBeInTheDocument();
  });

  test('should render with a custom title', () => {
    render(<TrashDeleteIcon title="Remove item" />);

    expect(screen.getByTitle('Remove item')).toBeInTheDocument();
  });

  test('should forward a custom data-testid', () => {
    render(<TrashDeleteIcon data-testid="trash-icon" />);

    expect(screen.getByTestId('trash-icon')).toBeInTheDocument();
  });

  test('should call onClick when clicked', () => {
    const handleClick = testing.fn();
    render(<TrashDeleteIcon onClick={handleClick} />);

    fireEvent.click(screen.getByTestId('delete-icon'));

    expect(handleClick).toHaveBeenCalled();
  });
});
