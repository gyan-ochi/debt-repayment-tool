@echo off
cd /d %~dp0
set PATH=%CD%\node-runtime\node-v22.14.0-win-x64;%PATH%
call .\node-runtime\node-v22.14.0-win-x64\npm.cmd run dev
