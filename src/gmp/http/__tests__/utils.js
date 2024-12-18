/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {FeedStatus} from 'gmp/commands/feedstatus';
import {createResponse, createHttp} from 'gmp/commands/testing';
import {
  getFeedAccessStatusMessage,
  findActionInXMLString,
} from 'gmp/http/utils';

describe('Http', () => {
  describe('getFeedAccessStatusMessage', () => {
    const setupTest = async (feedOwnerSet, feedResourcesAccess) => {
      const response = createResponse({
        get_feeds: {
          get_feeds_response: {
            feed_owner_set: feedOwnerSet,
            feed_resources_access: feedResourcesAccess,
          },
        },
      });
      const fakeHttp = createHttp(response);
      const feedCmd = new FeedStatus(fakeHttp);
      await feedCmd.checkFeedOwnerAndPermissions();
      return getFeedAccessStatusMessage(fakeHttp);
    };

    test.each([
      [
        0,
        1,
        'The feed owner is currently not set. This issue may be due to the feed not having completed its synchronization.\nPlease try again shortly.',
      ],
      [
        1,
        0,
        'Access to the feed resources is currently restricted. This issue may be due to the feed not having completed its synchronization.\nPlease try again shortly.',
      ],
      [1, 1, ''],
    ])(
      'should return correct message for feedOwnerSet: %i, feedResourcesAccess: %i',
      async (feedOwnerSet, feedResourcesAccess, expectedMessage) => {
        const message = await setupTest(feedOwnerSet, feedResourcesAccess);
        expect(message).toBe(expectedMessage);
      },
    );
  });

  describe('findActionInXMLString', () => {
    test.each([
      {
        description:
          'should return true if an action is found in the XML string',
        xmlString: `
          <response>
            <action>Run Wizard</action>
          </response>
        `,
        actions: ['Run Wizard', 'Create Task', 'Save Task'],
        expected: true,
      },
      {
        description:
          'should return false if no action is found in the XML string',
        xmlString: `
          <response>
            <action>Delete Task</action>
          </response>
        `,
        actions: ['Run Wizard', 'Create Task', 'Save Task'],
        expected: false,
      },
      {
        description: 'should return false if the XML string is empty',
        xmlString: '',
        actions: ['Run Wizard', 'Create Task', 'Save Task'],
        expected: false,
      },
      {
        description: 'should return false if the actions array is empty',
        xmlString: `
          <response>
            <action>Run Wizard</action>
          </response>
        `,
        actions: [],
        expected: false,
      },
    ])('$description', ({xmlString, actions, expected}) => {
      expect(findActionInXMLString(xmlString, actions)).toBe(expected);
    });
  });
});
