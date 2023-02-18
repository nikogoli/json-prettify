import { assertEquals } from "https://deno.land/std@0.177.0/testing/asserts.ts"

import { stringify } from "./stringify.ts"

const base_obj = {
  bool: true,
  string: "string",
  short: [1, 2, 3],
  long: [
    {x: 1, y: 2},
    {x: 2, y: 1, z: 1000000, a: 1000, b: 1000, c: 1000, d: 1000},
    {x: 1, y: 1},
    {x: 2, y: 2}
  ]
}

const expanded = `{
  "bool": true,
  "string": "string",
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
}`

const indent2_no_break =`{
  "bool": true,
  "string": "string",
  "short": [1, 2, 3],
  "long": [
    {"x": 1, "y": 2},
    {"x": 2, "y": 1, "z": 1000000, "a": 1000, "b": 1000, "c": 1000, "d": 1000},
    {"x": 1, "y": 1},
    {"x": 2, "y": 2}
  ]
}`

const indent1_no_break = `{
  "bool": true,
  "string": "string",
  "short": [1, 2, 3],
  "long": [{"x": 1, "y": 2}, {"x": 2, "y": 1, "z": 1000000, "a": 1000, "b": 1000, "c": 1000, "d": 1000}, {"x": 1, "y": 1}, {"x": 2, "y": 2}]
}`

const indent2_strict =`{
  "bool": true,
  "string": "string",
  "short": [1, 2, 3],
  "long": [
    {"x": 1, "y": 2},
    {"x": 2, "y": 1, "z": 1000000, "a": 1000, "b": 1000,
     "c": 1000, "d": 1000},
    {"x": 1, "y": 1},
    {"x": 2, "y": 2}
  ]
}`

const indent2_not_strict =`{
  "bool": true,
  "string": "string",
  "short": [1, 2, 3],
  "long": [
    {"x": 1, "y": 2},
    {
      "x": 2, "y": 1, "z": 1000000, "a": 1000, "b": 1000,
      "c": 1000, "d": 1000
    },
    {"x": 1, "y": 1},
    {"x": 2, "y": 2}
  ]
}`

const indent1_strict = `{
  "bool": true,
  "string": "string",
  "short": [1, 2, 3],
  "long": [{"x": 1, "y": 2},
   {"x": 2, "y": 1, "z": 1000000, "a": 1000, "b": 1000,
    "c": 1000, "d": 1000},
   {"x": 1, "y": 1}, {"x": 2, "y": 2}]
}`

const indent1_not_strict = `{
  "bool": true,
  "string": "string",
  "short": [1, 2, 3],
  "long": [
    {"x": 1, "y": 2},
    {
      "x": 2, "y": 1, "z": 1000000, "a": 1000, "b": 1000,
      "c": 1000, "d": 1000
    },
    {"x": 1, "y": 1}, {"x": 2, "y": 2}
  ]
}`

const indent1_inner_strict = `{
  "bool": true,
  "string": "string",
  "short": [1, 2, 3],
  "long": [
    {"x": 1, "y": 2},
    {"x": 2, "y": 1, "z": 1000000, "a": 1000, "b": 1000,
     "c": 1000, "d": 1000},
    {"x": 1, "y": 1}, {"x": 2, "y": 2}
  ]
}`

const _max = 60


Deno.test("simple な入力の処理", async t => {
  const vs = [
    [null, `null`],
    [true, `true`],
    [false, `false`],
    [[], `[]`],
    [{}, `{}`],
    ["文字列", `"文字列"`],
    [1, `1`],
    [0.1, `0.1`],
    [-5.2e50, `-5.2e+50`]
  ]

  await vs.reduce( (pre, [input, excepted]) => pre.then(async () => {
    await t.step(`OK: ${input} を入力すると ${excepted} が返る`, () => {
      assertEquals(stringify(input), excepted)
    })
  }) , Promise.resolve())
})


Deno.test("対応範囲外の入力の処理", async t => {
  const vs = [undefined, Function, { toJSON: Function.prototype }]

  await vs.reduce( (pre, input) => pre.then(async () => {
    await t.step(`OK: ${input} を入力すると undefined が返る`, () => {
      assertEquals(stringify(input), undefined)
    })
  }), Promise.resolve())
})


Deno.test("packing", async t => {
  await t.step("設定なし", () => {
    assertEquals(stringify(base_obj, {maxLength:_max}), expanded)
  })

  await t.step("maxIndent 2、packType: デフォルト (false)", () => {
    assertEquals(stringify(base_obj, {maxLength:_max, maxIndent:2}), indent2_no_break)
  })

  await t.step("maxIndent 2、packType: strict", () => {
    assertEquals(stringify(base_obj, {maxLength:_max, maxIndent:2, packType:"strict"}), indent2_strict)
  })

  await t.step("maxIndent 2、packType: not_strict", () => {
    assertEquals(stringify(base_obj, {maxLength:_max, maxIndent:2, packType:"not_strict"}), indent2_not_strict)
  })

  await t.step("maxIndent 1、packType: デフォルト (false)", () => {
    assertEquals(stringify(base_obj, {maxLength:_max, maxIndent:1}), indent1_no_break)
  })

  await t.step("maxIndent 1、packType: strict", () => {
    assertEquals(stringify(base_obj, {maxLength:_max, maxIndent:1, packType:"strict"}), indent1_strict)
  })

  await t.step("maxIndent 1、packType: not_strict", () => {
    assertEquals(stringify(base_obj, {maxLength:_max, maxIndent:1, packType:"not_strict"}), indent1_not_strict)
  })

  await t.step("maxIndent -1、packType: デフォルト (false)", () => {
    assertEquals(stringify(base_obj, {maxLength:_max, maxIndent:-1}), indent2_no_break)
  })

  await t.step("maxIndent -1、packType: not_strict", () => {
    assertEquals(stringify(base_obj, {maxLength:_max, maxIndent:-1, packType:"not_strict"}), indent2_not_strict)
  })

  await t.step("maxIndent -1、packType: strict", () => {
    assertEquals(stringify(base_obj, {maxLength:_max, maxIndent:-1, packType:"strict"}), indent2_strict)
  })

  await t.step("maxIndent -1、packType: inner_strict", () => {
    assertEquals(stringify(base_obj, {maxLength:_max, maxIndent:-1, packType:"inner_strict"}), indent2_not_strict)
  })

  await t.step("maxIndent -2、packType: デフォルト (false)", () => {
    assertEquals(stringify(base_obj, {maxLength:_max, maxIndent:-2}), indent1_no_break)
  })

  await t.step("maxIndent -2、packType: not_strict", () => {
    assertEquals(stringify(base_obj, {maxLength:_max, maxIndent:-2, packType:"not_strict"}), indent1_not_strict)
  })

  await t.step("maxIndent -2、packType: strict", () => {
    assertEquals(stringify(base_obj, {maxLength:_max, maxIndent:-2, packType: "strict"}), indent1_strict)
  })

  await t.step("maxIndent -2、packType: inner_strict", () => {
    assertEquals(stringify(base_obj, {maxLength:_max, maxIndent:-2, packType: "inner_strict"}), indent1_inner_strict)
  })
})