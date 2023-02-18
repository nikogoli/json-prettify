# json-pretty-compact

forked from [lydell / json-stringify-pretty-compact](https://github.com/lydell/json-stringify-pretty-compact)

`JSON.stringify()` による過度なインデントの挿入を修正する。
```json
"stringify(obj, {maxLength:60, packAt: -1)"

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
    space?: string|number,  maxLength?: number,
    maxIndent?: number,     packType?: "strict" | "not_strict"
  } | {
    space?: string|number,  maxLength?: number,
    packAt?: number,        packType?: "strict" | "inner_strict"
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
  "short array": [1, 2, 3],
  "long array": [
    {"x": 1, "y": 2},
    {"x": 2, "y": 1, "z": 1000000, "a": 1000, "b": 1000, "c": 1000, "d": 1000},
    {"x": 1, "y": 1},
    {"x": 2, "y": 2}
  ]
}
             "↓"
{
  "bool": true,
  "short array": [1, 2, 3],
  "long array": [
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
`maxIndent` と `withPack`, あるいは `packAt` と `strict` の設定することでこの挙動を調整し、文字数上限 (maxLength) まで1行に要素を並べることができる。

- **maxIndent**：正の数で指定。指定した数およびそれより深い階層ではオブジェクトや配列の展開形式を変更する。
- **packType**：変更後のオブジェクトや配列の展開形式。デフォルト `false`
  - `false`：常に1行に展開し、文字数上限は無視する。
  - `strict`：文字数上限を基準に複数行に展開する。`{ }`や`[ ]` の前後で改行しない。
  - `not_strict`：文字数上限を基準に複数行に展開する。`{ }`や`[ ]` の前後で改行してインデントを挿入する。<br><br>
- **packAt**：負の数で指定。最も深い階層から指定した数だけ逆算し、その階層およびそれより深い階層ではオブジェクトや配列を文字数上限を基準にして展開する。
- **packType**：変更後のオブジェクトや配列の展開形式。デフォルト `not_strict`
  - `not_strict`：文字数上限を基準に複数行に展開する。`{ }`や`[ ]` の前後で改行してインデントを挿入する。
  - `strict`：文字数上限を基準に複数行に展開する。`{ }`や`[ ]` の前後で改行しない。
  - `inner_strict`：文字数上限を基準に複数行に展開する。指定した階層では`not_strict`、それより深い階層では`strict`を適用する。

----

```JSON
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
```JSON
"stringify(obj, {maxLength:60, packAt: -1})"

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
```JSON
"stringify(obj, {maxLength:60, packAt: -1, packType: 'strict'})"

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
"stringify(obj, {maxLength:60, packAt: -2})"
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
"stringify(obj, {packAt: -2, packType: 'strict'})"

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
"stringify(obj, {packAt: -2, packType: 'inner_strict'})"

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