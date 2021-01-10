// On OWM data update increments the city counter 'u' in stats
exports.onWrite = (change, context) => {
  const cityId = context.params.cityId;
  const ref = change.after.ref.root.child(`stats/${cityId}/u`);

  return ref.transaction(value => {
    return value ? value + 1 : 1;
  });
};

// shell:
// owmOnWrite({before: {'owm': {'cid': { 'updated': false} } }, after: {'owm': {'cid': { 'updated': true} } } }, { params: { cityId : 5}})
