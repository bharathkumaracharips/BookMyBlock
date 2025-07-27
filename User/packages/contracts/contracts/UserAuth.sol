// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title UserAuth
 * @dev Smart contract for user authentication and activity logging
 * @notice This contract tracks user signup/login activities for BookMyBlock platform
 */
contract UserAuth {
    enum ActionType {
        None,
        Signup,
        Login,
        Logout
    }

    struct User {
        string uid; // Privy user ID
        address walletAddress; // User's wallet address
        bool isSignedUp;
        bool isLoggedIn;
        ActionType lastAction;
        uint256 lastTimestamp;
        uint256 loginCount; // Track number of logins
        uint256 signupTimestamp; // When user first signed up
    }

    // Mappings
    mapping(string => User) private users;
    mapping(address => string) private walletToUid; // Reverse lookup

    // Events
    event UserSignedUp(
        string indexed uid,
        address indexed wallet,
        uint256 timestamp
    );
    event UserLoggedIn(
        string indexed uid,
        address indexed wallet,
        uint256 timestamp,
        uint256 loginCount
    );
    event UserLoggedOut(
        string indexed uid,
        address indexed wallet,
        uint256 timestamp
    );

    // Modifiers
    modifier onlyValidUid(string memory uid) {
        require(bytes(uid).length > 0, "UID cannot be empty");
        _;
    }

    modifier onlySignedUpUser(string memory uid) {
        require(users[uid].isSignedUp, "User not signed up");
        _;
    }

    /**
     * @notice Sign up a user with a unique uid and wallet address
     * @param uid The user's unique identifier from Privy
     * @param walletAddress The user's wallet address
     */
    function signup(
        string memory uid,
        address walletAddress
    ) public onlyValidUid(uid) {
        require(walletAddress != address(0), "Invalid wallet address");
        require(!users[uid].isSignedUp, "User already signed up");
        require(
            bytes(walletToUid[walletAddress]).length == 0,
            "Wallet already registered"
        );

        users[uid] = User({
            uid: uid,
            walletAddress: walletAddress,
            isSignedUp: true,
            isLoggedIn: false,
            lastAction: ActionType.Signup,
            lastTimestamp: block.timestamp,
            loginCount: 0,
            signupTimestamp: block.timestamp
        });

        walletToUid[walletAddress] = uid;

        emit UserSignedUp(uid, walletAddress, block.timestamp);
    }

    /**
     * @notice Login a user using their uid
     * @param uid The user's unique identifier
     */
    function login(
        string memory uid
    ) public onlyValidUid(uid) onlySignedUpUser(uid) {
        User storage user = users[uid];
        user.isLoggedIn = true;
        user.lastAction = ActionType.Login;
        user.lastTimestamp = block.timestamp;
        user.loginCount++;

        emit UserLoggedIn(
            uid,
            user.walletAddress,
            block.timestamp,
            user.loginCount
        );
    }

    /**
     * @notice Logout a user using their uid
     * @param uid The user's unique identifier
     */
    function logout(
        string memory uid
    ) public onlyValidUid(uid) onlySignedUpUser(uid) {
        User storage user = users[uid];
        require(user.isLoggedIn, "User not logged in");

        user.isLoggedIn = false;
        user.lastAction = ActionType.Logout;
        user.lastTimestamp = block.timestamp;

        emit UserLoggedOut(uid, user.walletAddress, block.timestamp);
    }

    /**
     * @notice Fetch full user details
     * @param uid The user's UID (from Privy)
     * @return uidStr The user's UID
     * @return walletAddress The user's wallet address
     * @return isSignedUp Whether they have signed up
     * @return isLoggedIn Whether they are logged in
     * @return action The last action taken
     * @return timestamp The UNIX timestamp of the last action
     * @return loginCount Total number of logins
     * @return signupTimestamp When user first signed up
     */
    function fetchUserDetails(
        string memory uid
    )
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
            uint256 signupTimestamp
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
            user.signupTimestamp
        );
    }

    /**
     * @notice Get user UID by wallet address
     * @param walletAddress The wallet address to lookup
     * @return uid The user's UID
     */
    function getUserByWallet(
        address walletAddress
    ) public view returns (string memory uid) {
        require(walletAddress != address(0), "Invalid wallet address");
        uid = walletToUid[walletAddress];
        require(bytes(uid).length > 0, "Wallet not registered");
        return uid;
    }

    /**
     * @notice Check if a user exists and is signed up
     * @param uid The user's UID
     * @return exists Whether the user exists and is signed up
     */
    function userExists(
        string memory uid
    ) public view onlyValidUid(uid) returns (bool exists) {
        return users[uid].isSignedUp;
    }

    /**
     * @notice Get user's current login status
     * @param uid The user's UID
     * @return isLoggedIn Whether the user is currently logged in
     */
    function isUserLoggedIn(
        string memory uid
    )
        public
        view
        onlyValidUid(uid)
        onlySignedUpUser(uid)
        returns (bool isLoggedIn)
    {
        return users[uid].isLoggedIn;
    }

    /**
     * @notice Get total login count for a user
     * @param uid The user's UID
     * @return count Total number of logins
     */
    function getUserLoginCount(
        string memory uid
    )
        public
        view
        onlyValidUid(uid)
        onlySignedUpUser(uid)
        returns (uint256 count)
    {
        return users[uid].loginCount;
    }
}
