// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import './CVolcyToken.sol';

contract CVolcyTokenSale {
    address payable private owner;
    CVolcyToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell(address _buyer, uint256 _amount);

    constructor(CVolcyToken _tokenContract, uint256 _tokenPrice) {
        owner = payable(msg.sender);
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }

    function buyTokens(uint256 _numberOfTokens) public payable {
        require(msg.value == multiply(_numberOfTokens, tokenPrice));
        tokensSold += _numberOfTokens;

        emit Sell(msg.sender, _numberOfTokens);
    }

    function multiply(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x);
    }
}