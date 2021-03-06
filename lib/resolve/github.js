'use strict'
const got = require('../got')

/**
 * Resolves a 'hosted' package hosted on 'github'.
 */

const PARSE_GITHUB_RE = /^github:([^\/]+)\/([^#]+)(#(.+))?$/

module.exports = function resolveGithub (pkg) {
  const spec = parseGithubSpec(pkg)
  return resolveRef(spec).then(ref => {
    spec.ref = ref
    return resolvePackageName(spec).then(name => {
      const fullname = name.replace('/', '!') + ['@github', spec.owner, spec.repo, spec.ref].join('!')
      return {
        name,
        fullname,
        dist: {
          tarball: [
            'https://api.github.com/repos',
            spec.owner,
            spec.repo,
            'tarball',
            spec.ref
          ].join('/')
        }
      }
    })
  })
}

function resolvePackageName (spec) {
  const url = [
    'https://api.github.com/repos',
    spec.owner,
    spec.repo,
    'contents/package.json?ref=' + spec.ref
  ].join('/')
  return getJSON(url).then(body => {
    const content = new Buffer(body.content, 'base64').toString('utf8')
    const pkg = JSON.parse(content)
    return pkg.name
  })
}

function resolveRef (spec) {
  const url = [
    'https://api.github.com/repos',
    spec.owner,
    spec.repo,
    'commits',
    spec.ref
  ].join('/')
  return getJSON(url).then(body => body.sha)
}

function getJSON (url) {
  return got.get(url)
    .then(res => res.promise)
    .then(res => {
      const body = JSON.parse(res.body)
      return body
    })
}

function parseGithubSpec (pkg) {
  const m = PARSE_GITHUB_RE.exec(pkg.hosted.shortcut)
  if (!m) {
    throw new Error('cannot parse: ' + pkg.hosted.shortcut)
  }
  const owner = m[1]
  const repo = m[2]
  const ref = m[4] || 'HEAD'
  return {owner, repo, ref}
}
