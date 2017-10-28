/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import Layout from '../layout/layout.js';

const Panel = glamorous(Layout)({
  backgroundColor: '#ffffff',
  border: '1px solid #bce8f1',
  borderRadius: '4px',
  boxShadow: '0 1px 1px rgba(0, 0, 0, 0.05)',
});

const Heading = glamorous.div({
  display: 'flex',
  padding: '10px 15px',
  borderBottom: '1px solid #bce8f1',
  borderTopRightRadius: '3px',
  borderTopLeftRadius: '3px',
  minHeight: '35px',
  color: '#31708f',
  backgroundColor: '#d9edf7',
  borderColor: '#bce8f1',
});

const Footer = glamorous.div({
  display: 'flex',
  padding: '10px 15px',
  borderBottom: '1px solid #bce8f1',
  borderBottomRightRadius: '3px',
  borderBottomLeftRadius: '3px',
  minHeight: '35px',
  color: '#31708f',
  backgroundColor: '#d9edf7',
});

const Body = glamorous.div({
  display: 'flex',
  padding: '15px',
  flexGrow: '1',
});

const InfoPanel = ({
  heading,
  footer,
  children,
  ...props
}) => {
  return (
    <Panel
      {...props}
      align={['start', 'stretch']}
      flex="column"
    >
      {heading &&
        <Heading>{heading}</Heading>
      }
      {children &&
        <Body>{children}</Body>
      }
      {footer &&
        <Footer>{footer}</Footer>
      }
    </Panel>
  );
};

InfoPanel.propTypes = {
  footer: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.string,
  ]),
  heading: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.string,
  ]),
};

export default InfoPanel;

// vim: set ts=2 sw=2 tw=80:
