import { parsePhoneNumberFromString } from 'libphonenumber-js';

/**
 * Converts a given phone number to an international format.
 * @param {string} phoneNumber - The phone number to convert.
 * @returns {string} - The internationalized phone number.
 */
export function toInternationalFormat(phoneNumber) {
    const phoneNumberObj = parsePhoneNumberFromString(phoneNumber);
    if (phoneNumberObj && phoneNumberObj.isValid()) {
        return phoneNumberObj.formatInternational();
    }
    throw new Error('Invalid phone number');
}