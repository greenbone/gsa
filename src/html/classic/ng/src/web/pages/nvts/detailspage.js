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

import compose from '../../utils/compose.js';
import PropTypes from '../../utils/proptypes.js';
import withCapabilities from '../../utils/withCapabilities.js';

import DetailsBlock from '../../entity/block.js';
import Note from '../../entity/note.js';
import Override from '../../entity/override.js';
import EntityPage from '../../entity/page.js';
import {loader} from '../../entity/container.js';
import withEntityContainer from '../../entity/withEntityContainer.js';

import HelpIcon from '../../components/icon/helpicon.js';
import Icon from '../../components/icon/icon.js';
import ListIcon from '../../components/icon/listicon.js';

import Divider from '../../components/layout/divider.js';
import IconDivider from '../../components/layout/icondivider.js';
import Layout from '../../components/layout/layout.js';
import Wrapper from '../../components/layout/wrapper.js';

import Link from '../../components/link/link.js';

import InfoTable from '../../components/table/infotable.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

import withOverrideComponent from '../overrides/withOverrideComponent.js';
import withNoteComponent from '../notes/withNoteComponent.js';

import NvtDetails from './details.js';
import Preferences from './preferences.js';

const ToolBarIcons = ({
  capabilities,
  entity,
  onNoteCreateClick,
  onOverrideCreateClick,
}) => {
  return (
    <Divider margin="10px">
      <IconDivider>
        <HelpIcon
          page="nvt_details"
          title={_('Help: NVT Details')}
        />
        <ListIcon
          title={_('NVT List')}
          page="nvts"
        />
      </IconDivider>

      <IconDivider>
        {capabilities.mayCreate('note') &&
          <Icon
            img="new_note.svg"
            title={_('Add new Note')}
            value={entity}
            onClick={onNoteCreateClick}
          />
        }
        {capabilities.mayCreate('override') &&
          <Icon
            img="new_override.svg"
            title={_('Add new Override')}
            value={entity}
            onClick={onOverrideCreateClick}
          />
        }
      </IconDivider>

      <IconDivider>
        {capabilities.mayAccess('results') &&
          <Link
            to="results"
            filter={'nvt=' + entity.id}
          >
            <Icon
              img="result.svg"
              title={_('Corresponding Results')}
            />
          </Link>
        }
        {capabilities.mayAccess('vulns') &&
          <Link
            to="vulnerabilities"
            filter={'uuid=' + entity.id}
          >
            <Icon
              img="vulnerability.svg"
              title={_('Corresponding Vulnerabilities')}
            />
          </Link>
        }
      </IconDivider>
    </Divider>
  );
};

ToolBarIcons.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  entity: PropTypes.model.isRequired,
  onNoteCreateClick: PropTypes.func.isRequired,
  onOverrideCreateClick: PropTypes.func.isRequired,
};

const Details = ({
  entity,
  notes = [],
  overrides = [],
}) => {
  overrides = overrides.filter(override => override.isActive());
  notes = notes.filter(note => note.isActive());
  const {version, family, oid, preferences, default_timeout} = entity;
  return (
    <Layout flex="column">
      <InfoTable>
        <TableBody>
          <TableRow>
            <TableData>
              {_('Family')}
            </TableData>
            <TableData>
              {family}
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>
              {_('OID')}
            </TableData>
            <TableData>
              {oid}
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>
              {_('Version')}
            </TableData>
            <TableData>
              {version}
            </TableData>
          </TableRow>
        </TableBody>
      </InfoTable>

      <NvtDetails
        entity={entity}
      />

      <DetailsBlock
        title={_('Preferences')}>
        <Preferences
          preferences={preferences}
          default_timeout={default_timeout}
        />
      </DetailsBlock>

      {overrides.length > 0 &&
        <DetailsBlock
          id="overrides"
          title={_('Overrides')}>
          <Divider
            wrap
            align={['start', 'stretch']}
            width="15px">
            {
              overrides.map(override => (
                <Override
                  key={override.id}
                  override={override}
                />
              ))
            }
          </Divider>
        </DetailsBlock>
      }

      {notes.length > 0 &&
        <DetailsBlock
          id="notes"
          title={_('Notes')}>
          <Divider
            wrap
            align={['start', 'stretch']}
            width="15px">
            {
              notes.map(note => (
                <Note
                  key={note.id}
                  note={note}
                />
              ))
            }
          </Divider>
        </DetailsBlock>
      }
    </Layout>
  );
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
  notes: PropTypes.arrayLike,
  overrides: PropTypes.arrayLike,
};

class Page extends React.Component {

  constructor(...args) {
    super(...args);

    this.openOverrideDialog = this.openOverrideDialog.bind(this);
    this.openNoteDialog = this.openNoteDialog.bind(this);
  }

  openNoteDialog(nvt) {
    const {onNoteCreateClick} = this.props;
    onNoteCreateClick({
      fixed: true,
      nvt,
      oid: nvt.oid,
    });
  }

  openOverrideDialog(nvt) {
    const {onOverrideCreateClick} = this.props;
    onOverrideCreateClick({
      fixed: true,
      nvt,
      oid: nvt.oid,
    });
  }

  render() {
    return (
      <Wrapper>
        <EntityPage
          {...this.props}
          onNoteCreateClick={this.openNoteDialog}
          onOverrideCreateClick={this.openOverrideDialog}
        />
      </Wrapper>
    );
  }
}

Page.propTypes = {
  onNoteCreateClick: PropTypes.func.isRequired,
  onOverrideCreateClick: PropTypes.func.isRequired,
};

Page = compose(
  withNoteComponent({
    onCreated: 'onChanged',
    onSaved: 'onChanged',
  }),
  withOverrideComponent({
    onCreated: 'onChanged',
    onSaved: 'onChanged',
  }),
)(Page);

const nvt_id_filter = id => 'nvt_id=' + id;

export default withEntityContainer('nvt', {
  detailsComponent: Details,
  sectionIcon: 'nvt.svg',
  title: _('NVT'),
  toolBarIcons: withCapabilities(ToolBarIcons),
  permissionsComponent: false,
  loaders: [
    loader('notes', nvt_id_filter),
    loader('overrides', nvt_id_filter),
  ],
})(Page);

// vim: set ts=2 sw=2 tw=80:
