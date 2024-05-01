import { google } from "googleapis"
import { z } from "zod"

async function main() {
    const data = await getRows()

    console.log(data)
}

main()

async function getMetaData() {
    const { googleSheets, spreadsheetId } = await getAuthSheets()
    const response = await googleSheets.spreadsheets.get({
        spreadsheetId,
    })

    return response.data
}

async function getRows() {
    const { sheets } = await getMetaData()
    const { googleSheets, spreadsheetId, auth } = await getAuthSheets()
    const response = await googleSheets.spreadsheets.values.get({
        spreadsheetId,
        auth,
        range: sheets[0].properties.title
    })

    if (!response.data.values) {
        throw new Error("No data found.")
    }

    return response.data.values
}

async function getAuthSheets() {
    const { GOOGLE_SHEETS_ID } = getFromEnvs()
    const auth = new google.auth.GoogleAuth({
        keyFile: "google.json",
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    })

    const client = await auth.getClient()
    const googleSheets = google.sheets({ version: "v4", auth: client })
    const spreadsheetId = GOOGLE_SHEETS_ID

    return {
        auth,
        googleSheets,
        client,
        spreadsheetId,
    }
}

function getFromEnvs() {
    const env = z.object({
        GOOGLE_SHEETS_ID: z.string(),
    })

    return env.parse(process.env)
} 
