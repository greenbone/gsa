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

import glamorous from 'glamorous';

import _, {datetime} from 'gmp/locale.js';
import {is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';

import EntityPage from '../../entity/page.js';
import EntityContainer from '../../entity/container.js';

import HelpIcon from '../../components/icon/helpicon.js';
import ListIcon from '../../components/icon/listicon.js';

import Divider from '../../components/layout/divider.js';
import IconDivider from '../../components/layout/icondivider.js';
import Layout from '../../components/layout/layout.js';

import DetailsLink from '../../components/link/detailslink.js';
import ExternalLink from '../../components/link/externallink.js';

import StrippedTable from '../../components/table/strippedtable.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableHeader from '../../components/table/header.js';
import TableHead from '../../components/table/head.js';
import TableRow from '../../components/table/row.js';

import OvaldefDetails from './details.js';

const ToolBarIcons = () => (
  <IconDivider>
    <HelpIcon
      page="ovaldef_details"
      title={_('Help: OVAL Definition Details')}
    />
    <ListIcon
      title={_('OVAL Definitions List')}
      page="ovaldefs"
    />
  </IconDivider>
);

const Criteria = ({criteria}) => {
  const {
    criterions,
    criterias: subcriterias,
    extend_definitions,
    operator,
    comment,
    negate,
  } = criteria;
  return (
    <li>
      <Divider>
        {is_defined(operator) &&
          <b>{operator}</b>
        }
        {negate &&
          <b>NOT</b>
        }
        {is_defined(comment) &&
          <span>({comment})</span>
        }
      </Divider>
      <ul>
        {criterions.map((criterion, i) => (
          <li key={i}>
            <Divider>
              {criterion.negate &&
                <b>NOT</b>
              }
              <span>{criterion.comment}</span>
              <i>({criterion.test_ref})</i>
            </Divider>
          </li>
        ))}
        {extend_definitions.map((extend_definition, i) => (
          <li key={i}>
            <Divider>
              {extend_definition.negate &&
                <b>NOT</b>
              }
              <span>{extend_definition.comment}</span>
              <i>({extend_definition.definition_ref})</i>
            </Divider>
          </li>
        ))}
        {subcriterias.map((subcriteria, i) => (
          <Criteria
            key={i}
            criteria={subcriteria}
          />
        ))}
      </ul>
    </li>
  );
};

Criteria.propTypes = {
  criteria: PropTypes.object.isRequired,
};

const StyledDivider = glamorous(Divider)({
  marginBottom: '1em',
});

const Details = ({
  entity,
}) => {
  const {
    affecteds,
    criterias,
    references,
    repository,
  } = entity;
  return (
    <Layout flex="column">
      <OvaldefDetails
        entity={entity}
      />

      <h2>{_('Affected')}</h2>
      {affecteds.length === 0 ?
        <p>{_('None')}</p> :
        affecteds.map(affected => (
          <div key={affected.family}>
            <h3>{_('Family {{family}}', affected)}</h3>
            <StrippedTable>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {_('Type')}
                  </TableHead>
                  <TableHead>
                    {_('Name')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {affected.products.map(product => (
                  <TableRow key={product}>
                    <TableData>
                      {_('Product')}
                    </TableData>
                    <TableData>
                      {product}
                    </TableData>
                  </TableRow>
                ))}
                {affected.platforms.map(platform => (
                  <TableRow key={platform}>
                    <TableData>
                      {_('Platform')}
                    </TableData>
                    <TableData>
                      {platform}
                    </TableData>
                  </TableRow>
                ))}
              </TableBody>
            </StrippedTable>
          </div>
        ))
      }

      <h2>{_('Criteria')}</h2>
      {criterias.length === 0 ?
        <p>{_('None')}</p> :
        <ul>
          {criterias.map((criteria, i) => (
            <Criteria
              key={i}
              criteria={criteria}
            />
          ))}
        </ul>
      }

      <h2>{_('References')}</h2>
      {references.length === 0 ?
        <p>{_('None')}</p> :
        <StrippedTable>
          <TableHeader>
            <TableRow>
              <TableHead>
                {_('Source')}
              </TableHead>
              <TableHead>
                {_('Reference ID')}
              </TableHead>
              <TableHead>
                {_('URL')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {references.map(ref => (
              <TableRow key={ref.id}>
                <TableData>
                  {ref.source}
                </TableData>
                <TableData>
                  <DetailsLink
                    type={ref.type}
                    id={ref.id}
                  >
                    {ref.id}
                  </DetailsLink>
                </TableData>
                <TableData>
                  <ExternalLink to={ref.url}>
                    {ref.url}
                  </ExternalLink>
                </TableData>
              </TableRow>
            ))}
          </TableBody>
        </StrippedTable>
      }

      <h2>{_('Repository History')}</h2>
      {is_defined(repository) ?
        <div>
          <StyledDivider>
            <b>{_('Status')}</b>
            <span>{repository.status}</span>
          </StyledDivider>
          <StrippedTable>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {_('Status')}
                </TableHead>
                <TableHead>
                  {_('Date')}
                </TableHead>
                <TableHead>
                  {_('Contributors')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repository.changes.map(change => (
                <TableRow key={change.name}>
                  <TableData>
                    <Divider>
                      <span>
                        {change.name}
                      </span>
                      {is_defined(change.description) &&
                        <span>(<i>{change.description}</i>)</span>
                      }
                    </Divider>
                  </TableData>
                  <TableData>
                    {datetime(change.date)}
                  </TableData>
                  <TableData>
                    <Divider>
                      {change.contributors.map(contributor => (
                        <Divider key={contributor.name}>
                          <span>
                            {contributor.name}
                          </span>
                          {is_defined(contributor.organization) &&
                            <span>(<i>{contributor.organization}</i>)</span>
                          }
                        </Divider>
                      ))}
                    </Divider>
                  </TableData>
                </TableRow>
              ))}
            </TableBody>
          </StrippedTable>
        </div> :
        <p>{_('None')}</p>
      }
    </Layout>
  );
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
};

const CvePage = props => (
  <EntityContainer
    {...props}
    name="ovaldef"
    loadPermissions={false}
  >
    {({
      onChanged,
      onDownloaded,
      onError,
      ...cprops
    }) => (
      <EntityPage
        {...props}
        {...cprops}
        sectionIcon="ovaldef.svg"
        title={_('OVAL Definition')}
        detailsComponent={Details}
        permissionsComponent={false}
        toolBarIcons={ToolBarIcons}
        onPermissionChanged={onChanged}
        onPermissionDownloaded={onDownloaded}
        onPermissionDownloadError={onError}
      />
    )}
  </EntityContainer>
);

export default CvePage;
