// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BookMyBlockTicket
 * @dev NFT contract for event tickets on BookMyBlock platform
 */
contract BookMyBlockTicket is ERC721, Ownable {
    uint256 private _nextTokenId = 1;
    
    struct TicketInfo {
        uint256 eventId;
        string seatNumber;
        uint256 price;
        bool isUsed;
    }
    
    mapping(uint256 => TicketInfo) public tickets;
    mapping(uint256 => bool) public eventExists;
    
    event TicketMinted(
        uint256 indexed tokenId,
        address indexed to,
        uint256 indexed eventId,
        string seatNumber,
        uint256 price
    );
    
    event TicketUsed(uint256 indexed tokenId);
    
    constructor() ERC721("BookMyBlock Ticket", "BMB") Ownable(msg.sender) {}
    
    /**
     * @dev Mint a new ticket NFT
     */
    function mintTicket(
        address to,
        uint256 eventId,
        string memory seatNumber,
        uint256 price
    ) external onlyOwner returns (uint256) {
        require(eventExists[eventId], "Event does not exist");
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        
        tickets[tokenId] = TicketInfo({
            eventId: eventId,
            seatNumber: seatNumber,
            price: price,
            isUsed: false
        });
        
        emit TicketMinted(tokenId, to, eventId, seatNumber, price);
        return tokenId;
    }
    
    /**
     * @dev Mark ticket as used
     */
    function useTicket(uint256 tokenId) external {
        require(_ownerOf(tokenId) == msg.sender, "Not ticket owner");
        require(!tickets[tokenId].isUsed, "Ticket already used");
        
        tickets[tokenId].isUsed = true;
        emit TicketUsed(tokenId);
    }
    
    /**
     * @dev Add a new event
     */
    function addEvent(uint256 eventId) external onlyOwner {
        eventExists[eventId] = true;
    }
    
    /**
     * @dev Get ticket information
     */
    function getTicketInfo(uint256 tokenId) external view returns (TicketInfo memory) {
        require(_ownerOf(tokenId) != address(0), "Ticket does not exist");
        return tickets[tokenId];
    }
}