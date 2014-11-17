#!/bin/sh
# $Id$
# Description: Creates a timezone dictionary for GSA.
#
# Authors:
# Timo Pollmeier <timo.pollmeier@greenbone.net>
# Matthew Mundell <matthew.mundell@greenbone.net>
#
# Copyright:
# Copyright (C) 2013-2014 Greenbone Networks GmbH
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
# Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA
#

# Parse arguments.
while test $# -gt 0; do
 case "$1" in
    --prepend)
      PREPEND_FILE="$2"
      shift
      ;;
    --append)
      APPEND_FILE="$2"
      shift
      ;;
 esac
 shift
done

# Setup prepend (override) file path.
if [ -z "$PREPEND_FILE" ]
then
  PREPEND_FILE="zone-dict-prepend.in"
fi

# Setup append (fallback) file path.
if [ -z "$APPEND_FILE" ]
then
  APPEND_FILE="zone-dict-append.in"
fi

# Print xml header and info/license text.
cat <<!END
<?xml version="1.0" encoding="utf-8"?>

<!--
Greenbone Security Assistant
$Id$
Description: Zone dictionary.

Authors:
Timo Pollmeier <timo.pollmeier@greenbone.net>
Matthew Mundell <matthew.mundell@greenbone.net>

Copyright:
Copyright (C) 2013-2014 Greenbone Networks GmbH

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
-->

<!-- This file has been generated automatically using generate-zone-dict.sh. -->
!END

# Open root element.
echo "<zones>"

# Prepend manual zones.
if [ -r "$PREPEND_FILE" ]
then
  echo "  <!-- Manually created overrides. -->"
  cat "$PREPEND_FILE"
else
  echo "WARNING: Prepend file cannot be read" >&2
fi

echo "  <!-- Generated. -->"
sed '/^\#/d' /usr/share/zoneinfo/zone.tab | cut -s -f 3 | sort | sed -e "s;\(.*\);  <zone><name>\1</name></zone>;"

# Append manual zones.
if [ -r "$APPEND_FILE" ]
then
  echo "  <!-- Manually created fallbacks. -->"
  cat "$APPEND_FILE"
else
  echo "WARNING: Append file cannot be read" >&2
fi

# Close root element.
echo "</zones>"
