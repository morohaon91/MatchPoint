#!/bin/bash

# Script to run the admin version of the group schema migration

# Navigate to project root directory if not already there
cd "$(dirname "$0")/.." || exit

echo "Running group schema migration using admin SDK..."

# Run the script with development environment
NODE_ENV=development node src/scripts/fixGroupSchemaAdmin.js

echo "Script execution complete."
