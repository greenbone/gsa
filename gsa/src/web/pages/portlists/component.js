/* Copyright (C) 2017-2020 Greenbone Networks GmbH
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
import React, {useState, useReducer} from 'react';

import _ from 'gmp/locale';

import {parseInt} from 'gmp/parser';

import {parsePortRangeType} from 'gmp/models/portlist';

import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';

import PropTypes from 'web/utils/proptypes';
import useGmp from 'web/utils/useGmp';
import reducer from 'web/utils/stateReducer';
import readFileToText from 'web/utils/readFileToText.js';

import EntityComponent from 'web/entity/component';

import ImportPortListDialog from './importdialog';
import PortListsDialog from './dialog';
import PortRangeDialog from './portrangedialog';
import {
  useCreatePortList,
  useModifyPortList,
  useCreatePortRange,
  useDeletePortRange,
  useLazyGetPortList,
} from 'web/graphql/portlists';

const PortListComponent = ({
  children,
  onCloned,
  onCloneError,
  onCreated,
  onCreateError,
  onDeleted,
  onDeleteError,
  onDownloaded,
  onDownloadError,
  onImported,
  onImportError,
  onInteraction,
  onSaved,
  onSaveError,
}) => {
  const gmp = useGmp();

  const [state, dispatch] = useReducer(reducer, {
    importDialogVisible: false,
    portListDialogVisible: false,
    portRangeDialogVisible: false,
  });

  const [createPortList] = useCreatePortList();
  const [modifyPortList] = useModifyPortList();
  const [createPortRange] = useCreatePortRange();
  const [deletePortRange] = useDeletePortRange();
  const [getPortList, {portList: fetchedPortList}] = useLazyGetPortList();

  const [createdPortRanges, setCreatedPortRanges] = useState([]);
  const [deletedPortRanges, setDeletedPortRanges] = useState([]);

  const openPortListDialog = entity => {
    if (entity) {
      gmp.portlist.get(entity).then(response => {
        const portList = response.data;
        setCreatedPortRanges([]);
        setDeletedPortRanges([]);

        dispatch({
          type: 'setState',
          newState: {
            comment: portList.comment,
            id: portList.id,
            portList,
            name: portList.name,
            portListDialogVisible: true,
            portRanges: portList.port_ranges,
            title: _('Edit Port List {{name}}', {
              name: shorten(portList.name),
            }),
          },
        });
      });
    } else {
      setCreatedPortRanges([]);
      setDeletedPortRanges([]);
      dispatch({
        type: 'setState',
        newState: {
          comment: undefined,
          id: undefined,
          name: undefined,
          portList: undefined,
          portListDialogVisible: true,
          title: _('New Port List'),
        },
      });
    }

    handleInteraction();
  };

  const closePortListDialog = () => {
    dispatch({
      type: 'setState',
      newState: {portListDialogVisible: false},
    });
  };

  const handleClosePortListDialog = () => {
    closePortListDialog();
    handleInteraction();
  };

  const openImportDialog = () => {
    dispatch({
      type: 'setState',
      newState: {importDialogVisible: true},
    });
    handleInteraction();
  };

  const closeImportDialog = () => {
    dispatch({
      type: 'setState',
      newState: {importDialogVisible: false},
    });
  };

  const handleCloseImportDialog = () => {
    closeImportDialog();
    handleInteraction();
  };

  const openNewPortRangeDialog = portList => {
    dispatch({
      type: 'setState',
      newState: {
        portRangeDialogVisible: true,
        id: portList.id,
      },
    });
    handleInteraction();
  };

  const closeNewPortRangeDialog = () => {
    dispatch({
      type: 'setState',
      newState: {portRangeDialogVisible: false},
    });
  };

  const handleCloseNewPortRangeDialog = () => {
    closeNewPortRangeDialog();
    handleInteraction();
  };

  const handleDeletePortRange = ({id: portRangeId}) => {
    return deletePortRange(portRangeId)
      .then(() => getPortList(id))
      .then(() => {
        dispatch({
          type: 'setState',
          newState: {portList: fetchedPortList},
        });
      });
  };

  const handleSavePortRange = ({id, start, end, protocol_type}) => {
    const portRangeType = parsePortRangeType(protocol_type);
    return createPortRange({
      portListId: id,
      start,
      end,
      portRangeType,
    }).then(response => response.data.createPortRange.id);
  };

  const handleImportPortList = data => {
    handleInteraction();

    return gmp.portlist
      .import(data)
      .then(onImported, onImportError)
      .then(() => closeImportDialog());
  };

  const handleSavePortList = data => {
    const createdPortRangesCopy = [...createdPortRanges];

    handleInteraction();

    let promises = createdPortRangesCopy.map(range => {
      const saveData = {
        ...range,
        port_range_start: range.start,
        port_range_end: range.end,
        port_type: range.protocol_type,
      };
      return handleSavePortRange(saveData).then(id => {
        range.isTmp = false;
        range.id = id;
        setCreatedPortRanges(
          // .filter returns a new array => can be set.
          createdPortRanges.filter(prange => prange !== range),
        );
      });
    });
    const deletedPortRangesCopy = [...deletedPortRanges];
    promises = [
      ...promises,
      ...deletedPortRangesCopy.map(range =>
        handleDeletePortRange(range).then(
          setDeletedPortRanges(
            deletedPortRanges.filter(prange => prange !== range),
          ),
        ),
      ),
    ];

    const {id, from_file, file, name, comment, port_range} = data;
    return Promise.all(promises)
      .then(() => {
        if (from_file) {
          return readFileToText(file);
        }
        return Promise.resolve();
      })
      .then(text => {
        if (isDefined(id)) {
          return modifyPortList({
            id,
            name,
            comment,
          }).then(onSaved, onSaveError);
        }
        return createPortList({
          name,
          comment,
          portRange: from_file ? text : port_range,
        }).then(onCreated, onCreateError);
      })
      .then(() => closePortListDialog());
  };

  const handleTmpAddPortRange = values => {
    const {portRanges} = state;
    const {port_range_end, port_range_start, port_type} = values;

    handleInteraction();

    // reject port ranges with missing values
    if (!port_range_start || !port_range_end) {
      return Promise.reject(
        new Error(
          _('The port range needs numerical values for start and end!'),
        ),
      );
    }

    // reject port ranges with start value lower than end value
    if (port_range_start > port_range_end) {
      return Promise.reject(
        new Error(_('The end of the port range can not be below its start!')),
      );
    }

    // check if new port range overlaps with existing and temporarily existing
    // ones, only relevant if protocol_type is the same
    for (const range of portRanges) {
      const start = parseInt(range.start);
      const end = parseInt(range.end);
      if (
        range.protocol_type === port_type &&
        (port_range_start === start ||
          port_range_start === end ||
          (port_range_start > start && port_range_start < end) ||
          port_range_end === start ||
          port_range_end === end ||
          (port_range_end > start && port_range_end < end) ||
          (port_range_start < start && port_range_end > end))
      ) {
        return Promise.reject(
          new Error(_('New port range overlaps with an existing one!')),
        );
      }
    }

    const newRange = {
      end: values.port_range_end,
      entityType: 'portrange',
      id: values.id,
      protocol_type: values.port_type,
      start: values.port_range_start,
      isTmp: true,
    };
    // was this.created_port_ranges.push() therefore cannot be set directly
    setCreatedPortRanges(oldRanges => [...oldRanges, newRange]);
    dispatch({
      type: 'setState',
      newState: {
        portRanges: [...portRanges, newRange],
      },
    });
    closeNewPortRangeDialog();
  };

  const handleTmpDeletePortRange = portRange => {
    const {portRanges} = state;
    let newPortRanges = portRanges;

    if (portRange.isTmp) {
      setCreatedPortRanges(
        createdPortRanges.filter(range => range !== portRange),
      );
    } else {
      setDeletedPortRanges(oldRanges => [...oldRanges, portRange]);
    }

    newPortRanges = portRanges.filter(range => range !== portRange);

    dispatch({type: 'setState', newState: {portRanges: newPortRanges}});

    handleInteraction();
  };

  const handleInteraction = () => {
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  };

  const {
    comment,
    id,
    importDialogVisible,
    name,
    portList,
    portListDialogVisible,
    portRangeDialogVisible,
    title,
    portRanges,
  } = state;

  return (
    <EntityComponent
      name="portlist"
      onCreated={onCreated}
      onCreateError={onCreateError}
      onCloned={onCloned}
      onCloneError={onCloneError}
      onDeleted={onDeleted}
      onDeleteError={onDeleteError}
      onDownloaded={onDownloaded}
      onDownloadError={onDownloadError}
      onInteraction={onInteraction}
      onSaved={onSaved}
      onSaveError={onSaveError}
    >
      {({...other}) => (
        <React.Fragment>
          {children({
            ...other,
            create: openPortListDialog,
            edit: openPortListDialog,
            import: openImportDialog,
          })}
          {portListDialogVisible && (
            <PortListsDialog
              comment={comment}
              id={id}
              name={name}
              port_list={portList}
              title={title}
              port_ranges={portRanges}
              onClose={handleClosePortListDialog}
              onNewPortRangeClick={openNewPortRangeDialog}
              onSave={handleSavePortList}
              onTmpDeletePortRange={handleTmpDeletePortRange}
            />
          )}
          {importDialogVisible && (
            <ImportPortListDialog
              onClose={handleCloseImportDialog}
              onSave={handleImportPortList}
            />
          )}
          {portRangeDialogVisible && (
            <PortRangeDialog
              id={id}
              onClose={handleCloseNewPortRangeDialog}
              onSave={handleTmpAddPortRange}
            />
          )}
        </React.Fragment>
      )}
    </EntityComponent>
  );
};

PortListComponent.propTypes = {
  children: PropTypes.func.isRequired,
  onCloneError: PropTypes.func,
  onCloned: PropTypes.func,
  onCreateError: PropTypes.func,
  onCreated: PropTypes.func,
  onDeleteError: PropTypes.func,
  onDeleted: PropTypes.func,
  onDownloadError: PropTypes.func,
  onDownloaded: PropTypes.func,
  onImportError: PropTypes.func,
  onImported: PropTypes.func,
  onInteraction: PropTypes.func.isRequired,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

export default PortListComponent;

// vim: set ts=2 sw=2 tw=80:
