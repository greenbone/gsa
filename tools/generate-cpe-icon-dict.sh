#!/bin/sh
#
# generate-cpe-icon-dict
# This script creates a cpe icon dictionary for GSA
#
# Authors:
# Timo Pollmeier <timo.pollmeier@greenbone.net>
#
# Copyright:
# Copyright (C) 2013 Greenbone Networks GmbH
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License version 2,
# or, at your option, any later version as published by the Free
# Software Foundation
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

# Parse arguments
while test $# -gt 0; do
 case "$1" in
    --prefix)
      FILE_PREFIX="$2"
      shift
      ;;
    --src_path)
      SRC_PATH="$2"
      shift
      ;;
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


# Icon path prefix for generated icons
if [ -z "$FILE_PREFIX" ]
then
  FILE_PREFIX="cpe/"
fi

# Source path for generated icons
if [ -z "$SRC_PATH" ]
then
  SRC_PATH="."
fi
if [ ! -d "$SRC_PATH" ]
then
  echo "ERROR: Source path '$SRC_PATH' is cannot be found or is not a directory" >&2
  exit 1
fi

TEST=`ls ${SRC_PATH}/*.png 2> /dev/null`
if [ -z "$TEST" ]
then
  echo "ERROR: No PNG images found in source path '$SRC_PATH'" >&2
  exit 1
fi

# Prepend (override) file path
if [ -z "$PREPEND_FILE" ]
then
  PREPEND_FILE="cpe-icon-dict-prepend.in"
fi

# Append (fallback) file path
if [ -z "$APPEND_FILE" ]
then
  APPEND_FILE="cpe-icon-dict-append.in"
fi

# Print xml header and info/license text
cat <<!END
<?xml version="1.0" encoding="utf-8"?>

<!--
Greenbone Security Assistant
$Id$
Description: CPE icon dictionary

Authors:
Timo Pollmeier <timo.pollmeier@greenbone.net>

Copyright:
Copyright (C) 2013 Greenbone Networks GmbH

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License version 2,
or, at your option, any later version as published by the Free
Software Foundation

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
-->

<!-- This file has been generated automatically using generate-cpe-icon-dict.sh -->
!END

# Open root element
echo "<cpe_icon_dict>"

# Prepend manual files
if [ -r "$PREPEND_FILE" ]
then
  echo "  <!-- manually created overrides -->"
  cat "$PREPEND_FILE"
else
  echo "WARNING: Prepend file cannot be read" >&2
fi

# Auto-generate files
echo "  <!-- generated -->"
for pattern in `ls -1 ${SRC_PATH}/*.png | sed -e 's/\.png//' -e 's/.*\///'`
do
  if [ "other" != "$pattern" ]
  then
    echo "  <cpe_entry>"
    echo "    <pattern>cpe:/${pattern}</pattern>"
    echo "    <icon>${FILE_PREFIX}${pattern}.png</icon>"
    echo "  </cpe_entry>"
  fi
done

# Append manual files
if [ -r "$APPEND_FILE" ]
then
  echo "  <!-- manually created fallbacks -->"
  cat "$APPEND_FILE"
else
  echo "WARNING: Append file cannot be read" >&2
fi

# Close root element
echo "\n</cpe_icon_dict>"
