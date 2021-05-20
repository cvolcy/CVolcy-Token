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

        const amoutToTransfer = 250000;
        const receipt = await tokenInstance.transfer(accounts[1], amoutToTransfer, { from: accounts[0] });

        assert.equal(receipt.logs.length, 1, 'should trigger one event');
        assert.equal(receipt.logs[0].event, 'Transfer', 'should be a `Transfer` event');
        assert.equal(receipt.logs[0].args._from, accounts[0], 'from the creator account');
        assert.equal(receipt.logs[0].args._to, accounts[1], 'transfer to the second account');
        assert.equal(receipt.logs[0].args._value, amoutToTransfer, `transfer ${amoutToTransfer} tokens`);

        const receiverBalance = await tokenInstance.balanceOf(accounts[1]);
        const newCreatorBalance = await tokenInstance.balanceOf(accounts[0]);
        
        assert.equal(receiverBalance, amoutToTransfer, 'adds the amount to the receiving account');
        assert.equal(newCreatorBalance.toNumber(), creatorBalance.toNumber() - amoutToTransfer, 'deducts the amoubt from the sending account');
    });

    it('approves tokens for delegated transfer', async () => {
        const tokenInstance = await CvolcyToken.deployed();
        
        const amoutToTransfer = 100;
        const approvalSuccess = await tokenInstance.approve.call(accounts[1], amoutToTransfer);
        assert.equal(approvalSuccess, true, 'it successfully approval the delegated transfer');

        const receipt = await tokenInstance.approve(accounts[1], amoutToTransfer);

        assert.equal(receipt.logs.length, 1, 'should trigger one event');
        assert.equal(receipt.logs[0].event, 'Approval', 'should be an `Approval` event');
        assert.equal(receipt.logs[0].args._owner, accounts[0], 'from the creator account');
        assert.equal(receipt.logs[0].args._spender, accounts[1], 'transfer to the second account');
        assert.equal(receipt.logs[0].args._value, amoutToTransfer, `approves a delegated transfer of ${amoutToTransfer} tokens`);

        const allowance = await tokenInstance.allowance(accounts[0], accounts[1]);

        assert.equal(allowance, 100, 'stores the allowance for the delegate transfer');
    });

    it('handles delegated token transfer', async () => {
        const tokenInstance = await CvolcyToken.deployed();
        
        const fromAccount = accounts[2];
        const toAccount = accounts[3];
        const spendingAcccount = accounts[4];

        const fromAccountBalance = 100;
        await tokenInstance.transfer(fromAccount, fromAccountBalance, { from: accounts[0] }); // Setup by sending some tokens.

        const approvalAmount = 10;
        await tokenInstance.approve(spendingAcccount, approvalAmount, { from: fromAccount });
        
        try {
            assert.fail(await tokenInstance.transferFrom(fromAccount, toAccount, fromAccountBalance + 1, { from: spendingAcccount }));
        } catch (err) {
            assert(err.message.indexOf('revert') >= 0, 'should be reverted when amount is over balance');
        }

        try {
            assert.fail(await tokenInstance.transferFrom(fromAccount, toAccount, approvalAmount + 1, { from: spendingAcccount }));
        } catch (err) {
            assert(err.message.indexOf('revert') >= 0, `should be reverted when amount is over the approval amount of ${approvalAmount}`);
        }

        const receipt = await tokenInstance.transferFrom(fromAccount, toAccount, approvalAmount, { from: spendingAcccount });

        assert.equal(receipt.logs.length, 1, 'should trigger one event');
        assert.equal(receipt.logs[0].event, 'Transfer', 'should be a `Transfer` event');
        assert.equal(receipt.logs[0].args._from, fromAccount, 'from the creator account');
        assert.equal(receipt.logs[0].args._to, toAccount, 'transfer to the second account');
        assert.equal(receipt.logs[0].args._value, approvalAmount, `transfer ${approvalAmount} tokens`);

        const newfromAccountBalance = await tokenInstance.balanceOf(fromAccount);

        assert.equal(newfromAccountBalance.toNumber(), fromAccountBalance - approvalAmount, 'deducts the amount from the sending account');

        const toAccountBalance = await tokenInstance.balanceOf(toAccount);
        assert.equal(toAccountBalance.toNumber(), approvalAmount, 'adds the amount from the receiving account');

        const allowance = await tokenInstance.allowance(fromAccount, spendingAcccount);
        assert(allowance, 0, 'deducts the amount from the allowance');
    });
});