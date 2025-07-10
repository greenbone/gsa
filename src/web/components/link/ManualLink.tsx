/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import BlankLink, {BlankLinkProps} from 'web/components/link/BlankLink';
import useManualURL from 'web/hooks/useManualURL';

export interface ManualLinkProps extends Omit<BlankLinkProps, 'to'> {
  anchor?: string;
  highlight?: string;
  lang?: string;
  page: string;
  searchTerm?: string;
}

const ManualLink = ({
  anchor,
  page,
  searchTerm,
  lang,
  highlight,
  ...props
}: ManualLinkProps) => {
  const manualURL = useManualURL(lang);

  let url = manualURL + '/' + page + '.html';

  if (page === 'search' && isDefined(searchTerm)) {
    url += '?q=' + searchTerm;
  } else if (isDefined(highlight)) {
    url += '?highlight=' + highlight;
  } else if (isDefined(anchor)) {
    url += '#' + anchor;
  }
  return <BlankLink {...props} to={url} />;
};

export default ManualLink;
