/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import PropTypes from '../../utils/proptypes.js';

const ProgressBarBox = glamorous.div({
  height: '12px',
  boxSizing: 'content-box', /* height includes border */
  display: 'inline-block',
  width: '100px',
  background: '#454545',
  verticalAlign: 'middle',
  textAlign: 'center',
  border: '1px solid #999999',

  '@media print': {
    background: 'none',
    border: 0,
  },
});

const Content = glamorous.div({
  zIndex: 3,
  fontWeight: 'bold',
  color: '#FFFFFF',
  fontSize: '9px',
  margin: 0,
  position: 'relative',
  top: '-12px',

  '@media print': {
    color: 'black',
  },
});

const Progress = glamorous.div(
  {
    height: '12px',

    '@media print': {
      background: 'none',
    },
  },
  ({progress, background}) => {
    if (background === 'warn') {
      background = '#F0A519';
    }
    else if (background === 'error') {
      background = '#C83814';
    }
    else if (background === 'low') {
      background = '#4F91C7';
    }
    else if (background === 'new') {
      background = '#99BE48';
    }
    else if (background === 'run') {
      background = '#70C000';
    }
    else if (background === 'log') {
      background = 'gray';
    }

    if (progress > 100) {
      progress = 100;
    }
    return {
      width: progress + '%',
      background,
    };
  }
);

const ProgressBar = ({
  background,
  children,
  progress,
  title,
}) => {
  return (
    <ProgressBarBox title={title}>
      <Progress progress={progress} background={background}/>
      <Content>
        {children}
      </Content>
    </ProgressBarBox>
  );
};

ProgressBar.propTypes = {
  background: PropTypes.string,
  progress: PropTypes.numberOrNumberString,
  title: PropTypes.string,
};

export default ProgressBar;

// vim: set ts=2 sw=2 tw=80:
