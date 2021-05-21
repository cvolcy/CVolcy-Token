var CVolcyToken = artifacts.require('./CVolcyToken.sol');
var CVolcyTokenSale = artifacts.require('./CVolcyTokenSale.sol');

module.exports = async function(deployer) {
    await deployer.deploy(CVolcyToken, 1000000 * 10 ** 5, 'CVolcyToken', 5, 'cvol');

    const tokenPrice = 10000000000000; // in wei = 0.00001 eth
    await deployer.deploy(CVolcyTokenSale, CVolcyToken.address, tokenPrice);
}