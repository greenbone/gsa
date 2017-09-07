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

import PropTypes from '../../utils/proptypes.js';
import withCapabilities from '../../utils/withCapabilities.js';

import DetailsBlock from '../../entity/block.js';
import EntityPage from '../../entity/page.js';
import Note from '../../entity/note.js';
import Override from '../../entity/override.js';
import {withEntityContainer} from '../../entity/container.js';

import SeverityBar from '../../components/bar/severitybar.js';

import ExportIcon from '../../components/icon/exporticon.js';
import HelpIcon from '../../components/icon/helpicon.js';
import Icon from '../../components/icon/icon.js';
import ListIcon from '../../components/icon/listicon.js';

import Divider from '../../components/layout/divider.js';
import IconDivider from '../../components/layout/icondivider.js';
import Layout from '../../components/layout/layout.js';
import Wrapper from '../../components/layout/wrapper.js';

import AssetLink from '../../components/link/assetlink.js';
import DetailsLink from '../../components/link/detailslink.js';
import InnerLink from '../../components/link/innerlink.js';
import LegacyLink from '../../components/link/legacylink.js';

import InfoTable from '../../components/table/infotable.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

import NoteDialog from '../notes/dialog.js';

import OverrideDialog from '../overrides/dialog.js';

import ResultDetails from './details.js';

const ToolBarIcons = ({
  capabilities,
  entity,
  onNoteCreateClick,
  onOverrideCreateClick
}) => (
  <Divider margin="10px">
    <IconDivider>
      <HelpIcon
        page="result_details"
        title={_('Help: Result Details')}
      />
      <ListIcon
        title={_('Results List')}
        page="results"
      />
      <LegacyLink
        cmd="export_result"
        result_id={entity.id}
      >
        <ExportIcon
          title={_('Export Result as XML')}
        />
      </LegacyLink>
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
      {capabilities.mayAccess('tasks') &&
        <DetailsLink
          type="task"
          id={entity.task.id}
        >
          <Icon
            img="task.svg"
            title={_('Corresponding Task ({{name}})', entity.task)}
          />
        </DetailsLink>
      }
      {capabilities.mayAccess('reports') &&
        <DetailsLink
          legacy
          type="report"
          id={entity.report.id}
        >
          <Icon
            img="report.svg"
            title={_('Corresponding Report')}
          />
        </DetailsLink>
      }
    </IconDivider>
  </Divider>
);

ToolBarIcons.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  entity: PropTypes.model.isRequired,
  onNoteCreateClick: PropTypes.func.isRequired,
  onOverrideCreateClick: PropTypes.func.isRequired,
};

const active_filter = entity => entity.isActive();

