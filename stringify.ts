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
    packType?: "strict" | "not_strict"
  } | {
    space?: string|number,
    maxLength?: number,
    packAt?: number,
    packType?: "strict" | "inner_strict"
  }
) {
  const { space, maxLength, ...others } = option ? option : { space:undefined, maxLength:undefined }
  const indent = (option?.space)
      ? (typeof space == "string") ? space : [...Array(space)].map(_x => " ").join("")
      : "  "

  const maxlength = maxLength ? maxLength : 100
  const opt = { maxIndent: Infinity, packType: false as const, packAt: Infinity, ...others }
  if (opt.packAt !== Infinity && opt.packType === false){
    opt.packType = "not_strict"
  }

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
    else if (indentCount >= opt.maxIndent && !opt.packType){
      return (_depth:number) => prettified
    }
    else if (prettified.length <= lengthLimit) {
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
          if (depth <= indentCount && opt.packType){
            if (opt.packType == "not_strict"){
              const initial = (depth < indentCount) ? "" : " "
              const packed_items = indent + pack(items, lengthLimit, depth, initial).map(t => t.trimStart()).join(`\n${nextIndent}`)
              return [start, packed_items, end].join(`\n${currentIndent}`)
            }
            else if (opt.packType == "inner_strict" && depth == indentCount){
              const packed_items = indent + pack(items, lengthLimit, depth, " ").map(t => t.trimStart()).join(`\n${nextIndent}`)
              return [start, packed_items, end].join(`\n${currentIndent}`)
            }
            else {
              const initial = (opt.packType == "inner_strict")
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
  const not_pack = applied(Infinity)

  if (opt.packAt !== Infinity){ // packAt の設定がある場合
    const max_depth = Math.floor(get_max_indent(not_pack).length/indent.length)
    const packing_depth = opt.packAt <= 0 ? max_depth + opt.packAt : max_depth - 1
    return applied(packing_depth)
  }
  else if (opt.maxIndent !== Infinity && opt.packType){ // maxIndent & packType の設定がある場合
    return applied(opt.maxIndent)
  }
  else {
    return not_pack
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