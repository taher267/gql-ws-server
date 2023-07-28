export default (bugs = []) => {
    const errors = {};
    for (const bug of bugs) {
        const [mix, _, message] = bug.message.split(/"; |". /);
        const [__, Operation_key] = mix.split('" at "');
        const [___, key] = Operation_key.split(".");
        errors[key] = message;
    }
    return errors;
};
