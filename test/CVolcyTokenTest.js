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
});