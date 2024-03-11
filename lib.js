const fs = require('fs')
const nbt = require('prismarine-nbt')

const usage = `usage, feel free to use natural language:
Parse an NBT file to JSON: 
    nbt-dump <path-to-nbt-file> [out-json-file] [little|big|varint]

    nbt-dump level.dat
    nbt-dump level.dat to level.json
    nbt-dump level.dat as little to level.json

Write an JSON file to uncompressed NBT (defaults to big endian):
    nbt-dump write <path-to-json> [out-nbt-file] [little|big|varint]

    nbt-dump write level.json to level.dat
    nbt-dump write level.json to level.dat as little

You can also pipe the input to nbt-dump:
    cat level.dat | nbt-dump
    cat level.dat | nbt-dump to level.json
    cat level.json | nbt-dump write
    cat level.json | nbt-dump write to level.dat
`

async function isPipedInput () {
  return new Promise((resolve, reject) => {
    fs.fstat(0, function (err, stats) {
      if (err) {
        reject(err)
      } else {
        resolve(stats.isFIFO())
      }
    })
  })
}

async function main (args, argsStr) {
  if ((args.length === 0 || argsStr.includes('help')) && !!process.stdin.isTTY) {
    console.warn(usage)
    process.exit(1)
  }
  if (args[0] === 'read') args.shift()
  let files = []
  if (!process.stdin.isTTY && await isPipedInput()) {
    files.push(undefined)
  }
  for (const arg of args) {
    if (arg.includes('.')) files.push(arg)
  }
  const getFmt = () => {
    if (args.includes('big')) return 'big'
    if (args.includes('varint')) return 'littleVarint'
    if (args.includes('little')) return 'little'
    return undefined
  }
  if (args[0] === 'write') {
    if (!files.length && args[1]) files.push(args[1])
    if (files.length === 1) files.push(files[0] || 'stdin' + '.nbt')
    if (files.length === 2) return (await write(...files, getFmt()))
  } else {
    if (!files.length) files = [args[0], args[0] + '.json']
    return read(files[0], files[1], getFmt())
  }

  console.error('Bad arguments')
  console.warn(arguments)
}

async function write (inpf, outf, fmt) {
  console.log(`* Writing JSON from "${inpf || 'stdin'}" to "${outf}" as ${fmt || 'big'} endian`)

  let json
  if (!inpf) {
    const chunks = []
    for await (const chunk of process.stdin) chunks.push(chunk)
    json = JSON.parse(Buffer.concat(chunks).toString())
  } else {
    json = JSON.parse(fs.readFileSync(inpf))
  }
  const outBuffer = fs.createWriteStream(outf)

  try {
    const newBuf = nbt.writeUncompressed(json, fmt)
    outBuffer.write(newBuf)
    outBuffer.end(() => console.log('written!'))
  } catch (e) {
    console.warn('Failed to write. Make sure that the JSON schema matches the prismarine-nbt ProtoDef schema. See https://github.com/PrismarineJS/prismarine-nbt')
    throw e
  }
}

async function read (inpf, outf, fmt) {
  console.log(`* Dumping NBT ${inpf ? 'file "' + inpf + '"' : '"stdin"'} to "${outf || 'stdout'}" as JSON ${fmt ? 'as ' + fmt : ''}`)

  let buffer
  if (!inpf) {
    const chunks = []
    for await (const chunk of process.stdin) chunks.push(chunk)
    buffer = Buffer.concat(chunks)
  } else {
    buffer = await fs.promises.readFile(inpf)
  }
  const { parsed, type } = await nbt.parse(buffer, fmt)

  if (!fmt) console.log(`(as ${type} endian)`)
  if (outf) {
    const json = JSON.stringify(parsed, (k, v) => typeof v === 'bigint' ? v.toString() : v)
    fs.writeFileSync(outf, json)
  } else {
    console.log(nbt.simplify(parsed))
  }

  return true
}

module.exports = { main, write, read }
