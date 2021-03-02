/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import _ from 'gmp/locale';

import DetailsIcon from 'web/components/icon/detailsicon';

import IconDivider from 'web/components/layout/icondivider';

import DetailsLink from 'web/components/link/detailslink';

import PropTypes from 'web/utils/proptypes';

import EntityBox from './box';

const NoteBox = ({note, detailsLink = true}) => {
  const toolbox = detailsLink ? (
    <IconDivider>
      <DetailsLink id={note.id} type="note" title={_('Note Details')}>
        <DetailsIcon />
      </DetailsLink>
    </IconDivider>
  ) : undefined;
  return (
    <EntityBox
      title={_('Note')}
      text={note.text}
      end={note.endTime}
      toolbox={toolbox}
      modified={note.modificationTime}
    />
  );
};

NoteBox.propTypes = {
  detailsLink: PropTypes.bool,
  note: PropTypes.model.isRequired,
};

export default NoteBox;

// vim: set ts=2 sw=2 tw=80:
