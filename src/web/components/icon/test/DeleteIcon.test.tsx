/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {render, screen, fireEvent} from 'web/testing';
import DeleteIcon from 'web/components/icon/DeleteIcon';
import SelectionType from 'web/utils/selection-type';

describe('DeleteIcon component tests', () => {
  test('should render with the default data-testid', () => {
    render(<DeleteIcon />);

    expect(screen.getByTestId('delete-icon')).toBeInTheDocument();
  });

  test('should use a custom data-testid when provided', () => {
    render(<DeleteIcon data-testid="my-delete" />);

    expect(screen.getByTestId('my-delete')).toBeInTheDocument();
  });

  test('should use the provided title over any derived title', () => {
    render(
      <DeleteIcon
        selectionType={SelectionType.SELECTION_USER}
        title="Custom title"
      />,
    );

    expect(screen.getByTitle('Custom title')).toBeInTheDocument();
  });

  test('should derive title "Deleting" when loading and no title is given', () => {
    render(<DeleteIcon loading />);

    expect(screen.getByTitle('Deleting')).toBeInTheDocument();
  });

  test('should derive title for SELECTION_PAGE_CONTENTS when no title is given', () => {
    render(
      <DeleteIcon selectionType={SelectionType.SELECTION_PAGE_CONTENTS} />,
    );

    expect(screen.getByTitle('Delete page contents')).toBeInTheDocument();
  });

  test('should derive title for SELECTION_USER when no title is given', () => {
    render(<DeleteIcon selectionType={SelectionType.SELECTION_USER} />);

    expect(screen.getByTitle('Delete selection')).toBeInTheDocument();
  });

  test('should derive title for SELECTION_FILTER when no title is given', () => {
    render(<DeleteIcon selectionType={SelectionType.SELECTION_FILTER} />);

    expect(screen.getByTitle('Delete all filtered')).toBeInTheDocument();
  });

  test('should call onClick when clicked', () => {
    const handleClick = testing.fn();
    render(<DeleteIcon onClick={handleClick} />);

    fireEvent.click(screen.getByTestId('delete-icon'));

    expect(handleClick).toHaveBeenCalled();
  });
});
