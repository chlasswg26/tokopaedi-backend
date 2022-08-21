module.exports = {
  queryWithKey: (id, table, command, columns, prefix) => {
    const query = [table]
    query.push(command)

    const set = []
    Object.keys(columns).forEach(function (key, i) {
      set.push(`${key} = $${i + 1}`)
    })
    query.push(set.join(', '))

    query.push(prefix ? `WHERE id = ${id} ${prefix}` : `WHERE id = ${id}`)

    return query.join(' ')
  },
  queryWithValue: (body) => {
    return Object.keys(body).map(function (key) {
      return body[key]
    })
  },
  mappingKey: (object = {}) => {
    return Object.keys(object)
      .map(key => `${key}${object[key]}`)
      .join('')
  },
  random: function (length) {
    let result = ''
    const characters = '0123456789'
    const charactersLength = characters.length
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }

    return result
  }
}
