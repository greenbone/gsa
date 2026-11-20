/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactNode} from 'react';
import styled from 'styled-components';
import {type DirectoryComputer} from 'gmp/models/active-directory';
import Badge, {EThemeColors} from 'web/components/badge/StatusBadge';
import Column from 'web/components/layout/Column';
import InfoTable from 'web/components/table/InfoTable';
import TableBody from 'web/components/table/TableBody';
import TableCol from 'web/components/table/TableCol';
import {TableDataAlignTop} from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import useTranslation from 'web/hooks/useTranslation';
import ComputerRelationships from 'web/pages/active-directory/ComputerRelationships';
import {DirectoryDetailsSection} from 'web/pages/active-directory/DirectoryLayout';

const AttributesTable = styled(InfoTable)`
  table-layout: fixed;

  td {
    overflow-wrap: anywhere;
  }

  td:first-child {
    padding-inline-end: var(--mantine-spacing-sm);
  }

  td > div {
    padding-block: var(--mantine-spacing-xxs);
  }

  tr + tr > td {
    border-top: 1px solid var(--mantine-color-default-border);
  }

  pre {
    margin: 0;
  }
`;

const DetailsSeparator = styled.hr`
  width: 100%;
  margin: 0;
  border: 0;
  border-block-start: 1px solid var(--mantine-color-default-border);
`;

const ComputerDetails = ({
  node,
  details,
  feedback,
  loading = false,
}: {
  node: DirectoryComputer;
  details?: Pick<
    DirectoryComputer,
    'operatingSystemVersion' | 'servicePrincipalNames'
  >;
  feedback?: ReactNode;
  loading?: boolean;
}) => {
  const [_] = useTranslation();
  const attributes: {label: string; value: ReactNode}[] = [
    {
      label: _('Operating system'),
      value: node.operatingSystem || _('Not provided'),
    },
    ...(details
      ? [
          {
            label: _('OS version'),
            value: details.operatingSystemVersion || _('Not provided'),
          },
        ]
      : []),
    {
      label: _('Distinguished name'),
      value: <pre>{node.id}</pre>,
    },
    {
      label: _('Description'),
      value: <pre>{node.description || _('Not provided')}</pre>,
    },
  ];
  const spns = details?.servicePrincipalNames;
  if (loading) {
    attributes.push({
      label: _('Service principal names (SPNs)'),
      value: (
        <output aria-label={_('Loading computer details...')}>
          <Badge color={EThemeColors.NeutralLight} size="sm">
            {_('Loading...')}
          </Badge>
        </output>
      ),
    });
  } else if (spns !== undefined) {
    let value: ReactNode = _('No SPNs registered');
    if (spns.length > 0) {
      value = (
        <Column gap="xxs">
          <ul
            style={{margin: 0, paddingInlineStart: 'var(--mantine-spacing-md)'}}
          >
            {spns.map(spn => (
              <li key={spn}>{spn}</li>
            ))}
          </ul>
          <small>
            {_('SPNs can indicate service roles, but may be incomplete.')}
          </small>
        </Column>
      );
    }
    attributes.push({label: _('Service principal names (SPNs)'), value});
  }
  return (
    <Column gap="sm">
      <DirectoryDetailsSection title={_('Active Directory information')}>
        <Column gap="xs">
          {feedback}
          <AttributesTable
            aria-label={_('Active Directory information')}
            size="full"
          >
            <colgroup>
              <TableCol width="34%" />
              <TableCol width="66%" />
            </colgroup>
            <TableBody>
              {attributes.map(({label, value}) => (
                <TableRow key={label}>
                  <TableDataAlignTop>
                    <strong>{label}</strong>
                  </TableDataAlignTop>
                  <TableDataAlignTop>{value}</TableDataAlignTop>
                </TableRow>
              ))}
            </TableBody>
          </AttributesTable>
          <small>
            {_(
              'Descriptions are maintained by Active Directory administrators and may contain personal data.',
            )}
          </small>
        </Column>
      </DirectoryDetailsSection>
      <DetailsSeparator />
      <ComputerRelationships node={node} />
    </Column>
  );
};

export default ComputerDetails;
