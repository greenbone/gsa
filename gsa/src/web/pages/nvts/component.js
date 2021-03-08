/* Copyright (C) 2018-2021 Greenbone Networks GmbH
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
import {ALL_FILTER} from 'gmp/models/filter';
import {useSelector, useDispatch} from 'react-redux';
import logger from 'gmp/log';

import EntityComponent from 'web/entity/component';
import {useLazyGetNotes} from 'web/graphql/notes';
// import {useLazyGetOverride} from 'web/graphql/override';
import OverrideComponent from 'web/pages/overrides/component';
import NoteComponent from 'web/pages/notes/component';
import useGmp from 'web/utils/useGmp';
import PropTypes from 'web/utils/proptypes';

// Logger
const log = logger.getLogger('web.pages.nvts.component');

const TAGS_FILTER = ALL_FILTER.copy().set('resource_type', 'nvt');

const NvtComponent = ({
  children,
  onChanged,
  onDownloaded,
  onDownloadError,
  onInteraction,
}) => {
  // GMP and Redux
  const gmp = useGmp();
  const dispatch = useDispatch();

  // GraphQL Loaders and Data
  const [
    loadNotes,
    {notes, loading: isLoadingNotes, refetch: refetchNotes, error: noteError},
  ] = useLazyGetNotes({
    filterString: ALL_FILTER.toFilterString(),
  });

  // const [
  //   loadOverrides,
  //   {
  //     overrides,
  //     loading: isLoadingOverrides,
  //     error: overrideError,
  //     refetch: refetchOverrides,
  //   },
  // ] = useLazyGetOverrides({
  //   filterString: ALL_FILTER.toFilterString(),
  // });

  const handleNoteCreated = () => {
    refetchNotes();
  };

  // const handleOverrideCreated = overrideId => {
  //   refetchOverrides();
  //   dispatchState(updateState({overrideId}));
  // };

  return (
    <NoteComponent onCreated={handleNoteCreated} onInteraction={onInteraction}>
      {({create: notecreate}) => (
        <OverrideComponent
          // onCreated={handleOverrideCreated}
          onCreated={onInteraction}
          onInteraction={onInteraction}
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
};

NvtComponent.propTypes = {
  children: PropTypes.func.isRequired,
  onChanged: PropTypes.func,
  onDownloadError: PropTypes.func,
  onDownloaded: PropTypes.func,
  onInteraction: PropTypes.func.isRequired,
};

export default NvtComponent;

// vim: set ts=2 sw=2 tw=80:
