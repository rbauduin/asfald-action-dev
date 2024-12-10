const core = require('@actions/core');
const github = require('@actions/github');
const exec = require('@actions/exec');

function getSuffix() {
  switch (process.platform, process.arch) {
    case 'darwin', 'arm64':
      return '-aarch64-apple-darwin'
    case 'darwin', 'x64':
      return '-x86_64-apple-darwin'
    case 'win32', 'x64':
      return '-x86_64-pc-windows-gnu.zip'
    case 'linux', 'x64':
      return '-x86_64-unknown-linux-musl'
    case 'linux', 'arm':
      return '-armv7-unknown-linux-musleabi'
    case 'linux', 'arm64':
      return '-aarch64-unknown-linux-musl'
    case 'freebsd', 'x64':
      return '-x86_64-unknown-freebsd '
    default:
      return `${process.platform}-${process.arch}`
  }
}
async function main() {

  const suffix = getSuffix();
  const url = version
    ? `https://github.com/asfaload/asfald/releases/download/v${version}/asfald${suffix}`
    : `https://github.com/asfaload/asfald/releases/download/v0.5.1/asfald${suffix}`
  const checksumsUrl = `https://gh.checksums.asfaload.com/${url.replace("https://", "").replace(`asfald${suffix}`, "")}`
  const destDir = os.tmpdir();
  const fileName = `asfaload - ${suffix}`
  if (process.platform == 'win32') {
    const zipPath = path.join(destDir, fileName, ".zip");
    await exec.exec('curl', ["-L", url, '-o', zipPath])
    await exec.exec('unzip', [zipPath, '-d', os.tmpdir()])
    await io.mv(path.join(os.tmpdir(), fileName, "asfald.exe"), os.homedir())
  }
  else {
    await exec.exec('curl', ["-L", url, '-o', path.join(destDir, fileName)])
    await exec.exec('curl', ["-L", checksumsUrl, '-o', path.join(destDir, "checksums.txt")])
    await exec.exec('sha256sum', ["-c", "--ignore-missing", "checksums.txt"], { cwd: destDir })
    await io.mv(path.join(destDir, fileName), "/usr/bin/")

  }
}

main();
