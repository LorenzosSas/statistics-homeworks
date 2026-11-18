export const DATASETS = {
    smoking: {
        name: 'Smoking vs Disease',
        description: 'Classic epidemiological dataset: smoking habit vs disease occurrence',
        type: 'categorical',
        variables: {X: 'Smoking', F: 'Disease'},
        data: [
            {X: 'Smoker', F: 'Disease'},
            {X: 'Smoker', F: 'Disease'},
            {X: 'Smoker', F: 'Disease'},
            {X: 'Smoker', F: 'No Disease'},
            {X: 'Smoker', F: 'No Disease'},
            {X: 'Non-Smoker', F: 'Disease'},
            {X: 'Non-Smoker', F: 'No Disease'},
            {X: 'Non-Smoker', F: 'No Disease'},
            {X: 'Non-Smoker', F: 'No Disease'},
            {X: 'Non-Smoker', F: 'No Disease'},
            {X: 'Non-Smoker', F: 'No Disease'},
            {X: 'Non-Smoker', F: 'No Disease'},
        ]
    },
    gender_preference: {
        name: 'Gender vs Product Preference',
        description: 'Survey: gender vs preferred product category',
        type: 'categorical',
        variables: {X: 'Gender', F: 'Preference'},
        data: [
            {X: 'Male', F: 'Electronics'},
            {X: 'Male', F: 'Electronics'},
            {X: 'Male', F: 'Electronics'},
            {X: 'Male', F: 'Clothing'},
            {X: 'Male', F: 'Food'},
            {X: 'Female', F: 'Electronics'},
            {X: 'Female', F: 'Clothing'},
            {X: 'Female', F: 'Clothing'},
            {X: 'Female', F: 'Clothing'},
            {X: 'Female', F: 'Food'},
            {X: 'Female', F: 'Food'},
            {X: 'Male', F: 'Electronics'},
            {X: 'Male', F: 'Food'},
            {X: 'Female', F: 'Clothing'},
        ]
    },
    independent: {
        name: 'Independent Variables (synthetic)',
        description: 'Synthetically generated independent variables — chi-square should be ~0',
        type: 'categorical',
        variables: {X: 'Color', F: 'Shape'},
        data: [
            {X: 'Red', F: 'Circle'},
            {X: 'Red', F: 'Square'},
            {X: 'Red', F: 'Triangle'},
            {X: 'Blue', F: 'Circle'},
            {X: 'Blue', F: 'Square'},
            {X: 'Blue', F: 'Triangle'},
            {X: 'Green', F: 'Circle'},
            {X: 'Green', F: 'Square'},
            {X: 'Green', F: 'Triangle'},
            {X: 'Red', F: 'Circle'},
            {X: 'Red', F: 'Square'},
            {X: 'Red', F: 'Triangle'},
            {X: 'Blue', F: 'Circle'},
            {X: 'Blue', F: 'Square'},
            {X: 'Blue', F: 'Triangle'},
            {X: 'Green', F: 'Circle'},
            {X: 'Green', F: 'Square'},
            {X: 'Green', F: 'Triangle'},
        ]
    },
    education_income: {
        name: 'Education vs Income',
        description: 'Education level vs income bracket — continuous variables discretized',
        type: 'continuous',
        variables: {X: 'Years of Education', F: 'Annual Income (k$)'},
        data: Array.from({length: 100}, (_, i) => ({
            X: 8 + Math.floor(Math.random() * 12) + (i % 3) * 2,
            F: 20 + Math.floor(Math.random() * 80) + (i % 3) * 15
        }))
    },
    age_score: {
        name: 'Age vs Test Score',
        description: 'Age vs exam score — weakly correlated continuous variables',
        type: 'continuous',
        variables: {X: 'Age', F: 'Score'},
        data: Array.from({length: 80}, (_, i) => ({
            X: 18 + Math.floor(Math.random() * 42),
            F: 40 + Math.floor(Math.random() * 60)
        }))
    }
};

export function parseCSV(text, xCol = 0, fCol = 1, hasHeader = true) {
    const lines = text.trim().split('\n').map(l => l.trim()).filter(l => l);
    const start = hasHeader ? 1 : 0;
    const variables = hasHeader
        ? { X: lines[0].split(',')[xCol].trim(), F: lines[0].split(',')[fCol].trim() }
        : { X: 'X', F: 'F' };

    const data = lines.slice(start).map(line => {
        const cols = line.split(',').map(c => c.trim());
        const xVal = cols[xCol];
        const fVal = cols[fCol];
        const xNum = parseFloat(xVal);
        const fNum = parseFloat(fVal);
        return {
            X: isNaN(xNum) ? xVal : xNum,
            F: isNaN(fNum) ? fVal : fNum
        };
    }).filter(row => row.X !== undefined && row.F !== undefined);

    const isNumericX = data.every(r => typeof r.X === 'number');
    const isNumericF = data.every(r => typeof r.F === 'number');

    return {
        variables,
        data,
        type: isNumericX && isNumericF ? 'continuous' : 'categorical'
    };
}

export function discretize(values, numBins = 4) {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binWidth = (max - min) / numBins;

    return values.map(v => {
        const bin = Math.min(Math.floor((v - min) / binWidth), numBins - 1);
        const lo = (min + bin * binWidth).toFixed(1);
        const hi = (min + (bin + 1) * binWidth).toFixed(1);
        return `[${lo}, ${hi})`;
    });
} 