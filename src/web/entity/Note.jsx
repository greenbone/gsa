/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import React from 'react';
import {DetailsIcon} from 'web/components/icon';
import IconDivider from 'web/components/layout/IconDivider';
import DetailsLink from 'web/components/link/DetailsLink';
import EntityBox from 'web/entity/Box';
import PropTypes from 'web/utils/PropTypes';
const NoteBox = ({note, detailsLink = true}) => {
  const toolbox = detailsLink ? (
    <IconDivider>
      <DetailsLink id={note.id} title={_('Note Details')} type="note">
        <DetailsIcon />
      </DetailsLink>
    </IconDivider>
  ) : undefined;
  return (
    <EntityBox
      end={note.endTime}
      modified={note.modificationTime}
      text={note.text}
      title={_('Note')}
      toolbox={toolbox}
    />
  );
};

NoteBox.propTypes = {
  detailsLink: PropTypes.bool,
  note: PropTypes.model.isRequired,
};

export default NoteBox;
