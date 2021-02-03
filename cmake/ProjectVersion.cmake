# Copyright (C) 2020-2021 Greenbone Networks GmbH
#
# SPDX-License-Identifier: GPL-2.0-or-later
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.

## Retrieve git revision (at configure time)

include (GetGit)

if (NOT CMAKE_BUILD_TYPE MATCHES "Release")
  Git_GET_REVISION(${CMAKE_SOURCE_DIR} ProjectRevision)
  if (DEFINED ProjectRevision)
    set (GIT_REVISION "~git-${ProjectRevision}")
  else ()
    set (GIT_REVISION "~git")
  endif ()
endif (NOT CMAKE_BUILD_TYPE MATCHES "Release")

if (GIT_REVISION)
  set (PROJECT_VERSION_GIT "${GIT_REVISION}")
else (GIT_REVISION)
  set (PROJECT_VERSION_GIT "")
endif (GIT_REVISION)

string(LENGTH ${PROJECT_VERSION_MINOR} PROJECT_VERSION_MINOR_LENGTH)

if (PROJECT_VERSION_MINOR_LENGTH LESS 2)
  set (PROJECT_VERSION_MINOR_STRING "0${PROJECT_VERSION_MINOR}")
else ()
  set (PROJECT_VERSION_MINOR_STRING "${PROJECT_VERSION_MINOR}")
endif ()

# If PROJECT_BETA_RELEASE is set to "0", the version string will be set to:
#   "major.minor+alpha"
# If PROJECT_BETA_RELEASE is set otherwise, the version string will be set to:
#   "major.minor+beta${PROJECT_BETA_RELEASE}"
# If PROJECT_BETA_RELEASE is NOT set, the version string will be set to:
#   "major.minor.patch"
if (DEFINED PROJECT_BETA_RELEASE AND NOT PROJECT_BETA_RELEASE STREQUAL "")
  if (PROJECT_BETA_RELEASE STREQUAL "0")
    set (PROJECT_VERSION_SUFFIX "+alpha")
  else (PROJECT_BETA_RELEASE STREQUAL "0")
    set (PROJECT_VERSION_SUFFIX "+beta${PROJECT_BETA_RELEASE}")
  endif (PROJECT_BETA_RELEASE STREQUAL "0")
elseif (DEFINED PROJECT_VERSION_PATCH AND NOT PROJECT_VERSION_PATCH STREQUAL "")
  set (PROJECT_VERSION_SUFFIX ".${PROJECT_VERSION_PATCH}")
endif (DEFINED PROJECT_BETA_RELEASE AND NOT PROJECT_BETA_RELEASE STREQUAL "")

set (PROJECT_VERSION_STRING "${PROJECT_VERSION_MAJOR}.${PROJECT_VERSION_MINOR_STRING}${PROJECT_VERSION_SUFFIX}${PROJECT_VERSION_GIT}")
