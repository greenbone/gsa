/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import PropTypes from 'web/utils/proptypes';

import OverrideComponent from '../overrides/component';
import NoteComponent from '../notes/component';

import EntityComponent from 'web/entity/component';

const NvtComponent = ({
  children,
  onChanged,
  onDownloaded,
  onDownloadError,
  onInteraction,
}) => (
  <NoteComponent
    onCreated={onChanged}
    onInteraction={onInteraction}
    onSaved={onChanged}
  >
    {({create: notecreate}) => (
      <OverrideComponent
        onCreated={onChanged}
        onInteraction={onInteraction}
        onSaved={onChanged}
      >
        {({create: overridecreate}) => (
          <EntityComponent
            name="nvt"
            onDownloaded={onDownloaded}
            onDownloadError={onDownloadError}
            onInteraction={onInteraction}
          >
            {({download}) =>
              children({
                overridecreate,
                notecreate,
                download,
              })
            }
          </EntityComponent>
        )}
      </OverrideComponent>
    )}
  </NoteComponent>
);

NvtComponent.propTypes = {
  children: PropTypes.func.isRequired,
  onChanged: PropTypes.func,
  onDownloadError: PropTypes.func,
  onDownloaded: PropTypes.func,
  onInteraction: PropTypes.func.isRequired,
};

export default NvtComponent;

// vim: set ts=2 sw=2 tw=80:
