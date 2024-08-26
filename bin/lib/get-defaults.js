const path = require('path');
const fs = require('fs');
const exec = require('shelljs').exec;
const parseRepo = require('github-url-to-object');

function getDefaults(workPath, isEnterprise, callback) {
  const pkg = readJson(path.resolve(workPath, 'package.json'));
  const logPath = path.resolve(workPath, 'CHANGELOG.md');

  try {
    const changelog = fs.readFileSync(logPath, 'utf-8'); 

    const repoParts = parseRepo(pkg.repository, {
      enterprise: isEnterprise
    });
    if (!repoParts) {
      return callback(new Error('The repository defined in your package.json is invalid => https://docs.npmjs.com/files/package.json#repository'));
    }
    const owner = repoParts.user;
    const repo = repoParts.repo;

    const commit = "main"
    const version = pkg.version ? 'v' + pkg.version : null;

    callback(null, {
      body: changelog, 
      assets: false,
      owner,
      repo,
      dryRun: false,
      yes: false,
      endpoint: 'https://api.github.com',
      workpath: process.cwd(),
      prerelease: false,
      draft: false,
      target_commitish: commit,
      tag_name: version,
      name: version
    });

  } catch (err) {
    return callback(new Error('Error reading CHANGELOG.md: ' + err.message));
  }
}

function getTargetCommitish () {
  const commit = exec('git rev-parse HEAD', { silent: true }).split('\n')[0]
  if (commit.indexOf('fatal') === -1) return commit
  return 'master'
}

function readJson (filePath) {
  return JSON.parse(fs.readFileSync(filePath))
}

module.exports = getDefaults
module.exports.getTargetCommitish = getTargetCommitish
