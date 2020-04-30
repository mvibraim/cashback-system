resellerView = (reseller) => {
  return {
    id: reseller._id,
    full_name: reseller.full_name,
    cpf: reseller.cpf,
    email: reseller.email
  }
}

listResellerView = (data) => {
  return {
    results: data.results.map((reseller) => resellerView(reseller)),
    previous: data.previous,
    hasPrevious: data.hasPrevious,
    next: data.next,
    hasNext: data.hasNext
  }
}

module.exports = {
  resellerView,
  listResellerView
}