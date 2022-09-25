function isDebugEnabled() {
    return process.env.DEBUG !== undefined;
}

function debug(msg) {
    if(isDebugEnabled()) {
        console.log(msg);
    }
}

module.exports = {debug, isDebugEnabled}
