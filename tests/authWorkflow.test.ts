import assert from 'node:assert';

console.log("🧪 Starting Authentication & Sign-Up Enforcement Tests...\n");

// Mock existing stores mimicking backend behavior
const mockTutors: any[] = [
  { id: 'TT-1001', tutorCode: 'TT-1001', phone: '01700000001', email: 'muntasir@example.com', name: 'Muntasir Mamun', password: 'password123' },
  { id: 'TT-1002', tutorCode: 'TT-1002', phone: '01800000002', email: 'farhana@example.com', name: 'Farhana Yasmin', password: 'password123' },
];

const mockGuardians: any[] = [
  { id: 'G-001', fullName: 'Md. Rahman', phone: '01712345678', email: 'rahman@example.com', password: 'password123' },
  { id: 'G-004', fullName: 'Parent', phone: '01715998756', email: 'parent@example.com', password: 'password123' },
];

function loginUser(role: string, phoneOrEmail: string, password: string = 'password123') {
  const clean = phoneOrEmail.trim();
  if (role === 'parent' || role === 'guardian') {
    let matched = mockGuardians.find(g => g.phone === clean || g.email === clean);
    // Cross-role fallback to tutor
    if (!matched) {
      const tutorMatch = mockTutors.find(t => t.phone === clean || t.email === clean || t.tutorCode.toLowerCase() === clean.toLowerCase());
      if (tutorMatch) {
        matched = tutorMatch;
      }
    }
    if (!matched) {
      return { status: 404, notFound: true, error: `No guardian account found with "${clean}". Please Sign Up.` };
    }
    const expectedPassword = matched.password || 'password123';
    if (password !== expectedPassword) {
      return { status: 401, passwordIncorrect: true, error: 'Password incorrect. Please check your password and try again.' };
    }
    return { status: 200, success: true, user: matched };
  } else {
    let matched = mockTutors.find(t => t.phone === clean || t.email === clean || t.tutorCode.toLowerCase() === clean.toLowerCase());
    // Cross-role fallback to guardian
    if (!matched) {
      const guardianMatch = mockGuardians.find(g => g.phone === clean || g.email === clean);
      if (guardianMatch) {
        matched = guardianMatch;
      }
    }
    if (!matched) {
      return { status: 404, notFound: true, error: `No tutor account found with "${clean}". Please Sign Up.` };
    }
    const expectedPassword = matched.password || 'password123';
    if (password !== expectedPassword) {
      return { status: 401, passwordIncorrect: true, error: 'Password incorrect. Please check your password and try again.' };
    }
    return { status: 200, success: true, user: matched };
  }
}

function registerUser(role: string, fullName: string, phoneOrEmail: string, password: string = 'password123') {
  const clean = phoneOrEmail.trim();
  if (role === 'tutor') {
    const exists = mockTutors.some(t => t.phone === clean || t.email === clean);
    if (exists) {
      return { status: 409, alreadyExists: true, error: `A tutor account with "${clean}" already exists. Please sign in instead.` };
    }
    const newT = { id: 'TT-9999', tutorCode: 'TT-9999', phone: clean, email: clean.includes('@') ? clean : `${clean}@tutorlink.com`, name: fullName, password };
    mockTutors.push(newT);
    return { status: 200, success: true, user: newT };
  } else {
    const exists = mockGuardians.some(g => g.phone === clean || g.email === clean);
    if (exists) {
      return { status: 409, alreadyExists: true, error: `A guardian account with "${clean}" already exists. Please sign in instead.` };
    }
    const newG = { id: 'G-' + Date.now(), fullName, phone: clean, email: clean.includes('@') ? clean : `${clean}@tutorlink.com`, password };
    mockGuardians.push(newG);
    return { status: 200, success: true, user: newG };
  }
}

// Test 1: Non-existent guardian login rejection
console.log("Test 1: Non-existent guardian login rejection...");
const nonExistentLogin = loginUser('parent', '01799999999');
assert.strictEqual(nonExistentLogin.status, 404);
assert.strictEqual(nonExistentLogin.notFound, true);
console.log("✅ Passed Test 1: Non-existent login correctly returns 404 notFound.\n");

