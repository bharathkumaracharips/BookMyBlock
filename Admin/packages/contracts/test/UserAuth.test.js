const UserAuth = artifacts.require("UserAuth");

contract("UserAuth - Admin Dashboard", (accounts) => {
  let userAuthInstance;
  const testUid = "did:privy:admin123";
  const testWallet = accounts[1];
  const deployer = accounts[0];

  beforeEach(async () => {
    userAuthInstance = await UserAuth.new();
  });

  describe("Admin Signup", () => {
    it("should allow a new admin to signup", async () => {
      const result = await userAuthInstance.signup(testUid, testWallet);
      
      // Check if AdminSignedUp event was emitted
      assert.equal(result.logs.length, 1);
      assert.equal(result.logs[0].event, "AdminSignedUp");
      assert.equal(result.logs[0].args.uid, testUid);
      assert.equal(result.logs[0].args.wallet, testWallet);
    });

    it("should not allow duplicate admin signups", async () => {
      await userAuthInstance.signup(testUid, testWallet);
      
      try {
        await userAuthInstance.signup(testUid, testWallet);
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "Admin already signed up");
      }
    });

    it("should not allow empty UID", async () => {
      try {
        await userAuthInstance.signup("", testWallet);
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "UID cannot be empty");
      }
    });
  });

  describe("Admin Login", () => {
    beforeEach(async () => {
      await userAuthInstance.signup(testUid, testWallet);
    });

    it("should allow signed up admin to login", async () => {
      const result = await userAuthInstance.login(testUid);
      
      // Check if AdminLoggedIn event was emitted
      assert.equal(result.logs.length, 1);
      assert.equal(result.logs[0].event, "AdminLoggedIn");
      assert.equal(result.logs[0].args.uid, testUid);
      assert.equal(result.logs[0].args.wallet, testWallet);
      assert.equal(result.logs[0].args.loginCount.toNumber(), 1);
    });

    it("should not allow non-signed up admin to login", async () => {
      try {
        await userAuthInstance.login("did:privy:nonexistent");
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "Admin not signed up");
      }
    });
  });

  describe("Admin Details", () => {
    beforeEach(async () => {
      await userAuthInstance.signup(testUid, testWallet);
      await userAuthInstance.login(testUid);
    });

    it("should return correct admin details", async () => {
      const details = await userAuthInstance.fetchUserDetails(testUid);
      
      assert.equal(details[0], testUid);           // uid
      assert.equal(details[1], testWallet);       // walletAddress
      assert.equal(details[2], true);             // isSignedUp
      assert.equal(details[3], true);             // isLoggedIn
      assert.equal(details[4], "login");          // lastAction
      assert.equal(details[6].toNumber(), 1);     // loginCount
    });

    it("should check if admin exists", async () => {
      const exists = await userAuthInstance.userExists(testUid);
      assert.equal(exists, true);
    });
  });
});