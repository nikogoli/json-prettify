# json-pretty-compact

forked from [lydell / json-stringify-pretty-compact](https://github.com/lydell/json-stringify-pretty-compact)

`JSON.stringify()` による過度なインデントの挿入を修正する。
```json
"stringify(obj, { maxLength:60 })"
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

"stringify(obj, { maxLength:60, packType:'inner_strict' })"
{
  "bool": true,
  "short array": [1, 2, 3],
  "long array": [
    {"x": 1, "y": 2}, {"x": 2, "y": 1},
    {"x": 1, "y": 1}, {"x": 2, "y": 2}
  ]
}
```

## Usage
```ts
function stringify(
  input: any,
  option?: {
    space?: string|number,
    maxLength?: number,
    maxIndent?: number,
    packType?: "strict" | "not_strict" | "inner_strict"
  }
)
```
```ts
import { stringify } from "https://pax.deno.dev/nikogoli/json-pretty-compact"
// this means : import { stringify } from "https://raw.githubusercontent.com/nikogoli/json-pretty-compact/master/mod.ts"

console.log(someObject)
```
#### 基本設定
- **space**：インデントの設定。JSON.stringify() の引数 space と同じ。
- **maxLength**：1行の文字数の上限。これを超える行では改行する。デフォルト 100。

なお、`JSON.stringify(input, null, 0)` の結果が maxLength 以下のとき、`stringify(input, X)` は**改行せず X を無視する**。



----
#### コンパクト化の設定
`stringify()` は文字数の上限に達した場合、オブジェクトや配列の要素を1行ごとに展開する。このため、要素の大きさが不揃いな場合には行数が無駄に増えてしまう。
```JSON
{
  "bool": true,
  "short": [1, 2, 3],
  "long": [
    {"x": 1, "y": 2},
    {
      "x": 2,
      "y": 1,
      "z": 1000000,
      "a": 1000,
      "b": 1000,
      "c": 1000,
      "d": 1000
    },
    {"x": 1, "y": 1},
    {"x": 2, "y": 2}
  ]
}
```
`maxIndent` と `packType` の設定によってこの挙動を調整し、文字数上限 (maxLength) まで1行に要素を並べることができる。

- **maxIndent**：指定した数およびそれより深い階層において、オブジェクトや配列の展開形式を変更する。マイナスの数を渡すと最も深い階層から逆算する。
- **packType**：変更後のオブジェクトや配列の展開形式。デフォルト `false`
  - `false`：常に1行に展開し、文字数上限は無視する。
  - `strict`：文字数上限を基準に複数行に展開する。`{ }`や`[ ]` の前後で改行しない。
  - `not_strict`：文字数上限を基準に複数行に展開する。`{ }`や`[ ]` の前後で改行してインデントを挿入する。
  - `inner_strict`：文字数上限を基準に複数行に展開する。最初の階層では`{ }`や`[ ]` の前後で改行し、それより深い階層では改行しない。<br><br>

`packType`のみを設定した場合、`maxIndent:-1` が自動的に設定される。

----

第3階層以降の展開形式を変更するパターン
```JSON
"展開しない"
"stringify(obj, {maxLength:60, maxIndent: 2})"

{
  "bool": true,
  "short array": [1, 2, 3],
  "long array": [
    {"x": 1, "y": 2},
    {"x": 2, "y": 1, "z": 1000000, "a": 1000, "b": 1000, "c": 1000, "d": 1000},
    {"x": 1, "y": 1},
    {"x": 2, "y": 2}
  ]
}
```
```JSON
"文字数上限まで並べて改行 + { } で改行しない"
"stringify(obj, {maxLength:60, maxIndent: 2, packType: 'strict'})"

{
  "bool": true,
  "short array": [1, 2, 3],
  "long array": [
    {"x": 1, "y": 2},
    {"x": 2, "y": 1, "z": 1000000, "a": 1000, "b": 1000,
     "c": 1000, "d": 1000},
    {"x": 1, "y": 1},
    {"x": 2, "y": 2}
  ]
}
```
```JSON
"文字数上限まで並べて改行 + { } で改行する"
"stringify(obj, {maxLength:60, maxIndent: 2, packType: 'not_strict'})"

{
  "bool": true,
  "short array": [1, 2, 3],
  "long array": [
    {"x": 1, "y": 2},
    {
      "x": 2, "y": 1, "z": 1000000, "a": 1000, "b": 1000,
      "c": 1000, "d": 1000
    },
    {"x": 1, "y": 1},
    {"x": 2, "y": 2}
  ]
}
```
第2階層以降の展開形式を変更するパターン
```JSON
"展開しない"
"stringify(obj, {maxLength:60, maxIndent: 1})"

{
  "bool": true,
  "short array": [1, 2, 3],
  "long array": [{"x": 1, "y": 2}, {"x": 2, "y": 1, "z": 1000000, "a": 1000, "b": 1000, "c": 1000, "d": 1000}, {"x": 1, "y": 1}, {"x": 2, "y": 2}]
}
```
```JSON
"文字数上限まで並べて改行 + [ ] や { } で改行しない"
"stringify(obj, {maxLength:60, maxIndent: 1, packType: 'strict'})"

{
  "bool": true,
  "short array": [1, 2, 3],
  "long array": [{"x": 1, "y": 2},
   {"x": 2, "y": 1, "z": 1000000, "a": 1000, "b": 1000,
    "c": 1000, "d": 1000},
   {"x": 1, "y": 1}, {"x": 2, "y": 2}]
}
```
```JSON
"文字数上限まで並べて改行 + [ ] や { } で改行する"
"stringify(obj, {maxIndent: 1, packType: 'not_strict'})"
{
  "bool": true,
  "short array": [1, 2, 3],
  "long array": [
    {"x": 1, "y": 2},
    {
      "x": 2, "y": 1, "z": 1000000, "a": 1000, "b": 1000,
      "c": 1000, "d": 1000
    },
    {"x": 1, "y": 1}, {"x": 2, "y": 2}
  ]
}
```
```JSON
"文字数上限まで並べて改行 + 最初の階層のみ [ ] や { } で改行する"
"stringify(obj, {maxIndent: 1, packType: 'inner_strict'})"

{
  "bool": true,
  "short array": [1, 2, 3],
  "long array": [
    {"x": 1, "y": 2},
    {"x": 2, "y": 1, "z": 1000000, "a": 1000, "b": 1000,
     "c": 1000, "d": 1000},
    {"x": 1, "y": 1}, {"x": 2, "y": 2}
  ]
}
```
----
`maxIndent` が負の値の場合。
この例ではデフォルトが第3階層までの展開なので、`{maxIndent:-1}` は `{maxIndent:2}` と同じ。
```JSON
"展開しない"
"stringify(obj, {maxLength:60, maxIndent: -1})"

{
  "bool": true,
  "short array": [1, 2, 3],
  "long array": [
    {"x": 1, "y": 2},
    {"x": 2, "y": 1, "z": 1000000, "a": 1000, "b": 1000, "c": 1000, "d": 1000},
    {"x": 1, "y": 1},
    {"x": 2, "y": 2}
  ]
}
```
```JSON
"文字数上限まで並べて改行 + [ ] や { } で改行しない"
"stringify(obj, {maxLength:60, maxIndent: -1, packType: 'strict'})"

{
  "bool": true,
  "short array": [1, 2, 3],
  "long array": [
    {"x": 1, "y": 2},
    {"x": 2, "y": 1, "z": 1000000, "a": 1000, "b": 1000,
     "c": 1000, "d": 1000},
    {"x": 1, "y": 1},
    {"x": 2, "y": 2}
  ]
}
```
```JSON
"文字数上限まで並べて改行 + [ ] や { } で改行する"
"stringify(obj, {maxIndent: -1, packType: 'not_strict'})"

{
  "bool": true,
  "short array": [1, 2, 3],
  "long array": [
    {"x": 1, "y": 2},
    {
      "x": 2, "y": 1, "z": 1000000, "a": 1000, "b": 1000,
      "c": 1000, "d": 1000
    },
    {"x": 1, "y": 1},
    {"x": 2, "y": 2}
  ]
}
```
この例では、`{maxIndent:-2}` は `{maxIndent:1}` と同じ
```JSON
"展開しない"
"stringify(obj, {maxLength:60, maxIndent: -2})"

{
  "bool": true,
  "short array": [1, 2, 3],
  "long array": [{"x": 1, "y": 2}, {"x": 2, "y": 1, "z": 1000000, "a": 1000, "b": 1000, "c": 1000, "d": 1000}, {"x": 1, "y": 1}, {"x": 2, "y": 2}]
}
```
```JSON
"文字数上限まで並べて改行 + [ ] や { } で改行しない"
"stringify(obj, {maxLength:60, maxIndent: -2, packType: 'strict'})"

{
  "bool": true,
  "short array": [1, 2, 3],
  "long array": [{"x": 1, "y": 2},
   {"x": 2, "y": 1, "z": 1000000, "a": 1000, "b": 1000,
    "c": 1000, "d": 1000},
   {"x": 1, "y": 1}, {"x": 2, "y": 2}]
}
```
```JSON
"文字数上限まで並べて改行 + [ ] や { } で改行する"
"stringify(obj, {maxIndent: -2, packType: 'not_strict'})"

{
  "bool": true,
  "short array": [1, 2, 3],
  "long array": [
    {"x": 1, "y": 2},
    {
      "x": 2, "y": 1, "z": 1000000, "a": 1000, "b": 1000,
      "c": 1000, "d": 1000
    },
    {"x": 1, "y": 1}, {"x": 2, "y": 2}
  ]
}
```
```JSON
"文字数上限まで並べて改行 + 最初の階層のみ [ ] や { } で改行する"
"stringify(obj, {maxIndent: -2, packType: 'inner_strict'})"

{
  "bool": true,
  "short array": [1, 2, 3],
  "long array": [
    {"x": 1, "y": 2},
    {"x": 2, "y": 1, "z": 1000000, "a": 1000, "b": 1000,
     "c": 1000, "d": 1000},
    {"x": 1, "y": 1}, {"x": 2, "y": 2}
  ]
}
```