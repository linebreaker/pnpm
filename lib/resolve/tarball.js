'use strict'
const basename = require('path').basename
const crypto = require('crypto')

/**
 * Resolves a 'remote' package.
 *
 *     pkg = {
 *       raw: 'http://registry.npmjs.org/is-array/-/is-array-1.0.1.tgz',
 *       scope: null,
 *       name: null,
 *       rawSpec: 'http://registry.npmjs.org/is-array/-/is-array-1.0.1.tgz',
 *       spec: 'http://registry.npmjs.org/is-array/-/is-array-1.0.1.tgz',
 *       type: 'remote' }
 *     resolveTarball(pkg)
 */

module.exports = function resolveTarball (pkg) {
  const name = basename(pkg.raw).replace(/(\.tgz|\.tar\.gz)$/i, '')

  return Promise.resolve({
    name,
    fullname: name + '#' + hash(pkg.raw),
    dist: {
      tarball: pkg.raw
    }
  })
}

function hash (str) {
  const hash = crypto.createHash('sha1')
  hash.update(str)
  return hash.digest('hex')
}
