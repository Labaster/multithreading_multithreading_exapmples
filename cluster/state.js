const starage = (() => {
    const stateMap = new Map();
    
    return {
        add: (key, value) => { 
            const prevVal = +stateMap.get(key) || 0;
            if (+value) stateMap.set(key, prevVal + value);
        },
        set: (key, val) => {
            if (key && val) stateMap.set(key, val);
        },
        get: (key = 0) => key ? stateMap.get(key) : stateMap,
    };
})();

module.exports = starage;