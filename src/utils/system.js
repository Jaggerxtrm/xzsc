'use strict';

const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

/**
 * System utilities for zsc
 */

// OS detection
function getOS() {
  const platform = os.platform();
  const arch = os.arch();

  return {
    platform,
    arch,
    isLinux: platform === 'linux',
    isMacOS: platform === 'darwin',
    isWindows: platform === 'win32',
    isWSL: isWSL(),
    distribution: getLinuxDistribution()
  };
}

/**
 * Detect if running in WSL
 */
function isWSL() {
  try {
    const version = execSync('cat /proc/version', { encoding: 'utf8' });
    return /microsoft|wsl/i.test(version);
  } catch (error) {
    return false;
  }
}

/**
 * Get Linux distribution
 */
function getLinuxDistribution() {
  if (os.platform() !== 'linux') return null;

  try {
    const release = execSync('cat /etc/os-release', { encoding: 'utf8' });
    const match = release.match(/^ID="?([^"\n]+)"?/m);
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
}

/**
 * Check if command exists
 */
function commandExists(command) {
  try {
    execSync(`command -v ${command}`, { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get command path
 */
function getCommandPath(command) {
  try {
    const result = execSync(`command -v ${command}`, { encoding: 'utf8', stdio: 'pipe' });
    return result.trim();
  } catch (error) {
    return null;
  }
}

/**
 * Get command version
 */
function getCommandVersion(command, versionFlag = '--version') {
  try {
    const result = execSync(`${command} ${versionFlag}`, { encoding: 'utf8', stdio: 'pipe' });
    return result.trim().split('\n')[0];
  } catch (error) {
    return null;
  }
}

/**
 * Execute shell command and return result
 */
function execute(command, options = {}) {
  const defaultOptions = {
    encoding: 'utf8',
    stdio: 'pipe'
  };

  try {
    const result = execSync(command, { ...defaultOptions, ...options });
    return {
      success: true,
      stdout: result.trim(),
      stderr: ''
    };
  } catch (error) {
    return {
      success: false,
      stdout: error.stdout || '',
      stderr: error.stderr || error.message,
      code: error.status
    };
  }
}

/**
 * Check if running with sudo privileges
 */
function isRoot() {
  return process.getuid && process.getuid() === 0;
}

/**
 * Check if have sudo access
 */
function hasSudoAccess() {
  try {
    execSync('sudo -n true 2>/dev/null', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get current shell
 */
function getCurrentShell() {
  try {
    const result = execSync('echo $SHELL', { encoding: 'utf8', stdio: 'pipe' });
    return path.basename(result.trim());
  } catch (error) {
    return 'bash'; // Default fallback
  }
}

/**
 * Get home directory
 */
function getHome() {
  return os.homedir();
}

/**
 * Get user name
 */
function getUsername() {
  return os.userInfo().username;
}

/**
 * Get hostname
 */
function getHostname() {
  return os.hostname();
}

/**
 * Get CPU info
 */
function getCPU() {
  return {
    model: os.cpus()[0]?.model || 'Unknown',
    cores: os.cpus().length,
    arch: os.arch()
  };
}

/**
 * Get memory info
 */
function getMemory() {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;

  return {
    total: formatBytes(total),
    free: formatBytes(free),
    used: formatBytes(used),
    percentage: Math.round((used / total) * 100)
  };
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Check if package manager is available
 */
function getPackageManager() {
  const managers = [
    { name: 'dnf', command: 'dnf' },
    { name: 'yum', command: 'yum' },
    { name: 'apt', command: 'apt-get' },
    { name: 'apt', command: 'apt' },
    { name: 'brew', command: 'brew' },
    { name: 'pacman', command: 'pacman' }
  ];

  for (const manager of managers) {
    if (commandExists(manager.command)) {
      return manager;
    }
  }

  return null;
}

/**
 * Install package using system package manager
 */
function installPackage(packageName, options = {}) {
  const { nonInteractive = true, yes = false } = options;
  const pm = getPackageManager();

  if (!pm) {
    throw new Error('No supported package manager found');
  }

  let command = '';

  switch (pm.name) {
    case 'dnf':
    case 'yum':
      command = `sudo ${pm.name} install -y ${packageName}`;
      break;
    case 'apt':
    case 'apt-get':
      command = `sudo apt update && sudo apt install -y ${packageName}`;
      break;
    case 'brew':
      command = `brew install ${packageName}`;
      break;
    case 'pacman':
      command = `sudo pacman -S --noconfirm ${packageName}`;
      break;
    default:
      throw new Error(`Unsupported package manager: ${pm.name}`);
  }

  return execute(command);
}

/**
 * Check if running in tmux
 */
function isInTmux() {
  return process.env.TMUX !== undefined;
}

/**
 * Get tmux session name
 */
function getTmuxSession() {
  if (!isInTmux()) return null;

  try {
    const result = execSync('tmux display-message -p "#S"', { encoding: 'utf8', stdio: 'pipe' });
    return result.trim();
  } catch (error) {
    return null;
  }
}

/**
 * Get tmux version
 */
function getTmuxVersion() {
  try {
    const result = execSync('tmux -V', { encoding: 'utf8', stdio: 'pipe' });
    const match = result.match(/tmux (\d+\.\d+)/);
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
}

module.exports = {
  getOS,
  isWSL,
  getLinuxDistribution,
  commandExists,
  getCommandPath,
  getCommandVersion,
  execute,
  isRoot,
  hasSudoAccess,
  getCurrentShell,
  getHome,
  getUsername,
  getHostname,
  getCPU,
  getMemory,
  formatBytes,
  getPackageManager,
  installPackage,
  isInTmux,
  getTmuxSession,
  getTmuxVersion
};
