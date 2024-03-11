/* eslint-env mocha */
/* eslint-disable n/no-path-concat */
const lib = require('nbt-dump')
const fs = require('fs')
const assert = require('assert')

describe('basic tests', () => {
  it('writes bigtest.nbt to bigtest.json', async () => {
    const bigNBT = `${__dirname}/bigtest.nbt`
    const bigJSON = `${__dirname}/bigtest.json`
    fs.rmSync(bigJSON, { force: true })
    const args = [bigNBT, bigJSON]
    await lib.main(args, args.join(' '))
    assert(fs.existsSync(bigJSON))
  })
})
