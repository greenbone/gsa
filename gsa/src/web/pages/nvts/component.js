/* Copyright (C) 2018-2020 Greenbone Networks GmbH
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

import PropTypes from '../../utils/proptypes.js';

import OverrideComponent from '../overrides/component.js';
import NoteComponent from '../notes/component.js';

import EntityComponent from '../../entity/component.js';

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
