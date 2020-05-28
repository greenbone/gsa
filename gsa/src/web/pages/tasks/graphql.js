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
import gql from 'graphql-tag';

import {useMutation, useQuery, useLazyQuery} from '@apollo/react-hooks';

import {toGraphQL, toFruitfulQuery} from 'web/utils/graphql';

export const GET_TASK = gql`
  query Task($id: UUID!) {
    task(id: $id) {
      name
      id
      creationTime
      modificationTime
      permissions {
        name
      }
      reports {
        lastReport {
          id
          severity
          timestamp
          scanStart
          scanEnd
        }
        currentReport {
          id
          scanStart
        }
        counts {
          total
          finished
        }
      }
      results {
        counts {
          current
        }
      }
      status
      target {
        name
        id
      }
      trend
      alterable
      comment
      owner
      preferences {
        name
        value
        description
      }
      schedule {
        name
        id
        icalendar
        timezone
        duration
      }
      alerts {
        name
        id
      }
      scanConfig {
        id
        name
        trash
        type
      }
      scanner {
        id
        name
        type
      }
      schedulePeriods
      hostsOrdering
      userTags {
        count
        tags {
          name
          id
          value
          comment
        }
      }
      observers {
        users
        roles {
          name
        }
        groups {
          name
        }
      }
    }
  }
`;

export const useGetTask = () => {
  return toFruitfulQuery(useQuery)(GET_TASK);
};

export const GET_TASKS = gql`
  query Task($filterString: String) {
    tasks(filterString: $filterString) {
      edges {
        node {
          name
          id
          permissions {
            name
          }
          reports {
            lastReport {
              id
              severity
              timestamp
            }
            counts {
              total
              finished
            }
          }
          status
          target {
            name
            id
          }
          trend
          alterable
          comment
          owner
          preferences {
            name
            value
            description
          }
          schedule {
            name
            id
            icalendar
            timezone
            duration
          }
          alerts {
            name
            id
          }
          scanConfig {
            id
            name
            trash
          }
          scanner {
            id
            name
            type
          }
          hostsOrdering
          observers {
            users
            roles {
              name
            }
            groups {
              name
            }
          }
        }
      }
      counts {
        total
        filtered
        offset
        limit
        length
      }
    }
  }
`;

export const useGetTasks = () => {
  return toFruitfulQuery(useQuery)(GET_TASKS);
};

export const LAZY_GET_TASKS = gql`
  query Task($filterString: String) {
    tasks(filterString: $filterString) {
      edges {
        node {
          name
          id
        }
      }
      counts {
        total
        filtered
        offset
        limit
        length
      }
    }
  }
`;

export const useLazyGetTasks = () => {
  return toFruitfulQuery(useLazyQuery)(LAZY_GET_TASKS);
};

export const CLONE_TASK = gql`
  mutation cloneTask($id: UUID!) {
    cloneTask(id: $id) {
      id
    }
  }
`;

export const useCloneTask = () => {
  const [cloneTask] = useMutation(CLONE_TASK);
  return toGraphQL(cloneTask);
};

export const DELETE_TASK = gql`
  mutation deleteTask($id: UUID!) {
    deleteTask(id: $id) {
      ok
    }
  }
`;

export const useDeleteTask = () => {
  const [deleteTask] = useMutation(DELETE_TASK);
  return toGraphQL(deleteTask);
};

export const START_TASK = gql`
  mutation startTask($id: UUID!) {
    startTask(id: $id) {
      reportId
    }
  }
`;

export const useStartTask = () => {
  const [startTask] = useMutation(START_TASK);
  return toGraphQL(startTask);
};

export const GET_SCANNERS = gql`
  query Scanner($filterString: String) {
    scanners(filterString: $filterString) {
      nodes {
        name
        type
        id
      }
    }
  }
`;

export const useGetScanners = () => {
  return toFruitfulQuery(useLazyQuery)(GET_SCANNERS);
};

export const GET_SCAN_CONFIGS = gql`
  query ScanConfigs($filterString: String) {
    scanConfigs(filterString: $filterString) {
      nodes {
        name
        type
        id
      }
    }
  }
`;

export const useGetScanConfigs = () => {
  return toFruitfulQuery(useLazyQuery)(GET_SCAN_CONFIGS);
};

export const GET_TARGETS = gql`
  query Targets($filterString: String) {
    targets(filterString: $filterString) {
      nodes {
        name
        id
      }
    }
  }
`;

export const useGetTargets = () => {
  return toFruitfulQuery(useLazyQuery)(GET_TARGETS);
};
