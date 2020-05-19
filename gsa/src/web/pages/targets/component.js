/* Copyright (C) 2016-2020 Greenbone Networks GmbH
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
/* eslint-disable no-shadow */

import React, {useState} from 'react';

import _ from 'gmp/locale';

import {first} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';

import PropTypes from '../../utils/proptypes.js';
import useGmp from 'web/utils/useGmp';
import {NULL_VALUE} from '../../utils/render.js';

import EntityComponent from '../../entity/component.js';

import CredentialsDialog from '../credentials/dialog.js';

import PortListDialog from '../portlists/dialog.js';

import TargetDialog from './dialog.js';

import {useCreateTarget, useModifyTarget} from './graphql';

const DEFAULT_PORT_LIST_ID = '33d0cd82-57c6-11e1-8ed1-406186ea4fc5'; // All IANA assigned TCP 2012-02-10

const id_or__ = value => {
  return isDefined(value) ? value.id : NULL_VALUE;
};

const TargetComponent = props => {
  const gmp = useGmp();

  const createTarget = useCreateTarget();
  const modifyTarget = useModifyTarget();

  const [credentialsDialogVisible, setCredentialsDialogVisible] = useState(
    false,
  );
  const [portListDialogVisible, setPortListDialogVisible] = useState(false);
  const [targetDialogVisible, setTargetDialogVisible] = useState(false);

  // eslint-disable-next-line no-unused-vars
  const [idField, setIdField] = useState();
  const [credentialTypes, setCredentialTypes] = useState();
  const [credentialsTitle, setCredentialsTitle] = useState();
  const [id, setId] = useState();

  const [alive_tests, setAliveTests] = useState();
  const [comment, setComment] = useState();
  const [esxi_credential_id, setEsxiCredentialId] = useState();
  const [exclude_hosts, setExcludeHosts] = useState();
  const [hosts, setHosts] = useState();
  const [in_use, setInUse] = useState();
  const [name, setName] = useState();
  const [port, setPort] = useState();
  const [reverse_lookup_only, setReverseLookupOnly] = useState();
  const [reverse_lookup_unify, setReverseLookupUnify] = useState();
  const [target_source, setTargetSource] = useState();
  const [target_exclude_source, setTargetExcludeSource] = useState();
  const [targetTitle, setTargetTitle] = useState();
  const [smb_credential_id, setSmbCredentialId] = useState();
  const [ssh_credential_id, setSshCredentialId] = useState();
  const [port_list_id, setPortListId] = useState();

  // eslint-disable-next-line no-unused-vars
  const [initial, setInitial] = useState({});

  const [credentials, setCredentials] = useState();
  const [portLists, setPortLists] = useState();
  const [snmp_credential_id, setSnmpCredentialId] = useState();
  const [portListsTitle, setPortListsTitle] = useState();

  const openCredentialsDialog = ({id_field, types, title}) => {
    setIdField(id_field);

    setCredentialsDialogVisible(true);
    setCredentialTypes(types);
    setCredentialsTitle(title);

    handleInteraction();
  };

  const closeCredentialsDialog = () => {
    setCredentialsDialogVisible(false);
  };

  const handleCloseCredentialsDialog = () => {
    closeCredentialsDialog();
    handleInteraction();
  };

  const openTargetDialog = (entity, initial = {}) => {
    if (isDefined(entity)) {
      setTargetDialogVisible(true);
      setId(entity.id);
      setAliveTests(entity.alive_tests);
      setComment(entity.comment);
      setEsxiCredentialId(id_or__(entity.esxi_credential));
      setExcludeHosts(
        isDefined(entity.exclude_hosts) ? entity.exclude_hosts.join(', ') : '',
      );
      setHosts(entity.hosts.join(', '));
      setInUse(entity.isInUse());
      setName(entity.name);
      setPort(
        isDefined(entity.ssh_credential) ? entity.ssh_credential.port : '22',
      );
      setReverseLookupOnly(entity.reverse_lookup_only);
      setReverseLookupUnify(entity.reverse_lookup_unify);
      setTargetSource('manual');
      setTargetExcludeSource('manual');
      setTargetTitle(_('Edit Target {{name}}', entity));

      // set credential and port list ids after credentials and port lists have been loaded
      loadAll().then(() => {
        setPortListId(id_or__(entity.port_list));
        setSmbCredentialId(id_or__(entity.smb_credential));
        setSshCredentialId(id_or__(entity.ssh_credential));
      });
    } else {
      loadAll().then(() => {
        setPortListId(DEFAULT_PORT_LIST_ID);
      });
      setTargetDialogVisible(true);
      setTargetTitle(_('New Target'));
      setInitial({...initial});
      setAliveTests();
      setComment();
      setEsxiCredentialId();
      setExcludeHosts();
      setHosts();
      setId();
      setInUse();
      setName();
      setPort();
      setReverseLookupOnly();
      setReverseLookupUnify();
      setSmbCredentialId();
      setSnmpCredentialId();
      setSshCredentialId();
      setTargetSource();
      setTargetExcludeSource();
      setTargetTitle();
    }

    handleInteraction();
  };

  const openCreateTargetDialog = (initial = {}) => {
    openTargetDialog(undefined, initial);
  };

  const closeTargetDialog = () => {
    setTargetDialogVisible(false);
  };

  const handleCloseTargetDialog = () => {
    closeTargetDialog();
    handleInteraction();
  };

  const loadAll = () => {
    return Promise.all([
      loadCredentials().then(credentials => setCredentials(credentials)),
      loadPortLists().then(port_lists => setPortLists(port_lists)),
    ]);
  };

  const loadCredentials = () => {
    return gmp.credentials.getAll().then(response => response.data);
  };

  const loadPortLists = () => {
    return gmp.portlists.getAll().then(response => response.data);
  };

  const openPortListDialog = () => {
    setPortListDialogVisible(true);
    setPortListsTitle(_('New Port List'));
    handleInteraction();
  };

  const closePortListDialog = () => {
    setPortListDialogVisible(false);
  };

  const handleClosePortListDialog = () => {
    closePortListDialog();
    handleInteraction();
  };

  const handleCreateCredential = data => {
    let credential_id;

    handleInteraction();

    return gmp.credential
      .create(data)
      .then(response => {
        const {data: credential} = response;

        credential_id = credential.id;
        closeCredentialsDialog();
        return loadCredentials();
      })
      .then(credentials => {
        setIdField(credential_id);
        setCredentials(credentials);
      });
  };

  const handleCreatePortList = data => {
    let port_list_id;

    handleInteraction();

    return gmp.portlist
      .create(data)
      .then(response => {
        const {data: portlist} = response;
        port_list_id = portlist.id;
        closePortListDialog();
        return loadPortLists();
      })
      .then(port_lists => {
        setPortLists(port_lists);
        setPortListId(port_list_id);
      });
  };

  const handlePortListChange = port_list_id => {
    setPortListId(port_list_id);
  };

  const handleEsxiCredentialChange = esxi_credential_id => {
    setEsxiCredentialId(esxi_credential_id);
  };

  const handleSshCredentialChange = ssh_credential_id => {
    setSshCredentialId(ssh_credential_id);
  };

  const handleSnmpCredentialChange = snmp_credential_id => {
    setSnmpCredentialId(snmp_credential_id);
  };

  const handleSmbCredentialChange = smb_credential_id => {
    setSmbCredentialId(smb_credential_id);
  };

  const handleInteraction = () => {
    const {onInteraction} = props;
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  };

  const setFileText = (file, exclude_file) => {
    let fileText;
    let excludeFileText;

    if (isDefined(file)) {
      fileText = file.text().then(text => {
        return text;
      });
    } else {
      fileText = Promise.resolve();
    }

    if (isDefined(exclude_file)) {
      excludeFileText = exclude_file.text().then(text => {
        return text;
      });
    } else {
      excludeFileText = Promise.resolve();
    }

    return Promise.all([fileText, excludeFileText]);
  };

  const handleSaveTarget = ({
    alive_tests,
    comment,
    esxi_credential_id,
    exclude_hosts,
    exclude_file,
    file,
    hosts,
    id,
    in_use,
    name,
    port,
    port_list_id,
    reverse_lookup_only,
    reverse_lookup_unify,
    smb_credential_id,
    snmp_credential_id,
    ssh_credential_id,
    target_exclude_source,
    target_source,
  }) => {
    handleInteraction();

    if (isDefined(id)) {
      const {onSaved, onSaveError} = props;

      return setFileText(file, exclude_file)
        .then(text => {
          const [fileText, excludeFileText] = text;

          const mutationData = {
            targetId: id,
            aliveTest: alive_tests.toLowerCase(),
            comment,
            esxiCredentialId: esxi_credential_id,
            hosts: target_source === 'file' ? fileText : hosts,
            excludeHosts:
              target_exclude_source === 'file'
                ? excludeFileText
                : exclude_hosts,
            inUse: in_use,
            name,
            sshCredentialPort: parseInt(port),
            portListId: port_list_id,
            reverseLookupOnly: reverse_lookup_only,
            reverseLookupUnify: reverse_lookup_unify,
            smbCredentialId: smb_credential_id,
            snmpCredentialId: snmp_credential_id,
            sshCredentialId: ssh_credential_id,
          };

          return modifyTarget(mutationData);
        })
        .then(onSaved, onSaveError)
        .then(() => closeTargetDialog());
    }

    const {onCreated, onCreateError} = props;

    return setFileText(file, exclude_file)
      .then(text => {
        const [fileText, excludeFileText] = text;

        const mutationData = {
          aliveTest: alive_tests.toLowerCase(),
          comment,
          esxiCredentialId: esxi_credential_id,
          name,
          hosts: target_source === 'file' ? fileText : hosts,
          excludeHosts:
            target_exclude_source === 'file' ? excludeFileText : exclude_hosts,
          sshCredentialPort: parseInt(port),
          portListId: port_list_id,
          reverseLookupOnly: reverse_lookup_only,
          reverseLookupUnify: reverse_lookup_unify,
          smbCredentialId: smb_credential_id,
          snmpCredentialId: snmp_credential_id,
          sshCredentialId: ssh_credential_id,
        };

        return createTarget(mutationData);
      })
      .then(result => onCreated(result), onCreateError)
      .then(() => closeTargetDialog());
  };

  const {
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
  } = props;

  return (
    <EntityComponent
      name="target"
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
            create: openCreateTargetDialog,
            edit: openTargetDialog,
          })}
          {targetDialogVisible && (
            <TargetDialog
              alive_tests={alive_tests}
              comment={comment}
              // credential={credential} // this is undefined?
              credentials={credentials}
              esxi_credential_id={esxi_credential_id}
              exclude_hosts={exclude_hosts}
              hosts={hosts}
              // hosts_count={hosts_count} // this is undefined?
              // hosts_filter={hosts_filter} // this is undefined?
              id={id}
              in_use={in_use}
              name={name}
              port={port}
              port_lists={portLists}
              port_list_id={port_list_id}
              reverse_lookup_only={reverse_lookup_only}
              reverse_lookup_unify={reverse_lookup_unify}
              smb_credential_id={smb_credential_id}
              snmp_credential_id={snmp_credential_id}
              ssh_credential_id={ssh_credential_id}
              target_source={target_source}
              target_exclude_source={target_exclude_source}
              title={targetTitle}
              onClose={handleCloseTargetDialog}
              onNewCredentialsClick={openCredentialsDialog}
              onNewPortListClick={openPortListDialog}
              onPortListChange={handlePortListChange}
              onSnmpCredentialChange={handleSnmpCredentialChange}
              onSshCredentialChange={handleSshCredentialChange}
              onEsxiCredentialChange={handleEsxiCredentialChange}
              onSmbCredentialChange={handleSmbCredentialChange}
              onSave={handleSaveTarget}
            />
          )}
          {credentialsDialogVisible && (
            <CredentialsDialog
              types={credentialTypes}
              base={first(credentialTypes)}
              title={`${credentialsTitle}`}
              onClose={handleCloseCredentialsDialog}
              onSave={handleCreateCredential}
            />
          )}
          {portListDialogVisible && (
            <PortListDialog
              title={portListsTitle}
              visible={portListDialogVisible}
              onClose={handleClosePortListDialog}
              onSave={handleCreatePortList}
            />
          )}
        </React.Fragment>
      )}
    </EntityComponent>
  );
};

TargetComponent.propTypes = {
  children: PropTypes.func.isRequired,
  onCloneError: PropTypes.func,
  onCloned: PropTypes.func,
  onCreateError: PropTypes.func,
  onCreated: PropTypes.func,
  onDeleteError: PropTypes.func,
  onDeleted: PropTypes.func,
  onDownloadError: PropTypes.func,
  onDownloaded: PropTypes.func,
  onInteraction: PropTypes.func.isRequired,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

export default TargetComponent;

// vim: set ts=2 sw=2 tw=80:
