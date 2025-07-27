const UserAuth = artifacts.require("UserAuth");

contract("UserAuth - User Dashboard", (accounts) => {
  let userAuthInstance;
  const testUid = "did:privy:test123";
  const testWallet = accounts[1];
  const deployer = accounts[0];

  beforeEach(async () => {
    userAuthInstance = await UserAuth.new();
  });

  describe("User Signup", () => {
    it("should allow a new user to signup", async () => {
      const result = await userAuthInstance.signup(testUid, testWallet);
      
      // Check if UserSignedUp event was emitted
      assert.equal(result.logs.length, 1);
      assert.equal(result.logs[0].event, "UserSignedUp");
      assert.equal(result.logs[0].args.uid, testUid);
      assert.equal(result.logs[0].args.wallet, testWallet);
    });

    it("should not allow duplicate signups", async () => {
      await userAuthInstance.signup(testUid, testWallet);
      
      try {
        await userAuthInstance.signup(testUid, testWallet);
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "User already signed up");
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

    it("should not allow zero address", async () => {
      try {
        await userAuthInstance.signup(testUid, "0x0000000000000000000000000000000000000000");
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "Invalid wallet address");
      }
    });
  });

  describe("User Login", () => {
    beforeEach(async () => {
      await userAuthInstance.signup(testUid, testWallet);
    });

    it("should allow signed up user to login", async () => {
      const result = await userAuthInstance.login(testUid);
      
      // Check if UserLoggedIn event was emitted
      assert.equal(result.logs.length, 1);
      assert.equal(result.logs[0].event, "UserLoggedIn");
      assert.equal(result.logs[0].args.uid, testUid);
      assert.equal(result.logs[0].args.wallet, testWallet);
      assert.equal(result.logs[0].args.loginCount.toNumber(), 1);
    });

    it("should not allow non-signed up user to login", async () => {
      try {
        await userAuthInstance.login("did:privy:nonexistent");
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "User not signed up");
      }
    });

    it("should increment login count", async () => {
      await userAuthInstance.login(testUid);
      await userAuthInstance.login(testUid);
      
      const details = await userAuthInstance.fetchUserDetails(testUid);
      assert.equal(details[6].toNumber(), 2); // loginCount is at index 6
    });
  });

  describe("User Logout", () => {
    beforeEach(async () => {
      await userAuthInstance.signup(testUid, testWallet);
      await userAuthInstance.login(testUid);
    });

    it("should allow logged in user to logout", async () => {
      const result = await userAuthInstance.logout(testUid);
      
      // Check if UserLoggedOut event was emitted
      assert.equal(result.logs.length, 1);
      assert.equal(result.logs[0].event, "UserLoggedOut");
      assert.equal(result.logs[0].args.uid, testUid);
      assert.equal(result.logs[0].args.wallet, testWallet);
    });

    it("should not allow non-logged in user to logout", async () => {
      await userAuthInstance.logout(testUid); // First logout
      
      try {
        await userAuthInstance.logout(testUid); // Second logout should fail
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "User not logged in");
      }
    });
  });

  describe("User Details", () => {
    beforeEach(async () => {
      await userAuthInstance.signup(testUid, testWallet);
      await userAuthInstance.login(testUid);
    });

    it("should return correct user details", async () => {
      const details = await userAuthInstance.fetchUserDetails(testUid);
      
      assert.equal(details[0], testUid);           // uid
      assert.equal(details[1], testWallet);       // walletAddress
      assert.equal(details[2], true);             // isSignedUp
      assert.equal(details[3], true);             // isLoggedIn
      assert.equal(details[4], "login");          // lastAction
      assert.equal(details[6].toNumber(), 1);     // loginCount
    });

    it("should check if user exists", async () => {
      const exists = await userAuthInstance.userExists(testUid);
      assert.equal(exists, true);
      
      const notExists = await userAuthInstance.userExists("did:privy:nonexistent");
      assert.equal(notExists, false);
    });

    it("should get user by wallet address", async () => {
      const uid = await userAuthInstance.getUserByWallet(testWallet);
      assert.equal(uid, testUid);
    });

    it("should check login status", async () => {
      const isLoggedIn = await userAuthInstance.isUserLoggedIn(testUid);
      assert.equal(isLoggedIn, true);
      
      await userAuthInstance.logout(testUid);
      const isLoggedInAfterLogout = await userAuthInstance.isUserLoggedIn(testUid);
      assert.equal(isLoggedInAfterLogout, false);
    });
  });
});