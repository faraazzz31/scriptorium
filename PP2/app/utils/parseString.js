// "[1,2,3]"" => [1, 2, 3]
export function parseStringToNumberArray(string) {
    const array = string.slice(1, -1);
    return array ? array.split(',').map(Number) : [];
}