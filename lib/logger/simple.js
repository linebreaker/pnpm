'use strict'
const chalk = require('chalk')

const UPDATERS = [
  'resolving', 'resolved', 'download-start', 'dependencies'
]

const BAR_LENGTH = 20

const s = {
  gray: chalk.gray,
  green: chalk.green,
  bold: chalk.bold
}

/*
 * Simple percent logger
 */

module.exports = function logger () {
  const out = process.stdout
  const progress = { done: 0, total: 0 }
  let lastStatus
  const done = {}

  process.on('exit', _ => {
    out.write(reset())
  })

  return pkg => {
    const name = pkg.name
      ? (pkg.name + ' ' + pkg.rawSpec)
      : pkg.rawSpec

    update()
    progress.total += UPDATERS.length + 20
    let left = UPDATERS.length + 20
    let pkgData

    return (status, args) => {
      if (status === 'done') progress.done += left

      if (~UPDATERS.indexOf(status)) {
        progress.done += 1
        left -= 1
      }

      if (status === 'package.json') {
        pkgData = args
      }

      lastStatus = name

      if (process.env.VERBOSE) {
        if (status !== 'downloading') update(getName() + ' ' + status)
      } else if (status === 'done') {
        update(getName())
      } else {
        update()
      }
    }

    function getName () {
      if (pkgData && pkgData.version) {
        return pkgData.name + ' ' + s.gray(pkgData.version)
      } else {
        return pkgData && pkgData.name || name
      }
    }

    function update (line) {
      if (line && !done[line]) {
        done[line] = true
        out.write(reset() + line + '\n')
      }

      const percent = progress.done / progress.total
      if (progress.total > 0 && out.isTTY) {
        const bar = Math.round(percent * BAR_LENGTH)
        out.write(
          reset() +
          s.bold(Math.round(percent * 100) + '%') + ' ' +
          s.green(Array(bar).join('=') + '>') +
          Array(BAR_LENGTH - bar).join(' ') + ' ' +
          s.gray(lastStatus.substr(0, 40))) + ' '
      }
    }
  }

  function reset () {
    return out.isTTY
      ? '\r' + Array(out.columns).join(' ') + '\r'
      : ''
  }
}
