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
    indentLimit?: number,
    strict?: true,
}) {
  const indent = (option?.space)
      ? (typeof option.space == "string") ? option.space : [...Array(option.space)].map(_x => " ").join("")
      : "  "

  const maxlength = option?.maxLength ? option.maxLength : 100
  const indentLimit = option?.indentLimit ? option.indentLimit : Infinity
  const strict = option?.strict ? option.strict : false

  function _stringify(
    obj: Record<string, any>,
    currentIndent:string,
    reserved: number,
    indentCount: number,
  ) {
    // 再帰なし
    const string = JSON.stringify(obj)
    const prettified = string.replace(stringOrChar, str_replcer)  // JSON.stringify() & replace
    const lengthLimit = maxlength - currentIndent.length - reserved // 上限までの残りの文字数

    if (string === undefined) {                           // 不適切な入力の場合: undefined
      return string
    }
    else if (!strict && indentCount >= indentLimit){      // インデント上限の場合: JSON.stringify() & replace
      return prettified
    }
    else if (prettified.length <= lengthLimit) {          // 文字数が上限以下の場合: JSON.stringify() & replace
      return prettified
    } // なので、インデントなしの結果が文字数上限を越えないなら space の設定は無視される


    // 再帰あり
    if (typeof obj === "object" && obj !== null) {
      const nextIndent = currentIndent + indent
      const items:Array<string> = []
      let start
      let end

      if (Array.isArray(obj)) {
        start = "["
        end = "]"
        const last_idx = obj.length - 1
        obj.forEach((_x,index) => {
          items.push(
            _stringify(obj[index], nextIndent, index === last_idx ? 0 : 1, indentCount+1) ||
            "null"
          )
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
            items.push(keyPart + value)
          }
        })
      }

      if (items.length > 0) {
        if (strict && indentCount >= indentLimit){
          const flexed_items = flex(items, lengthLimit, indentCount > indentLimit).join(`\n${currentIndent}`)
          return start + flexed_items + end
        } else {
          const indented_items = indent + items.join(`,\n${nextIndent}`)
          return [start, indented_items, end].join(`\n${currentIndent}`)
        }
      }
    }

    return string
  }
  return _stringify(input, "", 0, 0)
}


export function flex(
  items: Array<string>,
  lengthLimit: number,
  is_nested: boolean
): Array<string> {
  const densed: Array<string> = []
  const last = items.reduce( (pre, item) => {
    const added = pre + item + ", "
    if (added.length <= lengthLimit -1){
      return added
    } else {
      densed.push(pre)
      return is_nested ? item + ", " : " " + item + ", "
    }
  } , "")
  return [...densed, (last.endsWith(", ")) ? last.slice(0,-2) : last]
}