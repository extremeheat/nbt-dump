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
`

function main(args, argsStr) {
  if (args.length == 0 || argsStr.includes('help')) {
    console.warn(usage)
    process.exit(1)
  }
  if (args[0] == 'read') args.shift()
  let files = []
  for (var arg of args) {
    if (arg.includes('.')) files.push(arg)
  }
  const getFmt = () => {
    if (args.includes('big')) return 'big'
    if (args.includes('varint')) return 'littleVarint'
    if (args.includes('little')) return 'little'
    return ''
  }
  if (args[0] == 'write') {
    if (!files.length && args[1]) files.push(args[1])
    if (files.length == 1) files.push(files[0] + '.nbt')
    if (files.length == 2) return write(...files, getFmt())
  } else {
    if (!files.length) files = [args[0], args[0] + '.json']
    // if (files.length == 1) files.push(files[0] + '.json')
    return read(files[0], files[1], getFmt())
  }

  console.error('Bad arguments')
  console.warn(arguments)
}

function write(inpf, outf, fmt) {
  console.log(`* Writing JSON from "${inpf}" to "${outf}" as ${fmt || 'big'} endian`)

  const json = JSON.parse(fs.readFileSync(inpf))
  const outBuffer = fs.createWriteStream(outf)

  try {
    const newBuf = nbt.writeUncompressed(result, json)
    outBuffer.write(newBuf)
    outBuffer.end(() => console.log('written!'))
  } catch (e) {
    console.warn('Failed to write. Make sure that the JSON schema matches the prismarine-nbt ProtoDef schema. See https://github.com/PrismarineJS/prismarine-nbt')
    throw e
  }
  return
}

async function read(inpf, outf, fmt) {
  console.log(`* Dumping NBT file "${inpf}" to "${outf || 'stdout'}" as JSON ${fmt ? 'as ' + fmt : ''}`)

  const buffer = await fs.promises.readFile(inpf)
  const { result, type } = await nbt.parse(buffer, fmt)

  if (outf) {
    const json = JSON.stringify(result, (k, v) => typeof v === 'bigint' ? v.toString() : v)
    fs.writeFileSync(outf, json)
  } else {
    if (!fmt) console.log(`(as ${type} endian)`)
    console.log(nbt.simplify(result))
  }

  return true
}

const args = process.argv.slice(2)
main(args, args.join(' '))