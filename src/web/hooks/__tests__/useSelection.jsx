/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/* eslint-disable react/prop-types */

import {describe, test, expect} from '@gsa/testing';

import {fireEvent, render, screen} from 'web/utils/testing';
import SelectionType from 'web/utils/selectiontype';

import useSelection from '../useSelection';

const TestComponent = () => {
  const {selected, selectionType, select, deselect, changeSelectionType} =
    useSelection(SelectionType.SELECTION_USER);
  return (
    <>
      <span data-testid="selectionType">{selectionType}</span>
      <input
        type="checkbox"
        checked={selected?.includes(1) === true}
        readOnly
        data-testid="checked1"
      />
      <input
        type="checkbox"
        checked={selected?.includes(2) === true}
        readOnly
        data-testid="checked2"
      />
      <button onClick={() => select(1)} data-testid="select1" />
      <button onClick={() => select(2)} data-testid="select2" />
      <button onClick={() => deselect(1)} data-testid="deselect1" />
      <button
        onClick={() =>
          changeSelectionType(SelectionType.SELECTION_PAGE_CONTENTS)
        }
        data-testid="selectPageContent"
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
