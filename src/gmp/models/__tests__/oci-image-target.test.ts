/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import OciImageTarget from 'gmp/models/oci-image-target';
import {testModel} from 'gmp/models/testing';
import {YES_VALUE, NO_VALUE} from 'gmp/parser';

describe('OciImageTarget model tests', () => {
  testModel(OciImageTarget, 'ociimagetarget');

  test('should use defaults', () => {
    const target = new OciImageTarget();
    expect(target.id).toBeUndefined();
    expect(target.name).toBeUndefined();
    expect(target.comment).toBeUndefined();
    expect(target.imageReferences).toEqual([]);
    expect(target.credential).toBeUndefined();
    expect(target.reverseLookupOnly).toBe(false);
    expect(target.reverseLookupUnify).toBe(false);
  });

  test('should parse defaults', () => {
    const target = OciImageTarget.fromElement({});
    expect(target.id).toBeUndefined();
    expect(target.name).toBeUndefined();
    expect(target.comment).toBeUndefined();
    expect(target.imageReferences).toEqual([]);
    expect(target.credential).toBeUndefined();
    expect(target.reverseLookupOnly).toBe(false);
    expect(target.reverseLookupUnify).toBe(false);
  });

  test('should parse imageReferences', () => {
    const target = OciImageTarget.fromElement({image_references: 'img1,img2'});
    expect(target.imageReferences).toEqual(['img1', 'img2']);
  });

  test('should parse credential', () => {
    const credential = {_id: 'cred-1', name: 'Credential1'};
    const target = OciImageTarget.fromElement({credential});
    expect(target.credential).toBeDefined();
    expect(target.credential?.id).toEqual('cred-1');
    expect(target.credential?.name).toEqual('Credential1');
  });

  test('should ignore empty credential', () => {
    const target = OciImageTarget.fromElement({credential: {_id: ''}});
    expect(target.credential).toBeUndefined();
  });

  test('should parse reverseLookupOnly', () => {
    const targetTrue = OciImageTarget.fromElement({
      reverse_lookup_only: YES_VALUE,
    });
    expect(targetTrue.reverseLookupOnly).toEqual(true);
    const targetFalse = OciImageTarget.fromElement({
      reverse_lookup_only: NO_VALUE,
    });
    expect(targetFalse.reverseLookupOnly).toEqual(false);
  });

  test('should parse reverseLookupUnify', () => {
    const targetTrue = OciImageTarget.fromElement({
      reverse_lookup_unify: YES_VALUE,
    });
    expect(targetTrue.reverseLookupUnify).toEqual(true);
    const targetFalse = OciImageTarget.fromElement({
      reverse_lookup_unify: NO_VALUE,
    });
    expect(targetFalse.reverseLookupUnify).toEqual(false);
  });

  test('should parse all fields together', () => {
    const target = OciImageTarget.fromElement({
      image_references: 'imgA,imgB',
      credential: {_id: 'cred-2', name: 'Cred2'},
      reverse_lookup_only: YES_VALUE,
      reverse_lookup_unify: NO_VALUE,
    });
    expect(target.imageReferences).toEqual(['imgA', 'imgB']);
    expect(target.credential?.id).toEqual('cred-2');
    expect(target.credential?.name).toEqual('Cred2');
    expect(target.reverseLookupOnly).toEqual(true);
    expect(target.reverseLookupUnify).toEqual(false);
  });
});
