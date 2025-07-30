/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Filter from 'gmp/models/filter';
import PortList, {PortListElement} from 'gmp/models/portlist';
import {useGetQuery} from 'web/queries/useGetQuery';

export const useGetPortLists = ({filter = undefined}: {filter?: Filter}) =>
  useGetQuery({
    cmd: 'get_port_lists',
    filter,
    name: 'port_list',
    parseEntity: el => PortList.fromElement(el as PortListElement | undefined),
  });
