; Installeur Windows de Loto (NSIS, construit sous Linux avec makensis).
; Installe pour l'utilisateur courant (pas besoin d'être administrateur), crée les raccourcis Bureau et menu Démarrer.
; Les données de l'app (%APPDATA%\Loto) ne sont jamais touchées : ni par une mise à jour, ni par la désinstallation.
Unicode true
!ifndef VERSION
  !define VERSION "0.0.0"
!endif
!define APP "Loto"
!define UNINST_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\Loto"

Name "${APP}"
Caption "Installation de ${APP} ${VERSION}"
OutFile "dist/Loto-Setup-${VERSION}.exe"
InstallDir "$LOCALAPPDATA\Programs\Loto"
InstallDirRegKey HKCU "${UNINST_KEY}" "InstallLocation"
RequestExecutionLevel user
SetCompressor /SOLID lzma
BrandingText "${APP} ${VERSION}"

VIProductVersion "${VERSION}.0"
VIAddVersionKey /LANG=1036 "ProductName" "${APP}"
VIAddVersionKey /LANG=1036 "FileDescription" "Installation de ${APP}"
VIAddVersionKey /LANG=1036 "FileVersion" "${VERSION}"
VIAddVersionKey /LANG=1036 "ProductVersion" "${VERSION}"
VIAddVersionKey /LANG=1036 "CompanyName" "${APP}"
VIAddVersionKey /LANG=1036 "LegalCopyright" "${APP}"

!include "MUI2.nsh"
!define MUI_ICON "icon.ico"
!define MUI_UNICON "icon.ico"
!define MUI_ABORTWARNING
!define MUI_FINISHPAGE_RUN "$INSTDIR\Loto.exe"
!define MUI_FINISHPAGE_RUN_TEXT "Lancer Loto"
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "French"

Section "Loto"
  ; mise à jour : ferme l'app si elle est ouverte, remplace les fichiers du programme
  nsExec::Exec 'taskkill /IM Loto.exe /F'
  Sleep 800
  SetOutPath "$INSTDIR"
  RMDir /r "$INSTDIR\resources"
  RMDir /r "$INSTDIR\locales"
  File /r "dist/win-unpacked/*.*"
  File "icon.ico"

  CreateShortCut "$DESKTOP\Loto.lnk" "$INSTDIR\Loto.exe" "" "$INSTDIR\Loto.exe" 0
  CreateShortCut "$SMPROGRAMS\Loto.lnk" "$INSTDIR\Loto.exe" "" "$INSTDIR\Loto.exe" 0

  WriteUninstaller "$INSTDIR\Desinstaller Loto.exe"
  WriteRegStr HKCU "${UNINST_KEY}" "DisplayName" "${APP}"
  WriteRegStr HKCU "${UNINST_KEY}" "DisplayVersion" "${VERSION}"
  WriteRegStr HKCU "${UNINST_KEY}" "Publisher" "${APP}"
  WriteRegStr HKCU "${UNINST_KEY}" "DisplayIcon" "$INSTDIR\Loto.exe"
  WriteRegStr HKCU "${UNINST_KEY}" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "${UNINST_KEY}" "UninstallString" '"$INSTDIR\Desinstaller Loto.exe"'
  WriteRegDWORD HKCU "${UNINST_KEY}" "NoModify" 1
  WriteRegDWORD HKCU "${UNINST_KEY}" "NoRepair" 1
SectionEnd

Section "Uninstall"
  nsExec::Exec 'taskkill /IM Loto.exe /F'
  Sleep 500
  Delete "$DESKTOP\Loto.lnk"
  Delete "$SMPROGRAMS\Loto.lnk"
  RMDir /r "$INSTDIR"
  DeleteRegKey HKCU "${UNINST_KEY}"
SectionEnd
