/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, rendererWithTableRow, fireEvent} from 'web/testing';
import EntitiesActions from 'web/entities/Actions';
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

  test('should call children function with entity', () => {
    const entity = {id: 'entity-1'};
    const {render} = rendererWithTableRow();
    const childFn = testing.fn(() => <span>Child Function</span>);

    render(<EntitiesActions entity={entity}>{childFn}</EntitiesActions>);

    expect(childFn).toHaveBeenCalledWith({entity});
    expect(screen.getByText('Child Function')).toBeInTheDocument();
  });

  test('should call children function with custom props', () => {
    const entity = {id: 'entity-1'};
    const {render} = rendererWithTableRow();
    const childFn = testing.fn(() => <span>Child Function</span>);
    const Actions = EntitiesActions<typeof entity, {customProp: string}>;

    render(
      <Actions customProp="foo" entity={entity}>
        {childFn}
      </Actions>,
    );

    expect(childFn).toHaveBeenCalledWith({customProp: 'foo', entity});
    expect(screen.getByText('Child Function')).toBeInTheDocument();
  });
});
