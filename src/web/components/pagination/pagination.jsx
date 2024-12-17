/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */



import _ from 'gmp/locale';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import styled from 'styled-components';
import FirstIcon from 'web/components/icon/firsticon';
import LastIcon from 'web/components/icon/lasticon';
import NextIcon from 'web/components/icon/nexticon';
import PreviousIcon from 'web/components/icon/previousicon';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';
import PropTypes from 'web/utils/proptypes';

const PaginationText = styled.span`
  margin: 0 3px;
`;

const PaginationLayout = styled(Layout)`
  margin: 2px 3px;
  padding: 15px 0;

  @media print {
    svg {
      display: none;
    }
  }
`;

const Pagination = ({
  counts,
  onFirstClick,
  onLastClick,
  onNextClick,
  onPreviousClick,
}) => {
  if (!isDefined(counts)) {
    return null;
  }

  return (
    <PaginationLayout flex align={['end', 'center']}>
      <IconDivider>
        <FirstIcon
          disabled={!counts.hasPrevious()}
          title={_('First')}
          onClick={onFirstClick}
        />
        <PreviousIcon
          disabled={!counts.hasPrevious()}
          title={_('Previous')}
          onClick={onPreviousClick}
        />
      </IconDivider>
      <PaginationText>
        {_('{{first}} - {{last}} of {{filtered}}', counts)}
      </PaginationText>
      <IconDivider>
        <NextIcon
          disabled={!counts.hasNext()}
          title={_('Next')}
          onClick={onNextClick}
        />
        <LastIcon
          disabled={!counts.hasNext()}
          title={_('Last')}
          onClick={onLastClick}
        />
      </IconDivider>
    </PaginationLayout>
  );
};

Pagination.propTypes = {
  counts: PropTypes.object,
  onFirstClick: PropTypes.func,
  onLastClick: PropTypes.func,
  onNextClick: PropTypes.func,
  onPreviousClick: PropTypes.func,
};

export default Pagination;

// vim: set ts=2 sw=2 tw=80:
