// based_on https://github.com/lydell/json-stringify-pretty-compact

export function stringify(input: any, space?:string|number, maxLength?: number) {
  const stringOrChar = /("(?:[^\\"]|\\.)*")|[:,]/g

  const indent = (space)
      ? (typeof space == "string") ? space : [...Array(space)].map(_x => " ").join("")
      : "  "

  const maxlength = (maxLength) ? maxLength : 100

  function _stringify(
    obj: Record<string, any>,
    currentIndent:string,
    reserved: number
  ) {
    const string = JSON.stringify(obj)
    if (string === undefined) { return string }
    const length = maxlength - currentIndent.length - reserved

      // indent = 0 での結果が limit 以下なら indent は考慮しない
      if (string.length <= length) {
        const prettified = string.replace(
          stringOrChar,
          (match, stringLiteral) => { return stringLiteral || `${match} ` }
        )
        if (prettified.length <= length) {
          return prettified
        }
      }

      if (typeof obj === "object" && obj !== null) {
        const nextIndent = currentIndent + indent
        const items:Array<string> = []
        let start
        let end

        if (Array.isArray(obj)) {
          start = "["
          end = "]"
          const max = obj.length
          obj.forEach((_x,index) => {
            items.push(
              _stringify(obj[index], nextIndent, index === max - 1 ? 0 : 1) ||
                "null"
            )
          })
        } else {
          start = "{"
          end = "}"
          const max = Object.keys(obj).length
          Object.entries(obj).forEach(([key,val], index) => {
            const keyPart = `${JSON.stringify(key)}: `
            const newReseve = keyPart.length + (index === max - 1 ? 0 : 1)
            const value = _stringify(val, nextIndent, newReseve)
            if (value !== undefined) {
              items.push(keyPart + value)
            }
          })
        }

        if (items.length > 0) {
          return [start, indent + items.join(`,\n${nextIndent}`), end].join(
            `\n${currentIndent}`
          )
        }
      }

      return string
  }
  return _stringify(input, "", 0)
}