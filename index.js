const core = require('@actions/core');
const github = require('@actions/github');
const exec = require('@actions/exec');
const os = require("os");
const path = require("path");
const io = require('@actions/io');

// From mise: https://github.com/jdx/mise-action/blob/main/src/utils.ts
function asfaldDir() {
  const dir = core.getState('ASFALD_DIR')
  if (dir) return dir

  const { ASFALD_DATA_DIR, XDG_DATA_HOME, LOCALAPPDATA } = process.env
  if (ASFALD_DATA_DIR) return ASFALD_DATA_DIR
  if (XDG_DATA_HOME) return path.join(XDG_DATA_HOME, 'mise')
  if (process.platform === 'win32' && LOCALAPPDATA)
    return path.join(LOCALAPPDATA, 'asfald')

  return path.join(os.homedir(), '.local', 'share', 'asfald')
}




function getSuffix() {
  switch (`${process.platform}, ${process.arch}`) {
    case 'darwin, arm64':
      return '-aarch64-apple-darwin'
    case 'darwin, x64':
      return '-x86_64-apple-darwin'
    case 'win32, x64':
      return '-x86_64-pc-windows-gnu.zip'
    case 'linux, x64':
      return '-x86_64-unknown-linux-musl'
    case 'linux, arm':
      return '-armv7-unknown-linux-musleabi'
    case 'linux, arm64':
      return '-aarch64-unknown-linux-musl'
    case 'freebsd, x64':
      return '-x86_64-unknown-freebsd'
    default:
      return `${process.platform}-${process.arch}`
  }
}
async function main() {

  console.log(process.platform);
  console.log(process.arch);

  const installDir = asfaldDir();
  const version = core.getInput("version");
  const suffix = getSuffix();
  const fileName = `asfald${suffix}`
  const url = version
    ? `https://github.com/asfaload/asfald/releases/download/v${version}/${fileName}`
    : `https://github.com/asfaload/asfald/releases/download/v0.5.1/${fileName}`
  const checksumsUrl = `https://gh.checksums.asfaload.com/${url.replace("https://", "").replace(`asfald${suffix}`, "")}/checksums.txt`
  const destDir = os.tmpdir();
  if (process.platform == 'win32') {
    const zipPath = path.join(destDir, fileName, ".zip");
    await exec.exec('curl', ["-L", url, '-o', zipPath])
    await exec.exec('unzip', [zipPath, '-d', os.tmpdir()])
    await io.mv(path.join(os.tmpdir(), fileName, "asfald.exe"), installDir)
  }
  else {
    await exec.exec('curl', ["-L", url, '-o', path.join(destDir, fileName)])
    await exec.exec('curl', ["-L", checksumsUrl, '-o', path.join(destDir, "checksums.txt")])
    await exec.exec('sha256sum', ["-c", "--ignore-missing", "checksums.txt"], { cwd: destDir })
    await exec.exec('chmod', ["+x", fileName], { cwd: destDir })
    await io.mv(path.join(destDir, fileName), path.join(installDir, "asfald"))
    await exec.exec('ls', ['-l', path.join(installDir, "asfald")]);

  }
  core.addPath(installDir)
}

main();
