# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [20.8.3] (unreleased)

### Added
### Changed
### Deprecated
### Removed
### Fixed

 [Unreleased]: https://github.com/greenbone/gsa/compare/v20.8.2...gsa-20.08

## [20.8.2] - 2021-06-25

### Added
- Show type of xrefs in NVT details [#2980](https://github.com/greenbone/gsa/pull/2980)
- Set SameSite=strict for the session cookie to avoid CSRF [#2948](https://github.com/greenbone/gsa/pull/2948)

### Changed
- Properly space and linebreak roles and groups in users table row [#2949](https://github.com/greenbone/gsa/pull/2949)
- Make HorizontalSep component wrappable [#2949](https://github.com/greenbone/gsa/pull/2949)
- Use greenbone sensor as default scanner type when opening the dialog if available [#2867](https://github.com/greenbone/gsa/pull/2867)

### Fixed
- Initialize severity value with 0 in powerfilter SeverityValuesGroup [#3031](https://github.com/greenbone/gsa/pull/3031)
- Removed a CMake dependency in the CMakeLists, so GSA can be build again. [#3030](https://github.com/greenbone/gsa/pull/3030)
- Fixed setting whether to include related resources for new permissions [#2931](https://github.com/greenbone/gsa/pull/2891)
- Fixed setting secret key in RADIUS dialog, backport from [#2891](https://github.com/greenbone/gsa/pull/2891), [#2915](https://github.com/greenbone/gsa/pull/2915)

### Removed

[20.8.2]: https://github.com/greenbone/gsa/compare/v20.8.1...v20.8.2

## [20.8.1] - 2021-02-02

### Added
- Added icon to host detailspage to link to TLS certificates [#2624](https://github.com/greenbone/gsa/pull/2624)
- Added form validation for user setting "rows per page"
  [#2478](https://github.com/greenbone/gsa/pull/2478), [#2505](https://github.com/greenbone/gsa/pull/2505)
- Added option for "Start Task" event upon "New SecInfo arrived" condition in alerts dialog [#2418](https://github.com/greenbone/gsa/pull/2418)

### Changed
- Ensure superadmins can edit themselves [#2633](https://github.com/greenbone/gsa/pull/2633)
- Disable clone icon for superadmins [#2634](https://github.com/greenbone/gsa/pull/2634)
- Allow äüöÄÜÖß in form validation rule for "name" [#2586](https://github.com/greenbone/gsa/pull/2586)
- Show "Filter x matches at least y results" condition to task events in alert dialog [#2580](https://github.com/greenbone/gsa/pull/2580)
- Always send sort=name with delta report request filters [#2570](https://github.com/greenbone/gsa/pull/2570)
- Changed trash icon to delete icon on host detailspage [#2565](https://github.com/greenbone/gsa/pull/2565)
- Change tooltip of override icon in result details [#2467](https://github.com/greenbone/gsa/pull/2467)
- For edit config/policy dialog, only send name and comment if config or policy is in use, and add in use notification [#2463](https://github.com/greenbone/gsa/pull/2463)
- Changed visual appearance of compliance status bar [#2457](https://github.com/greenbone/gsa/pull/2457)
- Changed delete icons on report format detailspage and schedule detailspage to trashcan icons [#2459](https://github.com/greenbone/gsa/pull/2459)
- Use <predefined> to disable feed object editing and filter creation on feed status page [#2398](https://github.com/greenbone/gsa/pull/2398)
- Allow underscores and hyphens in host parameters [#2846](https://github.com/greenbone/gsa/pull/#2846)

### Fixed
- Fix default port value for scanner dialog [#2773](https://github.com/greenbone/gsa/pull/2773)
- Stop growing of toolbars which only have the help icon [#2641](https://github.com/greenbone/gsa/pull/2641)
- Fixed initial value of dropdown for including related resources for permissions [#2632](https://github.com/greenbone/gsa/pull/2632)
- Fixed compiling gsad with libmicrohttp 0.9.71 and later [#2625](https://github.com/greenbone/gsa/pull/2625)
- Fixed display of alert condition "Severity changed" [#2623](https://github.com/greenbone/gsa/pull/2623)
- Fixed sanity check for port ranges [#2566](https://github.com/greenbone/gsa/pull/2566)
- Allow to delete processes without having had edges in BPM [#2507](https://github.com/greenbone/gsa/pull/2507)
- Fixed TLS certificate download for users with permissions [#2496](https://github.com/greenbone/gsa/pull/2496)
- Fixed form validation error tooltips [#2478](https://github.com/greenbone/gsa/pull/2478)
- Only show schedule options in advanced and modify task wizard if user has correct permissions [#2472](https://github.com/greenbone/gsa/pull/2472)
- Replace deprecated sys_siglist with strsignal [#2513](https://github.com/greenbone/gsa/pull/2513)

### Removed
- Remove secinfo filter from user settings dialog and elsewhere [#2495](https://github.com/greenbone/gsa/pull/2495)
- Removed export/download for report formats [#2427](https://github.com/greenbone/gsa/pull/2427)

[20.8.1]: https://github.com/greenbone/gsa/compare/v20.8.0...v20.8.1

## [20.8.0] - 2020-08-11

### Added
- Added reload timer to feedstatuspage and displaying when updating is in progress [#2350](https://github.com/greenbone/gsa/pull/2350)
- Added filtered links to GVMD_DATA row in feed status page [#2339](https://github.com/greenbone/gsa/pull/2339)
- Added loading indicator for CVEs on CPE detailspage [#2248](https://github.com/greenbone/gsa/pull/2248)
- Added new form validation feature, implemented on create and edit ticket dialog [#1782](https://github.com/greenbone/gsa/pull/1782)
- Added German translation for About page [#1998](https://github.com/greenbone/gsa/pull/1998)
- Added a renew session timeout icon to usermenu [#1966](https://github.com/greenbone/gsa/pull/1966)
- Added new BPM feature [#1931](https://github.com/greenbone/gsa/pull/1931) [#2018](https://github.com/greenbone/gsa/pull/2018) [#2025](https://github.com/greenbone/gsa/pull/2025) [#2099](https://github.com/greenbone/gsa/pull/2099)  [#2129](https://github.com/greenbone/gsa/pull/2129) [#2196](https://github.com/greenbone/gsa/pull/2196)
- Added clean-up-translations script [#1948](https://github.com/greenbone/gsa/pull/1948)
- Added handling possible undefined trash in case of an error on the trashcanpage [#1908](https://github.com/greenbone/gsa/pull/1908)
- Added translation using babel-plugin-i18next-extract [#1808](https://github.com/greenbone/gsa/pull/1808)
- Multistep dialog feature, implemented on scanner dialog [#1725](https://github.com/greenbone/gsa/pull/1725)
- Added handling of queued task status [#2208](https://github.com/greenbone/gsa/pull/2208)

### Changed
- Increase age for feed being too old [#2394](https://github.com/greenbone/gsa/pull/2394)
- Do not use result filter from store on report detailspage by default [#2358](https://github.com/greenbone/gsa/pull/2358)
- Improve performance of form fields in edit scan config dialog [#2354](https://github.com/greenbone/gsa/pull/2354)
- Default to sorting nvts by "Created", newest first [#2352](https://github.com/greenbone/gsa/pull/2352)
- Disable EditIcons for data objects from feed [#2346](https://github.com/greenbone/gsa/pull/2346)
- Improve error 503 message at login [#2310](https://github.com/greenbone/gsa/pull/2310)
- Use unified solution type instead of solution type nvt tag [#2268](https://github.com/greenbone/gsa/pull/2268)
- Changed queued status color [#2227](https://github.com/greenbone/gsa/pull/2227)
- Make several NVT families selectable as a whole only in scan configs [#2222](https://github.com/greenbone/gsa/pull/2222)
- Changed future release version from 20.04 to 20.08 [#2118](https://github.com/greenbone/gsa/pull/2118)
- Adjusted task icons to use them for both tasks and audits and removed audit icons [#2070](https://github.com/greenbone/gsa/pull/2070)
- Don't use DetailsLink in ClosedCvesTable if host does not have an ID [#2055](ttps://github.com/greenbone/gsa/pull/2055)
- Changed NOTES_DASHBOARD_ID to fit [gvmd/#1018](https://github.com/greenbone/gvmd/pull/1018) [#2053](https://github.com/greenbone/gsa/pull/2053)
- Change license to AGPL-3.0-or-later [#2027](https://github.com/greenbone/gsa/pull/2027)
- Moved mockprocessmap to separate file to keep tests from running multiple times [#2008](https://github.com/greenbone/gsa/pull/2008)
- Updated German translation according to the changes made in gsa8 and gsa9 [#2007](https://github.com/greenbone/gsa/pull/2007)
- Changed image, text, and layout of About page [#1993](https://github.com/greenbone/gsa/pull/1993)[#1996](https://github.com/greenbone/gsa/pull/1996)[#1998](https://github.com/greenbone/gsa/pull/1998)
- Adjusted multiselect and report listpage to use getDerivedStateFromProps instead of deprecated componentWillReceiveProps [#1935](https://github.com/greenbone/gsa/pull/1935)
- Updated react-beautiful-dnd to version 12.2.0 and fix dragging into empty row [#1837](https://github.com/greenbone/gsa/pull/1837)
- Deleting a single entity now removes its ID from store [#1839](https://github.com/greenbone/gsa/pull/1839)

### Fixed
- Fixed formatting of Detection Method in Results [#2793](https://github.com/greenbone/gsa/pull/2793)
- Fixed empty subsections on oval def details page [#2396](https://github.com/greenbone/gsa/pull/2396)
- Fixed missing NVT solution [#2388](https://github.com/greenbone/gsa/pull/2388)
- EmptyResultsReport uses the same counts as the results tab title in normal reports, when filtering for nonexistent results
  [#2335](https://github.com/greenbone/gsa/pull/2335), [#2365](https://github.com/greenbone/gsa/pull/2365)
- Show proper error message on report detailspage when no report format is available [#2367](https://github.com/greenbone/gsa/pull/2367)
- Don't use stored result list page filter at report results tab [#2366](https://github.com/greenbone/gsa/pull/2366)
- Fixed pagination of report results [#2365](https://github.com/greenbone/gsa/pull/2365)
- Fixed flickering reports [#2359](https://github.com/greenbone/gsa/pull/2359)
- Fixed "Hosts scanned" in report details disappearing during page refresh [#2357](https://github.com/greenbone/gsa/pull/2357)
- Fixed schedule_periods not forwarded if there is no schedule [#2331](https://github.com/greenbone/gsa/pull/2331)
- Fixed broken radio buttons in alert dialog [#2326](https://github.com/greenbone/gsa/pull/2326)
- Fixed report formats undeletable and unrestorable [#2321](https://github.com/greenbone/gsa/pull/2321)
- Fixed loading delta report detailspage [#2320](https://github.com/greenbone/gsa/pull/2320)
- Fixed spacing between radio buttons and input field in override dialog [#2286](https://github.com/greenbone/gsa/pull/2286)
- Fixed separating hosts in override dialog via comma [#2280](https://github.com/greenbone/gsa/pull/2280)
- Fixed installing the json translation files [#2272](https://github.com/greenbone/gsa/pull/2272)
- Fixed displaying asset host identifiers references [#2260](https://github.com/greenbone/gsa/pull/2260)
- Fixed sort order for recurring days for custom monthly schedule [#2188](https://github.com/greenbone/gsa/pull/2188)
- Fixed missing loading indicator for test alert button [#2156](https://github.com/greenbone/gsa/pull/2156)
- Close dialog for ExternalLink when following link [#2148](https://github.com/greenbone/gsa/pull/2148)
- Fixed license information on AboutPage [#2118](https://github.com/greenbone/gsa/pull/2118) [#2148](https://github.com/greenbone/gsa/pull/2148)
- Fixed state updates on unmounted SvgIcons [#2063](https://github.com/greenbone/gsa/pull/2063)
- Fixed parsing xml rejection messages [#1970](https://github.com/greenbone/gsa/pull/1970)
- Fixed returning bulk_delete response [#1969](https://github.com/greenbone/gsa/pull/1969)
- Fixed parsing DFN-Cert CVE entries [#1965](https://github.com/greenbone/gsa/pull/1965)
- Fixed credential_login in gsad request handlers [#2347](https://github.com/greenbone/gsa/pull/2347)

### Removed
- Remove multistep feature from scanner dialog [#2337](https://github.com/greenbone/gsa/pull/2337)
- Removed predefined status for report formats [#2111](https://github.com/greenbone/gsa/pull/2111)
- Removed old translation mechanism [#1952](https://github.com/greenbone/gsa/pull/1952)
- Removed Agents from GSA and gsad [#1903](https://github.com/greenbone/gsa/pull/1903) [#1905](https://github.com/greenbone/gsa/pull/1905)
- Removed "All SecInfo" section [#1685](https://github.com/greenbone/gsa/pull/1685) [#1695](https://github.com/greenbone/gsa/pull/1695)
- Removed agents [#1903](https://github.com/greenbone/gsa/pull/1903)

[20.8.0]: https://github.com/greenbone/gsa/compare/gsa-9.0...v20.8.0
