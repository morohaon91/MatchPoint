#!/bin/bash

# Script to run the group schema migration

# Navigate to project root directory if not already there
cd "$(dirname "$0")/.." || exit

echo "Running group schema migration script..."

# Run the CommonJS version of the script
NODE_ENV=development node src/scripts/fixGroupSchemaCommonJS.js

echo "Script execution complete."