const Details = ({
  entity,
  ...props,
}) => {
  const {notes, overrides, qod, host, user_tags} = entity;
  const active_notes = notes.filter(active_filter);
  const active_overrides = overrides.filter(active_filter);
  return (
    <Layout flex="column">
      <DetailsBlock
        title={_('Vulnerability')}>
        <InfoTable>
          <TableBody>
            <TableRow>
              <TableData>
                {_('Name')}
              </TableData>
              <TableData>
                {entity.name}
              </TableData>
            </TableRow>
            <TableRow>
              <TableData>
                {_('Severity')}
              </TableData>
              <TableData flex align={['start', 'center']}>
                <Divider>
                  <SeverityBar severity={entity.severity}/>
                  {overrides.active &&
                    <InnerLink
                      to="overrides">
                      <Icon img="override.svg"
                        title={_('Overrides are applied')}
                      />
                    </InnerLink>
                  }
                </Divider>
              </TableData>
            </TableRow>
            <TableRow>
              <TableData>
                {_('QoD')}
              </TableData>
              <TableData>
                {qod.value} %
              </TableData>
            </TableRow>
            <TableRow>
              <TableData>
                {_('Host')}
              </TableData>
              <TableData>
                <AssetLink
                  type="host"
                  id={host.id}>
                  {host.name}
                </AssetLink>
              </TableData>
            </TableRow>
            <TableRow>
              <TableData>
                {_('Location')}
              </TableData>
              <TableData>
                {entity.port}
              </TableData>
            </TableRow>
          </TableBody>
        </InfoTable>
      </DetailsBlock>

      {user_tags.length > 0 &&
        <DetailsBlock
          title={_('Tags')}
        >
          <Divider>
            {user_tags.map(tag => (
              <DetailsLink
                legacy
                key={tag.id}
                id={tag.id}
                type="tag"
              >
                {tag.name + '=' + tag.value}
              </DetailsLink>
            ))}
          </Divider>
        </DetailsBlock>
      }

      <ResultDetails
        entity={entity}
        {...props}
      />

      {active_overrides.length > 0 &&
        <DetailsBlock
          id="overrides"
          title={_('Overrides')}>
          <Divider
            wrap
            align={['start', 'stretch']}
            width="15px">
            {
              active_overrides.map(override => (
                <Override
                  key={override.id}
                  override={override}
                />
              ))
            }
          </Divider>
        </DetailsBlock>
      }

      {active_notes.length > 0 &&
        <DetailsBlock
          id="notes"
          title={_('Notes')}>
          <Divider
            wrap
            align={['start', 'stretch']}
            width="15px">
            {
              active_notes.map(note => (
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
};

class Page extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleSaveNote = this.handleSaveNote.bind(this);
    this.handleSaveOverride = this.handleSaveOverride.bind(this);

    this.openNoteDialog = this.openNoteDialog.bind(this);
    this.openOverrideDialog = this.openOverrideDialog.bind(this);
  }

  handleSaveNote(data) {
    const {gmp} = this.context;
    const {onChanged} = this.props;

    return gmp.note.create(data).then(onChanged);
  }

  handleSaveOverride(data) {
    const {gmp} = this.context;
    const {onChanged} = this.props;

    return gmp.override.create(data).then(onChanged);
  }

  openNoteDialog(result) {
    this.note_dialog.show({
      fixed: true,
      oid: result.nvt.oid,
      nvt: result.nvt,
      task_id: '0',
      task_name: result.task.name,
      result_id: '',
      task_uuid: result.task.id,
      result_uuid: result.id,
      result_name: result.name,
      severity: result.original_severity > 0 ? 0.1 : result.original_severity,
      note_severity: result.original_severity,
      hosts: '--',
      hosts_manual: result.host.name,
      port: '--',
      port_manual: result.port,
    });
  }

  openOverrideDialog(result) {
    this.override_dialog.show({
      fixed: true,
      oid: result.nvt.oid,
      nvt: result.nvt,
      task_id: '0',
      task_name: result.task.name,
      result_id: '',
      task_uuid: result.task.id,
      result_uuid: result.id,
      result_name: result.name,
      severity: result.original_severity > 0 ? 0.1 : result.original_severity,
      note_severity: result.original_severity,
      hosts: '--',
      hosts_manual: result.host.name,
      port: '--',
      port_manual: result.port,
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
        <NoteDialog
          ref={ref => this.note_dialog = ref}
          onSave={this.handleSaveNote}
        />
        <OverrideDialog
          ref={ref => this.override_dialog = ref}
          onSave={this.handleSaveOverride}
        />
      </Wrapper>
    );
  }
}

Page.propTypes = {
  onChanged: PropTypes.func.isRequired,
};

Page.contextTypes = {
  gmp: PropTypes.gmp.isRequired,
};

export default withEntityContainer('result', {
  sectionIcon: 'result.svg',
  title: _('Result'),
  toolBarIcons: withCapabilities(ToolBarIcons),
  detailsComponent: Details,
  permissionsComponent: false,
})(Page);

// vim: set ts=2 sw=2 tw=80:
