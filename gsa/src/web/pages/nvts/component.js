/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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

import PropTypes from '../../utils/proptypes.js';

import OverrideComponent from '../overrides/component.js';
import NoteComponent from '../notes/component.js';

import EntityComponent from '../../entity/component.js';

const NvtComponent = ({
  children,
  onChanged,
  onDownloaded,
  onDownloadError,
}) => (
  <NoteComponent
    onCreated={onChanged}
    onSaved={onChanged}
  >
    {({
      create: notecreate,
    }) => (
      <OverrideComponent
        onCreated={onChanged}
        onSaved={onChanged}
      >
        {({
          create: overridecreate,
        }) => (
          <EntityComponent
            name="nvt"
            onDownloaded={onDownloaded}
            onDownloadError={onDownloadError}
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

// vim: set ts=2 sw=2 tw=80:
