/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import _ from 'gmp/locale.js';
import {is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';

import {CVE_SCANNER_TYPE} from 'gmp/models/scanner.js';

import EntityPage from '../../entity/page.js';
import EntityContainer, {
  permissions_resource_loader,
} from '../../entity/container.js';
import {goto_details, goto_list} from '../../entity/component.js';

import CloneIcon from '../../entity/icon/cloneicon.js';
import CreateIcon from '../../entity/icon/createicon.js';
import EditIcon from '../../entity/icon/editicon.js';
import TrashIcon from '../../entity/icon/trashicon.js';

import Divider from '../../components/layout/divider.js';
import IconDivider from '../../components/layout/icondivider.js';

import ExportIcon from '../../components/icon/exporticon.js';
import HelpIcon from '../../components/icon/helpicon.js';
import Icon from '../../components/icon/icon.js';
import ListIcon from '../../components/icon/listicon.js';

import ScannerComponent from './component.js';
import ScannerDetails from './details.js';

const ToolBarIcons = ({
  entity,
  onScannerCertificateDownloadClick,
  onScannerCloneClick,
  onScannerCreateClick,
  onScannerDeleteClick,
  onScannerDownloadClick,
  onScannerEditClick,
  onScannerVerifyClick,
}) => {
  return (
    <Divider margin="10px">
      <IconDivider>
        <HelpIcon
          page="scanner_details"
          title={_('Help: Scanner Details')}
        />
        <ListIcon
          title={_('Scanner List')}
          page="scanners"
        />
      </IconDivider>
      <IconDivider>
        <CreateIcon
          entity={entity}
          onClick={onScannerCreateClick}
        />
        <CloneIcon
          entity={entity}
          mayClone={entity.scanner_type !== CVE_SCANNER_TYPE}
          onClick={onScannerCloneClick}
        />
        <EditIcon
          entity={entity}
          onClick={onScannerEditClick}
        />
        <TrashIcon
          entity={entity}
          onClick={onScannerDeleteClick}
        />
        <ExportIcon
          value={entity}
          title={_('Export Scanner as XML')}
          onClick={onScannerDownloadClick}
        />
        <Icon
          img="verify.svg"
          value={entity}
          title={_('Verify Scanner')}
          onClick={onScannerVerifyClick}
        />
      </IconDivider>
      <IconDivider>
        {is_defined(entity.ca_pub) &&
          <Icon
            img="key.svg"
            title={_('Download CA Certificate')}
            value={entity}
            onClick={onScannerCertificateDownloadClick}
          />
        }
      </IconDivider>
    </Divider>
  );
};

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onScannerCertificateDownloadClick: PropTypes.func.isRequired,
  onScannerCloneClick: PropTypes.func.isRequired,
  onScannerCreateClick: PropTypes.func.isRequired,
  onScannerDeleteClick: PropTypes.func.isRequired,
  onScannerDownloadClick: PropTypes.func.isRequired,
  onScannerEditClick: PropTypes.func.isRequired,
  onScannerVerifyClick: PropTypes.func.isRequired,
};

const Page = ({
  onChanged,
  onDownloaded,
  onError,
  ...props
}) => (
  <ScannerComponent
    onCertificateDownloadError={onError}
    onCertificateDownloaded={onDownloaded}
    onCloned={goto_details('scanner', props)}
    onCloneError={onError}
    onCreated={goto_details('scanner', props)}
    onDeleted={goto_list('scanners', props)}
    onDeleteError={onError}
    onDownloaded={onDownloaded}
    onDownloadError={onError}
    onSaved={onChanged}
    onVerified={onChanged}
    onVerifyError={onError}
  >
    {({
      clone,
      create,
      delete: delete_func,
      download,
      downloadcertificate,
      edit,
      save,
      verify,
    }) => (
      <EntityPage
        {...props}
        detailsComponent={ScannerDetails}
        sectionIcon="scanner.svg"
        toolBarIcons={ToolBarIcons}
        title={_('Scanner')}
        onScannerCertificateDownloadClick={downloadcertificate}
        onScannerCloneClick={clone}
        onScannerCreateClick={create}
        onScannerDeleteClick={delete_func}
        onScannerDownloadClick={download}
        onScannerEditClick={edit}
        onScannerSaveClick={save}
        onScannerVerifyClick={verify}
        onPermissionChanged={onChanged}
        onPermissionDownloaded={onDownloaded}
        onPermissionDownloadError={onError}
      />
    )}
  </ScannerComponent>
);

Page.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};
const ScannerPage = props => (
  <EntityContainer
    {...props}
    name="scanner"
    loaders={[
      permissions_resource_loader,
    ]}
  >
    {cprops => <Page {...props} {...cprops} />}
  </EntityContainer>
);

export default ScannerPage;

// vim: set ts=2 sw=2 tw=80:
