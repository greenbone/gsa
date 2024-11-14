/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import PropTypes from 'web/utils/proptypes';

import DetailsIcon from 'web/components/icon/detailsicon';

import IconDivider from 'web/components/layout/icondivider';

import DetailsLink from 'web/components/link/detailslink';

import EntityBox from './box';

const NoteBox = ({note, detailsLink = true}) => {
  const toolbox = detailsLink ? (
    <IconDivider>
      <DetailsLink id={note.id} type="note" title={_('Note Details')} data-testid="details_link">
        <DetailsIcon data-testid="detailsicon"/>
      </DetailsLink>
    </IconDivider>
  ) : (
    undefined
  );
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
