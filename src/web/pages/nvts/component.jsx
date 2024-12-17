/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import EntityComponent from 'web/entity/component';
import PropTypes from 'web/utils/proptypes';

import NoteComponent from '../notes/component';
import OverrideComponent from '../overrides/component';

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
            onDownloadError={onDownloadError}
            onDownloaded={onDownloaded}
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
