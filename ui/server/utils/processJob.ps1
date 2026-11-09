param([int]$GuardianPid, [string]$ReadyFile, [string]$StoppedFile, [string]$StopFile, [string]$GuardianBirth)
$ErrorActionPreference = 'Stop'
Add-Type -Path (Join-Path $PSScriptRoot 'processHost.cs')
[G9AgentJob]::Run($GuardianPid, $ReadyFile, $StoppedFile, $StopFile, $GuardianBirth)
