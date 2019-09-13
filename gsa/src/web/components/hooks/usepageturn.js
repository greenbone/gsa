/* Copyright (C) 2018-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import {useState, useEffect} from 'react';

import {isDefined} from 'gmp/utils/identity';
import PropTypes from 'web/utils/proptypes';

const usePageTurn = (firstPage, lastPage, titles) => {
  const [page, setPage] = useState(firstPage);
  const [prevDisabled, setPrev] = useState(false);
  const [nextDisabled, setNext] = useState(false);
  const [prevTitle, setPrevTitle] = useState(
    isDefined(titles) ? titles[page - 1] : undefined,
  );
  const [nextTitle, setNextTitle] = useState(
    isDefined(titles) ? titles[page + 1] : undefined,
  ); // we don't HAVE to use title

  // disable 'Previous' button if at first page. disable 'Next button if at last page.
  useEffect(() => {
    if (page === firstPage) {
      setPrev(true);
    } else {
      setPrev(false);
    }

    if (page === lastPage) {
      setNext(true);
    } else {
      setNext(false);
    }
  }, [page, firstPage, lastPage]);

  useEffect(() => {
    if (isDefined(titles)) {
      setPrevTitle(titles[page - 1]); // if at first page, will be calling titles[-1] which is undefined => disabled 'Previous' button.
      setNextTitle(titles[page + 1]); // same here, if at last page.
    }
  }, [page, titles]);

  const handlePageTurn = direction => {
    if (direction === 'Next') {
      setPage(page < lastPage ? page + 1 : page); // disallow large indices for nonexistent pages
    } else if (direction === 'Previous') {
      setPage(page > firstPage ? page - 1 : page); // disallow subzero page indices
    }
  };

  return {
    prevTitle,
    nextTitle,
    page,
    prevDisabled,
    nextDisabled,
    handlePageTurn,
  };
};

usePageTurn.propTypes = {
  firstPage: PropTypes.number.isRequired,
  lastPage: PropTypes.number.isRequired,
  titles: PropTypes.array,
};

export default usePageTurn;
