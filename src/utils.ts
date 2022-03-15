function getDeepKeys(obj: any) {
    var keys: string[] = [];
    for (var key in obj) {
        if (isNaN(parseInt(key))) {
            keys.push(key);
            if (obj[key]["type"] === "object") {
                var subkeys = getDeepKeys(obj[key]);
                keys = keys.concat(
                    subkeys.map(function (subkey) {
                        return key + "." + subkey;
                    })
                );
            }
        }
    }
    return keys;
}

export { getDeepKeys };
