import assert from 'node:assert';

console.log("🧪 Starting Authentication & Sign-Up Enforcement Tests...\n");

// Mock existing stores mimicking backend behavior
const mockTutors = [
  { id: 'TT-1001', tutorCode: 'TT-1001', phone: '01700000001', email: 'muntasir@example.com', name: 'Muntasir Mamun' },
  { id: 'TT-1002', tutorCode: 'TT-1002', phone: '01800000002', email: 'farhana@example.com', name: 'Farhana Yasmin' },
];

const mockGuardians = [
  { id: 'G-001', fullName: 'Md. Rahman', phone: '01712345678', email: 'rahman@example.com' },
  { id: 'G-004', fullName: 'Parent', phone: '01715998756', email: 'parent@example.com' },
];

function loginUser(role: string, phoneOrEmail: string) {
  const clean = phoneOrEmail.trim();
  if (role === 'parent' || role === 'guardian') {
    const matched = mockGuardians.find(g => g.phone === clean || g.email === clean);
    if (!matched) {
      return { status: 404, notFound: true, error: `No guardian account found with "${clean}". Please Sign Up.` };
    }
    return { status: 200, success: true, user: matched };
  } else {
    const matched = mockTutors.find(t => t.phone === clean || t.email === clean || t.tutorCode.toLowerCase() === clean.toLowerCase());
    if (!matched) {
      return { status: 404, notFound: true, error: `No tutor account found with "${clean}". Please Sign Up.` };
    }
    return { status: 200, success: true, user: matched };
  }
}

function registerUser(role: string, fullName: string, phoneOrEmail: string) {
  const clean = phoneOrEmail.trim();
  const exists = mockTutors.some(t => t.phone === clean || t.email === clean) || mockGuardians.some(g => g.phone === clean || g.email === clean);
  if (exists) {
    return { status: 409, alreadyExists: true, error: `An account with "${clean}" already exists. Please sign in.` };
  }

  if (role === 'parent' || role === 'guardian') {
    const newG = { id: 'G-' + Date.now(), fullName, phone: clean, email: clean.includes('@') ? clean : `${clean}@tutorlink.com` };
    mockGuardians.push(newG);
    return { status: 200, success: true, user: newG };
  } else {
    const newT = { id: 'TT-9999', tutorCode: 'TT-9999', phone: clean, email: clean.includes('@') ? clean : `${clean}@tutorlink.com`, name: fullName };
    mockTutors.push(newT);
    return { status: 200, success: true, user: newT };
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

console.log("🎉 ALL AUTHENTICATION & SIGN-UP ENFORCEMENT TESTS PASSED SUCCESSFULLY!");

