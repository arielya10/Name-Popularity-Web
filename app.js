const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');

const app = express();
const upload = multer();

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const readExcelFile = (filePath, sheetName) => {
    const workbook = xlsx.readFile(filePath);
    return xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
};

const clearData = (data) => {
    return data.map(row => {
        for (let key in row) {
            if (!['Names', 'Amount'].includes(key)) {
                row[key] = parseInt(row[key]) || null;
            }
        }
        return row;
    });
};

const dataFilePath = path.join(__dirname, 'data', 'Names.xlsx');
const data = {
    Jews: {
        M: clearData(readExcelFile(dataFilePath, 'יהודים')),
        F: clearData(readExcelFile(dataFilePath, 'יהודיות')),
    },
    Muslims: {
        M: clearData(readExcelFile(dataFilePath, 'מוסלמים')),
        F: clearData(readExcelFile(dataFilePath, 'מוסלמיות')),
    },
    Christians: {
        M: clearData(readExcelFile(dataFilePath, 'נוצרים')),
        F: clearData(readExcelFile(dataFilePath, 'נוצריות')),
    }
};


const createPlotData = (name, M_status, F_status, religion) => {
    let year_M = [], amount_M = [], year_F = [], amount_F = [], place_M = 0, place_F = 0;
    let messages = [];

    const df_M = data[religion].M;
    const df_F = data[religion].F;

    const allYears = Array.from({length: 2021 - 1948 + 1}, (_, i) => (1948 + i).toString());

    const fillMissingYears = (years, amounts) => {
        const amountsMap = years.reduce((acc, year, idx) => {
            acc[year] = amounts[idx];
            return acc;
        }, {});
        return allYears.map(year => amountsMap[year] || 0);
    };

    if (M_status) {
        const nameRow_M = df_M.find(row => row.Names === name);
        if (!nameRow_M) {
            messages.push(`השם '${name}' לא נמצא בשמות הגברים`);
        } else {
            year_M = Object.keys(nameRow_M).slice(2).filter(key => !isNaN(key)); // Filter only numeric keys
            amount_M = year_M.map(year => nameRow_M[year] || 0); // Replace null with 0
            place_M = df_M.filter(row => row.Amount > nameRow_M.Amount).length + 1;
            messages.push(`השם '${name}' נמצא במקום ${df_M.length}/${place_M} בשמות הגברים`);
            amount_M = fillMissingYears(year_M, amount_M);
            year_M = allYears;
        }
    }

    if (F_status) {
        const nameRow_F = df_F.find(row => row.Names === name);
        if (!nameRow_F) {
            messages.push(`השם '${name}' לא נמצא בשמות הנשים`);
        } else {
            year_F = Object.keys(nameRow_F).slice(2).filter(key => !isNaN(key)); // Filter only numeric keys
            amount_F = year_F.map(year => nameRow_F[year] || 0); // Replace null with 0
            place_F = df_F.filter(row => row.Amount > nameRow_F.Amount).length + 1;
            messages.push(`השם '${name}' נמצא במקום ${df_F.length}/${place_F} בשמות הנשים`);
            amount_F = fillMissingYears(year_F, amount_F);
            year_F = allYears;
        }
    }

    return { year_M, amount_M, year_F, amount_F, messages };
};




app.get('/', (req, res) => {
    res.render('index');
});

app.post('/', upload.none(), (req, res) => {
    const { name, M_status, F_status, religion } = req.body;

    console.log(`%c[INFO] %cReceived Data:`, 'color: blue; font-weight: bold;', 'color: black;', {
        Name: name,
        "Male Status": M_status === 'on',
        "Female Status": F_status === 'on',
        Religion: religion
    });
    
    const plotData = createPlotData(name, M_status === 'on', F_status === 'on', religion);
    
    // Log Plot Data in a more structured and professional way
    console.log(`%c[INFO] %cGenerated Plot Data:`, 'color: green; font-weight: bold;', 'color: black;', {
        "Years (Male)": plotData.year_M,
        "Amounts (Male)": plotData.amount_M,
        "Years (Female)": plotData.year_F,
        "Amounts (Female)": plotData.amount_F,
        Messages: plotData.messages
    });

    // Adding additional debugging information
    console.log(`%c[DEBUG] %cNumber of years processed for Males: ${plotData.year_M.length}`, 'color: orange; font-weight: bold;', 'color: black;');
    console.log(`%c[DEBUG] %cNumber of years processed for Females: ${plotData.year_F.length}`, 'color: orange; font-weight: bold;', 'color: black;');
    console.log(`%c[DEBUG] %cMessages Returned: ${plotData.messages.length}`, 'color: orange; font-weight: bold;', 'color: black;');

    res.json({
        year_M: plotData.year_M,
        amount_M: plotData.amount_M,
        year_F: plotData.year_F,
        amount_F: plotData.amount_F,
        messages: plotData.messages
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
