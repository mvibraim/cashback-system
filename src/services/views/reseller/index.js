function resellerView(reseller) {
  return {
    id: reseller._id,
    full_name: reseller.full_name,
    cpf: reseller.cpf,
    email: reseller.email
  }
}

export { resellerView }
