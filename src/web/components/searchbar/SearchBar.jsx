/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState, useEffect} from 'react';
import styled from 'styled-components';
import TextField from 'web/components/form/TextField';
import { SearchIcon } from 'web/components/icon/icons';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
import Theme from 'web/utils/Theme';
const StyledTextField = styled(TextField)`
  .mantine-Input-input {
    padding-left: 2.5rem;
  }
`;

const NoMatchesMessage = styled.p`
  font-weight: bold;
  text-align: center;
  margin-top: 1rem;
  background-color: ${Theme.lightRed};
  color: ${Theme.darkRed};
  padding: 0.5rem;
  border-radius: 0.25rem;
`;

const SearchBar = ({placeholder, onSearch, matchesCount, ...props}) => {
  const [_] = useTranslation();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 100);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  return (
    <>
      <StyledTextField
        {...props}
        leftSection={<SearchIcon />}
        placeholder={placeholder}
        title={_('Search')}
        value={query}
        onChange={value => setQuery(value)}
      />
      {matchesCount === 0 && (
        <NoMatchesMessage>{_('No matches found.')}</NoMatchesMessage>
      )}
    </>
  );
};

SearchBar.propTypes = {
  matchesCount: PropTypes.number.isRequired,
  placeholder: PropTypes.string.isRequired,
  onSearch: PropTypes.func.isRequired,
};

export default SearchBar;
