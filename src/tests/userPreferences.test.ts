import { execSync } from 'child_process';
import { login, register, getSalt } from '../content/auth';
import { genSaltSync } from 'bcryptjs';
import { MockObjects } from './mocks/objects';
import { UserPreferences } from '../content/userPreferences';
import { User } from '../content/user';
import { DatabaseCalls } from '../content/databaseCalls';
import { HelperFunctions } from '../content/helperFunctions';

describe("userPreferences.ts file tests", () => {
    beforeAll(() => {
      // clear our db
      execSync('buildjobrater', { stdio: 'inherit' });
      HelperFunctions.delaySync(10000);
    });
    it("Tests that we can properly register a user with preferences", () => {
        const mockUser : User = MockObjects.ericdemoneyUserWithPreferences;
        return expect(register(mockUser, "Xdfgh1012#", "Xdfgh1012#", genSaltSync())).resolves.toMatch("Success");
    })
    it("Tests that we can read back the preferences after sign in", async () => {
        await DatabaseCalls.getUserData()
        .then((json) => {
            const user: User = json["user"];
            const preferences = user.preferences;
            expect(user.email === MockObjects.ericdemoneyUserWithPreferences.email);
            expect(preferences === MockObjects.preferences);
        })
    })
  })
