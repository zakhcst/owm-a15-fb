// Increments the counter for all OWM requests (updates to FB)
exports.onWriteToStatsCityUpdatesIncAll = (change, context) => {

  const ref = change.after.ref.root.child(`stats/u`);

  return ref.transaction(value => {
    return value ? value + 1 : 1;
  });
};

// Increments the counter for all OWM data reads from the DB
exports.onWriteToStatsCityReadsIncAll = (change, context) => {
  
  const ref = change.after.ref.root.child(`stats/r`);
  
  return ref
  .transaction(value => {
      return value ? value + 1 : 1;
    });
};
