/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 Greenbone Networks GmbH
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

import {is_defined, is_array} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';
import compose from '../../utils/compose.js';
import withCapabilties from '../../utils/withCapabilities.js';

import withClickHandler from '../form/withClickHandler.js';

import Link from '../link/link.js';
import LegacyLink from '../link/legacylink.js';

const Entry = glamorous.li({
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  textIndent: '12px',
  textAlign: 'left',
  color: '#3A3A3A',
  height: '22px',
  lineHeight: '22px',
  fontSize: '10px',
  fontWeight: 'bold',
  width: '100%',
  backgroundColor: 'white',
  '& > a': {
    display: 'flex',
    flexGrow: 1,
    background: 'none',
    textDecoration: 'none',
    color: '#3A3A3A',
  },
  '&:last-child': {
    borderBottomRightRadius: '8px',
    borderBottomLeftRadius: '8px',
  },
  '&:hover': {
    background: '#99CE48',
  },
  '& > a:hover, & > a:focus, & > a:link': {
    textDecoration: 'none',
    color: '#3A3A3A',
  },
},
  ({onClick}) => is_defined(onClick) ? {cursor: 'pointer'} : {},
);

const MenuEntry = ({
    capabilities,
    caps,
    children,
    manualLink,
    section,
    title,
    to,
    onClick,
    ...other
  }) => {
  let entry;
  const css = section ? 'menu-entry menu-section' : 'menu-entry';

  if (is_defined(caps) && is_defined(capabilities)) {

    if (!is_array(caps)) {
      caps = [caps];
    }

    const may_op = caps.reduce((a, b) => {
      return capabilities.mayOp(b) && a;
    }, true);

    if (!may_op) {
      return null;
    }
  }

  if (manualLink) {
    entry = <a href={to} target="_blank">{title}</a>;
  }
  else if (is_defined(to)) {
    entry = <Link to={to}>{title}</Link>;
  }
  else if (is_defined(title)) {
    entry = title;
  }
  else {
    entry = children;
  }

  return (
    <Entry className={css} onClick={onClick}>{entry}</Entry>
  );
};

MenuEntry.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  caps: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
  ]),
  manualLink: PropTypes.bool,
  section: PropTypes.bool,
  title: PropTypes.string.isRequired,
  to: PropTypes.string,
  onClick: PropTypes.func,
};

export default compose(
  withCapabilties,
  withClickHandler(),
)(MenuEntry);

// vim: set ts=2 sw=2 tw=80:
