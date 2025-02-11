require('dotenv').config();
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { GoogleAuth } = require('google-auth-library');

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

const creds = {
    type: "service_account",
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
};

async function addWalletToSheet(walletAddress, userId) {
    try {
        const auth = new GoogleAuth({
            credentials: creds,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(SHEET_ID, auth);
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];

        await sheet.addRow({
            Wallet: walletAddress,
            Time: new Date().toLocaleString(),
        });

        console.log('✅ Добавлено в Google Sheets:', walletAddress);
    } catch (error) {
        console.error('❌ Google Sheets Error:', error);
    }
}

module.exports = { addWalletToSheet };
