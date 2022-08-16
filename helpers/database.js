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
  }
}
