#!/bin/sh
# Releases with electron-builder's default postun remove the new launcher on
# upgrade. Repair it after all old-package scriptlets have finished as well.
if [ -x '/opt/G9Agent/g9agent-desktop' ]; then
  if type update-alternatives >/dev/null 2>&1; then
    update-alternatives --install '/usr/bin/g9agent-desktop' 'g9agent-desktop' '/opt/G9Agent/g9agent-desktop' 100
  else
    ln -sf '/opt/G9Agent/g9agent-desktop' '/usr/bin/g9agent-desktop'
  fi
fi
