import bcrypt from 'bcrypt';
const SALT_ROUNDS = 12;
export const hash = {
    make(value) {
        return bcrypt.hash(value, SALT_ROUNDS);
    },
    check(value, hashedValue) {
        return bcrypt.compare(value, hashedValue);
    },
};
