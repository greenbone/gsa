/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  CERT_FEED,
  GVMD_DATA_FEED,
  NVT_FEED,
  SCAP_FEED,
  type Feed,
} from 'gmp/commands/feed-status';
import {isDefined} from 'gmp/utils/identity';
import {
  CertBundAdvIcon,
  CpeLogoIcon,
  CveIcon,
  DfnCertAdvIcon,
  NvtIcon,
  PolicyIcon,
  PortListIcon,
  ReportFormatIcon,
  ScanConfigIcon,
} from 'web/components/icon';
import Divider from 'web/components/layout/Divider';
import IconDivider from 'web/components/layout/IconDivider';
import Link from 'web/components/link/Link';
import Table from 'web/components/table/StripedTable';
import TableBody from 'web/components/table/TableBody';
import TableData from 'web/components/table/TableData';
import TableHead from 'web/components/table/TableHead';
import TableRow from 'web/components/table/TableRow';
import useTranslation from 'web/hooks/useTranslation';

interface FeedStatusTabProps {
  feeds: Feed[];
}

interface FeedCheckProps {
  feed: Feed;
}

interface FeedStatusDisplayProps {
  feed: Feed;
}

const FeedCheck = ({feed}: FeedCheckProps) => {
  const [_] = useTranslation();
  const age = feed.age;

  if (age >= 30 && !feed.currentlySyncing) {
    return (
      <span>
        {_('Please check the automatic synchronization of your system.')}
      </span>
    );
  }

  return null;
};

const FeedStatusDisplay = ({feed}: FeedStatusDisplayProps) => {
  const [_] = useTranslation();

  if (feed.currentlySyncing) {
    return <span>{_('Update in progress...')}</span>;
  }

  if (isDefined(feed.syncNotAvailableError)) {
    return (
      <span>
        {_('Synchronization issue: {{error}}', {
          error: feed.syncNotAvailableError,
        })}
      </span>
    );
  }

  const {age} = feed;
  if (age >= 30) {
    return <span>{_('Too old ({{age}} days)', {age: String(age)})}</span>;
  }

  if (age >= 2) {
    return <span>{_('{{age}} days old', {age: String(age)})}</span>;
  }

  return <span>{_('Current')}</span>;
};

const FeedStatusTab = ({feeds}: FeedStatusTabProps) => {
  const [_] = useTranslation();

  return (
    <Table>
      <TableBody>
        <TableRow>
          <TableHead>{_('Type')}</TableHead>
          <TableHead>{_('Content')}</TableHead>
          <TableHead>{_('Origin')}</TableHead>
          <TableHead>{_('Version')}</TableHead>
          <TableHead>{_('Status')}</TableHead>
        </TableRow>

        {feeds.map(feed => {
          return (
            <TableRow key={feed.feedType}>
              <TableData>{feed.feedType}</TableData>
              <TableData>
                {feed.feedType === NVT_FEED && (
                  <IconDivider>
                    <Link to="nvts">
                      <IconDivider align={['start', 'center']}>
                        <NvtIcon size="medium" />
                        <span>{_('NVTs')}</span>
                      </IconDivider>
                    </Link>
                  </IconDivider>
                )}
                {feed.feedType === SCAP_FEED && (
                  <IconDivider>
                    <Link to="cves">
                      <IconDivider align={['start', 'center']}>
                        <CveIcon size="medium" />
                        <span>{_('CVEs')}</span>
                      </IconDivider>
                    </Link>
                    <Link to="cpes">
                      <IconDivider align={['start', 'center']}>
                        <CpeLogoIcon size="medium" />
                        <span>{_('CPEs')}</span>
                      </IconDivider>
                    </Link>
                  </IconDivider>
                )}
                {feed.feedType === CERT_FEED && (
                  <IconDivider>
                    <Link to="certbunds">
                      <IconDivider align={['start', 'center']}>
                        <CertBundAdvIcon size="medium" />
                        <span>{_('CERT-Bund Advisories')}</span>
                      </IconDivider>
                    </Link>
                    <Link to="dfncerts">
                      <IconDivider align={['start', 'center']}>
                        <DfnCertAdvIcon size="medium" />
                        <span>{_('DFN-CERT Advisories')}</span>
                      </IconDivider>
                    </Link>
                  </IconDivider>
                )}
                {feed.feedType === GVMD_DATA_FEED && (
                  <IconDivider>
                    <Link filter="predefined=1" to="policies">
                      <IconDivider align={['start', 'center']}>
                        <PolicyIcon size="medium" />
                        <span>{_('Compliance Policies')}</span>
                      </IconDivider>
                    </Link>
                    <Link filter="predefined=1" to="portlists">
                      <IconDivider align={['start', 'center']}>
                        <PortListIcon size="medium" />
                        <span>{_('Port Lists')}</span>
                      </IconDivider>
                    </Link>
                    <Link filter="predefined=1" to="reportformats">
                      <IconDivider align={['start', 'center']}>
                        <ReportFormatIcon size="medium" />
                        <span>{_('Report Formats')}</span>
                      </IconDivider>
                    </Link>
                    <Link filter="predefined=1" to="scanconfigs">
                      <IconDivider align={['start', 'center']}>
                        <ScanConfigIcon size="medium" />
                        <span>{_('Scan Configs')}</span>
                      </IconDivider>
                    </Link>
                  </IconDivider>
                )}
              </TableData>
              <TableData>{feed.name}</TableData>
              <TableData>{feed.version}</TableData>
              <TableData>
                <Divider wrap>
                  <strong>
                    <FeedStatusDisplay feed={feed} />
                  </strong>
                  <span data-testid="update-msg">
                    <FeedCheck feed={feed} />
                  </span>
                </Divider>
              </TableData>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default FeedStatusTab;
