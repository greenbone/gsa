/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {parseInt} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import React, {useState} from 'react';
import EntityComponent from 'web/entity/EntityComponent';
import useGmp from 'web/hooks/useGmp';
import PortListsDialog from 'web/pages/portlists/Dialog';
import ImportPortListDialog from 'web/pages/portlists/ImportDialog';
import PortRangeDialog from 'web/pages/portlists/PortRangeDialog';
import PropTypes from 'web/utils/PropTypes';

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
  onInteraction,
  onSaved,
  onSaveError,
  onImported,
  onImportError,
}) => {
  const gmp = useGmp();
  const [importDialogVisible, setImportDialogVisible] = useState(false);
  const [portListDialogVisible, setPortListDialogVisible] = useState(false);
  const [portRangeDialogVisible, setPortRangeDialogVisible] = useState(false);
  const [portListDialogTitle, setPortListDialogTitle] = useState();
  const [portList, setPortList] = useState();
  const [portRanges, setPortRanges] = useState([]);
  const [createdPortRanges, setCreatedPortRanges] = useState([]);
  const [deletedPortRanges, setDeletedPortRanges] = useState([]);

  const handleInteraction = () => {
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  };

  const openPortListDialog = async entity => {
    if (entity) {
      // edit
      const response = await gmp.portlist.get(entity);
      const portList = response.data;
      setCreatedPortRanges([]);
      setDeletedPortRanges([]);
      setPortListDialogTitle(
        _('Edit Port List {{name}}', {name: shorten(portList.name)}),
      );
      setPortList(portList);
      setPortListDialogVisible(true);
      setPortRanges(portList.port_ranges);
    } else {
      // create
      setCreatedPortRanges([]);
      setDeletedPortRanges([]);
      setPortList(undefined);
      setPortListDialogVisible(true);
      setPortListDialogTitle(_('New Port List'));
      setPortRanges([]);
    }

    handleInteraction();
  };

  const closePortListDialog = () => {
    setPortListDialogVisible(false);
  };

  const handleClosePortListDialog = () => {
    closePortListDialog();
    handleInteraction();
  };

  const openImportDialog = () => {
    setImportDialogVisible(true);
    handleInteraction();
  };

  const closeImportDialog = () => {
    setImportDialogVisible(false);
  };

  const handleCloseImportDialog = () => {
    closeImportDialog();
    handleInteraction();
  };

  const openNewPortRangeDialog = () => {
    setPortRangeDialogVisible(true);
    handleInteraction();
  };

  const closeNewPortRangeDialog = () => {
    setPortRangeDialogVisible(false);
  };

  const handleCloseNewPortRangeDialog = () => {
    closeNewPortRangeDialog();
    handleInteraction();
  };

  const handleDeletePortRange = async range => {
    await gmp.portlist.deletePortRange(range);
  };

  const handleSavePortRange = async data => {
    const response = await gmp.portlist.createPortRange(data);
    return response.data.id;
  };

  const handleImportPortList = async data => {
    handleInteraction();
    try {
      const response = await gmp.portlist.import(data);
      onImported(response);
      closeImportDialog();
    } catch (error) {
      onImportError(error);
    }
  };

  const handleSavePortList = async (save, data) => {
    handleInteraction();

    const createdPromises = createdPortRanges.map(async range => {
      // save temporary port ranges in the backend
      const id = await handleSavePortRange({
        ...range,
        port_range_start: parseInt(range.start),
        port_range_end: parseInt(range.end),
        port_type: range.protocol_type,
      });
      range.isTmp = false;
      range.id = id;
      // the range has been saved in the backend
      // if something fails the state contains the still to be saved ranges
      setCreatedPortRanges(createdPortRanges =>
        createdPortRanges.filter(pRange => pRange !== range),
      );
    });
    const deletedPromises = deletedPortRanges.map(async range => {
      await handleDeletePortRange(range);
      // the range has been deleted from the backend
      // if something fails the state contains the still to be deleted ranges
      setDeletedPortRanges(deletedPortRanges =>
        deletedPortRanges.filter(pRange => pRange !== range),
      );
    });

    const promises = [...createdPromises, ...deletedPromises];
    try {
      await Promise.all(promises);
      await save(data);
    } catch (error) {
      if (isDefined(data?.id) && isDefined(onSaveError)) {
        return onSaveError(error);
      } else if (!isDefined(data?.id) && isDefined(onCreateError)) {
        return onCreateError(error);
      }
      throw error;
    }
    closePortListDialog();
  };

  const handleTmpAddPortRange = async values => {
    let {port_range_end, port_range_start, port_type} = values;

    port_range_end = parseInt(port_range_end);
    port_range_start = parseInt(port_range_start);

    handleInteraction();

    // reject port ranges with missing values
    if (!port_range_start || !port_range_end) {
      throw new Error(
        _('The port range needs numerical values for start and end!'),
      );
    }

    // reject port ranges with start value lower than end value
    if (port_range_start > port_range_end) {
      throw new Error(
        _('The end of the port range can not be below its start!'),
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
        throw new Error(_('New port range overlaps with an existing one!'));
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

    setCreatedPortRanges(createdPortRanges => [...createdPortRanges, newRange]);
    setPortRanges(currentPortRanges => [...currentPortRanges, newRange]);
    closeNewPortRangeDialog();
  };

  const handleTmpDeletePortRange = portRange => {
    if (portRange.isTmp) {
      // it hasn't been saved yet
      setCreatedPortRanges(createdPortRanges =>
        createdPortRanges.filter(range => range !== portRange),
      );
    } else {
      // we need to delete it from the backend
      setDeletedPortRanges(deletedPortRanges => [
        ...deletedPortRanges,
        portRange,
      ]);
    }

    setPortRanges(portRanges =>
      portRanges.filter(range => range !== portRange),
    );

    handleInteraction();
  };

  const {comment, id, name} = portList || {};
  return (
    <EntityComponent
      name="portlist"
      onCloneError={onCloneError}
      onCloned={onCloned}
      onCreateError={onCreateError}
      onCreated={onCreated}
      onDeleteError={onDeleteError}
      onDeleted={onDeleted}
      onDownloadError={onDownloadError}
      onDownloaded={onDownloaded}
      onInteraction={onInteraction}
      onSaveError={onSaveError}
      onSaved={onSaved}
    >
      {({save, ...other}) => (
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
              port_ranges={portRanges}
              title={portListDialogTitle}
              onClose={handleClosePortListDialog}
              onNewPortRangeClick={openNewPortRangeDialog}
              onSave={(...args) => handleSavePortList(save, ...args)}
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
  onInteraction: PropTypes.func,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

export default PortListComponent;
