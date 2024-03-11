# nbt-dump
[![NPM version](https://img.shields.io/npm/v/nbt-dump.svg)](http://npmjs.com/package/nbt-dump)
[![Build Status](https://github.com/extremeheat/nbt-dump/actions/workflows/ci.yml/badge.svg)](https://github.com/extremeheat/nbt-dump/actions/workflows/)
[![Gitpod ready-to-code](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/extremeheat/nbt-dump)

A simple command line Node.js tool to read and write NBT files to JSON and back. Supports big, little and little-varint encoding.

Uses `prismarine-nbt` for serialization and deserialization, see https://github.com/PrismarineJS/prismarine-nbt for more info on schema.

### Usage 

via npx:
```sh
npx nbt-dump --help
```

via npm:
```
npm install -g nbt-dump
nbt-dump --help
```

```
usage, feel free to use natural language:
Parse an NBT file to JSON: 
    nbt-dump <path-to-nbt-file> [out-json-file] [little|big|varint]

    nbt-dump level.dat
        (Dump the contents of level.dat to terminal)
    nbt-dump level.dat to level.json
        (Dump the contents of level.dat to JSON)
    nbt-dump level.dat as little to level.json
        (Dump the contents of little endian encoded level.dat to JSON)

Write an JSON file to uncompressed NBT (defaults to big endian):
    nbt-dump write <path-to-json> [out-nbt-file] [little|big|varint]

    nbt-dump write level.json to level.dat
    nbt-dump write level.json to level.dat as little

You can also pipe the input to nbt-dump:
    cat level.dat | nbt-dump
    cat level.dat | nbt-dump to level.json
    cat level.json | nbt-dump write
    cat level.json | nbt-dump write to level.dat
```

### Example

If you do not specify endianness, it will automatically be inferred.

Parse to json, and back to nbt as big endian
```sh
$ nbt-dump level.dat level.json
* Dumping NBT file "file.nbt" to "file.json" as JSON
(as big endian)
$ nbt-dump write level.json level.dat
* Writing JSON from "file.json" to "file.nbt" as big endian
written!
```

Write as little endian
```sh
$ nbt-dump level.dat level.json
* Dumping NBT file "file.nbt" to "file.json" as JSON
(as big endian)
$ nbt-dump write level.json level.dat little
* Writing JSON from "file.json" to "file.nbt" as little endian
```
