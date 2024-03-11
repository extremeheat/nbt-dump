#!/usr/bin/env node
const { main } = require('./lib')
const args = process.argv.slice(2)
main(args, args.join(' '))
