/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactNode} from 'react';
import {type DirectoryComputer} from 'gmp/models/active-directory';
import Column from 'web/components/layout/Column';
import InfoTable from 'web/components/table/InfoTable';
import TableBody from 'web/components/table/TableBody';
import TableCol from 'web/components/table/TableCol';
import {TableDataAlignTop} from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import DetailsBlock from 'web/entity/DetailsBlock';
import useTranslation from 'web/hooks/useTranslation';
import ComputerRelationships from 'web/pages/active-directory/ComputerRelationships';
import Theme from 'web/utils/theme';

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
  const loadingValue = (
    <small style={{color: Theme.darkGray}}>{_('Loading...')}</small>
  );
  const attributes: {label: string; value: ReactNode}[] = [
    {
      label: _('Operating system'),
      value: node.operatingSystem || _('Not provided'),
    },
    ...(details || loading
      ? [
          {
            label: _('OS version'),
            value: loading ? (
              <output aria-label={_('Loading computer details...')}>
                {loadingValue}
              </output>
            ) : (
              details?.operatingSystemVersion || _('Not provided')
            ),
          },
        ]
      : []),
    {
      label: _('Distinguished name'),
      value: <pre style={{margin: 0}}>{node.id}</pre>,
    },
    {
      label: _('Description'),
      value: (
        <pre style={{margin: 0}}>{node.description || _('Not provided')}</pre>
      ),
    },
  ];
  const spns = details?.servicePrincipalNames;
  if (loading || spns !== undefined) {
    let value: ReactNode = _('No SPNs registered');
    if (loading) {
      value = loadingValue;
    } else if (spns?.length) {
      value = (
        <Column gap="xxs" style={{overflowWrap: 'anywhere'}}>
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
    <Column gap="md">
      <DetailsBlock title={_('Active Directory information')}>
        <Column gap={0} miw={0} style={{overflowX: 'auto'}}>
          <InfoTable aria-label={_('Active Directory information')} size="full">
            <colgroup>
              <TableCol width="25%" />
              <TableCol width="75%" />
            </colgroup>
            <TableBody>
              {attributes.map(({label, value}, index) => (
                <TableRow
                  key={label}
                  style={{
                    borderBottom:
                      index < attributes.length - 1
                        ? '1px solid var(--mantine-color-default-border)'
                        : undefined,
                  }}
                >
                  <TableDataAlignTop style={{paddingBlock: '2px'}}>
                    <strong>{label}</strong>
                  </TableDataAlignTop>
                  <TableDataAlignTop style={{paddingBlock: '2px'}}>
                    {value}
                  </TableDataAlignTop>
                </TableRow>
              ))}
            </TableBody>
          </InfoTable>
        </Column>
        {feedback}
        <p>
          {_(
            'Descriptions are maintained by Active Directory administrators and may contain personal data.',
          )}
        </p>
      </DetailsBlock>
      <hr
        style={{
          border: 0,
          borderTop: '1px solid var(--mantine-color-default-border)',
          margin: 'var(--mantine-spacing-sm) 0',
        }}
      />
      <ComputerRelationships node={node} />
    </Column>
  );
};

export default ComputerDetails;
