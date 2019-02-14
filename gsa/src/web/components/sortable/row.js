/* Copyright (C) 2018-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import styled from 'styled-components';

import {Droppable} from 'react-beautiful-dnd';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import Theme from 'web/utils/theme';

import Resizer from './resizer';

const MIN_HEIGHT = 175;

const GridRow = styled.div`
  display: flex;
  height: ${props => props.height}px;
  min-height: ${MIN_HEIGHT}px;
  background: ${props => (props.isDraggingOver ? Theme.lightBlue : 'none')};
`;

class Row extends React.Component {
  constructor(...args) {
    super(...args);

    this.handleResize = this.handleResize.bind(this);
  }

  handleResize(diffY) {
    const {onResize} = this.props;

    if (isDefined(onResize)) {
      const box = this.row.getBoundingClientRect();
      const height = box.height + diffY;

      if (height > MIN_HEIGHT) {
        onResize(height);
      }
    }
  }

  render() {
    const {children, dropDisabled, id, height} = this.props;
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
