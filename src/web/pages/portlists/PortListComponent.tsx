/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState} from 'react';
import {EntityCommandParams} from 'gmp/commands/entity';
import Rejection from 'gmp/http/rejection';
import Response from 'gmp/http/response';
import {XmlMeta} from 'gmp/http/transform/fastxml';
import ActionResult from 'gmp/models/actionresult';
import PortList, {ProtocolType} from 'gmp/models/portlist';
import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import useEntityClone from 'web/entity/hooks/useEntityClone';
import useEntityCreate from 'web/entity/hooks/useEntityCreate';
import useEntityDelete from 'web/entity/hooks/useEntityDelete';
import useEntityDownload, {
  OnDownloadedFunc,
} from 'web/entity/hooks/useEntityDownload';
import useEntitySave from 'web/entity/hooks/useEntitySave';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import PortListsDialog, {
  SavePortListData,
} from 'web/pages/portlists/PortListDialog';
import ImportPortListDialog, {
  PortListImportDialogState,
} from 'web/pages/portlists/PortListImportDialog';
import PortRangeDialog, {
  PortRangeDialogData,
} from 'web/pages/portlists/PortRangeDialog';

interface PortRange {
  id?: string;
  isTmp?: boolean;
  protocolType: ProtocolType;
  portListId: string;
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
  onCloneError?: (error: Rejection) => void;
  onCloned?: (response: Response<ActionResult, XmlMeta>) => void;
  onCreateError?: (error: Rejection) => void;
  onCreated?: (response: Response<ActionResult, XmlMeta>) => void;
  onDeleteError?: (error: Rejection) => void;
  onDeleted?: () => void;
  onDownloadError?: (error: Rejection) => void;
  onDownloaded?: OnDownloadedFunc;
  onImportError?: (error: Rejection) => void;
  onImported?: (response: unknown) => void;
  onSaveError?: (error: Rejection) => void;
  onSaved?: (response: Response<ActionResult, XmlMeta>) => void;
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

  const handleSave = useEntitySave('portlist', {
    onSaveError,
    onSaved,
  });
  const handleCreate = useEntityCreate('portlist', {
    onCreated,
    onCreateError,
  });
  const handleClone = useEntityClone<PortList, Response<ActionResult, XmlMeta>>(
    'portlist',
    {
      onCloned,
      onCloneError,
    },
  );
  const handleDownload = useEntityDownload<PortList>('portlist', {
    onDownloadError,
    onDownloaded,
  });
  const handleDelete = useEntityDelete<PortList>('portlist', {
    onDeleteError,
    onDeleted,
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
      setPortRanges(portList.portRanges as PortRange[]);
    } else {
      // create
      setCreatedPortRanges([]);
      setDeletedPortRanges([]);
      setPortList(undefined);
      setPortListDialogVisible(true);
      setPortListDialogTitle(_('New Port List'));
      setPortRanges([]);
    }
  };

  const closePortListDialog = () => {
    setPortListDialogVisible(false);
  };

  const handleClosePortListDialog = () => {
    closePortListDialog();
  };

  const openImportDialog = () => {
    setImportDialogVisible(true);
  };

  const closeImportDialog = () => {
    setImportDialogVisible(false);
  };

  const handleCloseImportDialog = () => {
    closeImportDialog();
  };

  const openNewPortRangeDialog = () => {
    setPortRangeDialogVisible(true);
  };

  const closeNewPortRangeDialog = () => {
    setPortRangeDialogVisible(false);
  };

  const handleCloseNewPortRangeDialog = () => {
    closeNewPortRangeDialog();
  };

  const handleDeletePortRange = async (range: PortRange) => {
    await gmp.portlist.deletePortRange({
      id: range.id as string,
      portListId: range.portListId,
    });
  };

  const handleSavePortRange = async (data: {
    portListId: string;
    portRangeStart: number;
    portRangeEnd: number;
    portType: ProtocolType;
  }) => {
    const response = await gmp.portlist.createPortRange(data);
    return response.data.id;
  };

  const handleImportPortList = async (data: PortListImportDialogState) => {
    try {
      const response = await gmp.portlist.import(data);
      if (isDefined(onImported)) {
        onImported(response);
      }
      closeImportDialog();
    } catch (error) {
      if (isDefined(onImportError)) {
        onImportError(error as Rejection);
      }
    }
  };

  const handleSavePortList = async (data: SavePortListData<PortRange>) => {
    if (isDefined(data.id)) {
      // save existing port list
      try {
        const createdPromises = createdPortRanges.map(
          async (range: PortRange) => {
            // save temporary port ranges in the backend
            const id = await handleSavePortRange({
              portListId: range.portListId,
              portRangeStart: range.start,
              portRangeEnd: range.end,
              portType: range.protocolType,
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
        if (isDefined(onSaveError)) {
          return onSaveError(error as Rejection);
        }
        throw error;
      }
      await handleSave(data);
    } else {
      await handleCreate(data);
    }
    closePortListDialog();
  };

  const handleTmpAddPortRange = async ({
    portListId,
    portRangeEnd,
    portRangeStart,
    portType,
  }: PortRangeDialogData) => {
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
        range.protocolType === portType &&
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
      portListId,
      protocolType: portType,
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
  };

  const {comment, id, name} = portList || {};
  return (
    <>
      {children({
        clone: handleClone,
        download: handleDownload,
        delete: handleDelete,
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
          portListId={id}
          onClose={handleCloseNewPortRangeDialog}
          onSave={handleTmpAddPortRange}
        />
      )}
    </>
  );
};

export default PortListComponent;
