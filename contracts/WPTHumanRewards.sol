// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/governance/TimelockController.sol";

interface IHumanityProtocol {
    function verifyZkTLSProof(address user, bytes calldata proof) external view returns (bool);
    function getHumanityScore(address user) external view returns (uint256);
}

contract WPTHumanRewards is ERC20, AccessControl, Pausable {
    // 🔐 SECURITY ROLES
    bytes32 public constant FOUNDER_ROLE = keccak256("FOUNDER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    // 📊 TOKEN CONSTANTS
    string public constant NAME = "WebPayback Human Token";
    string public constant SYMBOL = "WPT-HUMAN";
    uint8 public constant DECIMALS = 18;
    
    // 🏦 FEES
    uint256 public constant FOUNDER_FEE = 100; // 1%
    uint256 public constant PLATFORM_FEE = 100; // 1%
    uint256 public constant LIQUIDITY_FEE = 50;  // 0.5%
    
    // 🛡️ ANTI-INFLATION LIMITS
    uint256 public MAX_DAILY_MINT = 10000 * 10**18;
    uint256 public constant MAX_TOTAL_SUPPLY = 100000000 * 10**18; // 100 Million
    uint256 public constant INITIAL_PREMINT = 10000000 * 10**18;   // 10 Million (10%) per DEX Liquidity & Marketing
    
    // 🤖 ANTI-BOT PROTECTIONS
    uint256 public constant TRANSFER_COOLDOWN = 60;
    uint256 public constant MAX_TRANSFER_PERCENT = 500; // 5%
    bool public tradingEnabled = false;
    
    // 📍 IMPORTANT ADDRESSES
    IHumanityProtocol public humanityProtocol;
    address public founderWallet;
    address public platformWallet;
    address public liquidityPool;
    
    // 📊 MAPPINGS
    mapping(address => bool) public humanVerified;
    mapping(address => uint256) public humanityScore;
    mapping(address => uint256) public lastVerification;
    mapping(uint256 => uint256) public dailyMinted;
    mapping(address => uint256) public lastTransfer;
    mapping(address => bool) public blacklisted;
    mapping(address => bool) public whitelisted;
    
    // 📢 EVENTS
    event HumanVerified(address indexed user, uint256 score, uint256 timestamp);
    event RewardsDistributed(address indexed creator, uint256 amount, uint256 multiplier);
    
    constructor(
        address _humanityProtocol,
        address _founderWallet,
        address _platformWallet,
        address _liquidityPool
    ) ERC20(NAME, SYMBOL) {
        // Setup protocols
        humanityProtocol = IHumanityProtocol(_humanityProtocol);
        founderWallet = _founderWallet;
        platformWallet = _platformWallet;
        liquidityPool = _liquidityPool;
        
        // Setup roles - ONLY FOUNDER initially
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(FOUNDER_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        
        // Whitelist founder
        whitelisted[msg.sender] = true;
        
        // MINT INIZIALE (Pre-mint)
        // Inviamo il 10% della supply (10M) al platformWallet per poter:
        // 1. Creare la prima Liquidity Pool su un DEX
        // 2. Finanziare airdrops e marketing per attirare utenti
        _mint(platformWallet, INITIAL_PREMINT);
    }
    
    // 🔐 SECURITY MODIFIERS
    modifier onlyFounder() {
        require(hasRole(FOUNDER_ROLE, msg.sender), "Only founder");
        _;
    }
    
    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Not admin");
        _;
    }
    
    modifier onlyMinter() {
        require(hasRole(MINTER_ROLE, msg.sender), "Not minter");
        _;
    }
    
    modifier mintingLimits(uint256 amount) {
        uint256 today = block.timestamp / 1 days;
        
        require(
            dailyMinted[today] + amount <= MAX_DAILY_MINT,
            "Daily minting limit exceeded"
        );
        
        require(
            totalSupply() + amount <= MAX_TOTAL_SUPPLY,
            "Total supply cap exceeded"
        );
        
        dailyMinted[today] += amount;
        _;
    }
    
    modifier notContract() {
        require(tx.origin == msg.sender, "Contracts not allowed");
        require(!isContract(msg.sender), "Contract detected");
        _;
    }
    
    // 🔍 HUMAN VERIFICATION
    function verifyHumanWithZkTLS(
        bytes calldata zkProof
    ) external notContract {
        require(
            humanityProtocol.verifyZkTLSProof(msg.sender, zkProof),
            "Invalid zkTLS proof"
        );
        
        humanVerified[msg.sender] = true;
        humanityScore[msg.sender] = humanityProtocol.getHumanityScore(msg.sender);
        lastVerification[msg.sender] = block.timestamp;
        
        emit HumanVerified(msg.sender, humanityScore[msg.sender], block.timestamp);
    }
    
    // 🎯 REWARDS DISTRIBUTION
    function distributeHumanRewards(
        address creator,
        uint256 baseAmount,
        uint256 engagementScore
    ) external onlyMinter {
        require(humanVerified[creator], "Creator not human verified");
        require(isVerificationValid(creator), "Verification expired");
        
        uint256 humanMultiplier = calculateHumanMultiplier(creator);
        uint256 creatorAmount = (baseAmount * humanMultiplier * engagementScore) / 10000;
        
        // 🏦 FEE CALCULATION
        uint256 founderFee = (creatorAmount * FOUNDER_FEE) / 10000;
        uint256 platformFee = (creatorAmount * PLATFORM_FEE) / 10000;
        uint256 liquidityFee = (creatorAmount * LIQUIDITY_FEE) / 10000;
        
        uint256 totalMintAmount = creatorAmount + founderFee + platformFee + liquidityFee;
        
        // Apply minting limits
        uint256 today = block.timestamp / 1 days;
        require(
            dailyMinted[today] + totalMintAmount <= MAX_DAILY_MINT,
            "Daily minting limit exceeded"
        );
        require(
            totalSupply() + totalMintAmount <= MAX_TOTAL_SUPPLY,
            "Total supply cap exceeded"
        );
        dailyMinted[today] += totalMintAmount;
        
        // 🪙 MINT TOKENS
        _mint(creator, creatorAmount);
        _mint(founderWallet, founderFee);
        _mint(platformWallet, platformFee);
        _mint(liquidityPool, liquidityFee);
        
        emit RewardsDistributed(creator, creatorAmount, humanMultiplier);
    }
    
    // 🎁 AIRDROP (FOR V1 MIGRATION & REWARDS)
    function airdropToVerifiedUsers(
        address[] calldata users,
        uint256[] calldata amounts
    ) external onlyAdmin {
        require(users.length == amounts.length, "Arrays length mismatch");
        
        for (uint i = 0; i < users.length; i++) {
            require(humanVerified[users[i]], "User not verified");
            _mint(users[i], amounts[i]);
        }
    }
    
    // 📊 CALCULATION FUNCTIONS
    function calculateHumanMultiplier(address user) public view returns (uint256) {
        if (!humanVerified[user]) return 1000; // 1x
        
        uint256 score = humanityScore[user];
        if (score >= 95) return 2000; // 2x
        if (score >= 85) return 1750; // 1.75x
        if (score >= 75) return 1500; // 1.5x
        return 1250; // 1.25x
    }
    
    function isVerificationValid(address user) public view returns (bool) {
        return (block.timestamp - lastVerification[user]) <= 30 days;
    }
    
    function isContract(address account) internal view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(account)
        }
        return size > 0;
    }
    
    // 🛡️ TRANSFER PROTECTIONS
    function _update(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        // 🚫 BLACKLIST
        require(!blacklisted[from] && !blacklisted[to], "Address blacklisted");
        
        // 🤖 ANTI-BOT COOLDOWN
        if (from != address(0) && !whitelisted[from]) {
            require(
                block.timestamp >= lastTransfer[from] + TRANSFER_COOLDOWN,
                "Transfer cooldown active"
            );
            lastTransfer[from] = block.timestamp;
        }
        
        // 🐋 ANTI-WHALE
        if (!whitelisted[from] && from != address(0)) {
            uint256 maxAmount = (balanceOf(from) * MAX_TRANSFER_PERCENT) / 10000;
            require(amount <= maxAmount, "Transfer amount too large");
        }
        
        // 📈 TRADING CONTROL
        if (!tradingEnabled && from != address(0) && to != address(0)) {
            require(whitelisted[from] || whitelisted[to], "Trading not enabled");
        }
        
        // 🔍 LARGE TRANSFER VERIFICATION
        if (amount > 1000 * 10**18 && !whitelisted[from]) {
            require(humanVerified[from], "Large transfer requires human verification");
            require(isVerificationValid(from), "Human verification expired");
        }
        
        super._update(from, to, amount);
    }
    
    // 🔧 ADMIN FUNCTIONS
    function enableTrading() external onlyAdmin {
        tradingEnabled = true;
    }
    
    function setBlacklist(address user, bool status) external onlyAdmin {
        blacklisted[user] = status;
    }
    
    function setWhitelist(address user, bool status) external onlyAdmin {
        whitelisted[user] = status;
    }
    
    function updateMintingLimit(uint256 newLimit) external onlyFounder {
        MAX_DAILY_MINT = newLimit;
    }
    
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    // 💰 RECOVERY FUNCTIONS
    function recoverERC20(address token, uint256 amount) external onlyFounder {
        require(IERC20(token).transfer(founderWallet, amount), "Recovery failed");
    }
}
