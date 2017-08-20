const Configurations = {
  endpoint: "localhost"
};

require('dns').lookup(require('os').hostname(), (err, add, fam) => {
  Configurations.endpoint = add;
});


module.exports = Configurations;