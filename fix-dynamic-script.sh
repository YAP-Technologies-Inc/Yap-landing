#!/bin/zsh

# Script to fix the dynamic-wallet script configuration in angular.json
# This script adds the "inject": true property to the dynamic-wallet script entry

# Define the file to modify
ANGULAR_JSON="/Users/gregbrown/github/YAP/yap-landing/angular.json"

# Create a backup
cp "$ANGULAR_JSON" "${ANGULAR_JSON}.bak-$(date +%s)"

# Use a temporary file for the modification
TMP_FILE=$(mktemp)

# Use awk to add the inject:true property right after "bundleName": "dynamic-wallet" line
awk '
  {
    print $0;
    if ($0 ~ /"bundleName": "dynamic-wallet"/) {
      # Look at the next line to see if it already has inject
      getline next_line;
      if (next_line !~ /"inject":/) {
        print "                \"inject\": true,";
      }
      print next_line;
    }
  }
' "$ANGULAR_JSON" > "$TMP_FILE"

# Replace the original file with our modified version
mv "$TMP_FILE" "$ANGULAR_JSON"

echo "Added 'inject: true' to dynamic-wallet script entries in angular.json"

# Verify the change
grep -A 3 "bundleName.*dynamic-wallet" "$ANGULAR_JSON"
