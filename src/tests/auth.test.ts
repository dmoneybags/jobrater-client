//Tests for the file auth.ts
import { execSync } from 'child_process';
import { login, register, getSalt } from '../content/auth';
import { User } from '../content/user';
import { LocalStorageHelper } from '../content/localStorageHelper'
import { genSaltSync } from 'bcryptjs';
import { MockObjects } from './mocks/objects';
import { HelperFunctions } from '../content/helperFunctions';

describe("Auth.ts file tests", () => {
  beforeAll(() => {
    //clear our db
    execSync('buildjobrater', { stdio: 'inherit' });
    HelperFunctions.delaySync(5000);
  });
  it("Tests that we can properly talk to our auth server to get salt", async () => {
    return expect(getSalt("dandemoney@gmail")).rejects.toEqual("Wrong username or password!");
  });
  it("Tests that we can properly register a user", async () => {
    const mockUser : User = MockObjects.dandemoneyUser;
    await register(mockUser, "Xdfgh1012#", "Xdfgh1012#", genSaltSync());
  })
  it("Tests that we can login the user we just registered", async () => {
    await getSalt("dandemoney@gmail.com")
    .then((salt) => {
      return expect(login("dandemoney@gmail.com", "Xdfgh1012#", salt)).resolves.toBe("Success");
    })
  })
  it("Tests that we cannot login the user we just registered with a bad pw", async () => {
    await getSalt("dandemoney@gmail.com")
    .then((salt) => {
      return expect(login("dandemoney@gmail.com", "Xdfgh1012", salt)).rejects.toEqual("Wrong username or password!");
    })
  })
  it("Tests that we cannot register a duplicate user", () => {
    const mockUser : User = MockObjects.dandemoneyUser;
    return expect(register(mockUser, "Xdfgh1012#", "Xdfgh1012#", genSaltSync())).rejects.toEqual("Email already has an account");
  })
})