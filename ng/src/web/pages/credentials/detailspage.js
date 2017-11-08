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

import _, {datetime} from 'gmp/locale.js';
import {is_defined} from 'gmp/utils.js';

import {
  CERTIFICATE_STATUS_INACTIVE,
  CERTIFICATE_STATUS_EXPIRED,
} from 'gmp/models/credential';

import PropTypes from '../../utils/proptypes.js';

import ExportIcon from '../../components/icon/exporticon.js';
import HelpIcon from '../../components/icon/helpicon.js';
import ListIcon from '../../components/icon/listicon.js';

import Divider from '../../components/layout/divider.js';
import IconDivider from '../../components/layout/icondivider.js';
import Layout from '../../components/layout/layout.js';

import InfoTable from '../../components/table/infotable.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

import CloneIcon from '../../entity/icon/cloneicon.js';
import CreateIcon from '../../entity/icon/createicon.js';
import EditIcon from '../../entity/icon/editicon.js';
import TrashIcon from '../../entity/icon/trashicon.js';

import DetailsBlock from '../../entity/block.js';
import EntityPage from '../../entity/page.js';
import EntityContainer from '../../entity/container.js';
import {goto_details, goto_list} from '../../entity/component.js';

import CredentialDetails from './details.js';
import CredentialComponent from './component.js';

const ToolBarIcons = ({
  entity,
  onCredentialCloneClick,
  onCredentialCreateClick,
  onCredentialDeleteClick,
  onCredentialDownloadClick,
  onCredentialEditClick,
}) => (
  <Divider margin="10px">
    <IconDivider>
      <HelpIcon
        page="credential_details"
        title={_('Help: Credential Details')}
      />
      <ListIcon
        title={_('Credential List')}
        page="credentials"
      />
    </IconDivider>
    <IconDivider>
      <CreateIcon
        entity={entity}
        onClick={onCredentialCreateClick}
      />
      <CloneIcon
        entity={entity}
        onClick={onCredentialCloneClick}
      />
      <EditIcon
        entity={entity}
        onClick={onCredentialEditClick}
      />
      <TrashIcon
        entity={entity}
        onClick={onCredentialDeleteClick}
      />
      <ExportIcon
        value={entity}
        title={_('Export Credential as XML')}
        onClick={onCredentialDownloadClick}
      />
    </IconDivider>
  </Divider>
);

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onCredentialCloneClick: PropTypes.func.isRequired,
  onCredentialCreateClick: PropTypes.func.isRequired,
  onCredentialDeleteClick: PropTypes.func.isRequired,
  onCredentialDownloadClick: PropTypes.func.isRequired,
  onCredentialEditClick: PropTypes.func.isRequired,
};

const Details = ({
  entity,
  links = true,
  ...props
}) => {
  const {
    certificate_info: cert,
  } = entity;
  return (
    <Layout flex="column">
      <CredentialDetails
        entity={entity}
        links={links}
      />
      {is_defined(cert) &&
        <DetailsBlock
          title={_('Certificate')}
        >
          <InfoTable>
            <TableBody>
              <TableRow>
                <TableData>
                  {_('Activation')}
                </TableData>
                <TableData>
                  <Divider>
                    <span>
                      {datetime(cert.activation_time)}
                    </span>
                    {cert.time_status === CERTIFICATE_STATUS_INACTIVE &&
                      <span>{_('inactive')}</span>
                    }
                  </Divider>
                </TableData>
              </TableRow>

              <TableRow>
                <TableData>
                  {_('Expiration')}
                </TableData>
                <TableData>
                  <Divider>
                    <span>
                      {datetime(cert.expiration_time)}
                    </span>
                    {cert.time_status === CERTIFICATE_STATUS_EXPIRED &&
                      <span>{_('expired')}</span>
                    }
                  </Divider>
                </TableData>
              </TableRow>

              <TableRow>
                <TableData>
                  {_('MD5 Fingerprint')}
                </TableData>
                <TableData>
                  {cert.md5_fingerprint}
                </TableData>
              </TableRow>

              <TableRow>
                <TableData>
                  {_('Issued By')}
                </TableData>
                <TableData>
                  {cert.issuer}
                </TableData>
              </TableRow>
            </TableBody>
          </InfoTable>
        </DetailsBlock>
      }
    </Layout>
  );
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

const Page = ({
  onChanged,
  onDownloaded,
  onError,
  ...props
}) => {
  return (
    <CredentialComponent
      onCloned={goto_details('credential', props)}
      onCloneError={onError}
      onCreated={goto_details('credential', props)}
      onDeleted={goto_list('credentials', props)}
      onDeleteError={onError}
      onDownloaded={onDownloaded}
      onDownloadError={onError}
      onSaved={onChanged}
    >
      {({
        clone,
        create,
        delete: delete_func,
        download,
        edit,
        save,
      }) => (
        <EntityPage
          {...props}
          detailsComponent={Details}
          sectionIcon="credential.svg"
          toolBarIcons={ToolBarIcons}
          title={_('Credential')}
          onCredentialCloneClick={clone}
          onCredentialCreateClick={create}
          onCredentialDeleteClick={delete_func}
          onCredentialDownloadClick={download}
          onCredentialEditClick={edit}
          onCredentialSaveClick={save}
          onPermissionChanged={onChanged}
          onPermissionDownloadError={onError}
          onPermissionDownloaded={onDownloaded}
        />
      )}
    </CredentialComponent>
  );
};

Page.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

const CredentialPage = props => (
  <EntityContainer
    {...props}
    name="credential"
  >
    {cprops => <Page {...props} {...cprops} />}
  </EntityContainer>
);

export default CredentialPage;

// vim: set ts=2 sw=2 tw=80:
