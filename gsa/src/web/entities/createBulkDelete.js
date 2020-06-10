/* Copyright (C) 2020 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import SelectionType from 'web/utils/selectiontype';

const createBulkDelete = ({
  entities,
  filteredEntities,
  selected,
  selectionType,
  deleteFunc,
  refetch,
  onError,
}) => {
  const handleBulkDelete = () => {
    const toDelete = [];

    if (selectionType === SelectionType.SELECTION_USER) {
      selected.forEach(item => {
        const promise = deleteFunc(item.id);

        toDelete.push(promise);
      });
    } else if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
      entities.forEach(entity => {
        const promise = deleteFunc(entity.id);

        toDelete.push(promise);
      });
    } else {
      filteredEntities.forEach(entity => {
        const promise = deleteFunc(entity.id);
        toDelete.push(promise);
      });
    }

    return Promise.all([...toDelete]).then(refetch, onError);
  };

  return handleBulkDelete;
};

export default createBulkDelete;
