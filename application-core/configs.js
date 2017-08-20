const Configurations = {
  endpoint: null
};

require('dns').lookup(require('os').hostname(),
  function (err, add, fam) {
    Configurations.endpoint = add;
  });


module.exports = Configurations;