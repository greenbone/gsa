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

import _ from 'gmp/locale.js';

import PropTypes from '../utils/proptypes.js';

import Icon from '../components/icon/icon.js';

import IconDivider from '../components/layout/icondivider.js';

import DetailsLink from '../components/link/detailslink.js';

import EntityBox from './box.js';

const NoteBox = ({
  note,
  detailsLink = true,
}) => {
  const toolbox = detailsLink ? (
    <IconDivider>
      <DetailsLink
        legacy
        id={note.id}
        type="note"
        title={_('Note Details')}
      >
        <Icon img="details.svg"/>
      </DetailsLink>
    </IconDivider>
  ) : undefined;
  return (
    <EntityBox
      title={_('Note')}
      text={note.text}
      end={note.end_time}
      toolbox={toolbox}
      modified={note.modification_time}>
    </EntityBox>
  );
};

NoteBox.propTypes = {
  detailsLink: PropTypes.bool,
  note: PropTypes.model.isRequired,
};

export default NoteBox;

// vim: set ts=2 sw=2 tw=80:
