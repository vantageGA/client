#!/usr/bin/env bash

# Copies the built client assets from client/dist to the prod directory.
# It clears the target directory first (without deleting the directory itself).

set -euo pipefail

SRC_DIR="dist"
DEST_DIR="/home/gary/Documents/WebApps/prod/bodyVantage"

handle_error() {
  echo "❌ Copy failed: $1"
  exit 1
}

# Ensure the source exists
if [[ ! -d "${SRC_DIR}" ]]; then
  handle_error "Source directory '${SRC_DIR}' does not exist. Build the client first."
fi

# Create destination if needed
mkdir -p "${DEST_DIR}"

# Remove existing contents (including dotfiles) safely
shopt -s dotglob nullglob
if compgen -G "${DEST_DIR}/*" > /dev/null; then
  rm -rf "${DEST_DIR:?}/"*
fi
shopt -u dotglob nullglob

# Copy new build
if ! cp -a "${SRC_DIR}/." "${DEST_DIR}/"; then
  handle_error "File copy operation failed."
fi

echo "✅ Copy complete: '${SRC_DIR}' -> '${DEST_DIR}'"
