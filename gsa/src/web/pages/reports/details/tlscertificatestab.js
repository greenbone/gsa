/* Copyright (C) 2019-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';

import PropTypes from 'web/utils/proptypes';

import {
  makeCompareDate,
  makeCompareIp,
  makeComparePort,
  makeCompareString,
} from 'web/utils/sort';

import TLSCertificatesTable from './tlscertificatestable';
import ReportEntitiesContainer from './reportentitiescontainer';

const tlsCertificatesSortFunctions = {
  dn: makeCompareString('issuer'),
  serial: makeCompareString('serial'),
  notvalidbefore: makeCompareDate('notbefore'),
  notvalidafter: makeCompareDate('notafter'),
  ip: makeCompareIp('ip'),
  hostname: makeCompareString('hostname'),
  port: makeComparePort('port'),
};

const TLSCertificatesTab = ({
  counts,
  filter,
  isUpdating,
  sortField,
  sortReverse,
  tlsCertificates,
  onInteraction,
  onSortChange,
  onTlsCertificateDownloadClick,
}) => (
  <ReportEntitiesContainer
    counts={counts}
    entities={tlsCertificates}
    filter={filter}
    sortFunctions={tlsCertificatesSortFunctions}
    sortField={sortField}
    sortReverse={sortReverse}
    onInteraction={onInteraction}
  >
    {({
      entities,
      entitiesCounts,
      sortBy,
      sortDir,
      onFirstClick,
      onLastClick,
      onNextClick,
      onPreviousClick,
    }) => (
      <TLSCertificatesTable
        entities={entities}
        entitiesCounts={entitiesCounts}
        filter={filter}
        isUpdating={isUpdating}
        sortBy={sortBy}
        sortDir={sortDir}
        toggleDetailsIcon={false}
        onFirstClick={onFirstClick}
        onLastClick={onLastClick}
        onNextClick={onNextClick}
        onPreviousClick={onPreviousClick}
        onSortChange={onSortChange}
        onTlsCertificateDownloadClick={onTlsCertificateDownloadClick}
      />
    )}
  </ReportEntitiesContainer>
);

TLSCertificatesTab.propTypes = {
  counts: PropTypes.object,
  filter: PropTypes.filter.isRequired,
  isUpdating: PropTypes.bool,
  sortField: PropTypes.string.isRequired,
  sortReverse: PropTypes.bool.isRequired,
  tlsCertificates: PropTypes.array,
  onInteraction: PropTypes.func.isRequired,
  onSortChange: PropTypes.func.isRequired,
  onTlsCertificateDownloadClick: PropTypes.func.isRequired,
};

export default TLSCertificatesTab;
