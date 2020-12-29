# nbt-dump

A simple command line Node.js tool to read and write NBT files to JSON and back. Supports big, little and little-varint encoding.

Uses `prismarine-nbt` for serialization and deserialization, see https://github.com/PrismarineJS/prismarine-nbt for more info on schema.

```sh
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