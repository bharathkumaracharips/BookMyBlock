import { expect } from "chai";
import { ethers } from "hardhat";
import { BookMyBlockTicket } from "../typechain-types";

describe("BookMyBlockTicket", function () {
    let ticket: BookMyBlockTicket;
    let owner: any;
    let addr1: any;

    beforeEach(async function () {
        [owner, addr1] = await ethers.getSigners();

        const BookMyBlockTicket = await ethers.getContractFactory("BookMyBlockTicket");
        ticket = await BookMyBlockTicket.deploy();
        await ticket.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await ticket.owner()).to.equal(owner.address);
        });

        it("Should have correct name and symbol", async function () {
            expect(await ticket.name()).to.equal("BookMyBlock Ticket");
            expect(await ticket.symbol()).to.equal("BMB");
        });
    });

    describe("Event Management", function () {
        it("Should allow owner to add events", async function () {
            await ticket.addEvent(1);
            expect(await ticket.eventExists(1)).to.be.true;
        });

        it("Should not allow non-owner to add events", async function () {
            await expect(
                ticket.connect(addr1).addEvent(1)
            ).to.be.revertedWithCustomError(ticket, "OwnableUnauthorizedAccount");
        });
    });
});