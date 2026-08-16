import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;
/** Provides the hash public API for its configured application behavior. */
export const hash = {
    make(value) {
        return bcrypt.hash(value, SALT_ROUNDS);
    },
    check(value, hashedValue) {
        return bcrypt.compare(value, hashedValue);
    },
};
