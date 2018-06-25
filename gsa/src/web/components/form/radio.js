/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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

import {is_defined} from 'gmp/utils';

import compose from '../../utils/compose.js';
import PropTypes from '../../utils/proptypes.js';

import Divider from '../layout/divider.js';
import withLayout from '../layout/withLayout.js';

import withChangeHandler from './withChangeHandler.js';

export const StyledElement = glamorous.label({
  display: 'inline-flex',
  flexDirection: 'row',
  alignItems: 'center',
  fontWeight: 'normal',
  cursor: 'pointer',
});

export const StyledInput = glamorous.input({
  /* use font and line settings from parents not from browser default */
  fontamily: 'inherit',
  fontSize: 'inherit',

  padding: 0,
  margin: 0,
  marginLeft: '10px',
  lineHeight: 'normal',
  width: 'auto',
  height: 'auto',
  '& disabled': {
    cursor: 'not-allowed',
    opacity: '0.7',
  },
});

export const StyledTitle = glamorous.span(
  ({disabled}) => ({
    cursor: disabled ? 'not-allowed' : '',
    opacity: disabled ? '0.5' : '1',
  }),
);

const RadioComponent = ({title, children, disabled, ...other}) => {
  return (
    <StyledElement>
      <Divider>
        <StyledInput
          {...other}
          disabled={disabled}
          type="radio"
        />
        {is_defined(title) &&
          <StyledTitle disabled={disabled}>
            {title}
          </StyledTitle>
        }
        {children}
      </Divider>
    </StyledElement>
  );
};

RadioComponent.propTypes = {
  disabled: PropTypes.bool,
  name: PropTypes.string,
  title: PropTypes.string,
  onChange: PropTypes.func,
};

export default compose(
  withLayout({
    align: ['start', 'center'],
    flex: 'row',
  }),
  withChangeHandler(),
)(RadioComponent);

// vim: set ts=2 sw=2 tw=80:
