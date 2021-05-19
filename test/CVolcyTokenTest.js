const CvolcyToken = artifacts.require("./CVolcyToken.sol");

contract('CVolcyToken', accounts => {

    it('set the total supply on deployment', async () => {
        const tokenInstance = await CvolcyToken.deployed();
        const totalSupply = await tokenInstance.totalSupply();
        const decimals = await tokenInstance.decimals();
        
        assert.equal(totalSupply.toNumber() / (10 ** decimals.toNumber()), 1000000, 'to 1 000 000 tokens');
    });

    it('allocate the initial total supply to the creator', async () => {
        const tokenInstance = await CvolcyToken.deployed();
        const creatorBalance = await tokenInstance.balanceOf(accounts[0]);
        const decimals = await tokenInstance.decimals();

        assert.equal(creatorBalance.toNumber() / (10 ** decimals.toNumber()), 1000000, 'to 1 000 000 tokens');
    });

    it('Initializes the contract with the correct descriptions', async () => {
        const tokenInstance = await CvolcyToken.deployed();

        assert.equal(await tokenInstance.name(), 'CVolcyToken', 'has the correct name');
        assert.equal(await tokenInstance.symbol(), 'cvol', 'has the correct symbol');
    });

    it('transfers token ownership', async () => {
        const tokenInstance = await CvolcyToken.deployed();
        const creatorBalance = await tokenInstance.balanceOf(accounts[0]);

        try {
            assert.fail(await tokenInstance.transfer.call(accounts[1], creatorBalance + 1)); // using the `.call` here doesn't create a transaction
        } catch (err) {
            assert(err.message.indexOf('revert') >= 0, 'should be reverted when amount is over balance');
        }

        const receipt = await tokenInstance.transfer(accounts[1], 250000, { from: accounts[0] });
        const receiverBalance = await tokenInstance.balanceOf(accounts[1]);
        const newCreatorBalance = await tokenInstance.balanceOf(accounts[0]);
        
        assert.equal(receiverBalance, 250000, 'adds the amount to the receiving account');
        assert.equal(newCreatorBalance.toNumber(), creatorBalance.toNumber() - 250000, 'deducts the amoubt from the sending account');
    });
});