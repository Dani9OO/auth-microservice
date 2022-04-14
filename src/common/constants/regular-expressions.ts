export const alphabeticWord = /^[a-z]+$/i

export const diacriticPhrase = /^[A-Za-zÀ-ÖØ-öø-įĴ-őŔ-žǍ-ǰǴ-ǵǸ-țȞ-ȟȤ-ȳɃɆ-ɏḀ-ẞƀ-ƓƗ-ƚƝ-ơƤ-ƥƫ-ưƲ-ƶẠ-ỿ]+( [A-Za-zÀ-ÖØ-öø-įĴ-őŔ-žǍ-ǰǴ-ǵǸ-țȞ-ȟȤ-ȳɃɆ-ɏḀ-ẞƀ-ƓƗ-ƚƝ-ơƤ-ƥƫ-ưƲ-ƶẠ-ỿ]+){0,}$/

export const diacriticWord = /^[A-Za-zÀ-ÖØ-öø-įĴ-őŔ-žǍ-ǰǴ-ǵǸ-țȞ-ȟȤ-ȳɃɆ-ɏḀ-ẞƀ-ƓƗ-ƚƝ-ơƤ-ƥƫ-ưƲ-ƶẠ-ỿ]+$/

export const dottedAlphabeticPhrase = /^[a-z.]+$/i

export const securePassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[-_.!@#$%^&*]).{8,}$/

export const username = /^[a-z_\d]{1,16}$/
