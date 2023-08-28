#!/usr/bin/env node
const fs = require('fs')
const nbt = require('prismarine-nbt')
const RegionFile = require('./RegionFile')

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

function main (args, argsStr) {
  if (args.length == 0 || argsStr.includes('help')) {
    console.warn(usage)
    process.exit(1)
  }
  if (args[0] == 'read') args.shift()
  let files = []
  for (const arg of args) {
    if (arg.includes('.')) files.push(arg)
  }
  const getFmt = () => {
    if (args.includes('big')) return 'big'
    if (args.includes('varint')) return 'littleVarint'
    if (args.includes('little')) return 'little'
    return undefined
  }
  if (args[0] == 'write') {
    if (!files.length && args[1]) files.push(args[1])
    if (files.length == 1) files.push(files[0] + '.nbt')
    if (files.length == 2) return write(...files, getFmt())
  } else {
    if (!files.length) files = [args[0], args[0] + '.json']
    return read(files[0], files[1], getFmt())
  }

  console.error('Bad arguments')
  console.warn(arguments)
}

function write (inpf, outf, fmt) {
  if (outf.endsWith('.mca')) return writeAnvilRegion(inpf, outf)
  console.log(`* Writing JSON from "${inpf}" to "${outf}" as ${fmt || 'big'} endian`)

  const json = JSON.parse(fs.readFileSync(inpf))
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
  if (inpf.endsWith('.mca')) return readAnvilRegion(inpf, outf)
  console.log(`* Dumping NBT file "${inpf}" to "${outf || 'stdout'}" as JSON ${fmt ? 'as ' + fmt : ''}`)

  const buffer = await fs.promises.readFile(inpf)
  const { parsed, type } = await nbt.parse(buffer, fmt)

  if (!fmt) console.log(`(as ${type} endian)`)
  if (outf) {
    const json = JSON.stringify(parsed, (k, v) => typeof v === 'bigint' ? v.toString() : v)
    fs.writeFileSync(outf, json)
  } else {
    console.dir(nbt.simplify(parsed), { depth: null })
  }

  return true
}

async function writeAnvilRegion (inputFile, outputRegion) {
  console.log(`* Writing JSON from "${inputFile}" to "${outputRegion}" as an Anvil-format chunk`)
  const json = JSON.parse(fs.readFileSync(inputFile))
  const region = new RegionFile(outputRegion)
  await region.initialize()
  for (const chunk of json) {
    // console.dir(chunk.tag,{depth:null})
    // const tag = nbt.writeUncompressed(chunk.tag, 'big')
    await region.write(chunk.x, chunk.z, chunk.tag)
  }
  await region.close()
}

async function readAnvilRegion (inputFile, outputFile) {
  console.log(`* Dumping region file "${inputFile}" to "${outputFile || 'stdout'}" as JSON`)
  const region = new RegionFile(inputFile)
  await region.initialize()
  const data = []
  const chunks = await region.readAll()
  for (const [[x, z], chunk] of chunks) {
    console.log(nbt.writeUncompressed(JSON.parse(JSON.stringify(chunk)), 'big'))
    // const x = chunk.value.Level.value.xPos.value ?? chunk.value.xPos.value
    // const z = chunk.value.Level.value.zPos.value ?? chunk.value.zPos.value
    data.push({ x, z, tag: chunk })
    if (!outputFile) {
      const j = JSON.stringify(nbt.simplify(chunk), (k, v) => {
        if (typeof v.valueOf() === 'bigint') return parseInt(v)
        if (Array.isArray(v) && v.length > 20) {
          return `(${v.length} collapsed entries)`
        }
        return v
      })
      const parsed = JSON.parse(j)
      console.log('X:', parsed.Level.xPos || parsed.xPos, 'Z:', parsed.Level.zPos || parsed.zPos)
      console.dir(parsed, { depth: null })
    }
  }
  if (outputFile) fs.writeFileSync(outputFile, JSON.stringify(data))
  await region.close()
}

const args = process.argv.slice(2)
main(args, args.join(' '))
