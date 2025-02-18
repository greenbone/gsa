/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {isDefined} from 'gmp/utils/identity';
import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import DateTime from 'web/components/date/DateTime';
import DeleteIcon from 'web/components/icon/DeleteIcon';
import DetailsLink from 'web/components/link/DetailsLink';
import TableBody from 'web/components/table/Body';
import TableData from 'web/components/table/Data';
import TableFooter from 'web/components/table/Footer';
import TableHead from 'web/components/table/Head';
import TableHeader from 'web/components/table/Header';
import TableRow from 'web/components/table/Row';
import Table from 'web/components/table/StripedTable';
import DetailsBlock from 'web/entity/Block';
import PropTypes from 'web/utils/PropTypes';

const Action = styled.a`
  cursor: pointer;
`;

const Col = styled.col`
  width: ${props => props.width};
`;
const Div = styled.div`
  word-break: break-all;
`;

const filter_identifiers = (identifiers, latest = true) => {
  if (!latest || !isDefined(identifiers) || identifiers.length === 0) {
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
        <span>{_('Report')}</span>{' '}
        <DetailsLink id={id} textOnly={deleted} type="report">
          {id}
        </DetailsLink>{' '}
        <span>
          <span>(NVT</span>{' '}
          <DetailsLink id={data} type="nvt">
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
        <span>{_('Report')}</span>{' '}
        <DetailsLink id={id} textOnly={deleted} type="report">
          {id}
        </DetailsLink>{' '}
        <span>{_('(Target Host)')}</span>
      </div>
    );
  }

  if (source_type.startsWith('User')) {
    return (
      <div>
        <span>{_('User')}</span>{' '}
        <DetailsLink id={id} textOnly={deleted} type="user">
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

const Identifiers = props => {
  const {identifiers} = props;
  const filtered = filter_identifiers(identifiers, true);
  const equal = filtered.length === identifiers.length;

  const [ids, setIds] = useState(filtered);
  const [latest, setLatest] = useState(!equal);
  const [stateEqual, setStateEqual] = useState(equal);

  useEffect(() => {
    const newFiltered = filter_identifiers(props.identifiers, latest);
    const newEqual = !latest && newFiltered.length === props.identifiers.length;
    setLatest(!newEqual);
    setIds(newFiltered);
    setStateEqual(newEqual);
  }, [props.identifiers, latest]);

  const handleToggleLatest = () => {
    const {identifiers: newIds} = props;
    const newFiltered = filter_identifiers(newIds, !latest);
    const newEqual = !latest && newFiltered.length === newIds.length;

    setLatest(!latest && newFiltered.length !== newIds.length);
    setIds(newFiltered);
    setStateEqual(newEqual);
  };

  let {displayActions = false, onDelete} = props;

  const title = latest ? _('Latest Identifiers') : _('All Identifiers');
  const footer = (
    <TableFooter>
      <TableRow>
        <TableData flex align={['center', 'center']} colSpan="5">
          {!stateEqual && (
            <Action onClick={handleToggleLatest}>
              {latest
                ? _('Show all Identifiers')
                : _('Show latest Identifiers')}
            </Action>
          )}
        </TableData>
      </TableRow>
    </TableFooter>
  );

  displayActions = displayActions && isDefined(onDelete);
  return (
    <DetailsBlock title={title}>
      <Table footer={footer}>
        <colgroup>
          <Col width="15%" />
          <Col width="40%" />
          <Col width="10%" />
          <Col width={displayActions ? '30%' : '35%'} />
          {displayActions && <Col width="5%" />}
        </colgroup>
        <TableHeader>
          <TableRow>
            <TableHead>{_('Name')}</TableHead>
            <TableHead>{_('Value')}</TableHead>
            <TableHead>{_('Created')}</TableHead>
            <TableHead>{_('Source')}</TableHead>
            {displayActions && <TableHead>{_('Actions')}</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {ids.map(identifier => (
            <TableRow key={identifier.id}>
              <TableData>{identifier.name}</TableData>
              <TableData>
                <span>
                  <DetailsLink
                    id={isDefined(identifier.os) ? identifier.os.id : ''}
                    textOnly={identifier.name !== 'OS'}
                    type="operatingsystem"
                  >
                    <Div>{identifier.value}</Div>
                  </DetailsLink>
                </span>
              </TableData>
              <TableData>
                <DateTime date={identifier.creationTime} />
              </TableData>
              <TableData>
                <Source source={identifier.source} />
              </TableData>
              {displayActions && (
                <TableData align={['center', 'center']}>
                  <DeleteIcon
                    title={_('Delete Identifier')}
                    value={identifier}
                    onClick={onDelete}
                  />
                </TableData>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DetailsBlock>
  );
};

Identifiers.propTypes = {
  displayActions: PropTypes.bool,
  identifiers: PropTypes.array.isRequired,
  onDelete: PropTypes.func,
};

export default Identifiers;

// vim: set ts=4 sw=4 tw=80:
