module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  compilers: {
	solc: {
		version: "0.8.1",
	}
  },
  networks: {
    development: {
      host: "127.0.0.1",
   	  port: 8545,
      network_id: "*" // Match any network id
    },
    develop: {
      port: 8545
    //  host: "127.0.0.1",
    //  network_id: "5777" // Match any network id
    }
  }
};
