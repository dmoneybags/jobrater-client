import { execSync } from 'child_process';
import { login, register, getSalt } from 'applicantiq_core/Core/auth';
import { genSaltSync } from 'bcryptjs';
import { MockObjects } from './mocks/objects';
import { UserPreferences } from 'applicantiq_core/Core/userPreferences';
import { User } from 'applicantiq_core/Core/user';
import { DatabaseCalls } from 'applicantiq_core/Core/databaseCalls';
import { HelperFunctions } from 'applicantiq_core/Core/helperFunctions';

describe("userPreferences.ts file tests", () => {
    beforeAll(() => {
      // clear our db
      execSync('buildjobrater -BD', { stdio: 'inherit' });
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
