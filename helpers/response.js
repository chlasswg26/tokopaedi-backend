module.exports = (response, status, data, pagination) => {
  const result = {}
  result.status = status || 200
  result.data = data

  if (pagination) result.pagination = pagination

  return response
    .status(result.status)
    .json(result)
}
