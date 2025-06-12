/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import DetailsLink, {DetailsLinkProps} from 'web/components/link/DetailsLink';

type CveLinkProps = Omit<DetailsLinkProps, 'type' | 'data-testid'>;

const CveLink = ({id, ...props}: CveLinkProps) => (
  <DetailsLink {...props} data-testid="cve-link" id={id} type="cve">
    {id}
  </DetailsLink>
);

export default CveLink;
