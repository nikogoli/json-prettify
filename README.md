# json-stringify-pretty-compact

forked from [lydell/json-stringify-pretty-compact](https://github.com/lydell/json-stringify-pretty-compact)

`JSON.stringify()` による過度なインデントの挿入を修正し、JSON を "prettify" された文字列として出力する。
```json
{
  "bool": true,
  "short array": [1, 2, 3],
  "long array": [
    {"x": 1, "y": 2},
    {"x": 2, "y": 1},
    {"x": 1, "y": 1},
    {"x": 2, "y": 2}
  ]
}
```

## Usage
```ts
function stringify(input: any, space?: string|number, maxLength?: number)
```
- space: インデントの設定。JSON.stringify() の引数 space と同じ。
- maxLength: 1行の文字数の上限。これを超える行では改行する。デフォルト 100。

なお、`JSON.stringify(input, null, 0)` の結果が maxLength 以下のとき、`stringify(input, X)` は**改行せず X を無視する**。

------

```ts
import { stringify } from "https://pax.deno.dev/nikogoli/json-prettify"
// this means : import { stringify } from "https://raw.githubusercontent.com/nikogoli/json-prettify/master/mod.ts"

const prettified = stringify({
  "bool": true,
  "short array": [1, 2, 3],
  "long array": [
    {"x": 1, "y": 2},
    {"x": 2, "y": 1},
    {"x": 1, "y": 1},
    {"x": 2, "y": 2}
  ]
})

console.log(prettified)
```