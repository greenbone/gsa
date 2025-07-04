/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {isDefined} from 'gmp/utils/identity';
import Comment from 'web/components/comment/Comment';
import DateTime from 'web/components/date/DateTime';
import DetailsLink from 'web/components/link/DetailsLink';
import TableBody from 'web/components/table/Body';
import Col from 'web/components/table/Col';
import TableData from 'web/components/table/Data';
import InfoTable from 'web/components/table/InfoTable';
import TableRow from 'web/components/table/TableRow';
import DetailsBlock from 'web/entity/Block';
import EntityLink from 'web/entity/Link';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';

const TicketDetails = ({entity, links = true}) => {
  const [_] = useTranslation();
  const {task = {}} = entity;
  const taskIsInTrash = isDefined(task.isInTrash) ? task.isInTrash() : false;
  return (
    <React.Fragment>
      {!entity.isOrphan() && (
        <DetailsBlock title={_('References')}>
          <InfoTable size="full">
            <colgroup>
              <Col width="10%" />
              <Col width="90%" />
            </colgroup>
            <TableBody>
              {isDefined(entity.task) && (
                <TableRow>
                  <TableData>{_('Task')}</TableData>
                  <TableData>
                    <span>
                      <EntityLink entity={entity.task} textOnly={!links} />
                    </span>
                  </TableData>
                </TableRow>
              )}
              {isDefined(entity.report) && (
                <TableRow>
                  <TableData>{_('Report')}</TableData>
                  <TableData>
                    <span>
                      <DetailsLink
                        id={entity.report.id}
                        textOnly={!links}
                        type="report"
                      >
                        <DateTime date={entity.report.timestamp} />
                      </DetailsLink>
                    </span>
                  </TableData>
                </TableRow>
              )}
              {isDefined(entity.result) && (
                <TableRow>
                  <TableData>{_('Result')}</TableData>
                  <TableData>
                    <span>
                      <DetailsLink
                        id={entity.result.id}
                        textOnly={!links || taskIsInTrash}
                        type="result"
                      >
                        {entity.name}
                      </DetailsLink>
                    </span>
                  </TableData>
                </TableRow>
              )}
            </TableBody>
          </InfoTable>
        </DetailsBlock>
      )}
      <DetailsBlock title={_('Status Details')}>
        <InfoTable size="full">
          <colgroup>
            <Col width="10%" />
            <Col width="90%" />
          </colgroup>
          <TableBody>
            {isDefined(entity.openTime) && (
              <React.Fragment>
                <TableRow>
                  <TableData>{_('Opened')}</TableData>
                  <TableData>
                    <DateTime date={entity.openTime} />
                  </TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('With Note')}</TableData>
                  <TableData>
                    <Comment>{entity.openNote}</Comment>
                  </TableData>
                </TableRow>
              </React.Fragment>
            )}
            {isDefined(entity.fixedTime) && (
              <React.Fragment>
                <TableRow>
                  <TableData>{_('Fixed')}</TableData>
                  <TableData>
                    <DateTime date={entity.fixedTime} />
                  </TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('With Note')}</TableData>
                  <TableData>
                    <Comment>{entity.fixedNote}</Comment>
                  </TableData>
                </TableRow>
              </React.Fragment>
            )}
            {isDefined(entity.fixedVerifiedTime) && (
              <React.Fragment>
                <TableRow>
                  <TableData>{_('Fix Verified')}</TableData>
                  <TableData>
                    <DateTime date={entity.fixedVerifiedTime} />
                  </TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('With Report')}</TableData>
                  <TableData>
                    <span>
                      <DetailsLink
                        id={entity.fixedVerifiedReport.id}
                        textOnly={!links}
                        type="report"
                      >
                        <DateTime date={entity.fixedVerifiedReport.timestamp} />
                      </DetailsLink>
                    </span>
                  </TableData>
                </TableRow>
              </React.Fragment>
            )}
            {isDefined(entity.closedTime) && (
              <React.Fragment>
                <TableRow>
                  <TableData>{_('Closed')}</TableData>
                  <TableData>
                    <DateTime date={entity.closedTime} />
                  </TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('With Note')}</TableData>
                  <TableData>
                    <Comment>{entity.closedNote}</Comment>
                  </TableData>
                </TableRow>
              </React.Fragment>
            )}
          </TableBody>
        </InfoTable>
      </DetailsBlock>
    </React.Fragment>
  );
};

TicketDetails.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

export default TicketDetails;
