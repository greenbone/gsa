/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// Minimal fake PEM and feed-key strings for use in unit tests.
// These are NOT real keys and are intended for tests only.

export const fakePem = `-----BEGIN RSA PRIVATE KEY-----
MIIFakeAIBAAKCAQEA7u1xZkZGI9mNqLl0Q0lqv6sQbXw0dQw6x0QGQ1bVqYtQFJ
bE9mYXNrc2FtcGxlZmlsbGluZXN3aXRoYmFzZTY0cGF0dGVybm9uZWFjdHVhbA
dGVzdGZha2Vjb250ZW50MTIzNDU2Nw==
-----END RSA PRIVATE KEY-----
`;

export const fakeFeedKeyPlain = `testuser@feed.greenbone.net:/feed/
${fakePem}`;

export default {fakePem, fakeFeedKeyPlain};
