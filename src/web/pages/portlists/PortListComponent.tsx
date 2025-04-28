/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {EntityCommandParams} from 'gmp/commands/entity';
import PortList, {ProtocolType} from 'gmp/models/portlist';
import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import React, {useState} from 'react';
import useEntityClone from 'web/entity/hooks/useEntityClone';
import useEntityDelete from 'web/entity/hooks/useEntityDelete';
import useEntityDownload from 'web/entity/hooks/useEntityDownload';
import useEntitySave from 'web/entity/hooks/useEntitySave';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import PortListsDialog, {
  SavePortListData,
} from 'web/pages/portlists/PortListDialog';
import ImportPortListDialog from 'web/pages/portlists/PortListImportDialog';
import PortRangeDialog, {
  PortRangeDialogData,
} from 'web/pages/portlists/PortRangeDialog';

interface PortRange {
  id: string;
  isTmp?: boolean;
  protocol_type: ProtocolType;
  port_list_id?: string;
  start: number;
  end: number;
}

interface PortListComponentProps {
  children: (props: {
    clone: (entity: PortList) => void;
    download: (entity: PortList) => void;
    delete: (entity: PortList) => void;
    create: () => void;
    edit: (entity: PortList) => void;
    import: () => void;
  }) => React.ReactNode;
  onCloneError?: (error: unknown) => void;
  onCloned?: (newEntity: unknown) => void;
  onCreateError?: (error: unknown) => void;
  onCreated?: (response: unknown) => void;
  onDeleteError?: (error: unknown) => void;
  onDeleted?: () => void;
  onDownloadError?: (error: unknown) => void;
  onDownloaded?: (response: unknown) => void;
  onImportError?: (error: unknown) => void;
  onImported?: (response: unknown) => void;
  onInteraction?: () => void;
  onSaveError?: (error: unknown) => void;
  onSaved?: (response: unknown) => void;
}

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
}: PortListComponentProps) => {
  const [_] = useTranslation();
  const gmp = useGmp();
  const [importDialogVisible, setImportDialogVisible] = useState(false);
  const [portListDialogVisible, setPortListDialogVisible] = useState(false);
  const [portRangeDialogVisible, setPortRangeDialogVisible] = useState(false);
  const [portListDialogTitle, setPortListDialogTitle] = useState<
    string | undefined
  >();
  const [portList, setPortList] = useState<PortList | undefined>();
  const [portRanges, setPortRanges] = useState<PortRange[]>([]);
  const [createdPortRanges, setCreatedPortRanges] = useState<PortRange[]>([]);
  const [deletedPortRanges, setDeletedPortRanges] = useState<PortRange[]>([]);

  const handleInteraction = () => {
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  };

  const handleSave = useEntitySave('portlist', {
    onCreateError,
    onCreated,
    onSaveError,
    onSaved,
    onInteraction,
  });
  const handleClone = useEntityClone('portlist', {
    onCloned,
    onCloneError,
    onInteraction,
  });
  const handleDownload = useEntityDownload('portlist', {
    onDownloadError,
    onDownloaded,
    onInteraction,
  });
  const handleDelete = useEntityDelete('portlist', {
    onDeleteError,
    onDeleted,
    onInteraction,
  });

  const openPortListDialog = async (entity?: PortList) => {
    if (entity) {
      // edit
      const response = await gmp.portlist.get(entity as EntityCommandParams);
      const portList = response.data;
      setCreatedPortRanges([]);
      setDeletedPortRanges([]);
      setPortListDialogTitle(
        _('Edit Port List {{name}}', {name: shorten(portList.name)}),
      );
      setPortList(portList);
      setPortListDialogVisible(true);
      setPortRanges(portList.port_ranges as PortRange[]);
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

  const handleDeletePortRange = async (range: PortRange) => {
    await gmp.portlist.deletePortRange({
      id: range.id as string,
      portListId: range.port_list_id as string,
    });
  };

  const handleSavePortRange = async (data: {
    id: string;
    portRangeStart: number;
    portRangeEnd: number;
    portType: ProtocolType;
  }) => {
    const response = await gmp.portlist.createPortRange(data);
    return response.data.id;
  };

  const handleImportPortList = async (data: {xmlFile: string}) => {
    handleInteraction();
    try {
      const response = await gmp.portlist.import(data);
      if (isDefined(onImported)) {
        onImported(response);
      }
      closeImportDialog();
    } catch (error) {
      if (isDefined(onImportError)) {
        onImportError(error);
      }
    }
  };

  const handleSavePortList = async (data: SavePortListData) => {
    handleInteraction();

    if (isDefined(data.id)) {
      // save existing port list
      try {
        const createdPromises = createdPortRanges.map(
          async (range: PortRange) => {
            // save temporary port ranges in the backend
            const id = await handleSavePortRange({
              id: range.id as string,
              portRangeStart: range.start,
              portRangeEnd: range.end,
              portType: range.protocol_type,
            });
            range.isTmp = false;
            range.id = id;
            // the range has been saved in the backend
            // if something fails the state contains the still to be saved ranges
            setCreatedPortRanges(createdPortRanges =>
              createdPortRanges.filter(pRange => pRange !== range),
            );
          },
        );
        const deletedPromises = deletedPortRanges.map(
          async (range: PortRange) => {
            await handleDeletePortRange(range);
            // the range has been deleted from the backend
            // if something fails the state contains the still to be deleted ranges
            setDeletedPortRanges(deletedPortRanges =>
              deletedPortRanges.filter(pRange => pRange !== range),
            );
          },
        );

        const promises = [...createdPromises, ...deletedPromises];
        await Promise.all(promises);
      } catch (error) {
        if (isDefined(data?.id) && isDefined(onSaveError)) {
          return onSaveError(error);
        } else if (!isDefined(data?.id) && isDefined(onCreateError)) {
          return onCreateError(error);
        }
        throw error;
      }
    }
    await handleSave(data);
    closePortListDialog();
  };

  const handleTmpAddPortRange = async ({
    id,
    portRangeEnd,
    portRangeStart,
    portType,
  }: PortRangeDialogData) => {
    handleInteraction();

    // reject port ranges with missing values
    if (!portRangeStart || !portRangeEnd) {
      throw new Error(
        _('The port range needs numerical values for start and end!'),
      );
    }

    // reject port ranges with start value lower than end value
    if (portRangeStart > portRangeEnd) {
      throw new Error(
        _('The end of the port range can not be below its start!'),
      );
    }

    // check if new port range overlaps with existing and temporarily existing
    // ones, only relevant if protocol_type is the same
    for (const range of portRanges) {
      const start = range.start;
      const end = range.end;
      if (!start || !end) {
        continue;
      }

      if (
        range.protocol_type === portType &&
        (portRangeStart === start ||
          portRangeStart === end ||
          (portRangeStart > start && portRangeStart < end) ||
          portRangeEnd === start ||
          portRangeEnd === end ||
          (portRangeEnd > start && portRangeEnd < end) ||
          (portRangeStart < start && portRangeEnd > end))
      ) {
        throw new Error(_('New port range overlaps with an existing one!'));
      }
    }

    const newRange: PortRange = {
      end: portRangeEnd,
      id,
      protocol_type: portType,
      start: portRangeStart,
      isTmp: true,
    };

    setCreatedPortRanges(createdPortRanges => [...createdPortRanges, newRange]);
    setPortRanges(currentPortRanges => [...currentPortRanges, newRange]);
    closeNewPortRangeDialog();
  };

  const handleTmpDeletePortRange = (portRange: PortRange) => {
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
    <>
      {children({
        clone: handleClone as (entity: PortList) => void,
        download: handleDownload,
        delete: handleDelete as (entity: PortList) => void,
        create: openPortListDialog,
        edit: openPortListDialog,
        import: openImportDialog,
      })}
      {portListDialogVisible && (
        <PortListsDialog
          comment={comment}
          id={id}
          name={name}
          portList={portList}
          portRanges={portRanges}
          title={portListDialogTitle}
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
      {portRangeDialogVisible && id && (
        <PortRangeDialog
          id={id}
          onClose={handleCloseNewPortRangeDialog}
          onSave={handleTmpAddPortRange}
        />
      )}
    </>
  );
};

export default PortListComponent;
