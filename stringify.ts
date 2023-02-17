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
    indentLimit?: number
}) {
  const indent = (option?.space)
      ? (typeof option.space == "string") ? option.space : [...Array(option.space)].map(_x => " ").join("")
      : "  "

  const maxlength = option?.maxLength ? option.maxLength : 100
  const indentLimit = option?.indentLimit ? option.indentLimit : Infinity

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

    if (string === undefined) {                       // 不適切な入力の場合
      return string                                   // undefined
    }
    else if (indentCount >= indentLimit){             // インデント上限に達している場合
      return prettified                               // JSON.stringify() & replace
    }
    else if (prettified.length <= lengthLimit) {      // 文字数が上限以下の場合
      return prettified                               // JSON.stringify() & replace
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
        const indented_items = indent + items.join(`,\n${nextIndent}`)
        return [start, indented_items, end].join(`\n${currentIndent}`)
      }
    }

    return string
  }
  return _stringify(input, "", 0, 0)
}