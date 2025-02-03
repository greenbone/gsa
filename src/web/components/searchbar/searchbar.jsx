/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState, useEffect} from 'react';
import styled from 'styled-components';
import TextField from 'web/components/form/textfield';
import SearchIcon from 'web/components/icon/SearchIcon';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

const StyledTextField = styled(TextField)`
  .mantine-Input-input {
    padding-left: 2.5rem;
  }
`;

const NoResultsMessage = styled.p`
  font-weight: bold;
  text-align: center;
  margin-top: 1rem;
  background-color: ${Theme.lightRed};
  color: ${Theme.darkRed};
  padding: 0.5rem;
  border-radius: 0.25rem;
`;

const SearchBar = ({placeholder, onSearch, resultsCount, ...props}) => {
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
      {resultsCount === 0 && (
        <NoResultsMessage>{_('No results found.')}</NoResultsMessage>
      )}
    </>
  );
};

SearchBar.propTypes = {
  resultsCount: PropTypes.number.isRequired,
  placeholder: PropTypes.string.isRequired,
  onSearch: PropTypes.func.isRequired,
};

export default SearchBar;
