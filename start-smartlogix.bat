@echo off
setlocal EnableExtensions EnableDelayedExpansion

title SmartLogix - Microservices Launcher
color 0B

set "ROOT_DIR=%~dp0"
set "ROOT_DIR=%ROOT_DIR:~0,-1%"

set "SERVICES=identity-service api-gateway inventory-service order-service shipping-service"
set "TOTAL=5"
set "DRY_RUN=0"

if /i "%~1"=="/dry-run" set "DRY_RUN=1"
if /i "%~1"=="--dry-run" set "DRY_RUN=1"

call :banner
echo.
echo  Root: %ROOT_DIR%
echo  Mode: Development / Academic MVP
if "%DRY_RUN%"=="1" echo  Mode: Dry run validation
echo.

call :checkService identity-service || goto :fail
call :checkService api-gateway || goto :fail
call :checkService inventory-service || goto :fail
call :checkService order-service || goto :fail
call :checkService shipping-service || goto :fail

echo.
echo  Starting SmartLogix microservices...
echo.

call :startService 1 identity-service 8084 "Identity Service"
call :startService 2 api-gateway 8080 "API Gateway"
call :startService 3 inventory-service 8081 "Inventory Service"
call :startService 4 order-service 8082 "Order Service"
call :startService 5 shipping-service 8083 "Shipping Service"

echo.
echo  ================================================================
echo   SmartLogix launch completed
echo  ================================================================
echo.
if "%DRY_RUN%"=="1" (
  echo   Dry run completed. No CMD windows were opened.
  echo.
  exit /b 0
)
echo   Opened consoles:
echo    - identity-service  : http://localhost:8084/actuator/health
echo    - api-gateway       : http://localhost:8080/actuator/health
echo    - inventory-service : http://localhost:8081/actuator/health
echo    - order-service     : http://localhost:8082/actuator/health
echo    - shipping-service  : http://localhost:8083/actuator/health
echo.
echo   Tip: keep each CMD window open while testing with Bruno.
echo   To stop a service, press CTRL+C in its corresponding window.
echo.
pause
exit /b 0

:banner
echo  ================================================================
echo   SMARTLOGIX
echo   Academic MVP - Full Stack III
echo   Microservices Startup Automation
echo  ================================================================
echo   SmartLogix Microservices Launcher
echo  ================================================================
exit /b 0

:checkService
set "SERVICE=%~1"
if not exist "%ROOT_DIR%\%SERVICE%" (
  echo  [ERROR] Missing folder: %SERVICE%
  exit /b 1
)
if not exist "%ROOT_DIR%\%SERVICE%\mvnw.cmd" (
  echo  [ERROR] Missing Maven wrapper: %SERVICE%\mvnw.cmd
  exit /b 1
)
if not exist "%ROOT_DIR%\%SERVICE%\pom.xml" (
  echo  [ERROR] Missing pom.xml: %SERVICE%\pom.xml
  exit /b 1
)
echo  [OK] %SERVICE%
exit /b 0

:startService
set "STEP=%~1"
set "SERVICE=%~2"
set "PORT=%~3"
set "LABEL=%~4"

call :progress %STEP% %TOTAL% "%LABEL%"
echo  Launching %LABEL% on port %PORT%...

if "%DRY_RUN%"=="1" (
  echo  [DRY RUN] cd /d "%ROOT_DIR%\%SERVICE%" ^&^& call .\mvnw.cmd spring-boot:run
) else (
  start "%LABEL% - SmartLogix :%PORT%" cmd /k "cd /d ""%ROOT_DIR%\%SERVICE%"" && title %LABEL% - SmartLogix :%PORT% && echo ================================================================ && echo  %LABEL% && echo  Folder: %SERVICE% && echo  Port: %PORT% && echo ================================================================ && echo. && call .\mvnw.cmd spring-boot:run"
)

ping -n 3 127.0.0.1 >nul
exit /b 0

:progress
set "CURRENT=%~1"
set "MAX=%~2"
set "LABEL=%~3"
set /a "PERCENT=(CURRENT*100)/MAX"
set /a "FILLED=(CURRENT*30)/MAX"
set "BAR="

for /l %%I in (1,1,30) do (
  if %%I LEQ !FILLED! (
    set "BAR=!BAR!#"
  ) else (
    set "BAR=!BAR!-"
  )
)

echo  [!BAR!] !PERCENT!%%  %LABEL%
exit /b 0

:fail
echo.
echo  ================================================================
echo   Startup aborted. Fix the error above and run this file again.
echo  ================================================================
echo.
pause
exit /b 1
