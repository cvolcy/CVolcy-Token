const CVolcyTokenSale = artifacts.require("./CVolcyTokenSale.sol");
const CVolcyToken = artifacts.require("./CVolcyToken.sol");

contract('CVolcyTokenSaleTest', accounts => {
    var tokenPrice = 10000000000000; // in wei
    var owner = accounts[0];
    var buyer = accounts[1];

    it('initialize the contract with the right values', async () => {
        const tokenSaleInstance = await CVolcyTokenSale.deployed();
    
        assert.notEqual(tokenSaleInstance.address, 0x0, 'has a contract address');
        assert.notEqual(await tokenSaleInstance.tokenContract(), 0x0, 'has a token contract address');

        const fetchedTokenPrice = await tokenSaleInstance.tokenPrice();

        assert.equal(fetchedTokenPrice.toNumber(), tokenPrice, `has a token price of ${tokenPrice}`);
    });

    it('facilitates token buying', async () => {
        const tokenSaleInstance = await CVolcyTokenSale.deployed();
        const tokenInstance = await CVolcyToken.deployed();

        const totalSupply = await tokenInstance.totalSupply();
        const availableTokens = totalSupply.toNumber() * 0.75;
        await tokenInstance.transfer(tokenSaleInstance.address, availableTokens, { from: owner });

        const numberTokensToBuy = 10;
        const buyTokensValue = numberTokensToBuy * tokenPrice;
        const receipt = await tokenSaleInstance.buyTokens(numberTokensToBuy, { from: buyer, value: buyTokensValue });

        assert.equal(receipt.logs.length, 1, 'should trigger one event');
        assert.equal(receipt.logs[0].event, 'Sell', 'should be a `Sell` event');
        assert.equal(receipt.logs[0].args._buyer, buyer, 'from the buying account');
        assert.equal(receipt.logs[0].args._amount, numberTokensToBuy, `logs the amount of token purchased, ${numberTokensToBuy} tokens`);

        let tokensSold = await tokenSaleInstance.tokensSold();

        assert.equal(tokensSold.toNumber(), numberTokensToBuy, 'increments the number of tokens sold');

        let buyerBalance = await tokenInstance.balanceOf(buyer);
        assert.equal(buyerBalance.toNumber(), numberTokensToBuy)

        let tokenSaleBalance = await tokenInstance.balanceOf(tokenSaleInstance.address);
        assert.equal(tokenSaleBalance.toNumber(), availableTokens - numberTokensToBuy)

        try {
            assert.fail(await tokenSaleInstance.buyTokens(numberTokensToBuy, { from: buyer, value: 1 }));
        } catch (err) {
            assert(err.message.indexOf('revert') >= 0, 'should be reverted when numberTokensToBuy doesn\'t match the value in wei');
        }

        try {
            assert.fail(await tokenSaleInstance.buyTokens(availableTokens + 1, { from: buyer, value: 1 }));
        } catch (err) {
            assert(err.message.indexOf('revert') >= 0, 'should be reverted when numberTokensToBuy is over the number of available tokens');
        }
    });

    it('ends token sale', async () => {
        const tokenSaleInstance = await CVolcyTokenSale.deployed();
        const tokenInstance = await CVolcyToken.deployed();

        try {
            assert.fail(await tokenSaleInstance.endSale({ from: buyer }));
        } catch (err) {
            assert(err.message.indexOf('revert') >= 0, 'should be reverted when the sender is not the owner');
        }

        const tokenSaleBalance = await tokenInstance.balanceOf(tokenSaleInstance.address);
        const ownerBalance = await tokenInstance.balanceOf(owner);
        const receipt = await tokenSaleInstance.endSale({ from: owner });
        const finalOwnerBalance = await tokenInstance.balanceOf(owner);

        assert.equal(finalOwnerBalance.toNumber(), ownerBalance.toNumber() + tokenSaleBalance.toNumber(), 'returns all unsold tokens to admin');

        const finalTokenSaleBalance = await tokenInstance.balanceOf(tokenSaleInstance.address);
        assert.equal(finalTokenSaleBalance.toNumber(), 0, 'token sale balance was reset to zero');
    });
});