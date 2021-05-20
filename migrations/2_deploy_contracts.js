var CVolcyToken = artifacts.require('./CVolcyToken.sol');
var CVolcyTokenSale = artifacts.require('./CVolcyTokenSale.sol');

module.exports = function(deployer) {
    deployer.deploy(CVolcyToken, 1000000 * 10 ** 5, 'CVolcyToken', 5, 'cvol');
    deployer.deploy(CVolcyTokenSale);
}