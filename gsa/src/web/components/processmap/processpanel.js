/* Copyright (C) 2020-2021 Greenbone Networks GmbH
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

import React from 'react';
import styled from 'styled-components';

import _ from 'gmp/locale';

import CollectionCounts from 'gmp/collection/collectioncounts';

import {parseSeverity} from 'gmp/parser';

import {isDefined} from 'gmp/utils/identity';

import Button from 'web/components/form/button';
import MultiSelect from 'web/components/form/multiselect';

import EditIcon from 'web/components/icon/editicon';

import Layout from 'web/components/layout/layout';

import Loading from 'web/components/loading/loading';

import Pagination from 'web/components/pagination/pagination';

import PropTypes from 'web/utils/proptypes';

import Theme from 'web/utils/theme';
import withGmp from 'web/utils/withGmp';

import HostTable from './hosttable';
import ResultsTable from './resultstable';

import {MAX_HOSTS_PER_PROCESS} from './processmaploader';
const NUMBER_OF_LISTED_ITEMS = 10;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: absolute;
  left: 70%;
  top: 0;
  width: 30%;
  min-width: 250px;
  height: 100%;
  background-color: ${Theme.white};
  border-left: 2px solid ${Theme.lightGray};
`;

const TitleBox = styled.div`
  display: flex;
  font-size: 16px;
  font-weight: bold;
  justify-content: space-between;
  padding: 20px 20px 10px 20px;
  width: 100%;
`;

const CommentBox = styled.div`
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  padding: 0px 0px 10px 20px;
  min-height: 21px;
`;

const ListsBox = styled(Layout)`
  flex-grow: 1;
  flex-direction: column;
  align-items: stretch;
`;

const HostsList = styled.div`
  display: flex;
  height: 50%;
  align-items: flex-start;
  overflow: auto;
`;

const ResultsList = styled.div`
  display: flex;
  overflow: hidden;
  border-top: 2px solid ${Theme.lightGray};
`;

const MaxHostsWarning = styled.div`
  width: 100%;
  background-color: ${Theme.lightRed};
  padding: 5px;
`;

const compareSeverity = (host1, host2) => {
  // sort by highest to lowest severity
  const sev1 = parseSeverity(host1.severity);
  const sev2 = parseSeverity(host2.severity);
  if (sev1 > sev2) {
    return -1;
  }
  if (sev1 < sev2) {
    return 1;
  }
  return 0;
};

const getNumListedItems = (first, length) => {
  const rest = length % NUMBER_OF_LISTED_ITEMS;
  const allPages = Math.ceil(length / NUMBER_OF_LISTED_ITEMS);
  const currentPage = Math.ceil(first / NUMBER_OF_LISTED_ITEMS);
  const listedItems = currentPage === allPages ? rest : NUMBER_OF_LISTED_ITEMS;

  return listedItems;
};

class ProcessPanel extends React.Component {
  constructor(...args) {
    super(...args);

    const hostsCounts = new CollectionCounts({
      first: 1,
    });
    const resultsCounts = new CollectionCounts({
      first: 1,
    });
    this.state = {
      processDialogVisible: false,
      selectedHosts: [],
      hostsCounts,
      resultsCounts,
    };

    this.openProcessDialog = this.openProcessDialog.bind(this);
    this.closeProcessDialog = this.closeProcessDialog.bind(this);
    this.handleAddHosts = this.handleAddHosts.bind(this);
    this.handleSelectedHostsChange = this.handleSelectedHostsChange.bind(this);
    this.handleFirstHostsClick = this.handleFirstHostsClick.bind(this);
    this.handleNextHostsClick = this.handleNextHostsClick.bind(this);
    this.handleLastHostsClick = this.handleLastHostsClick.bind(this);
    this.handlePreviousHostsClick = this.handlePreviousHostsClick.bind(this);
    this.handleFirstResultsClick = this.handleFirstResultsClick.bind(this);
    this.handleNextResultsClick = this.handleNextResultsClick.bind(this);
    this.handleLastResultsClick = this.handleLastResultsClick.bind(this);
    this.handlePreviousResultsClick = this.handlePreviousResultsClick.bind(
      this,
    );
  }

  // in order to correctly use the pagination in the panel, we need to compare
  // the current element in the panel and the previous element that was selected
  static getDerivedStateFromProps = (nextProps, prevState) => {
    if (!isDefined(nextProps.element)) {
      // if no element will be selected, set current element to undefined
      // -> the panel will not show process information
      return {
        ...prevState,
        element: undefined,
      };
    } else if (
      // if the element does not change compared to the previous one (prevState)
      // or if the prevElement (stored for comparison) is equal to the current
      // element, set the counts according to the given hostList and don't reset
      // pagination
      nextProps.element === prevState.element ||
      nextProps.element === nextProps.prevElement
    ) {
      const {hostList = [], resultList = []} = nextProps;
      let {length} = hostList;

      // account for the +1 hosts loaded with hostFilter()
      length =
        hostList.length > MAX_HOSTS_PER_PROCESS
          ? hostList.length - 1
          : hostList.length;

      const newHostsCounts = prevState.hostsCounts.clone({
        // use count first of prevElement to be able to remember the page
        first: prevState.hostsCounts.first,
        length: getNumListedItems(prevState.hostsCounts.first, length),
        filtered: length,
      });

      const newResultsCounts = prevState.resultsCounts.clone({
        // use count first of prevElement to be able to remember the page
        first: prevState.resultsCounts.first,
        length: getNumListedItems(
          prevState.resultsCounts.first,
          resultList.length,
        ),
        filtered: resultList.length,
      });

      return {
        hostsCounts: newHostsCounts,
        resultsCounts: newResultsCounts,
      };
    } else if (nextProps.element !== nextProps.prevElement) {
      // if the selected element changes, the counts need to be reset so that
      // the pagination starts at the first element. Otherwise, e.g., navigating
      // to the third page of one element and then changing the element would
      // leed to the new elements hosts being listed from the third page on
      const {hostList = [], resultList = []} = nextProps;

      // account for the +1 hosts loaded with hostFilter()
      const length =
        hostList.length > MAX_HOSTS_PER_PROCESS
          ? hostList.length - 1
          : hostList.length;

      const newHostsCounts = prevState.hostsCounts.clone({
        first: 1,
        all: length,
        length: NUMBER_OF_LISTED_ITEMS,
        filtered: length,
        rows: NUMBER_OF_LISTED_ITEMS,
      });

      const newResultsCounts = prevState.resultsCounts.clone({
        first: 1,
        all: resultList.length,
        length: NUMBER_OF_LISTED_ITEMS,
        filtered: resultList.length,
        rows: NUMBER_OF_LISTED_ITEMS,
      });

      return {
        ...prevState,
        hostsCounts: newHostsCounts,
        resultsCounts: newResultsCounts,
        element: nextProps.element,
      };
    }
  };

  componentDidMount() {
    const {gmp} = this.props;
    let allHosts = [];
    gmp.hosts.getAll().then(response => {
      allHosts = response.data;
      this.setState({allHosts});
    });
    this.handleFirstHostsClick();
  }

  openProcessDialog() {
    this.setState({processDialogVisible: true});
  }

  closeProcessDialog() {
    this.setState({processDialogVisible: false});
  }

  handleSelectedHostsChange(value, name) {
    this.setState({[name]: value});
  }

  handleAddHosts(hosts) {
    this.props.onAddHosts(this.state.selectedHosts);
    this.setState({selectedHosts: []});
  }

  handleFirstHostsClick() {
    const {hostsCounts} = this.state;
    const {hostList = []} = this.props;

    hostsCounts.first = 1;
    hostsCounts.length = getNumListedItems(hostsCounts.first, hostList.length);

    if (isDefined(this.props.onInteraction)) {
      this.props.onInteraction();
    }

    this.setState({
      hostsCounts,
    });
  }

  handleFirstResultsClick() {
    const {resultsCounts} = this.state;
    const {resultList = []} = this.props;

    resultsCounts.first = 1;
    resultsCounts.length = getNumListedItems(
      resultsCounts.first,
      resultList.length,
    );

    if (isDefined(this.props.onInteraction)) {
      this.props.onInteraction();
    }

    this.setState({
      resultsCounts,
    });
  }

  handleNextHostsClick() {
    const {hostsCounts} = this.state;
    const {hostList = []} = this.props;
    const newFirst = hostsCounts.first + NUMBER_OF_LISTED_ITEMS;

    hostsCounts.first = newFirst;
    hostsCounts.length = getNumListedItems(newFirst, hostList.length);

    if (isDefined(this.props.onInteraction)) {
      this.props.onInteraction();
    }

    this.setState({
      hostsCounts,
    });
  }

  handleNextResultsClick() {
    const {resultsCounts} = this.state;
    const {resultList = []} = this.props;
    const newFirst = resultsCounts.first + NUMBER_OF_LISTED_ITEMS;

    resultsCounts.first = newFirst;
    resultsCounts.length = getNumListedItems(newFirst, resultList.length);

    if (isDefined(this.props.onInteraction)) {
      this.props.onInteraction();
    }

    this.setState({
      resultsCounts,
    });
  }

  handleLastHostsClick() {
    const {hostsCounts} = this.state;
    const {hostList = []} = this.props;
    const remainingHosts = hostList.length % NUMBER_OF_LISTED_ITEMS;

    hostsCounts.first = hostList.length - remainingHosts + 1;
    hostsCounts.length = remainingHosts;

    if (isDefined(this.props.onInteraction)) {
      this.props.onInteraction();
    }

    this.setState({
      hostsCounts,
    });
  }

  handleLastResultsClick() {
    const {resultsCounts} = this.state;
    const {resultList = []} = this.props;
    const remainingResults = resultList.length % NUMBER_OF_LISTED_ITEMS;

    resultsCounts.first = resultList.length - remainingResults + 1;
    resultsCounts.length = remainingResults;

    if (isDefined(this.props.onInteraction)) {
      this.props.onInteraction();
    }

    this.setState({
      resultsCounts,
    });
  }

  handlePreviousHostsClick(listType) {
    const {hostsCounts} = this.state;
    const newFirst = hostsCounts.first - NUMBER_OF_LISTED_ITEMS;

    hostsCounts.first = newFirst;

    if (isDefined(this.props.onInteraction)) {
      this.props.onInteraction();
    }

    this.setState({
      hostsCounts,
    });
  }

  handlePreviousResultsClick(listType) {
    const {resultsCounts} = this.state;
    const newFirst = resultsCounts.first - NUMBER_OF_LISTED_ITEMS;

    resultsCounts.first = newFirst;

    if (isDefined(this.props.onInteraction)) {
      this.props.onInteraction();
    }

    this.setState({
      resultsCounts,
    });
  }

  render() {
    const {
      element = {},
      hostList = [],
      resultList = [],
      isLoadingHosts,
      onDeleteHost,
      onSelectHost,
      onEditProcessClick,
    } = this.props;

    const {allHosts, hostsCounts, resultsCounts} = this.state;

    const {name = _('No process selected'), comment} = element;

    let hostItems = [];
    if (isDefined(allHosts)) {
      hostItems = allHosts.map(host => {
        const hName = isDefined(host.hostname) ? host.hostname : '';
        return {label: host.ip + ' ' + hName, value: host.id};
      });
    }

    const sortedHostList = hostList.sort(compareSeverity);
    const sortedResultList = resultList.sort(compareSeverity);
    const paginatedHosts = sortedHostList.slice(
      hostsCounts.first - 1,
      hostsCounts.last,
    );
    const paginatedResults = sortedResultList.slice(
      resultsCounts.first - 1,
      resultsCounts.last,
    );

    return (
      <Container>
        <TitleBox>
          {name}
          <EditIcon
            title={_('Edit process')}
            disabled={element.type !== 'process'}
            onClick={onEditProcessClick}
          />
        </TitleBox>
        <CommentBox>{comment}</CommentBox>
        <MultiSelect
          disabled={element.type !== 'process'}
          name="selectedHosts"
          width="100%"
          items={hostItems}
          value={this.state.selectedHosts}
          onChange={this.handleSelectedHostsChange}
        />
        <Button
          title={_('Add Selected Hosts')}
          disabled={element.type !== 'process'}
          onClick={this.handleAddHosts}
        />
        {hostList.length > MAX_HOSTS_PER_PROCESS && (
          <MaxHostsWarning>
            {_(
              'The maximum of {{num}} hosts was exceeded. If there are more ' +
                'hosts associated with this process, they will not be taken ' +
                'into account.',
              {num: MAX_HOSTS_PER_PROCESS},
            )}
          </MaxHostsWarning>
        )}
        <ListsBox>
          <HostsList>
            {isLoadingHosts ? (
              <Loading />
            ) : (
              <Layout flex="column" grow>
                <HostTable
                  hosts={
                    element.type === 'process' ? paginatedHosts : undefined
                  }
                  onDeleteHost={onDeleteHost}
                  onSelectHost={onSelectHost}
                />
                {hostList.length > 0 && (
                  <Pagination
                    counts={hostsCounts}
                    onNextClick={this.handleNextHostsClick}
                    onPreviousClick={this.handlePreviousHostsClick}
                    onLastClick={this.handleLastHostsClick}
                    onFirstClick={this.handleFirstHostsClick}
                  />
                )}
              </Layout>
            )}
          </HostsList>
          <ResultsList>
            <Layout flex="column" grow>
              <ResultsTable results={paginatedResults} />
              {resultList.length > 0 && (
                <Pagination
                  counts={resultsCounts}
                  onNextClick={this.handleNextResultsClick}
                  onPreviousClick={this.handlePreviousResultsClick}
                  onLastClick={this.handleLastResultsClick}
                  onFirstClick={this.handleFirstResultsClick}
                />
              )}
            </Layout>
          </ResultsList>
        </ListsBox>
      </Container>
    );
  }
}

ProcessPanel.propTypes = {
  element: PropTypes.object,
  gmp: PropTypes.gmp.isRequired,
  hostList: PropTypes.array,
  isLoadingHosts: PropTypes.bool,
  prevElement: PropTypes.object,
  resultList: PropTypes.array,
  onAddHosts: PropTypes.func.isRequired,
  onDeleteHost: PropTypes.func.isRequired,
  onEditProcessClick: PropTypes.func.isRequired,
  onInteraction: PropTypes.func,
  onSelectHost: PropTypes.func.isRequired,
};

export default withGmp(ProcessPanel);

// vim: set ts=2 sw=2 tw=80:
