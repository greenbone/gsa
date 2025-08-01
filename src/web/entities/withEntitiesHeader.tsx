/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {_, _l} from 'gmp/locale/lang';
import TableHead from 'web/components/table/TableHead';
import {updateDisplayName} from 'web/utils/displayName';
import SelectionType, {SelectionTypeType} from 'web/utils/SelectionType';

export type ActionsColumn = React.ReactElement | null;

/**
 * Props for the component passed to withEntitiesHeader gets provided.
 */
export interface WithEntitiesHeaderComponentProps {
  selectionType?: SelectionTypeType;
  actionsColumn?: ActionsColumn;
}

const defaultActions = (
  <TableHead align="center" title={_l('Actions')} width="8%" />
);

/**
 * Props for the component passed to withEntitiesHeader gets provided.
 */

/**
 * A higher order component to create table headers which support entity
 * selection.
 *
 * If a React element instance is passed via actionsColumn, the element will be
 * forwarded as actionsColumn to the Component.
 *
 * If actionsColumn is undefined, a default table head column will be passed as
 * actionsColumn to the Component.
 *
 * If actionsColumn is true, a default table head column will be passed as actionsColumn
 * to the Component if the current selectionType (passed via props) is SELECTION_USER.
 *
 * If actionsColumn is false, no actions (a null value in React) will be passed to
 * the Component.
 *
 * @param actionsColumn - React element, undefined, or boolean value.
 * @param options - Default properties for the Component.
 * @param Component - React component rendered as header.
 *
 * @return A new EntitiesHeader component.
 */
function withEntitiesHeader<TProps extends WithEntitiesHeaderComponentProps>(
  actionsColumn: React.ReactElement | null | true = defaultActions,
  options: Partial<TProps> = {},
) {
  return (Component: React.ComponentType<TProps>) => {
    if (!actionsColumn) {
      actionsColumn = null;
    }

    const HeaderWrapper = ({selectionType, ...props}: TProps) => {
      let column: ActionsColumn;
      if (actionsColumn && selectionType === SelectionType.SELECTION_USER) {
        column = <TableHead width="6em">{_('Actions')}</TableHead>;
      } else if (actionsColumn === true) {
        column = null;
      } else {
        column = actionsColumn;
      }
      return (
        <Component
          {...options}
          {...(props as TProps)}
          actionsColumn={column}
          selectionType={selectionType}
        />
      );
    };

    return updateDisplayName(HeaderWrapper, Component, 'withEntitiesHeader');
  };
}

export default withEntitiesHeader;
