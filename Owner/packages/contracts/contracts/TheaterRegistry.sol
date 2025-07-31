// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title TheaterRegistry - Theater Application Management
 * @dev Smart contract for storing theater applications on blockchain with IPFS integration
 * @notice This contract manages theater registration applications for BookMyBlock platform
 */
contract TheaterRegistry {
    enum ApplicationStatus {
        Pending,
        Approved,
        Rejected,
        UnderReview
    }

    struct TheaterApplication {
        string uid; // Privy user ID
        address ownerWallet; // Owner's wallet address
        string ipfsHash; // IPFS hash of the application document
        ApplicationStatus status; // Current status of application
        uint256 submissionTimestamp; // When application was submitted
        uint256 lastUpdated; // Last status update timestamp
        string reviewNotes; // Admin review notes
        bool isActive; // Whether the application is active
    }

    // Mappings
    mapping(string => TheaterApplication[]) private userApplications; // uid => applications
    mapping(string => TheaterApplication) private applicationById; // applicationId => application
    mapping(address => string[]) private walletToApplicationIds; // wallet => applicationIds

    // State variables
    uint256 private applicationCounter;
    address public admin;

    // Events
    event ApplicationSubmitted(
        string indexed applicationId,
        string indexed uid,
        address indexed ownerWallet,
        string ipfsHash,
        uint256 timestamp
    );

    event ApplicationStatusUpdated(
        string indexed applicationId,
        ApplicationStatus oldStatus,
        ApplicationStatus newStatus,
        string reviewNotes,
        uint256 timestamp
    );

    event ApplicationApproved(
        string indexed applicationId,
        string indexed uid,
        address indexed ownerWallet,
        uint256 timestamp
    );

    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyValidUid(string memory uid) {
        require(bytes(uid).length > 0, "UID cannot be empty");
        _;
    }

    modifier onlyValidIpfsHash(string memory ipfsHash) {
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        _;
    }

    modifier applicationExists(string memory applicationId) {
        require(
            bytes(applicationById[applicationId].uid).length > 0,
            "Application does not exist"
        );
        _;
    }

    constructor() {
        admin = msg.sender;
        applicationCounter = 0;
    }

    /**
     * @notice Submit a new theater application
     * @param uid The owner's unique identifier from Privy
     * @param ownerWallet The owner's wallet address
     * @param ipfsHash The IPFS hash of the application document
     * @return applicationId The unique ID of the submitted application
     */
    function submitApplication(
        string memory uid,
        address ownerWallet,
        string memory ipfsHash
    )
        public
        onlyValidUid(uid)
        onlyValidIpfsHash(ipfsHash)
        returns (string memory applicationId)
    {
        require(ownerWallet != address(0), "Invalid wallet address");

        applicationCounter++;
        applicationId = string(
            abi.encodePacked("APP_", uint2str(applicationCounter))
        );

        TheaterApplication memory newApplication = TheaterApplication({
            uid: uid,
            ownerWallet: ownerWallet,
            ipfsHash: ipfsHash,
            status: ApplicationStatus.Pending,
            submissionTimestamp: block.timestamp,
            lastUpdated: block.timestamp,
            reviewNotes: "",
            isActive: true
        });

        // Store the application
        applicationById[applicationId] = newApplication;
        userApplications[uid].push(newApplication);
        walletToApplicationIds[ownerWallet].push(applicationId);

        emit ApplicationSubmitted(
            applicationId,
            uid,
            ownerWallet,
            ipfsHash,
            block.timestamp
        );

        return applicationId;
    }

    /**
     * @notice Update application status (admin only)
     * @param applicationId The application ID
     * @param newStatus The new status
     * @param reviewNotes Admin review notes
     */
    function updateApplicationStatus(
        string memory applicationId,
        ApplicationStatus newStatus,
        string memory reviewNotes
    ) public onlyAdmin applicationExists(applicationId) {
        TheaterApplication storage application = applicationById[applicationId];
        ApplicationStatus oldStatus = application.status;

        application.status = newStatus;
        application.reviewNotes = reviewNotes;
        application.lastUpdated = block.timestamp;

        emit ApplicationStatusUpdated(
            applicationId,
            oldStatus,
            newStatus,
            reviewNotes,
            block.timestamp
        );

        if (newStatus == ApplicationStatus.Approved) {
            emit ApplicationApproved(
                applicationId,
                application.uid,
                application.ownerWallet,
                block.timestamp
            );
        }
    }

    /**
     * @notice Get application details by ID
     * @param applicationId The application ID
     * @return uid The user's unique identifier
     * @return ownerWallet The owner's wallet address
     * @return ipfsHash The IPFS hash of the application document
     * @return status The current status of the application
     * @return submissionTimestamp When the application was submitted
     * @return lastUpdated When the application was last updated
     * @return reviewNotes Admin review notes
     * @return isActive Whether the application is active
     */
    function getApplication(
        string memory applicationId
    )
        public
        view
        applicationExists(applicationId)
        returns (
            string memory uid,
            address ownerWallet,
            string memory ipfsHash,
            ApplicationStatus status,
            uint256 submissionTimestamp,
            uint256 lastUpdated,
            string memory reviewNotes,
            bool isActive
        )
    {
        TheaterApplication memory app = applicationById[applicationId];
        return (
            app.uid,
            app.ownerWallet,
            app.ipfsHash,
            app.status,
            app.submissionTimestamp,
            app.lastUpdated,
            app.reviewNotes,
            app.isActive
        );
    }

    /**
     * @notice Get all applications for a user
     * @param uid The user's UID
     * @return applications Array of user's applications
     */
    function getUserApplications(
        string memory uid
    )
        public
        view
        onlyValidUid(uid)
        returns (TheaterApplication[] memory applications)
    {
        return userApplications[uid];
    }

    /**
     * @notice Get application IDs for a wallet
     * @param walletAddress The wallet address
     * @return applicationIds Array of application IDs
     */
    function getWalletApplications(
        address walletAddress
    ) public view returns (string[] memory applicationIds) {
        require(walletAddress != address(0), "Invalid wallet address");
        return walletToApplicationIds[walletAddress];
    }

    /**
     * @notice Get total number of applications
     * @return count Total application count
     */
    function getTotalApplications() public view returns (uint256 count) {
        return applicationCounter;
    }

    /**
     * @notice Check if application exists
     * @param applicationId The application ID
     * @return exists Whether the application exists
     */
    function applicationExistsById(
        string memory applicationId
    ) public view returns (bool exists) {
        return bytes(applicationById[applicationId].uid).length > 0;
    }

    /**
     * @notice Transfer admin rights (admin only)
     * @param newAdmin The new admin address
     */
    function transferAdmin(address newAdmin) public onlyAdmin {
        require(newAdmin != address(0), "Invalid admin address");
        admin = newAdmin;
    }

    /**
     * @notice Convert uint to string (internal utility)
     */
    function uint2str(uint256 _i) internal pure returns (string memory str) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        j = _i;
        while (j != 0) {
            bstr[--k] = bytes1(uint8(48 + (j % 10)));
            j /= 10;
        }
        str = string(bstr);
    }
}
