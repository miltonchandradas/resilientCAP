const cds = require("@sap/cds");
const CircuitBreaker = require("opossum");
const retry = require("async-retry");

const options = {
  timeout: 10000, // Timeout in milliseconds
  errorThresholdPercentage: 50, // Error threshold percentage
  resetTimeout: 5000, // Time to wait before attempting to close the circuit again
};

module.exports = async (srv) => {
  const { BusinessPartners } = srv.entities;
  // connect to Remote Service
  const BPService = await cds.connect.to("API_BUSINESS_PARTNER");

  srv.on("READ", BusinessPartners, async (req) => {
    const remoteCall = async (req) => {
      return await BPService.send({
        query: req.query,
        headers: {
          apikey: process.env.apikey,
        },
      });
    };
    const breaker = new CircuitBreaker(remoteCall, options);

    try {
      return await retry(async () => {
        return await breaker.fire(req);
      });
    } catch (error) {
      console.log(`Error: ${error}`);
    }

    // try {
    //   return await retry(async () => {
    //     return await BPService.send({
    //       query: req.query,
    //     });
    //   });
    // } catch (error) {
    //   console.log(`Error: ${error}`);
    // }

    // return await BPService.send({
    //   query: req.query
    // });
  });
};
