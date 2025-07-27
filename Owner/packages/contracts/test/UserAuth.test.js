const UserAuth = artifacts.require("UserAuth");

contract("UserAuth - Owner Dashboard", (accounts) => {
  let userAuthInstance;
  const testUid = "did:privy:owner123";
  const testWallet = accounts[1];
  const testVenueName = "Test Venue";
  const deployer = accounts[0];

  beforeEach(async () => {
    userAuthInstance = await UserAuth.new();
  });

  describe("Owner Signup", () => {
    it("should allow a new owner to signup with venue name", async () => {
      const result = await userAuthInstance.signup(testUid, testWallet, testVenueName);
      
      // Check if OwnerSignedUp event was emitted
      assert.equal(result.logs.length, 1);
      assert.equal(result.logs[0].event, "OwnerSignedUp");
      assert.equal(result.logs[0].args.uid, testUid);
      assert.equal(result.logs[0].args.wallet, testWallet);
      assert.equal(result.logs[0].args.venueName, testVenueName);
    });

    it("should not allow duplicate owner signups", async () => {
      await userAuthInstance.signup(testUid, testWallet, testVenueName);
      
      try {
        await userAuthInstance.signup(testUid, testWallet, testVenueName);
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "Owner already signed up");
      }
    });
  });

  describe("Owner Login", () => {
    beforeEach(async () => {
      await userAuthInstance.signup(testUid, testWallet, testVenueName);
    });

    it("should allow signed up owner to login", async () => {
      const result = await userAuthInstance.login(testUid);
      
      // Check if OwnerLoggedIn event was emitted
      assert.equal(result.logs.length, 1);
      assert.equal(result.logs[0].event, "OwnerLoggedIn");
      assert.equal(result.logs[0].args.uid, testUid);
      assert.equal(result.logs[0].args.wallet, testWallet);
      assert.equal(result.logs[0].args.loginCount.toNumber(), 1);
    });

    it("should not allow non-signed up owner to login", async () => {
      try {
        await userAuthInstance.login("did:privy:nonexistent");
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "Owner not signed up");
      }
    });
  });

  describe("Owner Details", () => {
    beforeEach(async () => {
      await userAuthInstance.signup(testUid, testWallet, testVenueName);
      await userAuthInstance.login(testUid);
    });

    it("should return correct owner details with venue name", async () => {
      const details = await userAuthInstance.fetchUserDetails(testUid);
      
      assert.equal(details[0], testUid);           // uid
      assert.equal(details[1], testWallet);       // walletAddress
      assert.equal(details[2], true);             // isSignedUp
      assert.equal(details[3], true);             // isLoggedIn
      assert.equal(details[4], "login");          // lastAction
      assert.equal(details[6].toNumber(), 1);     // loginCount
      assert.equal(details[8], true);             // isOwner
      assert.equal(details[9], testVenueName);    // venueName
    });

    it("should allow venue name updates", async () => {
      const newVenueName = "Updated Venue Name";
      await userAuthInstance.updateVenueName(testUid, newVenueName);
      
      const details = await userAuthInstance.fetchUserDetails(testUid);
      assert.equal(details[9], newVenueName);
    });
  });
});