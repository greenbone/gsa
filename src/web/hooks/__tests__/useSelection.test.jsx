/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import useSelection from 'web/hooks/useSelection';
import SelectionType from 'web/utils/SelectionType';
import {fireEvent, render, screen} from 'web/utils/Testing';

const TestComponent = () => {
  const {selected, selectionType, select, deselect, changeSelectionType} =
    useSelection(SelectionType.SELECTION_USER);
  return (
    <>
      <span data-testid="selectionType">{selectionType}</span>
      <input
        readOnly
        checked={selected?.includes(1) === true}
        data-testid="checked1"
        type="checkbox"
      />
      <input
        readOnly
        checked={selected?.includes(2) === true}
        data-testid="checked2"
        type="checkbox"
      />
      <button data-testid="select1" onClick={() => select(1)} />
      <button data-testid="select2" onClick={() => select(2)} />
      <button data-testid="deselect1" onClick={() => deselect(1)} />
      <button
        data-testid="selectPageContent"
        onClick={() =>
          changeSelectionType(SelectionType.SELECTION_PAGE_CONTENTS)
        }
      />
    </>
  );
};

describe('useSelection', () => {
  test('should select and deselect entities', () => {
    render(<TestComponent />);

    fireEvent.click(screen.getByTestId('select1'));
    fireEvent.click(screen.getByTestId('select2'));

    expect(screen.getByTestId('checked1')).toBeChecked();
    expect(screen.getByTestId('checked2')).toBeChecked();

    fireEvent.click(screen.getByTestId('deselect1'));

    expect(screen.getByTestId('checked1')).not.toBeChecked();
  });

  test('should change selection type', () => {
    render(<TestComponent />);

    fireEvent.click(screen.getByTestId('select1'));
    fireEvent.click(screen.getByTestId('select2'));

    expect(screen.getByTestId('checked1')).toBeChecked();
    expect(screen.getByTestId('checked2')).toBeChecked();

    fireEvent.click(screen.getByTestId('selectPageContent'));

    expect(screen.getByTestId('checked1')).not.toBeChecked();
    expect(screen.getByTestId('checked2')).not.toBeChecked();
    expect(screen.getByTestId('selectionType')).toHaveTextContent(
      SelectionType.SELECTION_PAGE_CONTENTS,
    );
  });
});
