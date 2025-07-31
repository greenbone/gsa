/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import CollectionCounts from 'gmp/collection/CollectionCounts';
import {isDefined} from 'gmp/utils/identity';
import {FirstIcon, LastIcon, NextIcon, PreviousIcon} from 'web/components/icon';
import IconDivider from 'web/components/layout/IconDivider';
import Layout from 'web/components/layout/Layout';
import useTranslation from 'web/hooks/useTranslation';

interface PaginationProps {
  counts?: CollectionCounts;
  onFirstClick?: () => void;
  onLastClick?: () => void;
  onNextClick?: () => void;
  onPreviousClick?: () => void;
}

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
}: PaginationProps) => {
  const [_] = useTranslation();
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
        {_('{{first}} - {{last}} of {{filtered}}', {
          last: counts.last,
          first: counts.first,
          filtered: counts.filtered,
        })}
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

export default Pagination;
