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

import PropTypes from '../../utils/proptypes';

import ToolTip from './tooltip';

const StyledLegend = glamorous.div({
  padding: '5px 10px',
  border: '1px solid rgba(0, 0, 0, 0.3)',
  borderRadius: '8px',
  margin: '10px 5px',
  display: 'flex',
  flexDirection: 'column',
});

const Item = glamorous.div('legend-item', {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  margin: '5px 0',
});

const Label = glamorous.div('legend-label', {
  display: 'flex',
  justifyContent: 'start',
  alignItems: 'center',
  flexGrow: 1,
});

const Shape = glamorous.div('legend-shape', {
  display: 'flex',
  alignItems: 'center',
  width: '15px',
  height: '15px',
  marginRight: '5px',
}, ({color}) => ({
  backgroundColor: color,
}));

const Legend = ({
  data,
}) => (
  <StyledLegend>
    {data.map((d, i) => (
      <ToolTip
        key={i}
        content={d.toolTip}
      >
        {({targetRef, hide, show}) => (
          <Item
            innerRef={targetRef}
            onMouseOver={show}
            onMouseOut={hide}
          >
            <Shape color={d.color}/>
            <Label>{d.label}</Label>
          </Item>
        )}
      </ToolTip>
    ))}
  </StyledLegend>
);

Legend.propTypes = {
  /*
    Required array structure for data:

    [{
      color: ...,
      label: ...,
    }]
  */
  data: PropTypes.arrayOf(PropTypes.shape({
    color: PropTypes.toString.isRequired,
    label: PropTypes.any.isRequired,
  })),
};

export default Legend;

// vim: set ts=2 sw=2 tw=80:
