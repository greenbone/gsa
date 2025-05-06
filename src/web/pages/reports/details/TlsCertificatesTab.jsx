/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import ReportEntitiesContainer from 'web/pages/reports/details/ReportEntitiesContainer';
import TLSCertificatesTable from 'web/pages/reports/details/TlsCertificatesTable';
import PropTypes from 'web/utils/PropTypes';
import {
  makeCompareDate,
  makeCompareIp,
  makeComparePort,
  makeCompareString,
} from 'web/utils/Sort';

const tlsCertificatesSortFunctions = {
  dn: makeCompareString('subjectDn'),
  serial: makeCompareString('serial'),
  notvalidbefore: makeCompareDate('activationTime'),
  notvalidafter: makeCompareDate('expirationTime'),
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
    sortField={sortField}
    sortFunctions={tlsCertificatesSortFunctions}
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
