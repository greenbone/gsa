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

import {is_defined, is_empty} from 'gmp/utils.js';

import glamorous, {Col, Div} from 'glamorous';

import _, {datetime} from 'gmp/locale.js';

import PropTypes from '../../utils/proptypes.js';

import DeleteIcon from '../../components/icon/deleteicon.js';

import DetailsLink from '../../components/link/detailslink.js';

import Table from '../../components/table/stripedtable.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableHeader from '../../components/table/header.js';
import TableHead from '../../components/table/head.js';
import TableRow from '../../components/table/row.js';

import DetailsBlock from '../../entity/block.js';

const Action = glamorous.a({
  cursor: 'pointer',
});

const filter_identifiers = (identifiers, latest = true) => {
  if (!latest || is_empty(identifiers)) {
    return identifiers;
  }
  const last_id = identifiers[0].source.id;
  return identifiers.filter(identifier => identifier.source.id === last_id);
};

const Source = ({source}) => {
  const {source_type, deleted, id, data, name} = source;

  if (source_type === 'Report Host Detail') {
    return (
      <div>
        <span>{_('Report')}</span>
        {' '}
        <DetailsLink
          textOnly={deleted !== '0'}
          type="report"
          id={id}
        >
          {id}
        </DetailsLink>
        {' '}
        <span>
          <span>
            (NVT
          </span>
          {' '}
          <DetailsLink
            type="nvt"
            id={data}
          >
            {data}
          </DetailsLink>
          <span>)</span>
        </span>
      </div>
    );
  }

  if (source_type.startsWith('Report')) {
    return (
      <div>
        <span>{_('Report')}</span>
        {' '}
        <DetailsLink
          textOnly={deleted !== '0'}
          type="report"
          id={id}
        >
          {id}
        </DetailsLink>
        {' '}
        <span>
          {_('(Target Host)')}
        </span>
      </div>
    );
  }

  if (source_type.startsWith('User')) {
    return (
      <div>
        <span>{_('User')}</span>
        {' '}
        <DetailsLink
          legacy
          textOnly={deleted !== '0'}
          type="user"
          id={id}
        >
          {name}
        </DetailsLink>
      </div>
    );
  }

  return (
    <div>
      <span>{source_type}</span>
      <span>{id}</span>
    </div>
  );
};

Source.propTypes = {
  source: PropTypes.object.isRequired,
};

class Identifiers extends React.Component {

  constructor(...args) {
    super(...args);

    const {identifiers} = this.props;
    const filtered = filter_identifiers(identifiers, true);
    const equal = filtered.length === identifiers.length;

    this.state = {
      identifiers: filtered,
      latest: !equal,
      equal,
    };

    this.handleToggleLatest = this.handleToggleLatest.bind(this);
  }

  componentWillReceiveProps(next) {
    const {identifiers} = next;

    if (identifiers !== this.props.identifiers) {
      const {latest} = this.state;
      const filtered = filter_identifiers(identifiers, latest);
      const equal = !latest && filtered.length === identifiers.length;

      this.setState({
        latest: !equal,
        identifiers: filtered,
        equal,
      });
    }
  }


  handleToggleLatest() {
    const {latest} = this.state;
    const {identifiers} = this.props;
    const filtered = filter_identifiers(identifiers, !latest);
    const equal = !latest && filtered.length === identifiers.length;
    this.setState({
      latest: !latest && filtered.length !== identifiers.length,
      identifiers: filtered,
      equal,
    });
  }

  render() {
    let {displayActions = false, onDelete} = this.props;
    const {identifiers, latest, equal} = this.state;
    const title = latest ? _('Latest Identifiers') : _('All Identifiers');
    const footer = (
      <TableRow>
        <TableData
          flex
          align={['center', 'center']}
          colSpan="5"
        >
          {!equal &&
            <Action
              onClick={this.handleToggleLatest}
            >
              {latest ? _('Show all Identifiers') :
                  _('Show latest Identifiers')}
            </Action>
          }
        </TableData>
      </TableRow>
    );

    displayActions = displayActions && is_defined(onDelete);
    return (
      <DetailsBlock
        title={title}>
        <Table footer={footer}>
          <colgroup>
            <Col width="15%"/>
            <Col width="40%"/>
            <Col width="10%"/>
            <Col width={displayActions ? '30%' : '35%'}/>
            {displayActions &&
              <Col width="5%"/>
            }
          </colgroup>
          <TableHeader>
            <TableRow>
              <TableHead>
                {_('Name')}
              </TableHead>
              <TableHead>
                {_('Value')}
              </TableHead>
              <TableHead>
                {_('Created')}
              </TableHead>
              <TableHead>
                {_('Source')}
              </TableHead>
              {displayActions &&
                <TableHead>
                  {_('Actions')}
                </TableHead>
              }
            </TableRow>
          </TableHeader>
          <TableBody>
            {identifiers.map(identifier => (
              <TableRow key={identifier.id}>
                <TableData>
                  {identifier.name}
                </TableData>
                <TableData>
                  <DetailsLink
                    type="os"
                    page="operatingsystem"
                    id={is_defined(identifier.os) ? identifier.os.id : ''}
                    textOnly={identifier.name !== 'OS'}
                  >
                    <Div wordBreak="break-all">
                      {identifier.value}
                    </Div>
                  </DetailsLink>
                </TableData>
                <TableData>
                  {datetime(identifier.creation_time)}
                </TableData>
                <TableData>
                  <Source
                    source={identifier.source}
                  />
                </TableData>
                {displayActions &&
                  <TableData flex align={['center', 'center']}>
                    <DeleteIcon
                      title={_('Delete Identifier')}
                      value={identifier}
                      onClick={onDelete}
                    />
                  </TableData>
                }
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DetailsBlock>
    );
  }
}

Identifiers.propTypes = {
  displayActions: PropTypes.bool,
  identifiers: PropTypes.array.isRequired,
  onDelete: PropTypes.func,
};

export default Identifiers;

// vim: set ts=4 sw=4 tw=80:
