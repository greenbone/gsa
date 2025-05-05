/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {first} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import React, {useState} from 'react';
import EntityComponent from 'web/entity/EntityComponent';
import useCapabilities from 'web/hooks/useCapabilities';
import FilterDialog from 'web/pages/filters/Dialog';
import PropTypes from 'web/utils/PropTypes';

const FILTER_OPTIONS = [
  ['alert', _l('Alert')],
  ['audit_report', _l('Audit Report')],
  ['credential', _l('Credential')],
  ['filter', _l('Filter')],
  ['group', _l('Group')],
  ['host', _l('Host')],
  ['note', _l('Note')],
  ['os', _l('Operating System')],
  ['override', _l('Override')],
  ['permission', _l('Permission')],
  ['port_list', _l('Port List')],
  ['report', _l('Report')],
  ['report_config', _l('Report Config')],
  ['report_format', _l('Report Format')],
  ['result', _l('Result')],
  ['role', _l('Role')],
  ['scanner', _l('Scanner')],
  ['schedule', _l('Schedule')],
  ['info', _l('SecInfo')],
  ['config', _l('Scan Config')],
  ['tag', _l('Tag')],
  ['target', _l('Target')],
  ['task', _l('Task')],
  ['ticket', _l('Ticket')],
  ['tls_certificate', _l('TLS Certificate')],
  ['user', _l('User')],
  ['vulnerability', _l('Vulnerability')],
];

const filter_types = (caps, name) => {
  return caps.mayAccess(name);
};

const includes_type = (types, type) => {
  for (const option of types) {
    if (option[0] === type) {
      return true;
    }
  }
  return false;
};

const FilterComponent = props => {
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

  const capabilities = useCapabilities();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [types, setTypes] = useState([]);
  const [comment, setComment] = useState();
  const [id, setId] = useState();
  const [name, setName] = useState();
  const [term, setTerm] = useState('');
  const [title, setTitle] = useState();
  const [type, setType] = useState();

  const handleInteraction = () => {
    const {onInteraction} = props;
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  };

  const closeFilterDialog = () => {
    setDialogVisible(false);
  };

  const handleCloseFilterDialog = () => {
    closeFilterDialog();
    handleInteraction();
  };

  const openFilterDialog = filter => {
    let filterTypes = FILTER_OPTIONS.filter(option =>
      filter_types(capabilities, option[0]),
    );

    if (!isDefined(filterTypes)) {
      filterTypes = [];
    }

    handleInteraction();

    if (isDefined(filter)) {
      let {filter_type} = filter;
      if (!includes_type(filterTypes, filter_type)) {
        filter_type = first(filterTypes, [])[0];
      }

      const filterTitle = _('Edit Filter {{name}}', {
        name: shorten(filter.name),
      });

      setComment(filter.comment);
      setDialogVisible(true);
      setId(filter.id);
      setName(filter.name);
      setTerm(filter.toFilterString());
      setTitle(filterTitle);
      setType(filter_type);
      setTypes(filterTypes);
    } else {
      const filterType = first(filterTypes, [])[0];

      setComment(undefined);
      setDialogVisible(true);
      setId(undefined);
      setName(undefined);
      setTerm('');
      setType(filterType);
      setTypes(filterTypes);
    }
  };

  return (
    <EntityComponent
      name="filter"
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
        <>
          {children({
            ...other,
            create: openFilterDialog,
            edit: openFilterDialog,
          })}
          {dialogVisible && (
            <FilterDialog
              comment={comment}
              id={id}
              name={name}
              term={term}
              title={title}
              type={type}
              types={types}
              onClose={handleCloseFilterDialog}
              onSave={d => {
                handleInteraction();
                return save(d).then(() => closeFilterDialog());
              }}
            />
          )}
        </>
      )}
    </EntityComponent>
  );
};

FilterComponent.propTypes = {
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

export default FilterComponent;
