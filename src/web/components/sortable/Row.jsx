/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {Droppable} from '@atlaskit/pragmatic-drag-and-drop-react-beautiful-dnd-migration';
import {isDefined} from 'gmp/utils/identity';
import {useCallback, useRef} from 'react';
import styled from 'styled-components';
import Resizer from 'web/components/sortable/Resizer';
import PropTypes from 'web/utils/PropTypes';
import Theme from 'web/utils/Theme';


const MIN_HEIGHT = 175;

const GridRow = styled.div`
  display: flex;
  height: ${props => props.$height}px;
  min-height: ${MIN_HEIGHT}px;
  background: ${props => (props.$isDraggingOver ? Theme.lightBlue : 'none')};
`;

const Row = ({children, dropDisabled, id, height, onResize}) => {
  const rowRef = useRef(null);

  const handleResize = useCallback(
    diffY => {
      if (isDefined(onResize)) {
        const box = rowRef.current.getBoundingClientRect();
        const newHeight = box.height + diffY;

        if (newHeight > MIN_HEIGHT) {
          onResize(newHeight);
        }
      }
    },
    [onResize],
  );

  return (
    <>
      <Droppable
        direction="horizontal"
        droppableId={id}
        isDropDisabled={dropDisabled}
      >
        {(provided, snapshot) => (
          <GridRow
            ref={ref => {
              rowRef.current = ref;
              provided.innerRef(ref);
            }}
            $height={height}
            $isDraggingOver={snapshot.isDraggingOver}
            data-testid="grid-row"
          >
            {children}
            {provided.placeholder}
          </GridRow>
        )}
      </Droppable>
      <Resizer onResize={handleResize} />
    </>
  );
};

Row.propTypes = {
  children: PropTypes.node.isRequired,
  dropDisabled: PropTypes.bool,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  id: PropTypes.string.isRequired,
  onResize: PropTypes.func,
};

export default Row;
