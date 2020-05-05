function purchaseView(purchase) {
  purchase.id = purchase._id;
  delete purchase._id;

  if (purchase.status == 0) {
    purchase.status = "Em validação";
  } else {
    purchase.status = "Aprovado";
  }

  return purchase;
}

function listPurchaseView(data) {
  return {
    purchases: data.purchases.map((purchase) => purchaseView(purchase)),
    previous: data.previous,
    next: data.next,
  };
}

export { purchaseView, listPurchaseView };
