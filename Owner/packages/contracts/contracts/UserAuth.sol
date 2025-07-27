// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title UserAuth - Owner Dashboard
 * @dev Smart contract for venue owner authentication and activity logging
 * @notice This contract tracks owner signup/login activities for BookMyBlock platform
 */
contract UserAuth {
    enum ActionType { None, Signup, Login, Logout }
    
    struct User {
        string uid;           // Privy user ID
        address walletAddress; // User's wallet address
        bool isSignedUp;
        bool isLoggedIn;
        ActionType lastAction;
        uint256 lastTimestamp;
        uint256 loginCount;   // Track number of logins
        uint256 signupTimestamp; // When user first signed up
        bool isOwner;         // Owner-specific flag
        string venueName;     // Optional venue name
    }
    
    // Mappings
    mapping(string => User) private users;
    mapping(address => string) private walletToUid; // Reverse lookup
    
    // Events
    event OwnerSignedUp(string indexed uid, address indexed wallet, uint256 timestamp, string venueName);
    event OwnerLoggedIn(string indexed uid, address indexed wallet, uint256 timestamp, uint256 loginCount);
    event OwnerLoggedOut(string indexed uid, address indexed wallet, uint256 timestamp);
    
    // Modifiers
    modifier onlyValidUid(string memory uid) {
        require(bytes(uid).length > 0, "UID cannot be empty");
        _;
    }
    
    modifier onlySignedUpUser(string memory uid) {
        require(users[uid].isSignedUp, "Owner not signed up");
        _;
    }
    
    /**
     * @notice Sign up a venue owner with a unique uid and wallet address
     * @param uid The owner's unique identifier from Privy
     * @param walletAddress The owner's wallet address
     * @param venueName Optional venue name
     */
    function signup(string memory uid, address walletAddress, string memory venueName) 
        public 
        onlyValidUid(uid) 
    {
        require(walletAddress != address(0), "Invalid wallet address");
        require(!users[uid].isSignedUp, "Owner already signed up");
        require(bytes(walletToUid[walletAddress]).length == 0, "Wallet already registered");
        
        users[uid] = User({
            uid: uid,
            walletAddress: walletAddress,
            isSignedUp: true,
            isLoggedIn: false,
            lastAction: ActionType.Signup,
            lastTimestamp: block.timestamp,
            loginCount: 0,
            signupTimestamp: block.timestamp,
            isOwner: true,
            venueName: venueName
        });
        
        walletToUid[walletAddress] = uid;
        
        emit OwnerSignedUp(uid, walletAddress, block.timestamp, venueName);
    }
    
    /**
     * @notice Login a venue owner using their uid
     * @param uid The owner's unique identifier
     */
    function login(string memory uid) 
        public 
        onlyValidUid(uid) 
        onlySignedUpUser(uid) 
    {
        User storage user = users[uid];
        user.isLoggedIn = true;
        user.lastAction = ActionType.Login;
        user.lastTimestamp = block.timestamp;
        user.loginCount++;
        
        emit OwnerLoggedIn(uid, user.walletAddress, block.timestamp, user.loginCount);
    }
    
    /**
     * @notice Logout a venue owner using their uid
     * @param uid The owner's unique identifier
     */
    function logout(string memory uid) 
        public 
        onlyValidUid(uid) 
        onlySignedUpUser(uid) 
    {
        User storage user = users[uid];
        require(user.isLoggedIn, "Owner not logged in");
        
        user.isLoggedIn = false;
        user.lastAction = ActionType.Logout;
        user.lastTimestamp = block.timestamp;
        
        emit OwnerLoggedOut(uid, user.walletAddress, block.timestamp);
    }
    
    /**
     * @notice Fetch full owner details
     */
    function fetchUserDetails(string memory uid)
        public
        view
        onlyValidUid(uid)
        onlySignedUpUser(uid)
        returns (
            string memory uidStr,
            address walletAddress,
            bool isSignedUp,
            bool isLoggedIn,
            string memory action,
            uint256 timestamp,
            uint256 loginCount,
            uint256 signupTimestamp,
            bool isOwner,
            string memory venueName
        )
    {
        User memory user = users[uid];
        
        string memory actionStr = "";
        if (user.lastAction == ActionType.Signup) {
            actionStr = "signup";
        } else if (user.lastAction == ActionType.Login) {
            actionStr = "login";
        } else if (user.lastAction == ActionType.Logout) {
            actionStr = "logout";
        }
        
        return (
            user.uid,
            user.walletAddress,
            user.isSignedUp,
            user.isLoggedIn,
            actionStr,
            user.lastTimestamp,
            user.loginCount,
            user.signupTimestamp,
            user.isOwner,
            user.venueName
        );
    }
    
    // Additional owner-specific functions...
    function getUserByWallet(address walletAddress) public view returns (string memory uid) {
        require(walletAddress != address(0), "Invalid wallet address");
        uid = walletToUid[walletAddress];
        require(bytes(uid).length > 0, "Wallet not registered");
        return uid;
    }
    
    function userExists(string memory uid) public view onlyValidUid(uid) returns (bool exists) {
        return users[uid].isSignedUp;
    }
    
    function isUserLoggedIn(string memory uid) public view onlyValidUid(uid) onlySignedUpUser(uid) returns (bool isLoggedIn) {
        return users[uid].isLoggedIn;
    }
    
    /**
     * @notice Update venue name for an owner
     * @param uid The owner's UID
     * @param newVenueName The new venue name
     */
    function updateVenueName(string memory uid, string memory newVenueName) 
        public 
        onlyValidUid(uid) 
        onlySignedUpUser(uid) 
    {
        users[uid].venueName = newVenueName;
    }
}