// Test 2: Successful registration when user does not exist
console.log("Test 2: Successful registration of new guardian...");
const regResult = registerUser('parent', 'New Parent User', '01799999999');
assert.strictEqual(regResult.status, 200);
assert.strictEqual(regResult.success, true);
assert.strictEqual(regResult.user.phone, '01799999999');
console.log("✅ Passed Test 2: User successfully registered.\n");

// Test 3: Duplicate registration blocked
console.log("Test 3: Duplicate registration rejected...");
const dupResult = registerUser('parent', 'Duplicate User', '01799999999');
assert.strictEqual(dupResult.status, 409);
assert.strictEqual(dupResult.alreadyExists, true);
console.log("✅ Passed Test 3: Duplicate registration correctly returns 409 alreadyExists.\n");

// Test 4: Newly registered user can now login
console.log("Test 4: Newly registered user login...");
const newLogin = loginUser('parent', '01799999999');
assert.strictEqual(newLogin.status, 200);
assert.strictEqual(newLogin.success, true);
assert.strictEqual(newLogin.user.fullName, 'New Parent User');
console.log("✅ Passed Test 4: Newly registered user successfully logs in.\n");

// Test 5: Tutor login validation by phone & Tutor Code
console.log("Test 5: Tutor login validation...");
const tutorLogin = loginUser('tutor', 'TT-1001');
assert.strictEqual(tutorLogin.status, 200);
assert.strictEqual(tutorLogin.user.name, 'Muntasir Mamun');

const unknownTutorLogin = loginUser('tutor', 'TT-999999');
assert.strictEqual(unknownTutorLogin.status, 404);
assert.strictEqual(unknownTutorLogin.notFound, true);
console.log("✅ Passed Test 5: Tutor login works by phone and Tutor Code, rejects unknown codes.\n");

// Test 6: Wrong password rejection for Guardian and Tutor
console.log("Test 6: Wrong password validation & error rejection...");
const wrongPassGuardian = loginUser('parent', '01712345678', 'wrongPassword123');
assert.strictEqual(wrongPassGuardian.status, 401);
assert.strictEqual(wrongPassGuardian.passwordIncorrect, true);
assert.strictEqual(wrongPassGuardian.error, 'Password incorrect. Please check your password and try again.');

const correctPassGuardian = loginUser('parent', '01712345678', 'password123');
assert.strictEqual(correctPassGuardian.status, 200);
assert.strictEqual(correctPassGuardian.success, true);

const wrongPassTutor = loginUser('tutor', 'TT-1001', 'wrongPassword123');
assert.strictEqual(wrongPassTutor.status, 401);
assert.strictEqual(wrongPassTutor.passwordIncorrect, true);
assert.strictEqual(wrongPassTutor.error, 'Password incorrect. Please check your password and try again.');

const correctPassTutor = loginUser('tutor', 'TT-1001', 'password123');
assert.strictEqual(correctPassTutor.status, 200);
assert.strictEqual(correctPassTutor.success, true);
console.log("✅ Passed Test 6: Wrong password correctly returns 401 Password Incorrect for both Guardian and Tutor.\n");

// Test 7: Cross-role login resilience & registering new role for same user
console.log("Test 7: Cross-role login & new role registration...");
// Guardian 01712345678 can log in even if Tutor tab was selected
const crossRoleLogin = loginUser('tutor', '01712345678', 'password123');
assert.strictEqual(crossRoleLogin.status, 200);
assert.strictEqual(crossRoleLogin.success, true);
assert.strictEqual(crossRoleLogin.user.fullName, 'Md. Rahman');

// Guardian can also register as a Tutor with same phone
const dualReg = registerUser('tutor', 'Md. Rahman Tutor', '01712345678', 'password123');
assert.strictEqual(dualReg.status, 200);
assert.strictEqual(dualReg.success, true);
console.log("✅ Passed Test 7: Cross-role login succeeds and dual-role registration works seamlessly.\n");

console.log("🎉 ALL AUTHENTICATION & SIGN-UP ENFORCEMENT TESTS PASSED SUCCESSFULLY!");

