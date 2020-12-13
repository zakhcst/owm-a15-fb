exports.isEmulator = function () {
    return process.env['FIREBASE_EMULATOR'] === 'true';
}