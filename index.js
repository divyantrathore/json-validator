const core = require('@actions/core')
const github = require('@actions/github')
const ajv = require('ajv');
const fs = require('fs');

try {
    const jsonPath = core.getInput('JSON_PATH');
    const schemaPath = core.getInput('SCHEMA_PATH');
    const uniqueKeys = core.getInput('UNIQUE_KEYS');

    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    const ajvInstance = new ajv();
    const validate = ajvInstance.compile(schema);

    const valid = validate(json);

    if (valid) {
        uniqueKeys.split(',').forEach(key => {
            const uniqueValues = new Set();
            json.apps.forEach(app => {
                if (app[key.trim]) {
                    if (uniqueValues.has(app[key.trim()])) {
                        throw new Error(`Duplicate value found for key "${key}": ${app[key.trim()]}`);
                    }
                    uniqueValues.add(app[key.trim()]);
                }
            });
        });
    } else {
        throw new Error('JSON does not match schema');
    }
} catch(error) {
    core.setFailed(error.message);
    console.log(error);
    process.exit(1);
}