// "[1,2,3]"" => [1, 2, 3]
export function parseStringToNumberArray(string: string) {
    let array = string;
    if (string[0] === `[` && string[string.length - 1] === `]`) {
        array = string.slice(1, -1);
    }
    if (array[0] === `"`) {
        return array.slice(1, -1).split(`","`).map(Number);
    }
    return array ? array.split(',').map(Number) : [];
}