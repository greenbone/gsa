/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, rendererWithTableRow, fireEvent} from 'web/testing';
import EntitiesActions from 'web/entities/EntitiesActions';
import SelectionType from 'web/utils/SelectionType';

describe('EntitiesActions tests', () => {
  test('should render EntitySelection when selectionType is SELECTION_USER', () => {
    const entity = {id: 'entity-1'};
    const onSelected = testing.fn();
    const onDeselected = testing.fn();
    const {render} = rendererWithTableRow();

    render(
      <EntitiesActions
        entity={entity}
        selectionType={SelectionType.SELECTION_USER}
        onEntityDeselected={onDeselected}
        onEntitySelected={onSelected}
      />,
    );

    const selection = screen.getByTestId('entity-selection-entity-1');
    fireEvent.click(selection);
    expect(onSelected).toHaveBeenCalledWith(entity);

    fireEvent.click(selection);
    expect(onDeselected).toHaveBeenCalledWith(entity);
  });

  test('should render selectionType PAGE CONTENTS', () => {
    const entity = {id: 'entity-1'};
    const {render} = rendererWithTableRow();

    render(
      <EntitiesActions
        entity={entity}
        selectionType={SelectionType.SELECTION_PAGE_CONTENTS}
      >
        <div>Test</div>
      </EntitiesActions>,
    );

    expect(
      screen.queryByTestId('entity-selection-entity-1'),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('entities-actions')).toBeInTheDocument();
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  test('should not render anything if children is not provided', () => {
    const entity = {id: 'entity-1'};
    const {render} = rendererWithTableRow();

    render(<EntitiesActions entity={entity} />);

    expect(
      screen.queryByTestId('entity-selection-entity-1'),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('entities-actions')).not.toBeInTheDocument();
  });
});
