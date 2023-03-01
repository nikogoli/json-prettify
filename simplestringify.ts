class InnerItems {
  type:"array" | "obj";
  values:Array<((depth:number) => string) | string>;
  keys: Array<string>;

  constructor (type: "array" | "obj") {
    this.type = type
    this.values = []
    this.keys= []
  }

  items (depth: number) {
    return this.type == "array"
        ? this.values
        : this.keys.map((k, idx) => {
          const v = this.values[idx]
          return  k + ((typeof v == "string") ? v : v(depth))
        } )
  }
}

const stringOrChar = /("(?:[^\\"]|\\.)*")|[:,]/g // 文字列 or 区切り文字にマッチする

const str_replcer: Parameters<typeof String.prototype.replace>[1] = (match, captured) => {
  // 文字列はそのままで、区切り文字 : と , には後ろに半角空白を加える
  return captured || `${match} `
}


export function stringify(
  input: any,
  option?: {
    space?: string|number,
    maxLength?: number,
  }) {
  const indent = (option?.space)
      ? (typeof option.space == "string") ? option.space : [...Array(option.space)].map(_x => " ").join("")
      : "  "

  const maxlength = option?.maxLength ?? 100

  function _stringify(
    obj: Record<string, any>,
    currentIndent:string,
    reserved: number,
    indentCount: number,
    is_ArrayElem: boolean,
  ): ((depth:number) => string) | string | undefined {

    // 再帰なし
    const stringified = JSON.stringify(obj)
    if (stringified === undefined) { return stringified }

    const prettified = stringified.replace(stringOrChar, str_replcer)
    const lengthLimit = maxlength - currentIndent.length - reserved  // 上限までの残りの文字数

    if (prettified.length <= lengthLimit) {
      return prettified // JSON.stringify() の結果が文字数上限を越えないなら space の設定は無視
    }


    // 再帰あり
    if (typeof obj === "object" && obj !== null) {
      const nextIndent = currentIndent + indent
      let start: string
      let end: string
      let inner: InnerItems

      if (Array.isArray(obj)) {
        inner = new InnerItems("array")
        start = "["
        end = "]"
        const last_idx = obj.length - 1
        obj.forEach((_x,index) => {
          const newReseve = index === last_idx ? 0 : 1
          const val = _stringify(obj[index], nextIndent, newReseve, indentCount+1, true)
          inner.values.push( val === undefined ? "null" : val)
        })
      } else {
        inner = new InnerItems("obj")
        start = "{"
        end = "}"
        const last_idx = Object.keys(obj).length - 1
        Object.entries(obj).forEach(([key,val], index) => {
          const keyPart = `${JSON.stringify(key)}: `
          const newReseve = keyPart.length + (index === last_idx ? 0 : 1)
          const value = _stringify(val, nextIndent, newReseve, indentCount+1, false)
          if (value !== undefined) {
            if (typeof value == "string"){
              inner.keys.push(keyPart)
              inner.values.push(value)
            } else {
              inner.keys.push(keyPart)
              inner.values.push((depth:number) => value(depth))
            }
          }
        })
      }

      if (inner.values.length > 0) {
        const indented = (depth:number) => {
          //console.log({isStr: items.every(item => typeof item == "string"), items})
          if (inner.values.every(item => typeof item == "string")){
            const packed_items = pack(inner, lengthLimit, depth)
            if (is_ArrayElem){
              return start + packed_items.join(`\n${currentIndent}`+" ") + end
            } else {
              return [start, indent + packed_items.join(`\n${nextIndent}`+""), end].join(`\n${currentIndent}`)
            }
          }

          if (depth <= indentCount){
            return prettified
          }
          else {
            const items = inner.items(depth)
            const indented_items = indent + items.map(f => typeof f == "string" ? f : f(depth)).join(`,\n${nextIndent}`)
            return [start, indented_items, end].join(`\n${currentIndent}`)
          }
        }
        return indented
      }
    }

    return (_depth:number) => stringified
  }

  const applied = _stringify(input, "", 0, 0, false)
  if (applied === undefined || typeof applied == "string"){ return applied as string }

  return applied(Infinity)
}


export function get_max_indent(str:string): string{
  const m = str.match(/\n +["\w[{]/g)
  if (m){
    return m.reduce( (num, t) => t.length -2 > num.length ? t.slice(1,-1) : num , "")
  } else {
    return ""
  }
}


export function pack(
  inner: InnerItems,
  lengthLimit: number,
  depth: number,
): Array<string> {
  const densed: Array<string> = []
  const items = inner.items(depth)
  const last = items.map(v => typeof v == "string" ? v : v(depth))
    .reduce( (pre, item) => {
      const added = pre + item + ", "
      if (added.length <= lengthLimit -1){
        return added
      } else {
        densed.push(pre.trimEnd())
        return item + ", "
      }
    } , "")
  return [...densed, (last.endsWith(", ")) ? last.slice(0,-2) : last]
}