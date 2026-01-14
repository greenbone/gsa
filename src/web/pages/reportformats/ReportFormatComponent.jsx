/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState} from 'react';
import {isDefined} from 'gmp/utils/identity';
import EntityComponent from 'web/entity/EntityComponent';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import ReportFormatDialog from 'web/pages/reportformats/Dialog';
import PropTypes from 'web/utils/PropTypes';

const ReportFormatComponent = ({
  children,
  onDeleteError,
  onDeleted,
  onImportError,
  onImported,

  onSaveError,
  onSaved,
}) => {
  const gmp = useGmp();
  const [_] = useTranslation();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [preferences, setPreferences] = useState({});
  const [reportFormat, setReportFormat] = useState(undefined);
  const [title, setTitle] = useState('');
  const [idLists, setIdLists] = useState({});

  const closeReportFormatDialog = () => {
    setDialogVisible(false);
  };

  const handleCloseReportFormatDialog = () => {
    closeReportFormatDialog();
  };

  const openReportFormatDialog = async reportFormatParam => {
    if (isDefined(reportFormatParam)) {
      try {
        // (re-)load report format to get params
        const response = await gmp.reportformat.get(reportFormatParam);
        const format = response.data;
        const newPreferences = {};
        let loadFormats = false;
        const idLists = {};

        format.params.forEach(param => {
          if (param.type === 'report_format_list') {
            loadFormats = true;
            idLists[param.name] = param.value;
          } else {
            newPreferences[param.name] = param.value;
          }
        });

        // only load formats if they are required for the report format list
        // type param
        if (loadFormats) {
          await gmp.reportformats.getAll();
        }

        setDialogVisible(true);
        setPreferences(newPreferences);
        setIdLists(idLists);
        setReportFormat(format);
        setTitle(_('Edit Report Format {{name}}', {name: format.name}));
      } catch (error) {
        // Handle error if needed
        console.error('Error loading report format:', error);
      }
    } else {
      setDialogVisible(true);
      setReportFormat(undefined);
      setTitle(_('Import Report Format'));
    }
  };

  const handleSave = async data => {
    if (isDefined(data.id)) {
      const response = await gmp.reportformat.save(data);
      closeReportFormatDialog();
      if (onSaved) {
        onSaved(response);
      }
    } else {
      const response = await gmp.reportformat.import(data);
      closeReportFormatDialog();
      if (onImported) {
        onImported(response);
      }
    }
  };

  return (
    <EntityComponent
      name="reportformat"
      onDeleteError={onDeleteError}
      onDeleted={onDeleted}
    >
      {other => (
        <>
          {children({
            ...other,
            import: openReportFormatDialog,
            edit: openReportFormatDialog,
          })}
          {dialogVisible && (
            <ReportFormatDialog
              id_lists={idLists}
              preferences={preferences}
              reportformat={reportFormat}
              title={title}
              onClose={handleCloseReportFormatDialog}
              onError={isDefined(reportFormat) ? onSaveError : onImportError}
              onSave={handleSave}
            />
          )}
        </>
      )}
    </EntityComponent>
  );
};

ReportFormatComponent.propTypes = {
  children: PropTypes.func.isRequired,
  onDeleteError: PropTypes.func,
  onDeleted: PropTypes.func,
  onImportError: PropTypes.func,
  onImported: PropTypes.func.isRequired,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

export default ReportFormatComponent;
