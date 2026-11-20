// Écrit l'icône et les informations de version dans Loto.exe, sans Wine (resedit, en JavaScript).
const fs = require("fs");
const path = require("path");
module.exports = async function (ctx) {
  if (ctx.electronPlatformName !== "win32") return;
  const ResEdit = await import("resedit").then(m => m.default || m);
  const pngToIco = await import("png-to-ico").then(m => m.default || m);
  const exePath = path.join(ctx.appOutDir, ctx.packager.appInfo.productFilename + ".exe");
  const exe = ResEdit.NtExecutable.from(fs.readFileSync(exePath), { ignoreCert: true });
  const res = ResEdit.NtExecutableResource.from(exe);
  const ico = await pngToIco(path.join(__dirname, "icon.png"));
  const iconFile = ResEdit.Data.IconFile.from(ico);
  ResEdit.Resource.IconGroupEntry.replaceIconsForResource(res.entries, 1, 1033, iconFile.icons.map(i => i.data));
  const vi = ResEdit.Resource.VersionInfo.fromEntries(res.entries)[0];
  const v = ctx.packager.appInfo.version.split(".").map(Number);
  vi.setFileVersion(v[0], v[1], v[2], 0, 1033);
  vi.setProductVersion(v[0], v[1], v[2], 0, 1033);
  vi.setStringValues({ lang: 1033, codepage: 1200 }, { FileDescription: "Loto", ProductName: "Loto", CompanyName: "Loto", LegalCopyright: "Loto", OriginalFilename: "Loto.exe", InternalName: "Loto" });
  vi.outputToResourceEntries(res.entries);
  res.outputResource(exe);
  fs.writeFileSync(exePath, Buffer.from(exe.generate()));
};
