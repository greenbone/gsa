/* Copyright (C) 2020 Greenbone Networks GmbH
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

import {MAX_HOSTS_PER_PROCESS} from './processmaploader';
const NUMBER_OF_LISTED_HOSTS = 30;

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

const HostsList = styled.div`
  display: flex;
  height: 100%;
  overflow: hidden;
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
  const rest = length % NUMBER_OF_LISTED_HOSTS;
  const allPages = Math.ceil(length / NUMBER_OF_LISTED_HOSTS);
  const currentPage = Math.ceil(first / NUMBER_OF_LISTED_HOSTS);
  const listedItems = currentPage === allPages ? rest : NUMBER_OF_LISTED_HOSTS;

  return listedItems;
};

class ProcessPanel extends React.Component {
  constructor(...args) {
    super(...args);

    const counts = new CollectionCounts({
      first: 1,
    });
    this.state = {
      processDialogVisible: false,
      selectedHosts: [],
      counts,
    };

    this.openProcessDialog = this.openProcessDialog.bind(this);
    this.closeProcessDialog = this.closeProcessDialog.bind(this);
    this.handleAddHosts = this.handleAddHosts.bind(this);
    this.handleSelectedHostsChange = this.handleSelectedHostsChange.bind(this);
    this.handleFirstClick = this.handleFirstClick.bind(this);
    this.handleNextClick = this.handleNextClick.bind(this);
    this.handleLastClick = this.handleLastClick.bind(this);
    this.handlePreviousClick = this.handlePreviousClick.bind(this);
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
      const {hostList = []} = nextProps;
      let {length} = hostList;

      // account for the +1 hosts loaded with hostFilter()
      length =
        hostList.length > MAX_HOSTS_PER_PROCESS
          ? hostList.length - 1
          : hostList.length;

      const newCounts = prevState.counts.clone({
        // use count first of prevElement to be able to remember the page
        first: prevState.counts.first,
        length: getNumListedItems(prevState.counts.first, length),
        filtered: length,
      });

      return {
        counts: newCounts,
      };
    } else if (nextProps.element !== nextProps.prevElement) {
      // if the selected element changes, the counts need to be reset so that
      // the pagination starts at the first element. Otherwise, e.g., navigating
      // to the third page of one element and then changing the element would
      // leed to the new elements hosts being listed from the third page on
      const {hostList = []} = nextProps;

      // account for the +1 hosts loaded with hostFilter()
      const length =
        hostList.length > MAX_HOSTS_PER_PROCESS
          ? hostList.length - 1
          : hostList.length;

      const newCounts = prevState.counts.clone({
        first: 1,
        all: length,
        length: NUMBER_OF_LISTED_HOSTS,
        filtered: length,
        rows: NUMBER_OF_LISTED_HOSTS,
      });

      return {
        ...prevState,
        counts: newCounts,
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
    this.handleFirstClick();
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

  handleFirstClick() {
    const {counts} = this.state;
    const {hostList = []} = this.props;

    counts.first = 1;
    counts.length = getNumListedItems(counts.first, hostList.length);

    if (isDefined(this.props.onInteraction)) {
      this.props.onInteraction();
    }

    this.setState({
      counts,
    });
  }

  handleNextClick() {
    const {counts} = this.state;
    const {hostList = []} = this.props;
    const newFirst = counts.first + NUMBER_OF_LISTED_HOSTS;

    counts.first = newFirst;
    counts.length = getNumListedItems(newFirst, hostList.length);

    if (isDefined(this.props.onInteraction)) {
      this.props.onInteraction();
    }

    this.setState({
      counts,
    });
  }

  handleLastClick() {
    const {counts} = this.state;
    const {hostList = []} = this.props;
    const remainingHosts = hostList.length % NUMBER_OF_LISTED_HOSTS;

    counts.first = hostList.length - remainingHosts + 1;
    counts.length = remainingHosts;

    if (isDefined(this.props.onInteraction)) {
      this.props.onInteraction();
    }

    this.setState({
      counts,
    });
  }

  handlePreviousClick() {
    const {counts} = this.state;
    const newFirst = counts.first - NUMBER_OF_LISTED_HOSTS;

    counts.first = newFirst;

    if (isDefined(this.props.onInteraction)) {
      this.props.onInteraction();
    }

    this.setState({
      counts,
    });
  }

  render() {
    const {
      element = {},
      hostList = [],
      isLoadingHosts,
      onDeleteHost,
      onEditProcessClick,
    } = this.props;

    const {allHosts, counts} = this.state;

    const {name = _('No process selected'), comment} = element;

    let hostItems = [];
    if (isDefined(allHosts)) {
      hostItems = allHosts.map(host => {
        const hName = isDefined(host.hostname) ? host.hostname : '';
        return {label: host.ip + ' ' + hName, value: host.id};
      });
    }

    const sortedHostList = hostList.sort(compareSeverity);

    const paginatedHosts = sortedHostList.slice(counts.first - 1, counts.last);

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
              'The maximum of {{num}} hosts was exceded. If there are more ' +
                'hosts associated with this process, they will not be taken ' +
                'into account.',
              {num: MAX_HOSTS_PER_PROCESS},
            )}
          </MaxHostsWarning>
        )}
        <HostsList>
          {isLoadingHosts ? (
            <Loading />
          ) : (
            <Layout flex="column" grow>
              <HostTable
                hosts={element.type === 'process' ? paginatedHosts : undefined}
                onDeleteHost={onDeleteHost}
              />
              {hostList.length > 0 && (
                <Pagination
                  counts={counts}
                  onNextClick={this.handleNextClick}
                  onPreviousClick={this.handlePreviousClick}
                  onLastClick={this.handleLastClick}
                  onFirstClick={this.handleFirstClick}
                />
              )}
            </Layout>
          )}
        </HostsList>
      </Container>
    );
  }
}

ProcessPanel.propTypes = {
  element: PropTypes.object,
  gmp: PropTypes.gmp.isRequired,
  hostList: PropTypes.array,
  isLoadingHosts: PropTypes.bool,
  onAddHosts: PropTypes.func.isRequired,
  onDeleteHost: PropTypes.func.isRequired,
  onEditProcessClick: PropTypes.func.isRequired,
  onInteraction: PropTypes.func,
};

export default withGmp(ProcessPanel);

// vim: set ts=2 sw=2 tw=80:
