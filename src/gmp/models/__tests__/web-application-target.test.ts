/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {testModel} from 'gmp/models/testing';
import WebApplicationTarget from 'gmp/models/web-application-target';
import {YES_VALUE, NO_VALUE} from 'gmp/parser';

describe('WebApplicationTarget model tests', () => {
  testModel(WebApplicationTarget, 'webapplicationtarget');

  test('should use defaults', () => {
    const target = new WebApplicationTarget();
    expect(target.id).toBeUndefined();
    expect(target.name).toBeUndefined();
    expect(target.comment).toBeUndefined();
    expect(target.urls).toEqual([]);
    expect(target.excludeUrls).toEqual([]);
    expect(target.credential).toBeUndefined();
    expect(target.reverseLookupOnly).toBe(false);
    expect(target.reverseLookupUnify).toBe(false);
  });

  test('should parse defaults', () => {
    const target = WebApplicationTarget.fromElement({});
    expect(target.id).toBeUndefined();
    expect(target.name).toBeUndefined();
    expect(target.comment).toBeUndefined();
    expect(target.urls).toEqual([]);
    expect(target.excludeUrls).toEqual([]);
    expect(target.credential).toBeUndefined();
    expect(target.reverseLookupOnly).toBe(false);
    expect(target.reverseLookupUnify).toBe(false);
  });

  test('should parse target_url as array of urls', () => {
    const target = WebApplicationTarget.fromElement({
      urls: 'https://example.com,https://test.com',
    });
    expect(target.urls).toEqual(['https://example.com', 'https://test.com']);
  });

  test('should parse single target_url', () => {
    const target = WebApplicationTarget.fromElement({
      urls: 'https://example.com',
    });
    expect(target.urls).toEqual(['https://example.com']);
  });

  test('should expose backward-compatible url getter', () => {
    const target = WebApplicationTarget.fromElement({
      urls: 'https://example.com,https://test.com',
    });
    expect(target.url).toEqual('https://example.com');
  });

  test('should return empty string from url getter when urls is empty', () => {
    const target = WebApplicationTarget.fromElement({});
    expect(target.url).toEqual('');
  });

  test('should parse exclude_url as array', () => {
    const target = WebApplicationTarget.fromElement({
      exclude_urls: 'https://exclude1.com,https://exclude2.com',
    });
    expect(target.excludeUrls).toEqual([
      'https://exclude1.com',
      'https://exclude2.com',
    ]);
  });

  test('should parse credential', () => {
    const credential = {_id: 'cred-1', name: 'Credential1'};
    const target = WebApplicationTarget.fromElement({credential});
    expect(target.credential).toBeDefined();
    expect(target.credential?.id).toEqual('cred-1');
    expect(target.credential?.name).toEqual('Credential1');
  });

  test('should ignore empty credential', () => {
    const target = WebApplicationTarget.fromElement({
      credential: {_id: ''},
    });
    expect(target.credential).toBeUndefined();
  });

  test('should parse reverseLookupOnly', () => {
    const targetTrue = WebApplicationTarget.fromElement({
      reverse_lookup_only: YES_VALUE,
    });
    expect(targetTrue.reverseLookupOnly).toEqual(true);
    const targetFalse = WebApplicationTarget.fromElement({
      reverse_lookup_only: NO_VALUE,
    });
    expect(targetFalse.reverseLookupOnly).toEqual(false);
  });

  test('should parse reverseLookupUnify', () => {
    const targetTrue = WebApplicationTarget.fromElement({
      reverse_lookup_unify: YES_VALUE,
    });
    expect(targetTrue.reverseLookupUnify).toEqual(true);
    const targetFalse = WebApplicationTarget.fromElement({
      reverse_lookup_unify: NO_VALUE,
    });
    expect(targetFalse.reverseLookupUnify).toEqual(false);
  });

  test('should parse all fields together', () => {
    const target = WebApplicationTarget.fromElement({
      urls: 'https://a.com,https://b.com',
      exclude_urls: 'https://ex.com',
      credential: {_id: 'cred-2', name: 'Cred2'},
      reverse_lookup_only: YES_VALUE,
      reverse_lookup_unify: NO_VALUE,
    });
    expect(target.urls).toEqual(['https://a.com', 'https://b.com']);
    expect(target.url).toEqual('https://a.com');
    expect(target.excludeUrls).toEqual(['https://ex.com']);
    expect(target.credential?.id).toEqual('cred-2');
    expect(target.credential?.name).toEqual('Cred2');
    expect(target.reverseLookupOnly).toEqual(true);
    expect(target.reverseLookupUnify).toEqual(false);
  });
});
