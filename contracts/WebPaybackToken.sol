// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v4.9/contracts/token/ERC20/ERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v4.9/contracts/access/Ownable.sol";

contract WebPaybackToken is ERC20, Ownable {
    address public creatorWallet = 0x8250e17682de64eC41c20caE907F2c03875445eD;
    uint256 public creatorFeeBasisPoints = 300; // 3% (300 basis points)
    uint256 public constant MAX_FEE_BPS = 1000; // 10% max

    event FeeChanged(uint256 oldFee, uint256 newFee);
    event CreatorWalletChanged(address oldWallet, address newWallet);

    constructor() ERC20("WebPayback Token", "WPT") {
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }

    function setCreatorFee(uint256 _bps) external onlyOwner {
        require(_bps <= MAX_FEE_BPS, "Fee too high");
        emit FeeChanged(creatorFeeBasisPoints, _bps);
        creatorFeeBasisPoints = _bps;
    }

    function setCreatorWallet(address _newWallet) external onlyOwner {
        require(_newWallet != address(0), "Invalid wallet");
        emit CreatorWalletChanged(creatorWallet, _newWallet);
        creatorWallet = _newWallet;
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal virtual override {
        uint256 fee = (amount * creatorFeeBasisPoints) / 10000;
        if (fee > 0 && creatorWallet != address(0)) {
            super._transfer(sender, creatorWallet, fee);
        }
        super._transfer(sender, recipient, amount - fee);
    }
}
