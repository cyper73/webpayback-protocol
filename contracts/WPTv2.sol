/**
 *Optimized for verification at polygonscan.com
 *Based on original WPT contract with security improvements
*/

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// --- OpenZeppelin-style ERC20 implementation (same as original) ---

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }
    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

interface IERC20Metadata is IERC20 {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
}

contract ERC20 is Context, IERC20, IERC20Metadata {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    uint256 private _totalSupply;
    string private _name;
    string private _symbol;

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    function name() public view virtual override returns (string memory) {
        return _name;
    }

    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    function decimals() public view virtual override returns (uint8) {
        return 18;
    }

    function totalSupply() public view virtual override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view virtual override returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        address owner = _msgSender();
        _transfer(owner, to, amount);
        return true;
    }

    function allowance(address owner, address spender) public view virtual override returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public virtual override returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    }

    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, allowance(owner, spender) + addedValue);
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        address owner = _msgSender();
        uint256 currentAllowance = allowance(owner, spender);
        require(currentAllowance >= subtractedValue, "ERC20: decreased allowance below zero");
        unchecked {
            _approve(owner, spender, currentAllowance - subtractedValue);
        }
        return true;
    }

    function _transfer(address from, address to, uint256 amount) internal virtual {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");
        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, "ERC20: transfer amount exceeds balance");
        unchecked {
            _balances[from] = fromBalance - amount;
        }
        _balances[to] += amount;
        emit Transfer(from, to, amount);
    }

    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: mint to the zero address");
        _totalSupply += amount;
        _balances[account] += amount;
        emit Transfer(address(0), account, amount);
    }

    function _burn(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: burn from the zero address");
        uint256 accountBalance = _balances[account];
        require(accountBalance >= amount, "ERC20: burn amount exceeds balance");
        unchecked {
            _balances[account] = accountBalance - amount;
        }
        _totalSupply -= amount;
        emit Transfer(account, address(0), amount);
    }

    function _approve(address owner, address spender, uint256 amount) internal virtual {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");
        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _spendAllowance(address owner, address spender, uint256 amount) internal virtual {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "ERC20: insufficient allowance");
            unchecked {
                _approve(owner, spender, currentAllowance - amount);
            }
        }
    }
}

// *** WEBPAYBACK TOKEN V2 - OPTIMIZED FOR SCANNERS ***
contract WebPaybackTokenV2 is ERC20 {
    // FIXED IMMUTABLE PARAMETERS (cannot be changed by anyone)
    address public constant creatorWallet = 0xca5Ea48C76C72cc37cFb75c452457d0e6d0508Ba; // Configure in deployment
    uint256 public constant creatorFeeBasisPoints = 10; // 0.1% (10 basis points) - FIXED FOREVER
    
    // Events for transparency
    event CreatorFeeCollected(address indexed from, uint256 feeAmount);

    constructor() ERC20("WebPayback Token", "WPT") {
        // Mint 10 million tokens for better liquidity and divisibility
        _mint(msg.sender, 10_000_000 * 10 ** decimals());
    }
    // Override _transfer to include fee mechanism (same logic as original but with 0.1% fee)
    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal virtual override {
        // Calculate fee: 0.1% instead of 3%
        uint256 fee = (amount * creatorFeeBasisPoints) / 10000;
        
        // Send fee to creator wallet (if fee > 0)
        if (fee > 0 && creatorWallet != address(0)) {
            super._transfer(sender, creatorWallet, fee);
            emit CreatorFeeCollected(sender, fee);
        }
        
        // Send remaining amount to recipient
        super._transfer(sender, recipient, amount - fee);
    }
    
    // View functions for transparency
    function getCreatorWallet() external pure returns (address) {
        return creatorWallet;
    }
    
    function getCreatorFee() external pure returns (uint256) {
        return creatorFeeBasisPoints;
    }
    
    function calculateFee(uint256 amount) external pure returns (uint256) {
        return (amount * creatorFeeBasisPoints) / 10000;
    }
    
    // Additional utility functions for better UX
    function netTransferAmount(uint256 grossAmount) external pure returns (uint256) {
        uint256 fee = (grossAmount * creatorFeeBasisPoints) / 10000;
        return grossAmount - fee;
    }
    
    // Burn function for deflationary tokenomics
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
    
    // Check if address receives fee-free transfers (only creator wallet)
    function isFeeFree(address account) external pure returns (bool) {
        return account == creatorWallet;
    }
}