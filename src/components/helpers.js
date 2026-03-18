'use strict';

const path = require('path');
const os = require('os');
const fs = require('fs-extra');
const { execute, commandExists, installPackage } = require('../utils/system');

function homePath(...parts) {
  return path.join(os.homedir(), ...parts);
}

async function copyFileWithBackup(source, destination, logger, options = {}) {
  const { executable = false, backup = true } = options;

  await fs.ensureDir(path.dirname(destination));

  if (backup && await fs.pathExists(destination)) {
    const backupPath = `${destination}.zsc.bak`;
    await fs.copy(destination, backupPath, { overwrite: true });
    if (logger) logger.debug(`Backup created: ${backupPath}`);
  }

  await fs.copy(source, destination, { overwrite: true });

  if (executable) {
    await fs.chmod(destination, 0o755);
  }
}

async function copyFromData(scriptDir, dataName, destination, logger, options = {}) {
  const source = path.join(scriptDir, 'data', dataName);
  if (!await fs.pathExists(source)) {
    throw new Error(`Data file missing: ${source}`);
  }

  await copyFileWithBackup(source, destination, logger, options);
}

function run(command, logger) {
  if (logger) logger.debug(`Running: ${command}`);
  const result = execute(command);
  if (!result.success) {
    const message = result.stderr?.toString().trim() || result.stdout?.toString().trim() || 'Command failed';
    throw new Error(message);
  }
  return result;
}

function ensureBinary(binary, packageName, logger, options = {}) {
  if (commandExists(binary)) {
    return { installed: false, alreadyPresent: true };
  }

  if (options.dryRun) {
    if (logger) logger.dryRun(`Would install package '${packageName}' for '${binary}'`);
    return { installed: false, dryRun: true };
  }

  const result = installPackage(packageName, { yes: options.yes });
  if (!result.success) {
    throw new Error(`Could not install ${packageName}: ${result.stderr || result.stdout}`);
  }

  if (!commandExists(binary)) {
    throw new Error(`${packageName} installation completed but '${binary}' was not found in PATH`);
  }

  return { installed: true, alreadyPresent: false };
}

function setIfMissingInFile(filePath, line, logger) {
  const content = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
  if (content.includes(line)) return false;

  const next = content.endsWith('\n') || content.length === 0 ? `${content}${line}\n` : `${content}\n${line}\n`;
  fs.ensureDirSync(path.dirname(filePath));
  fs.writeFileSync(filePath, next, 'utf8');
  if (logger) logger.debug(`Added line to ${filePath}: ${line}`);
  return true;
}

module.exports = {
  homePath,
  copyFromData,
  copyFileWithBackup,
  run,
  ensureBinary,
  setIfMissingInFile
};
