/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import EntityComponent from 'web/entity/EntityComponent';
import NoteComponent from 'web/pages/notes/NoteComponent';
import OverrideComponent from 'web/pages/overrides/OverrideComponent';
import PropTypes from 'web/utils/PropTypes';

const NvtComponent = ({children, onChanged, onDownloaded, onDownloadError}) => (
  <NoteComponent onCreated={onChanged} onSaved={onChanged}>
    {({create: notecreate}) => (
      <OverrideComponent onCreated={onChanged} onSaved={onChanged}>
        {({create: overridecreate}) => (
          <EntityComponent
            name="nvt"
            onDownloadError={onDownloadError}
            onDownloaded={onDownloaded}
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
};

export default NvtComponent;
