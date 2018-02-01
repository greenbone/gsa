/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import glamorous from 'glamorous';

import {Droppable} from 'react-beautiful-dnd';

import {is_defined} from 'gmp/utils';

import PropTypes from '../../utils/proptypes';

import Resizer from './resizer';

const MIN_HEIGHT = 50;

const GridRow = glamorous.div('grid-row', {
  display: 'flex',
  minHeight: `${MIN_HEIGHT}px`,
}, ({isDraggingOver, height}) => ({
  background: isDraggingOver ? 'lightblue' : 'none',
  height,
}));

class Row extends React.Component {
  constructor(...args) {
    super(...args);

    this.handleResize = this.handleResize.bind(this);
  }

  handleResize(diffY) {
    const {onResize} = this.props;

    if (is_defined(onResize)) {
      const box = this.row.getBoundingClientRect();
      const height = box.height + diffY;

      if (height > MIN_HEIGHT) {
        onResize(height);
      }
    }
  }

  render() {
    const {
      children,
      dropDisabled,
      id,
      height,
    } = this.props;
    return (
      <React.Fragment>
        <Droppable
          isDropDisabled={dropDisabled}
          droppableId={id}
          direction="horizontal"
        >
          {(provided, snapshot) => (
            <GridRow
              innerRef={ref => {
                this.row = ref;
                provided.innerRef(ref);
              }}
              isDraggingOver={snapshot.isDraggingOver}
              height={height}
            >
              {children}
              {provided.placeholder}
            </GridRow>
          )}
        </Droppable>
        <Resizer onResize={this.handleResize} />
      </React.Fragment>
    );
  }
}

Row.propTypes = {
  dropDisabled: PropTypes.bool,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  id: PropTypes.string.isRequired,
  onResize: PropTypes.func,
};

export default Row;

// vim: set ts=2 sw=2 tw=80:
