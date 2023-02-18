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
    maxIndent?: number,
    packType?: "strict" | "not_strict" | "inner_strict"
  }) {
  const indent = (option?.space)
      ? (typeof option.space == "string") ? option.space : [...Array(option.space)].map(_x => " ").join("")
      : "  "

  const maxlength = option?.maxLength ?? 100
  const packType = option?.packType ?? false

  function _stringify(
    obj: Record<string, any>,
    currentIndent:string,
    reserved: number,
    indentCount: number,
  ): ((depth:number) => string) | undefined {

    // 再帰なし
    const stringified = JSON.stringify(obj)
    const prettified = stringified.replace(stringOrChar, str_replcer)
    const lengthLimit = maxlength - currentIndent.length - reserved  // 上限までの残りの文字数

    if (stringified === undefined) { return stringified as undefined }

    if (prettified.length <= lengthLimit) {
      return (_depth:number) => prettified
    }
    // なので、JSON.stringify() の結果が文字数上限を越えないなら space の設定は無視される


    // 再帰あり
    if (typeof obj === "object" && obj !== null) {
      const nextIndent = currentIndent + indent
      const items:Array<(depth:number) => string> = []
      let start: string
      let end: string

      if (Array.isArray(obj)) {
        start = "["
        end = "]"
        const last_idx = obj.length - 1
        obj.forEach((_x,index) => {
          const val = _stringify(obj[index], nextIndent, index === last_idx ? 0 : 1, indentCount+1)
          items.push( val === undefined ? (_depth:number) => "null" : val)
        })
      } else {
        start = "{"
        end = "}"
        const last_idx = Object.keys(obj).length - 1
        Object.entries(obj).forEach(([key,val], index) => {
          const keyPart = `${JSON.stringify(key)}: `
          const newReseve = keyPart.length + (index === last_idx ? 0 : 1)
          const value = _stringify(val, nextIndent, newReseve, indentCount+1)
          if (value !== undefined) {
            items.push( (depth:number) => keyPart + value(depth))
          }
        })
      }

      if (items.length > 0) {
        const indented = (depth:number) => {
          if (depth <= indentCount && !packType){
            return prettified
          }
          else if (depth <= indentCount && packType){
            if (packType == "not_strict"){
              const initial = (depth < indentCount) ? "" : " "
              const packed_items = indent + pack(items, lengthLimit, depth, initial).map(t => t.trimStart()).join(`\n${nextIndent}`)
              return [start, packed_items, end].join(`\n${currentIndent}`)
            }
            else if (packType == "inner_strict" && depth == indentCount){
              const packed_items = indent + pack(items, lengthLimit, depth, " ").map(t => t.trimStart()).join(`\n${nextIndent}`)
              return [start, packed_items, end].join(`\n${currentIndent}`)
            }
            else {
              const initial = (packType == "inner_strict")
                ? (depth < indentCount-1) ? "" : " "
                : (depth < indentCount) ? "" : " "
              const packed_items = pack(items, lengthLimit, depth, initial).join(`\n${currentIndent}`)
              return start + packed_items + end
            }
          }
          else {
            const indented_items = indent + items.map(f => f(depth)).join(`,\n${nextIndent}`)
            return [start, indented_items, end].join(`\n${currentIndent}`)
          }
        }
        return indented
      }
    }

    return (_depth:number) => stringified
  }

  const applied = _stringify(input, "", 0, 0)
  if (applied === undefined){ return applied }

  if (option?.maxIndent === undefined){
    return applied(Infinity)
  }
  else if (option?.maxIndent >= 0){
    return applied(option.maxIndent)
  }
  else if (option?.maxIndent < 0){
    const not_pack = applied(Infinity)
    const max_depth = Math.floor(get_max_indent(not_pack).length/indent.length)
    const packing_depth = max_depth + option.maxIndent
    return applied(packing_depth)
  }
  else {
    return applied(Infinity)
  }
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
  items: Array<(depth:number) => string>,
  lengthLimit: number,
  depth: number,
  initial: string
): Array<string> {
  const densed: Array<string> = []
  const last = items.reduce( (pre, item) => {
    const added = pre + item(depth) + ", "
    if (added.length <= lengthLimit -1){
      return added
    } else {
      densed.push(pre.trimEnd())
      return initial + item(depth) + ", "
    }
  } , "")
  return [...densed, (last.endsWith(", ")) ? last.slice(0,-2) : last]
}