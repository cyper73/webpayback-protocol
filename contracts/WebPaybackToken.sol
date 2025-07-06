// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title WebPaybackToken - ERC20 token with creator's fee for content reward system

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WebPaybackToken is ERC20, Ownable {
    address public creatorWallet;
    uint256 public creatorFeeBasisPoints = 300; // 3% (300 basis points)
    uint256 public constant MAX_FEE_BPS = 1000; // 10% max

    event FeeChanged(uint256 oldFee, uint256 newFee);
    event CreatorWalletChanged(address oldWallet, address newWallet);

    constructor(address _creatorWallet) ERC20("WebPayback Token", "WPT") {
        require(_creatorWallet != address(0), "Invalid creator wallet");
        creatorWallet = _creatorWallet;
        _mint(msg.sender, 1_000_000 * 10 ** decimals()); // 1 million tokens to deployer for initial testing
    }

    /// @notice Set a new creator fee (only owner, max 10%)
    function setCreatorFee(uint256 _bps) external onlyOwner {
        require(_bps <= MAX_FEE_BPS, "Fee too high");
        emit FeeChanged(creatorFeeBasisPoints, _bps);
        creatorFeeBasisPoints = _bps;
    }

    /// @notice Set a new creator wallet (only owner)
    function setCreatorWallet(address _newWallet) external onlyOwner {
        require(_newWallet != address(0), "Invalid wallet");
        emit CreatorWalletChanged(creatorWallet, _newWallet);
        creatorWallet = _newWallet;
    }

    /// @dev Override transfer to include creator's fee
    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal override {
        uint256 fee = (amount * creatorFeeBasisPoints) / 10000;
        if (fee > 0 && creatorWallet != address(0)) {
            super._transfer(sender, creatorWallet, fee);
        }
        super._transfer(sender, recipient, amount - fee);
    }
}
