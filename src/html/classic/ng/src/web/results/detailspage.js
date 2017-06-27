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

import _, {datetime} from '../../locale.js';
import {is_defined} from '../../utils.js';

import Layout from '../layout.js';
import PropTypes from '../proptypes.js';
import SeverityBar from '../severitybar.js';
import {result_cvss_risk_factor} from '../render.js';

import Divider from '../components/layout/divider.js';
import IconDivider from '../components/layout/icondivider.js';

import DetailsBlock from '../entity/block.js';
import EntityPage from '../entity/page.js';
import {withEntityContainer} from '../entity/container.js';

import ExportIcon from '../icons/exporticon.js';
import HelpIcon from '../icons/helpicon.js';
import Icon from '../icons/icon.js';

import AssetLink from '../link/assetlink.js';
import DetailsLink from '../link/detailslink.js';
import InnerLink from '../link/innerlink.js';
import LegacyLink from '../link/legacylink.js';

import InfoTable from '../table/info.js';
import TableBody from '../table/body.js';
import TableData from '../table/data.js';
import TableRow from '../table/row.js';

import ResultDetails from './details.js';

const Pre = glamorous.pre({
  whiteSpace: 'pre-line',
  wordWrap: 'normal',
});

const InfoLayout = glamorous(Layout)({
  border: '1px solid #CCCCCC',
  padding: '5px',
  marginBottom: '10px',
  width: '400px',
  '& h3': {
    marginTop: 0,
  },
});

const InfoBox = ({
  children,
  modified,
  end,
  text,
  title,
  toolbox,
  ...props
}) => {
  return (
    <InfoLayout {...props} flex="column" align="space-between">
      <Layout flex align={['space-between', 'start']}>
        <h3>{title}</h3>
        {is_defined(toolbox) && toolbox}
      </Layout>
      <Pre>{text}</Pre>
      {children}
      <InfoTable>
        <TableBody>
          {is_defined(end) &&
            <TableRow>
              <TableData>
                {_('Active until')}
              </TableData>
              <TableData>
                {datetime(end)}
              </TableData>
            </TableRow>
          }
          <TableRow>
            <TableData>
              {_('Modifed')}
            </TableData>
            <TableData>
              {datetime(modified)}
            </TableData>
          </TableRow>
        </TableBody>
      </InfoTable>
    </InfoLayout>
  );
};

InfoBox.propTypes = {
  modified: PropTypes.momentDate,
  end: PropTypes.momentDate,
  text: PropTypes.string,
  title: PropTypes.string.isRequired,
  toolbox: PropTypes.element,
};

const Override = ({
  override,
}) => {
  let severity;
  let new_severity = '';
  if (override.severity === 0) {
    severity = _('Any');
  }
  else if (override.severity > 0.0) {
    severity = _('Severity > 0.0');
  }
  else {
    severity = result_cvss_risk_factor(override.severity);
  }

  if (override.new_severity > 0) {
    new_severity = override.new_severity + ': ';
  }
  new_severity += result_cvss_risk_factor(override.new_severity);

  const toolbox = (
    <IconDivider>
      <DetailsLink
        legacy
        id={override.id}
        type="override"
        title={_('Override Details')}
      >
        <Icon img="details.svg"/>
      </DetailsLink>
    </IconDivider>
  );
  return (
    <InfoBox
      title={_('Override from {{- severity}} to {{- new_severity}}',
        {severity, new_severity})}
      text={override.text}
      end={override.end_time}
      toolbox={toolbox}
      modified={override.modification_time}
    />
  );
};

Override.propTypes = {
  className: PropTypes.string,
  override: PropTypes.model.isRequired,
};

const Note = ({
  note,
}) => {
  const toolbox = (
    <IconDivider>
      <DetailsLink
        legacy
        id={note.id}
        type="note"
        title={_('Note Details')}
      >
        <Icon img="details.svg"/>
      </DetailsLink>
    </IconDivider>
  );
  return (
    <InfoBox
      title={_('Note')}
      text={note.text}
      end={note.end_time}
      toolbox={toolbox}
      modified={note.modification_time}>
    </InfoBox>
  );
};

Note.propTypes = {
  note: PropTypes.model.isRequired,
};

const ToolBarIcons = ({
  entity,
  onNewNoteClick,
  onNewOverrideClick
}) => {
  return (
    <Divider margin="10px">
      <IconDivider>
        <HelpIcon
          page="result_details"
          title={_('Help: Result Details')}
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
        <DetailsLink
          legacy
          type="task"
          id={entity.task.id}
        >
          <Icon
            img="task.svg"
            title={_('Corresponding Task ({{name}})', entity.task)}
          />
        </DetailsLink>
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
      </IconDivider>
      <IconDivider>
        <Icon
          img="new_note.svg"
          title={_('Add new Note')}
          value={entity}
          onClick={onNewNoteClick}
        />
        <Icon
          img="new_override.svg"
          title={_('Add new Override')}
          value={entity}
          onClick={onNewOverrideClick}
        />
      </IconDivider>
    </Divider>
  );
};

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onNewNoteClick: PropTypes.func,
  onNewOverrideClick: PropTypes.func,
};

const Details = ({entity, ...props}) => {
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
              <TableData>
                <Divider>
                  <SeverityBar severity={entity.severity}/>
                  {entity.overrides.active &&
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
                {entity.qod.value} %
              </TableData>
            </TableRow>
            <TableRow>
              <TableData>
                {_('Host')}
              </TableData>
              <TableData>
                <AssetLink
                  type="host"
                  id={entity.host.id}>
                  {entity.host.name}
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

      <DetailsBlock
        title={_('Tags')}
      >
        <Divider>
          {entity.user_tags.map(tag => {
            return (
              <DetailsLink
                legacy
                key={tag.id}
                id={tag.id}
                type="tag"
              >
                {tag.name + '=' + tag.value}
              </DetailsLink>
            );
          })}
        </Divider>
      </DetailsBlock>

      <ResultDetails
        entity={entity}
        {...props}
      />

      <DetailsBlock
        id="overrides"
        title={_('Overrides')}>
        <Divider
          wrap
          align={['start', 'stretch']}
          width="15px">
          {
            entity.overrides.filter(override => override.isActive())
              .map(override => {
                return (
                  <Override
                    key={override.id}
                    override={override}
                  />
                );
              })
          }
        </Divider>
      </DetailsBlock>

      <DetailsBlock
        id="notes"
        title={_('Notes')}>
        <Divider
          wrap
          align={['start', 'stretch']}
          width="15px">
          {
            entity.notes.filter(note => note.isActive())
              .map(note => {
                return (
                  <Note
                    key={note.id}
                    note={note}
                  />
                );
              })
          }
        </Divider>
      </DetailsBlock>
    </Layout>
  );
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
};

export default withEntityContainer(EntityPage, 'result', {
  sectionIcon: 'result.svg',
  title: _('Result'),
  toolBarIcons: ToolBarIcons,
  details: Details,
});

// vim: set ts=2 sw=2 tw=80:
