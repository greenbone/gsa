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

import React, {useEffect, useState} from 'react';

import {useSelector, useDispatch} from 'react-redux';

import {_} from 'gmp/locale/lang';

import Filter from 'gmp/models/filter';

import {isDefined} from 'gmp/utils/identity';

import Loading from 'web/components/loading/loading';
import ConfirmationDialog from 'web/components/dialog/confirmationdialog';

import {
  loadEntities as loadHosts,
  selector as hostSelector,
} from 'web/store/entities/hosts';

import PropTypes from 'web/utils/proptypes';

import useGmp from 'web/utils/useGmp';

import {loadBusinessProcessMaps} from 'web/store/businessprocessmaps/actions';

import useColorize from './usecolorize';

export const MAX_HOSTS_PER_PROCESS = 100;

export const hostsFilter = id =>
  Filter.fromString(
    'tag_id=' + id + ' first=1 rows=' + (MAX_HOSTS_PER_PROCESS + 1),
  );

const createDialogContent = failedTags => {
  return (
    <span>
      <div>
        {_(
          'While loading the processes one or more corresponding tag(s) ' +
            'could not be found. Try reloading the map. If that does not help ' +
            'check the trashcan for those tags. If the tags are not there, ' +
            'affected processes need to be re-created by hand.',
        )}
      </div>
      <br />
      <div>
        {_('Affected processes:')}
        <br />
        {failedTags.map((tag, index) => {
          return (
            <span key={index}>
              {_('Process: "{{name}}", tag ID: {{tagId}}', {
                name: tag.processName,
                tagId: tag.tagId,
              })}
              <br />
            </span>
          );
        })}
      </div>
    </span>
  );
};

const ProcessMapsLoader = ({children, mapId = '1'}) => {
  // TODO '1' is an ID that needs to be dynamically changed when >1 maps are
  // loaded and must be replaced by a uuid. The dashboard display needs to know
  // via dashboard settings, which map it has to render

  const dispatch = useDispatch();
  const gmp = useGmp();

  const [
    applyConditionalColorization,
    setApplyConditionalColorization,
  ] = useState(true);
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const [dialogShownOnce, setDialogShownOnce] = useState(false);
  const [failedTags, setFailedTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedElement, setSelectedElement] = useState({});
  const [update, setUpdate] = useState(false);

  // get map from store
  const processMap = useSelector(state => {
    return isDefined(state.businessProcessMaps[mapId])
      ? state.businessProcessMaps[mapId]
      : {};
  });

  // load map if processMap is empty
  useEffect(() => {
    if (Object.entries(processMap).length === 0) {
      dispatch(loadBusinessProcessMaps(gmp)());
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // used to prevent infinite reloads and deal with an empty usersetting
  // no dep-array or a non-empty one will not prevent reloads

  // currently used to force an update when new hosts are added
  const forceUpdate = () => setUpdate(!update);

  // keep track of currently selected element
  const handleSelectElement = selEl => {
    return setSelectedElement(selEl);
  };

  // create a filter for each individual tagId used to load all hosts associated
  // to a specific process
  const hostFilter = hostsFilter(selectedElement.tagId);

  // loop through all processes and load their associated hosts via individual
  // host filters
  useEffect(() => {
    const processMapsTemp = isDefined(processMap) ? processMap : {};
    let tempHostFilter;
    const tmpFailedTags = [];
    for (const proc in processMapsTemp.processes) {
      const {tagId, name} = processMapsTemp.processes[proc];
      // check whether a tag with tagId exists prior to loading hosts
      /* eslint-disable handle-callback-err */
      gmp.tag.get({id: tagId}).catch(err => {
        /* eslint-enable */
        tmpFailedTags.push({processName: name, tagId});
      });
      tempHostFilter = hostsFilter(tagId);
      dispatch(loadHosts(gmp)(tempHostFilter));
      setFailedTags(tmpFailedTags);
    }
  }, [processMap, update, dispatch, gmp]);

  // in combination with the next useEffect(), this will update the map once
  // it is loaded to apply the correct colorization
  const isLoadingHosts = useSelector(rootState => {
    const hostSel = hostSelector(rootState);
    return hostSel.isLoadingAnyEntities();
  });
  useEffect(() => {
    setIsLoading(false);
  }, [isLoadingHosts]);

  const handleToggleConditionalColorization = () => {
    setApplyConditionalColorization(!applyConditionalColorization);
  };

  const coloredProcessMap = useColorize(
    processMap,
    applyConditionalColorization,
  );

  // use to show dialog, if there are processes without an existing tag
  useEffect(() => {
    if (failedTags.length > 0 && !isLoading && !dialogShownOnce) {
      setConfirmDialogVisible(true);
    }
  }, [failedTags.length, isLoading, dialogShownOnce]);

  return (
    <React.Fragment>
      {isLoading ? (
        <Loading />
      ) : (
        children({
          applyConditionalColorization,
          hostFilter,
          isLoading,
          mapId,
          processMaps: coloredProcessMap,
          forceUpdate,
          onSelectElement: handleSelectElement,
          onToggleConditionalColorization: handleToggleConditionalColorization,
        })
      )}
      {confirmDialogVisible && (
        <ConfirmationDialog
          content={createDialogContent(failedTags)}
          title={_('Error Loading Processes')}
          width="700px"
          onClose={() => {
            setConfirmDialogVisible(false);
            setDialogShownOnce(true);
          }}
          onResumeClick={() => {
            setConfirmDialogVisible(false);
            setDialogShownOnce(true);
          }}
        />
      )}
    </React.Fragment>
  );
};

ProcessMapsLoader.propTypes = {
  mapId: PropTypes.string, // TODO change this to uuid
};

export default ProcessMapsLoader;
