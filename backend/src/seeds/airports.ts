import { Knex } from "knex";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import csv from "csv-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function seed(knex: Knex): Promise<void> {
  // first we need to clear available data
  await knex("airports").del();

  console.log("Seed function");

  const airports: any[] = [];
  const filePath = path.join(
    __dirname,
    "..",
    "data",
    "airports",
    "airports.csv"
  );

  await new Promise<void>((resolve, reject) => {
    const readAirportsStream = fs.createReadStream(filePath);

    readAirportsStream
      .pipe(csv())
      .on("data", (row) => {
        if (row.ident && row.type === "large_airport") {
          // that's the format we expect in the database
          airports.push({
            icao_code: row.ident,
            name: row.name,
            city: row.municipality || "Default city",
            country: row.iso_country || "Default country",
            latitude: row.latitude_deg,
            longitude: row.longitude_deg,
          });
        }
      })
      .on("end", resolve)
      .on("error", reject);
  });

  if (airports.length > 0) {
    await knex("airports").insert(airports);
  }

  console.log(`Imported ${airports.length} airports from seed in database.`);
}
