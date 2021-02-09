# nbt-dump

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
    nbt-dump level.dat to level.json
    nbt-dump level.dat as little to level.json

Write an JSON file to uncompressed NBT (defaults to big endian):
    nbt-dump write <path-to-json> [out-nbt-file] [little|big|varint]

    nbt-dump write level.json to level.dat
    nbt-dump write level.json to level.dat as little
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
